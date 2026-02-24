
-- Notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  notify_assessment BOOLEAN NOT NULL DEFAULT true,
  notify_plan_update BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Update assessment trigger to check preferences
CREATE OR REPLACE FUNCTION public.notify_supervisors_on_assessment()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  member_name TEXT;
  supervisor RECORD;
  pref_enabled BOOLEAN;
BEGIN
  SELECT full_name INTO member_name FROM public.profiles WHERE id = NEW.user_id;

  FOR supervisor IN
    SELECT supervisor_id FROM public.team_members WHERE member_id = NEW.user_id
  LOOP
    -- Check supervisor preference (default true if no row)
    SELECT COALESCE(
      (SELECT notify_assessment FROM public.notification_preferences WHERE user_id = supervisor.supervisor_id),
      true
    ) INTO pref_enabled;

    IF pref_enabled THEN
      INSERT INTO public.notifications (user_id, title, message)
      VALUES (
        supervisor.supervisor_id,
        'New Assessment Completed',
        COALESCE(member_name, 'A team member') || ' has completed a new self-assessment.'
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Update plan trigger to check preferences
CREATE OR REPLACE FUNCTION public.notify_supervisors_on_plan_update()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  member_name TEXT;
  supervisor RECORD;
  pref_enabled BOOLEAN;
BEGIN
  SELECT full_name INTO member_name FROM public.profiles WHERE id = NEW.user_id;

  FOR supervisor IN
    SELECT supervisor_id FROM public.team_members WHERE member_id = NEW.user_id
  LOOP
    SELECT COALESCE(
      (SELECT notify_plan_update FROM public.notification_preferences WHERE user_id = supervisor.supervisor_id),
      true
    ) INTO pref_enabled;

    IF pref_enabled THEN
      INSERT INTO public.notifications (user_id, title, message)
      VALUES (
        supervisor.supervisor_id,
        'Development Plan Updated',
        COALESCE(member_name, 'A team member') || ' has updated their development plan.'
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;
