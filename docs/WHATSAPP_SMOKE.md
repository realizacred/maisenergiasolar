# WhatsApp Smoke Test — Pós P0 Hardening

**Data:** 2026-02-09

---

## Resumo

| Teste | Status | Observações |
|-------|--------|-------------|
| Inbox carrega conversas (admin) | ✅ OK | Policy SELECT requer `admin/gerente/vendedor`. Query em `WhatsAppAutomationConfig.tsx` funciona. |
| Inbox carrega conversas (vendedor) | ✅ OK | Vendedor tem acesso via `has_any_role`. |
| Inbox — usuário sem role | ✅ OK (bloqueado) | SELECT retorna 0 rows (RLS bloqueia). |
| Enviar mensagem (admin/vendedor) | ✅ OK | Edge function `send-whatsapp-message` autentica via token. INSERT em `whatsapp_messages` com policy `admin/gerente/vendedor`. |
| Enviar mensagem (user sem role) | ✅ OK (bloqueado) | INSERT falha com RLS violation. Edge function valida role via `getClaims`. |
| Automação (trigger boas-vindas) | ✅ OK | `process-whatsapp-automations` usa `SERVICE_ROLE_KEY` → bypassa RLS. Logs em `whatsapp_automation_logs` via service_role. |
| Automação (mudança de status) | ✅ OK | Mesmo mecanismo: trigger → pg_net → edge function com service_role. |
| Templates de automação (admin) | ✅ OK | Policy ALL para `admin/gerente`. |
| Templates de automação (vendedor) | ✅ OK (read-only) | SELECT apenas templates ativos. Não pode criar/editar. |
| Logs de automação (admin) | ✅ OK | SELECT restrito a `admin/gerente`. |
| Logs de automação — INSERT direto | ✅ OK (bloqueado) | Policy `WITH CHECK (false)` aplicada na migration P0-system. |

---

## Detalhes das Policies

### `whatsapp_messages`
| Operação | Policy | Acesso |
|----------|--------|--------|
| SELECT | `Admin/Gerente/Vendedor podem ver mensagens WhatsApp` | `has_any_role(admin, gerente, vendedor)` |
| INSERT | `Admin/Gerente/Vendedor podem criar mensagens WhatsApp` | `has_any_role(admin, gerente, vendedor)` |
| UPDATE | ❌ Nenhuma policy | Bloqueado (mensagens imutáveis) |
| DELETE | ❌ Nenhuma policy | Bloqueado (mensagens imutáveis) |

### `whatsapp_automation_templates`
| Operação | Policy | Acesso |
|----------|--------|--------|
| ALL (CRUD) | `Admin/Gerente podem gerenciar templates` | `has_any_role(admin, gerente)` |
| SELECT | `Usuários autenticados podem ver templates ativos` | authenticated + `ativo = true` |

### `whatsapp_automation_logs`
| Operação | Policy | Acesso |
|----------|--------|--------|
| SELECT | `Admin/Gerente podem ver logs` | `has_any_role(admin, gerente)` |
| INSERT | `Block direct insert - system only` | `WITH CHECK (false)` — apenas service_role |

---

## Fluxo de Envio Validado

```
1. Usuário clica "Enviar WhatsApp" no frontend
2. Frontend chama edge function `send-whatsapp-message` com auth token
3. Edge function valida: token válido + role admin/gerente/vendedor
4. Envia via webhook e/ou Evolution API
5. INSERT em `whatsapp_messages` usando token do usuário (RLS valida role)
6. Se RLS bloqueia → log warning no console, envio NÃO é afetado
```

```
1. Trigger Postgres dispara em INSERT/UPDATE de leads
2. pg_net chama `process-whatsapp-automations` com service_role_key
3. Edge function usa SERVICE_ROLE_KEY (bypassa RLS)
4. INSERT em `whatsapp_automation_logs` via service_role ✅
```

---

## Riscos Residuais

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Vendedor vê TODAS as mensagens (não só dos seus leads) | Baixo | Aceitável — vendedores precisam do contexto compartilhado. Para restringir, adicionar join com leads.vendedor. |
| Sem UPDATE/DELETE em whatsapp_messages | Info | Intencional — mensagens são imutáveis para auditoria. |

---

## Verificação — Query

```sql
-- Confirmar policies de whatsapp_messages
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'whatsapp_messages'
ORDER BY cmd;

-- Resultado esperado:
-- INSERT: has_any_role(admin, gerente, vendedor)
-- SELECT: has_any_role(admin, gerente, vendedor)
```
