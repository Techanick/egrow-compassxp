import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Target, Bell, CalendarClock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { skills, getBehaviorsByLevel } from '@/data/frameworkData';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface ReminderInfo {
  type: 'assessment' | 'plan';
  urgency: 'info' | 'warning' | 'urgent';
  message: Record<string, string>;
  actionLabel: Record<string, string>;
  route: string;
}

function getDaysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function buildReminders(
  lastAssessment: string | null,
  lastPlanUpdate: string | null,
): ReminderInfo[] {
  const reminders: ReminderInfo[] = [];
  const assessDays = getDaysSince(lastAssessment);
  const planDays = getDaysSince(lastPlanUpdate);

  // Assessment reminders
  if (assessDays === null) {
    reminders.push({
      type: 'assessment',
      urgency: 'urgent',
      message: {
        en: "You haven't completed a self-assessment yet. Start one to track your management skills.",
        fr: "Vous n'avez pas encore réalisé d'auto-évaluation. Commencez-en une pour suivre vos compétences.",
      },
      actionLabel: { en: 'Start Assessment', fr: 'Commencer' },
      route: '/assessment',
    });
  } else if (assessDays > 270) {
    reminders.push({
      type: 'assessment',
      urgency: 'urgent',
      message: {
        en: `Your last assessment was ${assessDays} days ago. It's time for your annual review.`,
        fr: `Votre dernière évaluation date de ${assessDays} jours. Il est temps de faire votre bilan annuel.`,
      },
      actionLabel: { en: 'Update Assessment', fr: 'Mettre à jour' },
      route: '/assessment',
    });
  } else if (assessDays > 90) {
    reminders.push({
      type: 'assessment',
      urgency: 'warning',
      message: {
        en: `It's been ${assessDays} days since your last assessment. Consider a quarterly check-in.`,
        fr: `Cela fait ${assessDays} jours depuis votre dernière évaluation. Pensez à un point trimestriel.`,
      },
      actionLabel: { en: 'Review Assessment', fr: 'Revoir' },
      route: '/assessment',
    });
  }

  // Plan reminders
  if (lastAssessment && planDays === null) {
    reminders.push({
      type: 'plan',
      urgency: 'warning',
      message: {
        en: "You've completed an assessment but haven't created a development plan yet.",
        fr: "Vous avez terminé une évaluation mais n'avez pas encore créé de plan de développement.",
      },
      actionLabel: { en: 'Create Plan', fr: 'Créer un plan' },
      route: '/plan',
    });
  } else if (planDays !== null && planDays > 30) {
    reminders.push({
      type: 'plan',
      urgency: planDays > 90 ? 'urgent' : 'info',
      message: {
        en: `Your development plan was last updated ${planDays} days ago. Review your progress.`,
        fr: `Votre plan de développement a été mis à jour il y a ${planDays} jours. Revoyez vos progrès.`,
      },
      actionLabel: { en: 'Update Plan', fr: 'Mettre à jour' },
      route: '/plan',
    });
  }

  return reminders;
}

const urgencyStyles = {
  info: 'border-l-primary bg-primary/5',
  warning: 'border-l-accent bg-accent/5',
  urgent: 'border-l-destructive bg-destructive/5',
};

const urgencyIcons = {
  info: CalendarClock,
  warning: Bell,
  urgent: AlertCircle,
};

const urgencyIconColors = {
  info: 'text-primary',
  warning: 'text-accent-foreground',
  urgent: 'text-destructive',
};

const Dashboard = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<ReminderInfo[]>([]);
  const [radarData, setRadarData] = useState<{ skill: string; level: number; fullMark: number }[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [assessRes, planRes] = await Promise.all([
        supabase
          .from('assessments')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('development_plans')
          .select('updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1),
      ]);

      const lastAssessment = assessRes.data?.[0]?.created_at ?? null;
      const lastPlanUpdate = planRes.data?.[0]?.updated_at ?? null;

      setReminders(buildReminders(lastAssessment, lastPlanUpdate));

      // Build radar from real assessment data if available
      if (lastAssessment) {
        const { data: fullAssess } = await supabase
          .from('assessments')
          .select('ratings')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (fullAssess?.[0]?.ratings) {
          const ratings = fullAssess[0].ratings as Record<string, string>;
          const data = skills.map(skill => {
            // Compute highest validated level
            const levels = ['fundamentals', 'intermediate', 'advanced', 'referent'] as const;
            let highest = 0;
            for (let i = 0; i < levels.length; i++) {
              const behaviors = getBehaviorsByLevel(skill, levels[i]);
              const qualifying = behaviors.filter(
                (b: any) => ratings[b.id] === 'often' || ratings[b.id] === 'almost_always'
              ).length;
              if (qualifying >= 3) highest = i + 1;
            }
            return { skill: skill.name[language], level: highest, fullMark: 4 };
          });
          setRadarData(data);
          return;
        }
      }

      // Fallback: empty radar
      setRadarData(skills.map(skill => ({ skill: skill.name[language], level: 0, fullMark: 4 })));
    };

    fetchData();
  }, [user, language]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('welcome')}</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'fr'
            ? 'Votre compagnon pour le développement managérial'
            : language === 'es'
            ? 'Tu compañero para el desarrollo gerencial'
            : language === 'tr'
            ? 'Yönetimsel gelişiminiz için rehberiniz'
            : language === 'zh'
            ? '您的管理发展伙伴'
            : 'Your management development companion'}
        </p>
      </div>

      {/* Periodic Reminders */}
      {reminders.length > 0 && (
        <div className="space-y-3">
          {reminders.map((reminder, i) => {
            const Icon = urgencyIcons[reminder.urgency];
            return (
              <Card
                key={i}
                className={`border-l-4 ${urgencyStyles[reminder.urgency]} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => navigate(reminder.route)}
              >
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 shrink-0 ${urgencyIconColors[reminder.urgency]}`} />
                    <p className="text-sm text-foreground">
                      {reminder.message[language] || reminder.message.en}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0">
                    {reminder.actionLabel[language] || reminder.actionLabel.en}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">{t('quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
            onClick={() => navigate('/assessment')}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <ClipboardCheck className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">{t('startAssessment')}</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-secondary"
            onClick={() => navigate('/plan')}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <Target className="h-8 w-8 text-secondary shrink-0" />
              <div>
                <p className="font-medium text-foreground">{t('updatePlan')}</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-accent"
            onClick={() => navigate('/framework')}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <BookOpen className="h-8 w-8 text-accent shrink-0" />
              <div>
                <p className="font-medium text-foreground">{t('browseFramework')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('progressSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
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
                  name="Level"
                  dataKey="level"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
