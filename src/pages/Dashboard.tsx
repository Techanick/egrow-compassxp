import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Target } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { skills } from '@/data/frameworkData';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Mock data for radar chart — will be replaced with real assessment data
  const radarData = skills.map((skill) => ({
    skill: skill.name[language],
    level: Math.floor(Math.random() * 4) + 1,
    fullMark: 4,
  }));

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
