import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Settings, User, Bell, ClipboardCheck, Target, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Preferences {
  notify_assessment: boolean;
  notify_plan_update: boolean;
}

interface ProfileData {
  full_name: string;
  role: string;
}

const SettingsPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({ full_name: '', role: '' });
  const [prefs, setPrefs] = useState<Preferences>({ notify_assessment: true, notify_plan_update: true });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profileRes, prefsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle(),
        supabase.from('notification_preferences').select('notify_assessment, notify_plan_update').eq('user_id', user.id).maybeSingle(),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (prefsRes.data) setPrefs(prefsRes.data);
      setLoading(false);
    })();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name.trim(), role: profile.role.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id);
    setSavingProfile(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'fr' ? 'Profil mis à jour' : 'Profile updated' });
    }
  };

  const updatePref = async (key: keyof Preferences, value: boolean) => {
    if (!user) return;
    setSavingPrefs(true);
    const newPrefs = { ...prefs, [key]: value };
    const oldPrefs = { ...prefs };
    setPrefs(newPrefs);

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        { user_id: user.id, ...newPrefs, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    setSavingPrefs(false);
    if (error) {
      setPrefs(oldPrefs);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const notifItems = [
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
      title: language === 'fr' ? 'Mises à jour du plan' : 'Plan Updates',
      description: language === 'fr'
        ? 'Recevoir une notification quand un collaborateur met à jour son plan de développement.'
        : 'Get notified when a team member updates their development plan.',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'fr' ? 'Paramètres' : 'Settings'}
        </h1>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">
                {language === 'fr' ? 'Profil' : 'Profile'}
              </CardTitle>
              <CardDescription>
                {language === 'fr'
                  ? 'Gérez vos informations personnelles.'
                  : 'Manage your personal information.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{language === 'fr' ? 'E-mail' : 'Email'}</Label>
            <Input id="email" value={user?.email ?? ''} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'L\'e-mail ne peut pas être modifié ici.' : 'Email cannot be changed here.'}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">{language === 'fr' ? 'Nom complet' : 'Full Name'}</Label>
            <Input
              id="fullName"
              value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              placeholder={language === 'fr' ? 'Votre nom...' : 'Your name...'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{language === 'fr' ? 'Rôle' : 'Role'}</Label>
            <Input
              id="role"
              value={profile.role}
              onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
              placeholder={language === 'fr' ? 'Ex : Manager, Directeur...' : 'E.g. Manager, Director...'}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm">
            {savingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {language === 'fr' ? 'Enregistrer' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Notification Preferences Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">
                {language === 'fr' ? 'Notifications' : 'Notifications'}
              </CardTitle>
              <CardDescription>
                {language === 'fr'
                  ? 'Choisissez les événements pour lesquels vous souhaitez recevoir des notifications.'
                  : 'Choose which events trigger notifications for you.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {notifItems.map(item => (
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
                disabled={savingPrefs}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
