import { useState } from 'react';
import { format } from 'date-fns';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useTeamData, TeamMemberData, DateRange } from '@/hooks/useTeamData';
import { supabase } from '@/integrations/supabase/client';
import { skills, masteryLevelColors, MasteryLevel } from '@/data/frameworkData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, Eye,
  BarChart3, UserCheck, Plus, Loader2, Trash2, Download, CalendarIcon, X,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MASTERY_LEVELS: MasteryLevel[] = ['fundamentals', 'intermediate', 'advanced', 'referent'];
const LEVEL_NUMERIC: Record<MasteryLevel | 'none', number> = {
  none: 0, fundamentals: 1, intermediate: 2, advanced: 3, referent: 4,
};

function getDevStatus(m: TeamMemberData): 'onTrack' | 'needsAttention' | 'notStarted' {
  if (!m.assessmentDate) return 'notStarted';
  if (m.actions.total === 0) return 'needsAttention';
  const pct = (m.actions.completed + m.actions.inProgress) / m.actions.total;
  return pct >= 0.5 ? 'onTrack' : 'needsAttention';
}

const statusConfig = {
  onTrack: { icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  needsAttention: { icon: AlertTriangle, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  notStarted: { icon: Clock, className: 'bg-muted text-muted-foreground' },
};

const Team = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const { members, loading, refresh } = useTeamData(dateRange);
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(null);
  const [comparedMember, setComparedMember] = useState<TeamMemberData | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addEmailError, setAddEmailError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMemberData | null>(null);

  const validateEmail = (email: string) => {
    if (!email.trim()) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) ? '' : (language === 'fr' ? 'Adresse e-mail invalide' : 'Invalid email address');
  };

  // Team-level aggregation
  const assessedMembers = members.filter(m => m.assessmentDate);
  const skillAverages = skills.map(skill => {
    const values = assessedMembers.map(m => LEVEL_NUMERIC[m.skillLevels[skill.id] ?? 'none']).filter(v => v > 0);
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { skill, avg };
  });
  const strongest = [...skillAverages].sort((a, b) => b.avg - a.avg)[0];
  const weakest = [...skillAverages].sort((a, b) => a.avg - b.avg)[0];

  const totalActions = members.reduce((s, m) => s + m.actions.total, 0);
  const completedActions = members.reduce((s, m) => s + m.actions.completed, 0);

  const handleAddMember = async () => {
    const emailErr = validateEmail(addEmail);
    if (emailErr) {
      setAddEmailError(emailErr);
      return;
    }
    setAddLoading(true);

    try {
      // Look up user by email via edge function
      const { data, error: fnError } = await supabase.functions.invoke('lookup-user-by-email', {
        body: { email: addEmail.trim() },
      });

      if (fnError || !data?.id) {
        const msg = data?.error || fnError?.message || 'User not found';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
        setAddLoading(false);
        return;
      }

      if (data.id === user.id) {
        toast({ title: 'Error', description: 'You cannot add yourself as a team member.', variant: 'destructive' });
        setAddLoading(false);
        return;
      }

      const { error } = await supabase.from('team_members').insert({
        supervisor_id: user.id,
        member_id: data.id,
      });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Member added', description: `${data.email} has been added to your team.` });
        setShowAddDialog(false);
        setAddEmail('');
        refresh();
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
    }

    setAddLoading(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('supervisor_id', user.id)
      .eq('member_id', memberId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Member removed' });
      refresh();
    }
  };

  const handleExportCSV = () => {
    if (members.length === 0) return;

    const skillCols = skills.map(s => s.name[language]);
    const headers = [
      language === 'fr' ? 'Nom' : 'Name',
      language === 'fr' ? 'Rôle' : 'Role',
      language === 'fr' ? 'Date évaluation' : 'Assessment Date',
      ...skillCols,
      language === 'fr' ? 'Compétences prioritaires' : 'Focus Skills',
      language === 'fr' ? 'Actions terminées' : 'Actions Completed',
      language === 'fr' ? 'Actions totales' : 'Total Actions',
    ];

    const rows = members.map(m => {
      const skillValues = skills.map(s => {
        const level = m.skillLevels[s.id];
        return level ? t(level) : '';
      });
      const focus = m.focusSkills
        .map(sid => skills.find(s => s.id === sid)?.name[language] ?? '')
        .filter(Boolean)
        .join('; ');
      return [
        m.name,
        m.role,
        m.assessmentDate ?? '',
        ...skillValues,
        focus,
        String(m.actions.completed),
        String(m.actions.total),
      ];
    });

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-skills-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: language === 'fr' ? 'Export réussi' : 'Export complete' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('teamOverview')}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3.5 w-3.5" />
            {members.length} {t('directReports')}
          </Badge>
          {members.length > 0 && (
            <Button size="sm" variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              {language === 'fr' ? 'Exporter CSV' : 'Export CSV'}
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {language === 'fr' ? 'Ajouter' : 'Add Member'}
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn(
              "justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              {dateRange.from
                ? dateRange.to
                  ? `${format(dateRange.from, 'PP')} – ${format(dateRange.to, 'PP')}`
                  : format(dateRange.from, 'PP')
                : (language === 'fr' ? 'Filtrer par période' : 'Filter by date range')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
              onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {(dateRange.from || dateRange.to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDateRange({ from: undefined, to: undefined })}
            className="h-8 px-2 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            {language === 'fr' ? 'Effacer' : 'Clear'}
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <Users className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold">
              {language === 'fr' ? 'Aucun collaborateur' : 'No team members yet'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'fr'
                ? 'Ajoutez des collaborateurs pour voir leurs évaluations et plans de développement.'
                : 'Add team members to see their assessments and development plans.'}
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              {language === 'fr' ? 'Ajouter un collaborateur' : 'Add a team member'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('lastAssessment')}</p>
                    <p className="text-2xl font-bold">{assessedMembers.length}/{members.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('strongestSkill')}</p>
                    <p className="text-lg font-semibold truncate">{strongest?.skill.name[language] ?? '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('developmentNeeded')}</p>
                    <p className="text-lg font-semibold truncate">{weakest?.skill.name[language] ?? '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('actionsProgress')}</p>
                    <p className="text-2xl font-bold">{completedActions}/{totalActions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Average Radar Chart */}
          {assessedMembers.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{t('teamSkillOverview')}</CardTitle>
                    <CardDescription>
                      {language === 'fr' ? 'Comparez un membre avec la moyenne de l\'équipe' :
                       language === 'es' ? 'Compare un miembro con el promedio del equipo' :
                       language === 'tr' ? 'Bir üyeyi takım ortalamasıyla karşılaştırın' :
                       language === 'zh' ? '将成员与团队平均水平进行比较' :
                       'Compare a member against the team average'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant={comparedMember === null ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setComparedMember(null)}
                    >
                      {language === 'fr' ? 'Moyenne seule' : 'Average only'}
                    </Badge>
                    {assessedMembers.map(m => (
                      <Badge
                        key={m.id}
                        variant={comparedMember?.id === m.id ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setComparedMember(comparedMember?.id === m.id ? null : m)}
                      >
                        {m.initials}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillAverages.map(sa => ({
                      skill: sa.skill.name[language],
                      average: parseFloat(sa.avg.toFixed(2)),
                      member: comparedMember ? LEVEL_NUMERIC[comparedMember.skillLevels[sa.skill.id] ?? 'none'] : undefined,
                      fullMark: 4,
                    }))}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        content={({ payload, label }) => {
                          if (!payload?.length) return null;
                          return (
                            <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                              <p className="font-medium mb-1">{label}</p>
                              {payload.map((entry: any) => (
                                <div key={entry.dataKey} className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">{entry.name}</span>
                                  <span className="font-mono font-medium">{entry.value}/4</span>
                                </div>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Radar
                        name={language === 'fr' ? 'Moyenne équipe' : 'Team Average'}
                        dataKey="average"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.15}
                      />
                      {comparedMember && (
                        <Radar
                          name={comparedMember.name}
                          dataKey="member"
                          stroke="hsl(var(--accent-foreground))"
                          fill="hsl(var(--accent))"
                          fillOpacity={0.25}
                          strokeDasharray="4 4"
                        />
                      )}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {comparedMember && (
                  <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-0.5 bg-primary rounded" />
                      {language === 'fr' ? 'Moyenne équipe' : 'Team Average'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-0.5 bg-accent-foreground rounded" style={{ borderTop: '2px dashed hsl(var(--accent-foreground))', height: 0, width: 12 }} />
                      {comparedMember.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members">{t('directReports')}</TabsTrigger>
              <TabsTrigger value="skills">{t('teamSkillOverview')}</TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('directReports')}</CardTitle>
                  <CardDescription>{t('team')}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('teamMember')}</TableHead>
                        <TableHead>{t('assessmentDate')}</TableHead>
                        <TableHead>{t('highestLevel')}</TableHead>
                        <TableHead>{t('focusAreas')}</TableHead>
                        <TableHead>{t('actionsProgress')}</TableHead>
                        <TableHead>{t('developmentStatus')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map(member => {
                        const status = getDevStatus(member);
                        const StatusIcon = statusConfig[status].icon;
                        const bestLevel = Object.values(member.skillLevels).filter(Boolean).sort(
                          (a, b) => LEVEL_NUMERIC[b ?? 'none'] - LEVEL_NUMERIC[a ?? 'none']
                        )[0];

                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{member.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.role}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {member.assessmentDate ?? <span className="text-muted-foreground italic">{t('noAssessment')}</span>}
                            </TableCell>
                            <TableCell>
                              {bestLevel ? (
                                <Badge className={`${masteryLevelColors[bestLevel]} text-white border-0`}>
                                  {t(bestLevel)}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {member.focusSkills.length > 0
                                  ? member.focusSkills.map(sid => {
                                      const sk = skills.find(s => s.id === sid);
                                      return sk ? (
                                        <Badge key={sid} variant="outline" className="text-xs">
                                          {sk.name[language]}
                                        </Badge>
                                      ) : null;
                                    })
                                  : <span className="text-muted-foreground text-sm">—</span>
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              {member.actions.total > 0 ? (
                                <div className="space-y-1 min-w-[100px]">
                                  <Progress value={(member.actions.completed / member.actions.total) * 100} className="h-2" />
                                  <p className="text-xs text-muted-foreground">
                                    {member.actions.completed}/{member.actions.total} {t('completed').toLowerCase()}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`gap-1 border-0 ${statusConfig[status].className}`}>
                                <StatusIcon className="h-3 w-3" />
                                {t(status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedMember(member)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setMemberToRemove(member)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('teamSkillOverview')}</CardTitle>
                  <CardDescription>{t('teamInsights')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {skills.map(skill => {
                      const memberLevels = members.map(m => ({
                        member: m,
                        level: m.skillLevels[skill.id],
                      }));

                      return (
                        <div key={skill.id} className="space-y-3">
                          <h3 className="font-semibold text-sm">{skill.name[language]}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {memberLevels.map(({ member, level }) => (
                              <div key={member.id} className="flex items-center gap-2 p-2 rounded-md border bg-card">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                    {member.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm flex-1 truncate">{member.name}</span>
                                {level ? (
                                  <Badge className={`${masteryLevelColors[level]} text-white border-0 text-[10px] px-1.5`}>
                                    {t(level)}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">{t('noAssessment')}</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {MASTERY_LEVELS.map(lvl => {
                              const count = memberLevels.filter(ml => ml.level === lvl).length;
                              return count > 0 ? (
                                <span key={lvl} className="flex items-center gap-1">
                                  <span className={`inline-block w-2 h-2 rounded-full ${masteryLevelColors[lvl]}`} />
                                  {t(lvl)}: {count}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedMember && (() => {
            const memberRadarData = skills.map(skill => {
              const avgValues = assessedMembers.map(m => LEVEL_NUMERIC[m.skillLevels[skill.id] ?? 'none']).filter(v => v > 0);
              const avg = avgValues.length > 0 ? avgValues.reduce((a, b) => a + b, 0) / avgValues.length : 0;
              return {
                skill: skill.name[language],
                value: LEVEL_NUMERIC[selectedMember.skillLevels[skill.id] ?? 'none'],
                average: parseFloat(avg.toFixed(2)),
                fullMark: 4,
              };
            });
            const hasAssessment = Object.values(selectedMember.skillLevels).some(Boolean);
            const status = getDevStatus(selectedMember);
            const StatusIcon = statusConfig[status].icon;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {selectedMember.avatarUrl && (
                        <AvatarImage src={selectedMember.avatarUrl} alt={selectedMember.name} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {selectedMember.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xl">{selectedMember.name}</p>
                      <p className="text-sm font-normal text-muted-foreground">{selectedMember.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`gap-1 border-0 text-xs ${statusConfig[status].className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {t(status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedMember.assessmentDate ?? t('noAssessment')}
                        </span>
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                  {/* Radar Chart with team average overlay */}
                  {hasAssessment && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">{t('teamSkillOverview')}</h4>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={memberRadarData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip
                              content={({ payload, label }) => {
                                if (!payload?.length) return null;
                                return (
                                  <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                                    <p className="font-medium mb-1">{label}</p>
                                    {payload.map((entry: any) => (
                                      <div key={entry.dataKey} className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">{entry.name}</span>
                                        <span className="font-mono font-medium">{entry.value}/4</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }}
                            />
                            <Radar
                              name={language === 'fr' ? 'Moyenne équipe' : 'Team Average'}
                              dataKey="average"
                              stroke="hsl(var(--muted-foreground))"
                              fill="hsl(var(--muted-foreground))"
                              fillOpacity={0.08}
                              strokeDasharray="4 4"
                            />
                            <Radar
                              name={selectedMember.name}
                              dataKey="value"
                              stroke="hsl(var(--primary))"
                              fill="hsl(var(--primary))"
                              fillOpacity={0.2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center justify-center gap-6 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-3 h-0.5 rounded" style={{ borderTop: '2px dashed hsl(var(--muted-foreground))', height: 0, width: 12 }} />
                          {language === 'fr' ? 'Moyenne équipe' : 'Team Average'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-3 h-0.5 bg-primary rounded" />
                          {selectedMember.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Full Skill Breakdown */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t('yourMasteryLevels')}</h4>
                    <div className="space-y-2">
                      {skills.map(skill => {
                        const level = selectedMember.skillLevels[skill.id];
                        const numericValue = LEVEL_NUMERIC[level ?? 'none'];
                        return (
                          <div key={skill.id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{skill.name[language]}</span>
                              {level ? (
                                <Badge className={`${masteryLevelColors[level]} text-white border-0 text-xs`}>
                                  {t(level)}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">{t('noAssessment')}</span>
                              )}
                            </div>
                            <Progress value={(numericValue / 4) * 100} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Focus Skills */}
                  {selectedMember.focusSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">{t('focusAreas')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.focusSkills.map(sid => {
                          const sk = skills.find(s => s.id === sid);
                          return sk ? (
                            <Badge key={sid} variant="outline">{sk.name[language]}</Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Development Plan Progress */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t('actionsProgress')}</h4>
                    {selectedMember.actions.total > 0 ? (
                      <div className="space-y-2">
                        <Progress
                          value={(selectedMember.actions.completed / selectedMember.actions.total) * 100}
                          className="h-3"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-md bg-muted/50">
                            <p className="text-lg font-bold text-foreground">
                              {selectedMember.actions.total - selectedMember.actions.completed - selectedMember.actions.inProgress}
                            </p>
                            <p className="text-xs text-muted-foreground">{t('todo')}</p>
                          </div>
                          <div className="text-center p-2 rounded-md bg-muted/50">
                            <p className="text-lg font-bold text-foreground">{selectedMember.actions.inProgress}</p>
                            <p className="text-xs text-muted-foreground">{t('inProgress')}</p>
                          </div>
                          <div className="text-center p-2 rounded-md bg-muted/50">
                            <p className="text-lg font-bold text-foreground">{selectedMember.actions.completed}</p>
                            <p className="text-xs text-muted-foreground">{t('completed')}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">{t('noActionsYet')}</p>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Ajouter un collaborateur' : 'Add Team Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {language === 'fr'
                ? 'Entrez l\'adresse e-mail du collaborateur à ajouter.'
                : 'Enter the email address of the team member to add.'}
            </p>
            <Input
              type="email"
              placeholder={language === 'fr' ? 'email@exemple.com' : 'email@example.com'}
              value={addEmail}
              onChange={e => { setAddEmail(e.target.value); setAddEmailError(validateEmail(e.target.value)); }}
              className={addEmailError ? 'border-destructive' : ''}
            />
            {addEmailError && (
              <p className="text-xs text-destructive">{addEmailError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAddMember} disabled={addLoading || !addEmail.trim() || !!addEmailError}>
              {addLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === 'fr' ? 'Ajouter' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Retirer ce collaborateur ?' : 'Remove team member?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr'
                ? `Êtes-vous sûr de vouloir retirer ${memberToRemove?.name} de votre équipe ? Cette action est irréversible.`
                : `Are you sure you want to remove ${memberToRemove?.name} from your team? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (memberToRemove) {
                  handleRemoveMember(memberToRemove.id);
                  setMemberToRemove(null);
                }
              }}
            >
              {language === 'fr' ? 'Retirer' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Team;
