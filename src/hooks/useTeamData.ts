import { useState, useEffect, useMemo } from 'react';
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
  assessmentDate: string | null;
  skillLevels: Record<string, MasteryLevel | null>;
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

export function useTeamData() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTeam = async () => {
      setLoading(true);

      // 1. Get team relationships
      const { data: teamRels } = await supabase
        .from('team_members')
        .select('member_id')
        .eq('supervisor_id', user.id);

      if (!teamRels || teamRels.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const memberIds = teamRels.map(r => r.member_id);

      // 2. Fetch profiles, assessments, and plans in parallel
      const [profilesRes, assessmentsRes, plansRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, role').in('id', memberIds),
        supabase.from('assessments').select('user_id, ratings, created_at').in('user_id', memberIds).order('created_at', { ascending: false }),
        supabase.from('development_plans').select('user_id, selected_skills, plans, updated_at').in('user_id', memberIds).order('updated_at', { ascending: false }),
      ]);

      const profiles = profilesRes.data || [];
      const assessments = assessmentsRes.data || [];
      const plans = plansRes.data || [];

      // Build member data — use latest assessment and plan per user
      const memberData: TeamMemberData[] = profiles.map(profile => {
        const latestAssessment = assessments.find(a => a.user_id === profile.id);
        const latestPlan = plans.find(p => p.user_id === profile.id);

        const ratings = (latestAssessment?.ratings as Record<string, Rating>) || {};
        const skillLevels = Object.keys(ratings).length > 0
          ? computeSkillLevels(ratings)
          : skills.reduce((acc, s) => ({ ...acc, [s.id]: null }), {} as Record<string, MasteryLevel | null>);

        const planSkills = (latestPlan?.selected_skills as string[]) || [];
        const planActions = ((latestPlan?.plans as unknown as SkillPlan[]) || []).flatMap(p => p.actions || []);
        const totalActions = planActions.length;
        const completedActions = planActions.filter(a => a.status === 'completed').length;
        const inProgressActions = planActions.filter(a => a.status === 'in_progress').length;

        return {
          id: profile.id,
          name: profile.full_name || 'Unnamed',
          initials: getInitials(profile.full_name || 'U'),
          role: profile.role || 'manager',
          assessmentDate: latestAssessment?.created_at?.split('T')[0] ?? null,
          skillLevels,
          focusSkills: planSkills,
          actions: { total: totalActions, completed: completedActions, inProgress: inProgressActions },
        };
      });

      setMembers(memberData);
      setLoading(false);
    };

    fetchTeam();
  }, [user]);

  return { members, loading };
}
