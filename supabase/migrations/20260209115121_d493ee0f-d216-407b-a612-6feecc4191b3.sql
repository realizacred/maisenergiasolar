
-- ====================================================
-- SYSTEM INSERT TABLES: Block direct user INSERT
-- These tables should ONLY be written to by SECURITY DEFINER functions/triggers.
-- Setting WITH CHECK (false) blocks all direct inserts while
-- SECURITY DEFINER functions bypass RLS automatically.
-- ====================================================

-- audit_logs: DROP permissive INSERT, create restrictive
DROP POLICY IF EXISTS "Inserção de logs via função segura" ON public.audit_logs;
CREATE POLICY "Block direct insert - system only"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- meta_notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.meta_notifications;
CREATE POLICY "Block direct insert - system only"
  ON public.meta_notifications FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- vendedor_achievements
DROP POLICY IF EXISTS "System can insert achievements" ON public.vendedor_achievements;
CREATE POLICY "Block direct insert - system only"
  ON public.vendedor_achievements FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- whatsapp_automation_logs
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON public.whatsapp_automation_logs;
CREATE POLICY "Block direct insert - system only"
  ON public.whatsapp_automation_logs FOR INSERT
  TO authenticated
  WITH CHECK (false);
