import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Bell, ClipboardCheck, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Preferences {
  notify_assessment: boolean;
  notify_plan_update: boolean;
}

const NotificationPreferences = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>({ notify_assessment: true, notify_plan_update: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('notify_assessment, notify_plan_update')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setPrefs(data);
      setLoading(false);
    })();
  }, [user]);

  const updatePref = async (key: keyof Preferences, value: boolean) => {
    if (!user) return;
    setSaving(true);
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        { user_id: user.id, ...newPrefs, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    setSaving(false);
    if (error) {
      setPrefs(prefs); // revert
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'fr' ? 'Préférences enregistrées' : 'Preferences saved' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const items = [
    {
      key: 'notify_assessment' as const,
      icon: ClipboardCheck,
      title: language === 'fr' ? 'Nouvelles évaluations' : 'New Assessments',
      description: language === 'fr'
        ? 'Recevoir une notification quand un collaborateur termine une auto-évaluation.'
        : 'Get notified when a team member completes a self-assessment.',
    },
    {
      key: 'notify_plan_update' as const,
      icon: Target,
      title: language === 'fr' ? 'Mises à jour du plan de développement' : 'Development Plan Updates',
      description: language === 'fr'
        ? 'Recevoir une notification quand un collaborateur met à jour son plan de développement.'
        : 'Get notified when a team member updates their development plan.',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'fr' ? 'Préférences de notification' : 'Notification Preferences'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'fr' ? 'Événements d\'équipe' : 'Team Events'}
          </CardTitle>
          <CardDescription>
            {language === 'fr'
              ? 'Choisissez les événements pour lesquels vous souhaitez recevoir des notifications.'
              : 'Choose which events trigger notifications for you.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.map(item => (
            <div key={item.key} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <Label htmlFor={item.key} className="text-sm font-medium cursor-pointer">
                    {item.title}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
              <Switch
                id={item.key}
                checked={prefs[item.key]}
                onCheckedChange={(v) => updatePref(item.key, v)}
                disabled={saving}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
