import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { skills, masteryLevelColors, masteryLevelTextColors, MasteryLevel } from '@/data/frameworkData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, Eye,
  BarChart3, UserCheck,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const MASTERY_LEVELS: MasteryLevel[] = ['fundamentals', 'intermediate', 'advanced', 'referent'];
const LEVEL_NUMERIC: Record<MasteryLevel | 'none', number> = {
  none: 0, fundamentals: 1, intermediate: 2, advanced: 3, referent: 4,
};

interface MockMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  assessmentDate: string | null;
  skillLevels: Record<string, MasteryLevel | null>;
  focusSkills: string[];
  actions: { total: number; completed: number; inProgress: number };
}

const mockTeam: MockMember[] = [
  {
    id: '1', name: 'Marie Dupont', initials: 'MD', role: 'Regional Manager',
    assessmentDate: '2026-01-15',
    skillLevels: { meaning: 'intermediate', engagement: 'advanced', feedback: 'intermediate', active_listening: 'fundamentals', objectives: 'advanced', decision_making: 'intermediate' },
    focusSkills: ['active_listening', 'meaning'],
    actions: { total: 6, completed: 3, inProgress: 2 },
  },
  {
    id: '2', name: 'Thomas Martin', initials: 'TM', role: 'Product Lead',
    assessmentDate: '2026-02-03',
    skillLevels: { meaning: 'advanced', engagement: 'intermediate', feedback: 'advanced', active_listening: 'intermediate', objectives: 'referent', decision_making: 'advanced' },
    focusSkills: ['engagement'],
    actions: { total: 4, completed: 4, inProgress: 0 },
  },
  {
    id: '3', name: 'Sophie Chen', initials: 'SC', role: 'Operations Manager',
    assessmentDate: '2025-11-20',
    skillLevels: { meaning: 'fundamentals', engagement: 'fundamentals', feedback: 'intermediate', active_listening: 'advanced', objectives: 'intermediate', decision_making: 'fundamentals' },
    focusSkills: ['meaning', 'decision_making'],
    actions: { total: 8, completed: 2, inProgress: 3 },
  },
  {
    id: '4', name: 'Kemal Yılmaz', initials: 'KY', role: 'Sales Manager',
    assessmentDate: null,
    skillLevels: { meaning: null, engagement: null, feedback: null, active_listening: null, objectives: null, decision_making: null },
    focusSkills: [],
    actions: { total: 0, completed: 0, inProgress: 0 },
  },
  {
    id: '5', name: 'Laura García', initials: 'LG', role: 'HR Business Partner',
    assessmentDate: '2026-02-10',
    skillLevels: { meaning: 'intermediate', engagement: 'referent', feedback: 'advanced', active_listening: 'referent', objectives: 'intermediate', decision_making: 'intermediate' },
    focusSkills: ['objectives', 'meaning'],
    actions: { total: 5, completed: 1, inProgress: 4 },
  },
];

function getDevStatus(m: MockMember): 'onTrack' | 'needsAttention' | 'notStarted' {
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

function highestLevel(levels: Record<string, MasteryLevel | null>, skillId: string): MasteryLevel | null {
  return levels[skillId] ?? null;
}

const Team = () => {
  const { t, language } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<MockMember | null>(null);

  // Team-level aggregation
  const assessedMembers = mockTeam.filter(m => m.assessmentDate);
  const skillAverages = skills.map(skill => {
    const values = assessedMembers.map(m => LEVEL_NUMERIC[m.skillLevels[skill.id] ?? 'none']).filter(v => v > 0);
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { skill, avg };
  });
  const strongest = [...skillAverages].sort((a, b) => b.avg - a.avg)[0];
  const weakest = [...skillAverages].sort((a, b) => a.avg - b.avg)[0];

  const totalActions = mockTeam.reduce((s, m) => s + m.actions.total, 0);
  const completedActions = mockTeam.reduce((s, m) => s + m.actions.completed, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('teamOverview')}</h1>
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3.5 w-3.5" />
          {mockTeam.length} {t('directReports')}
        </Badge>
      </div>

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
                <p className="text-2xl font-bold">{assessedMembers.length}/{mockTeam.length}</p>
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
                <p className="text-lg font-semibold truncate">{strongest?.skill.name[language]}</p>
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
                <p className="text-lg font-semibold truncate">{weakest?.skill.name[language]}</p>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('teamSkillOverview')}</CardTitle>
          <CardDescription>
            {language === 'fr' ? 'Niveau moyen de maîtrise de l\'équipe par compétence' :
             language === 'es' ? 'Nivel promedio de dominio del equipo por competencia' :
             language === 'tr' ? 'Yetkinlik başına ortalama takım ustalık seviyesi' :
             language === 'zh' ? '团队各技能平均掌握水平' :
             'Team average mastery level per skill'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillAverages.map(sa => ({
                skill: sa.skill.name[language],
                average: parseFloat(sa.avg.toFixed(2)),
                fullMark: 4,
              }))}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 4]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar
                  name="Team Average"
                  dataKey="average"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
                  {mockTeam.map(member => {
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedMember(member)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
                  const memberLevels = mockTeam.map(m => ({
                    member: m,
                    level: m.skillLevels[skill.id],
                  }));

                  return (
                    <div key={skill.id} className="space-y-3">
                      <h3 className="font-semibold text-sm">{skill.name[language]}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {memberLevels.map(({ member, level }) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 p-2 rounded-md border bg-card"
                          >
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

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-lg">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">{selectedMember.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{selectedMember.name}</p>
                    <p className="text-sm font-normal text-muted-foreground">{selectedMember.role}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t('yourMasteryLevels')}</h4>
                  <div className="space-y-2">
                    {skills.map(skill => {
                      const level = selectedMember.skillLevels[skill.id];
                      return (
                        <div key={skill.id} className="flex items-center justify-between text-sm">
                          <span>{skill.name[language]}</span>
                          {level ? (
                            <Badge className={`${masteryLevelColors[level]} text-white border-0 text-xs`}>
                              {t(level)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">{t('noAssessment')}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

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

                {selectedMember.actions.total > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t('actionsProgress')}</h4>
                    <Progress
                      value={(selectedMember.actions.completed / selectedMember.actions.total) * 100}
                      className="h-3 mb-1"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{selectedMember.actions.completed} {t('completed').toLowerCase()}</span>
                      <span>{selectedMember.actions.inProgress} {t('inProgress').toLowerCase()}</span>
                      <span>{selectedMember.actions.total - selectedMember.actions.completed - selectedMember.actions.inProgress} {t('todo').toLowerCase()}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {t('lastAssessment')}: {selectedMember.assessmentDate ?? t('noAssessment')}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Team;
