import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Settings, User, Bell, ClipboardCheck, Target, Save, Camera, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Preferences {
  notify_assessment: boolean;
  notify_plan_update: boolean;
}

interface ProfileData {
  full_name: string;
  role: string;
  avatar_url: string | null;
}

const SettingsPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({ full_name: '', role: '', avatar_url: null });
  const [prefs, setPrefs] = useState<Preferences>({ notify_assessment: true, notify_plan_update: true });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profileRes, prefsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, role, avatar_url').eq('id', user.id).maybeSingle(),
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image must be under 5MB.', variant: 'destructive' });
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Error', description: uploadError.message, variant: 'destructive' });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    setUploadingAvatar(false);
    if (updateError) {
      toast({ title: 'Error', description: updateError.message, variant: 'destructive' });
    } else {
      setProfile(p => ({ ...p, avatar_url: avatarUrl }));
      toast({ title: language === 'fr' ? 'Photo mise à jour' : 'Avatar updated' });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploadingAvatar(true);

    // List and delete all files in user folder
    const { data: files } = await supabase.storage.from('avatars').list(user.id);
    if (files && files.length > 0) {
      await supabase.storage.from('avatars').remove(files.map(f => `${user.id}/${f.name}`));
    }

    await supabase.from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    setProfile(p => ({ ...p, avatar_url: null }));
    setUploadingAvatar(false);
    toast({ title: language === 'fr' ? 'Photo supprimée' : 'Avatar removed' });
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
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Profile" />
                ) : null}
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {profile.full_name
                    ? profile.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{language === 'fr' ? 'Photo de profil' : 'Profile Picture'}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  {language === 'fr' ? 'Changer' : 'Change'}
                </Button>
                {profile.avatar_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {language === 'fr' ? 'Supprimer' : 'Remove'}
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'fr' ? 'JPG, PNG. Max 5 Mo.' : 'JPG, PNG. Max 5MB.'}
              </p>
            </div>
          </div>
          <Separator />
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
