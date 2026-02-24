import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { skills, getBehaviorsByLevel, MasteryLevel } from '@/data/frameworkData';

type Rating = 'hardly_ever' | 'sometimes' | 'often' | 'almost_always';

const MASTERY_LEVELS: MasteryLevel[] = ['fundamentals', 'intermediate', 'advanced', 'referent'];
const VALIDATION_THRESHOLD = 3;

export interface TeamMemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarUrl: string | null;
  department: string | null;
  geography: string | null;
  assessmentDate: string | null;
  skillLevels: Record<string, MasteryLevel | null>;
  ratings: Record<string, Rating>;
  focusSkills: string[];
  actions: { total: number; completed: number; inProgress: number };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function computeSkillLevels(ratings: Record<string, Rating>): Record<string, MasteryLevel | null> {
  const result: Record<string, MasteryLevel | null> = {};
  for (const skill of skills) {
    let highest: MasteryLevel | null = null;
    for (const level of MASTERY_LEVELS) {
      const behaviors = getBehaviorsByLevel(skill, level);
      const qualifying = behaviors.filter(
        b => ratings[b.id] === 'often' || ratings[b.id] === 'almost_always'
      ).length;
      if (qualifying >= VALIDATION_THRESHOLD) {
        highest = level;
      }
    }
    result[skill.id] = highest;
  }
  return result;
}

interface PlanAction {
  id: string;
  status: 'todo' | 'in_progress' | 'completed';
}

interface SkillPlan {
  skillId: string;
  actions: PlanAction[];
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export function useTeamData(dateRange?: DateRange, isHR?: boolean) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let memberIds: string[];

    if (isHR) {
      // HR sees all profiles (RLS policy allows this)
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', user.id);
      memberIds = (allProfiles || []).map(p => p.id);
    } else {
      const { data: teamRels } = await supabase
        .from('team_members')
        .select('member_id')
        .eq('supervisor_id', user.id);

      if (!teamRels || teamRels.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }
      memberIds = teamRels.map(r => r.member_id);
    }

    if (memberIds.length === 0) {
      setMembers([]);
      setLoading(false);
      return;
    }

    // Build assessments query with optional date filtering
    let assessmentsQuery = supabase
      .from('assessments')
      .select('user_id, ratings, created_at')
      .in('user_id', memberIds)
      .order('created_at', { ascending: false });

    if (dateRange?.from) {
      assessmentsQuery = assessmentsQuery.gte('created_at', dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      // Include the entire "to" day
      const endOfDay = new Date(dateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      assessmentsQuery = assessmentsQuery.lte('created_at', endOfDay.toISOString());
    }

    const [profilesRes, assessmentsRes, plansRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role, avatar_url, department, geography').in('id', memberIds),
      assessmentsQuery,
      supabase.from('development_plans').select('user_id, selected_skills, plans, updated_at').in('user_id', memberIds).order('updated_at', { ascending: false }),
    ]);

    const profiles = profilesRes.data || [];
    const assessments = assessmentsRes.data || [];
    const plans = plansRes.data || [];

    const memberData: TeamMemberData[] = profiles.map(profile => {
      const latestAssessment = assessments.find(a => a.user_id === profile.id);
      const latestPlan = plans.find(p => p.user_id === profile.id);

      const ratings = (latestAssessment?.ratings as Record<string, Rating>) || {};
      const skillLevels = Object.keys(ratings).length > 0
        ? computeSkillLevels(ratings)
        : skills.reduce((acc, s) => ({ ...acc, [s.id]: null }), {} as Record<string, MasteryLevel | null>);

      const planSkills = (latestPlan?.selected_skills as string[]) || [];
      const planActions = ((latestPlan?.plans as unknown as SkillPlan[]) || []).flatMap(p => p.actions || []);

      return {
        id: profile.id,
        name: profile.full_name || 'Unnamed',
        initials: getInitials(profile.full_name || 'U'),
        role: profile.role || 'manager',
        avatarUrl: profile.avatar_url || null,
        department: (profile as any).department || null,
        geography: (profile as any).geography || null,
        assessmentDate: latestAssessment?.created_at?.split('T')[0] ?? null,
        skillLevels,
        ratings,
        focusSkills: planSkills,
        actions: {
          total: planActions.length,
          completed: planActions.filter(a => a.status === 'completed').length,
          inProgress: planActions.filter(a => a.status === 'in_progress').length,
        },
      };
    });

    setMembers(memberData);
    setLoading(false);
  }, [user, isHR, dateRange?.from?.getTime(), dateRange?.to?.getTime()]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Subscribe to realtime assessment inserts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('team-assessments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'assessments' },
        () => {
          // Refetch team data when any assessment is inserted
          fetchTeam();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTeam]);

  return { members, loading, refresh: fetchTeam };
}
