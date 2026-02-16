import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

const SelfAssessment = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground">{t('selfAssessment')}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            {t('startAssessment')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('selfAssessment')} — coming soon. Rate each behavior across all 6 skills to track your mastery progression.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelfAssessment;
