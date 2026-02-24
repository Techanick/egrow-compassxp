
-- Allow HR to view all user roles
CREATE POLICY "HR can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (is_hr(auth.uid()));

-- Allow HR to insert roles
CREATE POLICY "HR can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (is_hr(auth.uid()));

-- Allow HR to delete roles
CREATE POLICY "HR can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (is_hr(auth.uid()));

-- Allow HR to update any profile (department, geography, etc.)
CREATE POLICY "HR can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (is_hr(auth.uid()));
