
-- 1. Create the new self-scoped has_role function (single argument)
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  );
$$;

-- 2. Update all RLS policies that use the old two-argument has_role

-- user_roles: Admins can view roles
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role('admin'::app_role));

-- site_config: admin policies
DROP POLICY IF EXISTS "Admins can delete site config" ON public.site_config;
CREATE POLICY "Admins can delete site config"
  ON public.site_config FOR DELETE TO authenticated
  USING (public.has_role('admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert site config" ON public.site_config;
CREATE POLICY "Admins can insert site config"
  ON public.site_config FOR INSERT TO authenticated
  WITH CHECK (public.has_role('admin'::app_role));

DROP POLICY IF EXISTS "Admins can update site config" ON public.site_config;
CREATE POLICY "Admins can update site config"
  ON public.site_config FOR UPDATE TO authenticated
  USING (public.has_role('admin'::app_role));

-- subscribers: admin view
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.subscribers;
CREATE POLICY "Admins can view subscribers"
  ON public.subscribers FOR SELECT TO authenticated
  USING (public.has_role('admin'::app_role));

-- 3. Drop the old two-argument function to prevent enumeration
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- 4. Revoke execute from public on the new function (only used internally by RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO postgres;

-- 5. Fix search_path on queue functions (linter warnings)
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;
