import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

const DevelopmentPlan = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground">{t('developmentPlan')}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-secondary" />
            {t('actionPlan')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('developmentPlan')} — coming soon. Build targeted development plans based on your self-assessment results.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopmentPlan;
