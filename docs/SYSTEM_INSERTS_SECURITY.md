# System Insert Tables — Security Validation

**Data:** 2026-02-09

---

## Tabelas Protegidas

Estas tabelas são escritas **exclusivamente** por funções SECURITY DEFINER (triggers, RPCs). Inserts diretos de usuários authenticated são **bloqueados** via `WITH CHECK (false)`.

| Tabela | Quem insere | Mecanismo |
|--------|-------------|-----------|
| `audit_logs` | Triggers/RPCs de auditoria (SECURITY DEFINER) | Trigger nos updates/deletes de tabelas auditadas |
| `meta_notifications` | Trigger de gamificação (SECURITY DEFINER) | Disparado quando vendedor atinge % da meta |
| `vendedor_achievements` | Trigger de gamificação (SECURITY DEFINER) | Disparado ao atingir marcos de vendas |
| `whatsapp_automation_logs` | Edge function `process-whatsapp-automations` via service_role | Registra envios automáticos |

## Policies Atuais

```
audit_logs:
  SELECT → admin only (has_role 'admin')
  INSERT → WITH CHECK (false) — bloqueado para todos
  UPDATE → USING (false) / WITH CHECK (false) — imutável
  DELETE → USING (false) — imutável

meta_notifications:
  SELECT → vendedor (próprias) ou admin/gerente
  INSERT → WITH CHECK (false) — bloqueado para todos
  UPDATE → vendedor (próprias) — apenas marcar como lida

vendedor_achievements:
  SELECT → public read (leaderboard)
  INSERT → WITH CHECK (false) — bloqueado para todos

whatsapp_automation_logs:
  SELECT → admin/gerente only
  INSERT → WITH CHECK (false) — bloqueado para todos
```

## Por que funciona

- **SECURITY DEFINER** functions executam com as permissões do *owner* (geralmente `postgres`), que tem acesso superuser e **bypassa RLS automaticamente**.
- `WITH CHECK (false)` bloqueia qualquer INSERT feito via `supabase.from('tabela').insert(...)` por um usuário autenticado normal.
- O `service_role` key (usado por Edge Functions) também bypassa RLS.

## Query de Verificação

Execute esta query para confirmar que as policies estão corretas:

```sql
SELECT 
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('audit_logs', 'meta_notifications', 'vendedor_achievements', 'whatsapp_automation_logs')
  AND cmd = 'INSERT'
ORDER BY tablename;
```

**Resultado esperado:** todas as linhas devem mostrar `with_check = false`.

## Teste Negativo (Staging)

Para validar que inserts diretos falham, execute como um usuário authenticated (não service_role):

```sql
-- Deve falhar com "new row violates row-level security policy"
INSERT INTO public.audit_logs (tabela, acao, registro_id)
VALUES ('test', 'test_insert', 'test-id');

-- Deve falhar
INSERT INTO public.meta_notifications (vendedor_id, tipo_meta, percentual_atingido, mes, ano)
VALUES ('00000000-0000-0000-0000-000000000000', 'test', 50, 1, 2026);

-- Deve falhar
INSERT INTO public.vendedor_achievements (vendedor_id, achievement_type, achievement_name)
VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'test');

-- Deve falhar
INSERT INTO public.whatsapp_automation_logs (lead_id, tipo, status, mensagem)
VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'failed', 'test');
```

**Resultado esperado:** Todos os INSERTs devem retornar erro RLS.

## Rollback

Para reverter (caso quebre algum trigger legítimo):

```sql
DROP POLICY IF EXISTS "Block direct insert - system only" ON public.audit_logs;
CREATE POLICY "Inserção de logs via função segura"
  ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Block direct insert - system only" ON public.meta_notifications;
CREATE POLICY "System can insert notifications"
  ON public.meta_notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Block direct insert - system only" ON public.vendedor_achievements;
CREATE POLICY "System can insert achievements"
  ON public.vendedor_achievements FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Block direct insert - system only" ON public.whatsapp_automation_logs;
CREATE POLICY "Sistema pode inserir logs"
  ON public.whatsapp_automation_logs FOR INSERT WITH CHECK (true);
```
