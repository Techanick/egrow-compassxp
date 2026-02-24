import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { departments, geographies, getDepartmentLabel, getGeoZoneLabel } from '@/data/organizationData';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

type AppRole = 'manager' | 'hr' | 'admin';
const AVAILABLE_ROLES: AppRole[] = ['manager', 'hr', 'admin'];

const roleLabels: Record<AppRole, Record<string, string>> = {
  manager: { en: 'Manager', fr: 'Manager' },
  hr: { en: 'HR Admin', fr: 'Admin RH' },
  admin: { en: 'Admin', fr: 'Administrateur' },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  currentDepartment: string | null;
  currentGeography: string | null;
  onSaved: () => void;
}

export function ManageMemberDialog({
  open, onOpenChange, memberId, memberName,
  currentDepartment, currentGeography, onSaved,
}: Props) {
  const { language } = useLanguage();
  const [department, setDepartment] = useState(currentDepartment || '');
  const [geography, setGeography] = useState(currentGeography || '');
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [originalRoles, setOriginalRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    if (!open || !memberId) return;
    setDepartment(currentDepartment || '');
    setGeography(currentGeography || '');
    setRolesLoading(true);

    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', memberId)
      .then(({ data }) => {
        const r = (data || []).map(d => d.role as AppRole);
        setRoles(r);
        setOriginalRoles(r);
        setRolesLoading(false);
      });
  }, [open, memberId, currentDepartment, currentGeography]);

  const toggleRole = (role: AppRole) => {
    setRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profile (department & geography)
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          department: department || null,
          geography: geography || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId);

      if (profileErr) throw profileErr;

      // Sync roles: add new, remove old
      const toAdd = roles.filter(r => !originalRoles.includes(r));
      const toRemove = originalRoles.filter(r => !roles.includes(r));

      for (const role of toAdd) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: memberId, role });
        if (error) throw error;
      }

      for (const role of toRemove) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', memberId)
          .eq('role', role);
        if (error) throw error;
      }

      toast({
        title: language === 'fr' ? 'Modifications enregistrées' : 'Changes saved',
        description: language === 'fr'
          ? `Le profil de ${memberName} a été mis à jour.`
          : `${memberName}'s profile has been updated.`,
      });
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save changes',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {language === 'fr' ? `Gérer ${memberName}` : `Manage ${memberName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Department */}
          <div className="space-y-2">
            <Label>{language === 'fr' ? 'Fonction' : 'Department'}</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'fr' ? 'Sélectionner...' : 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.label[language]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Geography */}
          <div className="space-y-2">
            <Label>{language === 'fr' ? 'Zone géographique' : 'Geography'}</Label>
            <Select value={geography} onValueChange={setGeography}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'fr' ? 'Sélectionner...' : 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {geographies.map(z => (
                  <SelectItem key={z.id} value={z.id}>{z.label[language]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <Label>{language === 'fr' ? 'Rôles' : 'Roles'}</Label>
            {rolesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="space-y-2">
                {AVAILABLE_ROLES.map(role => (
                  <div key={role} className="flex items-center gap-3">
                    <Checkbox
                      id={`role-${role}`}
                      checked={roles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <label htmlFor={`role-${role}`} className="text-sm cursor-pointer">
                      {roleLabels[role][language] || roleLabels[role].en}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {language === 'fr' ? 'Enregistrer' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
