
-- Team relationships: supervisor -> report
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(supervisor_id, member_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Supervisors can see their team relationships
CREATE POLICY "Supervisors can view their team" ON public.team_members
  FOR SELECT TO authenticated USING (auth.uid() = supervisor_id);

-- Supervisors can manage their team
CREATE POLICY "Supervisors can insert team members" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = supervisor_id);

CREATE POLICY "Supervisors can delete team members" ON public.team_members
  FOR DELETE TO authenticated USING (auth.uid() = supervisor_id);

-- Security definer function to check if user is a supervisor of another user
CREATE OR REPLACE FUNCTION public.is_supervisor_of(_supervisor_id UUID, _member_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE supervisor_id = _supervisor_id AND member_id = _member_id
  )
$$;

-- Allow supervisors to read their reports' profiles
CREATE POLICY "Supervisors can view report profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_supervisor_of(auth.uid(), id));

-- Allow supervisors to read their reports' assessments
CREATE POLICY "Supervisors can view report assessments" ON public.assessments
  FOR SELECT TO authenticated
  USING (public.is_supervisor_of(auth.uid(), user_id));

-- Allow supervisors to read their reports' development plans
CREATE POLICY "Supervisors can view report plans" ON public.development_plans
  FOR SELECT TO authenticated
  USING (public.is_supervisor_of(auth.uid(), user_id));
