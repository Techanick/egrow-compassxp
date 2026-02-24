
-- Drop the overly permissive insert policy
DROP POLICY "System can insert notifications" ON public.notifications;

-- Replace with a restrictive policy that blocks client-side inserts
-- The trigger uses SECURITY DEFINER so it bypasses RLS
CREATE POLICY "No client inserts on notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (false);
