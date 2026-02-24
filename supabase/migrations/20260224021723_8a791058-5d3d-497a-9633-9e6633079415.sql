
-- Function to notify supervisors when a development plan is updated
CREATE OR REPLACE FUNCTION public.notify_supervisors_on_plan_update()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  member_name TEXT;
  supervisor RECORD;
BEGIN
  SELECT full_name INTO member_name FROM public.profiles WHERE id = NEW.user_id;

  FOR supervisor IN
    SELECT supervisor_id FROM public.team_members WHERE member_id = NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
      supervisor.supervisor_id,
      'Development Plan Updated',
      COALESCE(member_name, 'A team member') || ' has updated their development plan.'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger on plan insert
CREATE TRIGGER on_plan_insert_notify
  AFTER INSERT ON public.development_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_supervisors_on_plan_update();

-- Trigger on plan update
CREATE TRIGGER on_plan_update_notify
  AFTER UPDATE ON public.development_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_supervisors_on_plan_update();
