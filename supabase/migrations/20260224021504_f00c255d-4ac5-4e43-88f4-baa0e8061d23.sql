
-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow inserts from service role / triggers (no restrictive user policy)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notifications for supervisors when assessment is inserted
CREATE OR REPLACE FUNCTION public.notify_supervisors_on_assessment()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  member_name TEXT;
  supervisor RECORD;
BEGIN
  -- Get the member's name
  SELECT full_name INTO member_name FROM public.profiles WHERE id = NEW.user_id;

  -- Insert a notification for each supervisor
  FOR supervisor IN
    SELECT supervisor_id FROM public.team_members WHERE member_id = NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
      supervisor.supervisor_id,
      'New Assessment Completed',
      COALESCE(member_name, 'A team member') || ' has completed a new self-assessment.'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger on assessment insert
CREATE TRIGGER on_assessment_insert_notify
  AFTER INSERT ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_supervisors_on_assessment();
