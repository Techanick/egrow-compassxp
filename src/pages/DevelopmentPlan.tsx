import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  skills,
  MasteryLevel,
  getBehaviorsByLevel,
  getToolsForSkill,
  masteryLevelColors,
  masteryLevelTextColors,
} from '@/data/frameworkData';
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';

type Rating = 'hardly_ever' | 'sometimes' | 'often' | 'almost_always';
type ActionStatus = 'todo' | 'in_progress' | 'completed';

interface ActionItem {
  id: string;
  description: string;
  deadline: string;
  status: ActionStatus;
  behaviorId?: string;
}

interface SkillPlan {
  skillId: string;
  targetLevel: MasteryLevel;
  actions: ActionItem[];
}

const MASTERY_LEVELS: MasteryLevel[] = ['fundamentals', 'intermediate', 'advanced', 'referent'];
const VALIDATION_THRESHOLD = 3;

const DevelopmentPlan = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState<Record<string, Rating>>(() => {
    const saved = sessionStorage.getItem('assessment_ratings');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [plans, setPlans] = useState<SkillPlan[]>([]);
  const [phase, setPhase] = useState<'select' | 'plan'>('select');
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});
  const [planId, setPlanId] = useState<string | null>(null);

  // Load latest assessment and plan from DB
  useEffect(() => {
    if (!user) return;
    // Load assessment
    supabase
      .from('assessments')
      .select('ratings')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0 && data[0].ratings) {
          setRatings(data[0].ratings as Record<string, Rating>);
        }
      });
    // Load dev plan
    supabase
      .from('development_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const plan = data[0];
          setPlanId(plan.id);
          setSelectedSkillIds(plan.selected_skills || []);
          setPlans((plan.plans as any) || []);
          if ((plan.plans as any[])?.length > 0) {
            setPhase('plan');
            setExpandedSkills({ [(plan.plans as any[])[0].skillId]: true });
          }
        }
      });
  }, [user]);

  // Compute gap analysis per skill
  const skillGaps = useMemo(() => {
    return skills.map(skill => {
      let highestValidated: MasteryLevel | null = null;
      let nextLevel: MasteryLevel | null = null;

      for (const level of MASTERY_LEVELS) {
        const behaviors = getBehaviorsByLevel(skill, level);
        const qualifying = behaviors.filter(
          b => ratings[b.id] === 'often' || ratings[b.id] === 'almost_always'
        ).length;
        if (qualifying >= VALIDATION_THRESHOLD) {
          highestValidated = level;
        }
      }

      const currentIdx = highestValidated ? MASTERY_LEVELS.indexOf(highestValidated) : -1;
      nextLevel = currentIdx < MASTERY_LEVELS.length - 1 ? MASTERY_LEVELS[currentIdx + 1] : null;

      // Gap score: lower validated = higher gap priority
      const gapScore = MASTERY_LEVELS.length - 1 - currentIdx;

      return {
        skill,
        highestValidated,
        nextLevel,
        gapScore,
        currentLevelIndex: currentIdx,
      };
    }).sort((a, b) => b.gapScore - a.gapScore);
  }, [ratings]);

  const masteryLabel = useCallback((level: MasteryLevel) => {
    const map: Record<MasteryLevel, Parameters<typeof t>[0]> = {
      fundamentals: 'fundamentals',
      intermediate: 'intermediate',
      advanced: 'advanced',
      referent: 'referent',
    };
    return t(map[level]);
  }, [t]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : prev.length < 2
        ? [...prev, skillId]
        : prev
    );
  };

  const savePlanToDB = async (newPlans: SkillPlan[], skillIds: string[]) => {
    if (!user) return;
    const payload = { user_id: user.id, selected_skills: skillIds, plans: newPlans as any, updated_at: new Date().toISOString() };
    if (planId) {
      await supabase.from('development_plans').update(payload).eq('id', planId);
    } else {
      const { data } = await supabase.from('development_plans').insert(payload).select('id').single();
      if (data) setPlanId(data.id);
    }
  };

  const startPlan = () => {
    const newPlans = selectedSkillIds.map(skillId => {
      const gap = skillGaps.find(g => g.skill.id === skillId)!;
      return {
        skillId,
        targetLevel: gap.nextLevel || 'fundamentals',
        actions: [] as ActionItem[],
      };
    });
    setPlans(newPlans);
    setPhase('plan');
    if (newPlans.length > 0) {
      setExpandedSkills({ [newPlans[0].skillId]: true });
    }
    savePlanToDB(newPlans, selectedSkillIds);
  };

  const addAction = (skillId: string, behaviorId?: string) => {
    setPlans(prev => {
      const next = prev.map(p =>
        p.skillId === skillId
          ? {
              ...p,
              actions: [
                ...p.actions,
                {
                  id: crypto.randomUUID(),
                  description: '',
                  deadline: '',
                  status: 'todo' as ActionStatus,
                  behaviorId,
                },
              ],
            }
          : p
      );
      savePlanToDB(next, selectedSkillIds);
      return next;
    });
  };

  const updateAction = (skillId: string, actionId: string, updates: Partial<ActionItem>) => {
    setPlans(prev => {
      const next = prev.map(p =>
        p.skillId === skillId
          ? {
              ...p,
              actions: p.actions.map(a => (a.id === actionId ? { ...a, ...updates } : a)),
            }
          : p
      );
      savePlanToDB(next, selectedSkillIds);
      return next;
    });
  };

  const removeAction = (skillId: string, actionId: string) => {
    setPlans(prev => {
      const next = prev.map(p =>
        p.skillId === skillId
          ? { ...p, actions: p.actions.filter(a => a.id !== actionId) }
          : p
      );
      savePlanToDB(next, selectedSkillIds);
      return next;
    });
  };

  const cycleStatus = (current: ActionStatus): ActionStatus => {
    const order: ActionStatus[] = ['todo', 'in_progress', 'completed'];
    return order[(order.indexOf(current) + 1) % order.length];
  };

  const statusIcon = (status: ActionStatus) => {
    switch (status) {
      case 'todo':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-accent" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-secondary" />;
    }
  };

  const statusLabel = (status: ActionStatus) => {
    switch (status) {
      case 'todo': return t('todo');
      case 'in_progress': return t('inProgress');
      case 'completed': return t('completed');
    }
  };

  const hasAssessment = Object.keys(ratings).length > 0;

  // No assessment yet
  if (!hasAssessment) {
    return (
      <div className="space-y-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground">{t('developmentPlan')}</h1>
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-accent mx-auto" />
            <h2 className="text-lg font-semibold">{t('noAssessmentYet')}</h2>
            <p className="text-muted-foreground">{t('completeAssessmentFirst')}</p>
            <Button onClick={() => navigate('/self-assessment')}>
              {t('goToAssessment')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Phase 1: Skill selection
  if (phase === 'select') {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('developmentPlan')}</h1>
          <p className="text-muted-foreground mt-1">{t('selectUpTo')}</p>
        </div>

        {/* Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t('gapAnalysis')}
            </CardTitle>
            <CardDescription>{t('recommendedSkills')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {skillGaps.map(({ skill, highestValidated, nextLevel, gapScore }, idx) => {
              const isSelected = selectedSkillIds.includes(skill.id);
              const isRecommended = idx < 2;
              return (
                <div
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30',
                    selectedSkillIds.length >= 2 && !isSelected && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    className="pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.name[language]}</span>
                      {isRecommended && (
                        <Badge variant="outline" className="text-accent border-accent text-xs">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          {t('recommendedSkills')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-sm">
                      <span className="text-muted-foreground">{t('currentLevel')}:</span>
                      {highestValidated ? (
                        <Badge className={cn(masteryLevelColors[highestValidated], 'text-white text-xs')}>
                          {masteryLabel(highestValidated)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                      {nextLevel && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{t('targetLevel')}:</span>
                          <Badge variant="outline" className={cn(masteryLevelTextColors[nextLevel], 'text-xs')}>
                            {masteryLabel(nextLevel)}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Gap indicator */}
                  <div className="flex gap-1">
                    {MASTERY_LEVELS.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-6 rounded-sm',
                          i <= (highestValidated ? MASTERY_LEVELS.indexOf(highestValidated) : -1)
                            ? 'bg-primary'
                            : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button disabled={selectedSkillIds.length === 0} onClick={startPlan}>
            {t('buildPlan')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Phase 2: Plan builder
  const totalActions = plans.reduce((s, p) => s + p.actions.length, 0);
  const completedActions = plans.reduce(
    (s, p) => s + p.actions.filter(a => a.status === 'completed').length,
    0
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('developmentPlan')}</h1>
          <p className="text-muted-foreground mt-1">{t('actionPlan')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPhase('select')}>
          {t('editSelection')}
        </Button>
      </div>

      {/* Progress overview */}
      {totalActions > 0 && (
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t('progressOverview')}</span>
              <span className="font-medium">
                {completedActions} / {totalActions} {t('completed').toLowerCase()}
              </span>
            </div>
            <Progress
              value={totalActions > 0 ? (completedActions / totalActions) * 100 : 0}
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Skill plans */}
      {plans.map(plan => {
        const skill = skills.find(s => s.id === plan.skillId)!;
        const gap = skillGaps.find(g => g.skill.id === plan.skillId)!;
        const tools = getToolsForSkill(plan.skillId);
        const targetBehaviors = getBehaviorsByLevel(skill, plan.targetLevel);
        const isExpanded = expandedSkills[plan.skillId] ?? false;

        return (
          <Collapsible
            key={plan.skillId}
            open={isExpanded}
            onOpenChange={(open) =>
              setExpandedSkills(prev => ({ ...prev, [plan.skillId]: open }))
            }
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5 text-primary" />
                        {skill.name[language]}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1.5">
                        {gap.highestValidated && (
                          <Badge className={cn(masteryLevelColors[gap.highestValidated], 'text-white text-xs')}>
                            {masteryLabel(gap.highestValidated)}
                          </Badge>
                        )}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className={cn(masteryLevelTextColors[plan.targetLevel], 'text-xs')}>
                          {masteryLabel(plan.targetLevel)}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {plan.actions.filter(a => a.status === 'completed').length}/{plan.actions.length} {t('completed').toLowerCase()}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Target behaviors */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                      {t('behaviorToWorkOn')} — {masteryLabel(plan.targetLevel)}
                    </h4>
                    <div className="space-y-1.5">
                      {targetBehaviors.map(b => (
                        <div key={b.id} className="flex items-start gap-2 text-sm">
                          <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', masteryLevelColors[plan.targetLevel])} />
                          <span>{b.description[language]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action items */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-muted-foreground">{t('actionPlan')}</h4>
                      <Button size="sm" variant="outline" onClick={() => addAction(plan.skillId)}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        {t('addActionItem')}
                      </Button>
                    </div>

                    {plan.actions.length === 0 ? (
                      <div className="text-center py-6 border border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('noActionsYet')}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => addAction(plan.skillId)}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          {t('addFirstAction')}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {plan.actions.map(action => (
                          <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                            <button
                              onClick={() =>
                                updateAction(plan.skillId, action.id, {
                                  status: cycleStatus(action.status),
                                })
                              }
                              className="mt-0.5 shrink-0"
                              title={statusLabel(action.status)}
                            >
                              {statusIcon(action.status)}
                            </button>
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder={t('actionDescription')}
                                value={action.description}
                                onChange={e =>
                                  updateAction(plan.skillId, action.id, {
                                    description: e.target.value,
                                  })
                                }
                                className={cn(
                                  'h-8 text-sm',
                                  action.status === 'completed' && 'line-through text-muted-foreground'
                                )}
                              />
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                  type="date"
                                  value={action.deadline}
                                  onChange={e =>
                                    updateAction(plan.skillId, action.id, {
                                      deadline: e.target.value,
                                    })
                                  }
                                  className="h-7 text-xs w-40"
                                />
                                <Badge
                                  variant={
                                    action.status === 'completed'
                                      ? 'default'
                                      : action.status === 'in_progress'
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                  className="text-xs cursor-pointer"
                                  onClick={() =>
                                    updateAction(plan.skillId, action.id, {
                                      status: cycleStatus(action.status),
                                    })
                                  }
                                >
                                  {statusLabel(action.status)}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeAction(plan.skillId, action.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggested tools */}
                  {tools.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                        {t('suggestedTools')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tools.map(tool => (
                          <div key={tool.id} className="p-3 border rounded-lg text-sm">
                            <div className="font-medium">{tool.name}</div>
                            <p className="text-muted-foreground text-xs mt-0.5">
                              {tool.description[language]}
                            </p>
                            <Badge variant="outline" className="mt-1.5 text-xs">
                              {tool.format}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default DevelopmentPlan;
