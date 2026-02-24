
-- Add department and geography columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS department text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS geography text DEFAULT NULL;

-- Create a function for HR to read all profiles
CREATE OR REPLACE FUNCTION public.is_hr(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'hr'
  )
$$;

-- HR can view all profiles
CREATE POLICY "HR can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_hr(auth.uid()));

-- HR can view all assessments
CREATE POLICY "HR can view all assessments"
  ON public.assessments FOR SELECT
  USING (public.is_hr(auth.uid()));

-- HR can view all development plans
CREATE POLICY "HR can view all development plans"
  ON public.development_plans FOR SELECT
  USING (public.is_hr(auth.uid()));

-- HR can view all team_members relationships
CREATE POLICY "HR can view all team members"
  ON public.team_members FOR SELECT
  USING (public.is_hr(auth.uid()));
