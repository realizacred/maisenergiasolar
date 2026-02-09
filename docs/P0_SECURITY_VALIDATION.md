# P0 Security Validation Report

**Data:** 2026-02-09
**Escopo:** Hardening de RLS policies — tabelas críticas

---

## Matriz de Acesso por Role (DEPOIS da migration P0)

### `profiles`
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| anon | ❌ | ❌ | ❌ | ❌ |
| authenticated (sem role) | ❌ | ❌ | ❌ | ❌ |
| vendedor | Próprio perfil | Próprio perfil | Próprio perfil | ❌ |
| instalador | Próprio perfil | Próprio perfil | Próprio perfil | ❌ |
| financeiro | Próprio perfil | Próprio perfil | Próprio perfil | ❌ |
| gerente | ✅ Todos | Via admin policy | Via admin policy | Via admin policy |
| admin | ✅ Todos | ✅ Todos | ✅ Todos | ✅ Todos |

### `clientes` (PII: CPF, identidade, endereço, documentos)
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| anon | ❌ | ❌ | ❌ | ❌ |
| authenticated (sem role) | ❌ | ❌ | ❌ | ❌ |
| vendedor | Apenas de seus leads | Apenas p/ seus leads | Apenas de seus leads | ❌ |
| instalador | ❌ | ❌ | ❌ | ❌ |
| financeiro | ✅ Todos | ✅ | ✅ | ❌ |
| gerente | ✅ Todos | ✅ | ✅ | ✅ |
| admin | ✅ Todos | ✅ | ✅ | ✅ |

### `recebimentos`
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| anon | ❌ | ❌ | ❌ | ❌ |
| authenticated (sem role) | ❌ | ❌ | ❌ | ❌ |
| vendedor | ❌ | ❌ | ❌ | ❌ |
| instalador | ❌ | ❌ | ❌ | ❌ |
| financeiro | ✅ | ✅ | ✅ | ✅ |
| gerente | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ |

### `parcelas`
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| anon | ❌ | ❌ | ❌ | ❌ |
| authenticated (sem role) | ❌ | ❌ | ❌ | ❌ |
| vendedor | ❌ | ❌ | ❌ | ❌ |
| financeiro | ✅ | ✅ | ✅ | ✅ |
| gerente | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ |

### `pagamentos`
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| anon | ❌ | ❌ | ❌ | ❌ |
| authenticated (sem role) | ❌ | ❌ | ❌ | ❌ |
| vendedor | ❌ | ❌ | ❌ | ❌ |
| financeiro | ✅ | ✅ | ✅ | ✅ |
| gerente | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ |

### `checklists_instalacao`
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| anon | ❌ | ❌ | ❌ | ❌ |
| authenticated (sem role) | ❌ | ❌ | ❌ | ❌ |
| instalador | Próprios | Próprios | Próprios | Próprios |
| gerente | ✅ Todos | ✅ | ✅ | ✅ |
| admin | ✅ Todos | ✅ | ✅ | ✅ |

### Outras tabelas corrigidas
| Tabela | Antes | Depois |
|--------|-------|--------|
| `financiamento_api_config` | ALL p/ authenticated | ALL admin/gerente; SELECT authenticated |
| `financiamento_bancos` | ALL p/ authenticated | ALL admin/gerente; SELECT authenticated (ativos) |
| `whatsapp_messages` | SELECT/INSERT authenticated | SELECT/INSERT admin/gerente/vendedor |

---

## WITH CHECK(true) — Policies Restantes (Intencionais)

| Tabela | Policy | Justificativa |
|--------|--------|---------------|
| `audit_logs` | INSERT | Inserção via SECURITY DEFINER functions |
| `leads` | INSERT | Formulário público de captação |
| `orcamentos` | INSERT | Formulário público de captação |
| `meta_notifications` | INSERT | Trigger SECURITY DEFINER |
| `simulacoes` | INSERT | Calculadora pública |
| `vendedor_achievements` | INSERT | Sistema de gamificação (trigger) |
| `whatsapp_automation_logs` | INSERT | Sistema de automação (trigger) |

---

## Rollback

Para reverter as policies antigas em caso de problemas:

```sql
-- P0-1: Reverter profiles
DROP POLICY IF EXISTS "Usuário vê próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admin/Gerente podem ver todos perfis" ON public.profiles;
CREATE POLICY "Usuários autenticados podem ver perfis"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated'::text);

-- P0-2: Reverter clientes
DROP POLICY IF EXISTS "Admin/Gerente/Financeiro podem criar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Vendedor pode criar clientes de seus leads" ON public.clientes;
DROP POLICY IF EXISTS "Admin/Gerente/Financeiro podem atualizar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Vendedor pode atualizar clientes de seus leads" ON public.clientes;
DROP POLICY IF EXISTS "Admin/Gerente podem deletar clientes" ON public.clientes;
CREATE POLICY "Usuários autenticados podem criar clientes"
  ON public.clientes FOR INSERT WITH CHECK (auth.role() = 'authenticated'::text);
CREATE POLICY "Usuários autenticados podem atualizar clientes"
  ON public.clientes FOR UPDATE USING (auth.role() = 'authenticated'::text);
CREATE POLICY "Usuários autenticados podem deletar clientes"
  ON public.clientes FOR DELETE USING (auth.role() = 'authenticated'::text);

-- P0-3: Reverter financeiro (recebimentos, parcelas, pagamentos)
-- [Mesma lógica: dropar novas, recriar antigas com authenticated]

-- P0-4: Reverter checklists_instalacao
DROP POLICY IF EXISTS "Admin/Gerente podem ver checklists instalacao" ON public.checklists_instalacao;
DROP POLICY IF EXISTS "Admin/Gerente podem gerenciar checklists instalacao" ON public.checklists_instalacao;
CREATE POLICY "Anyone can submit checklists via public link"
  ON public.checklists_instalacao FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their submitted checklist"
  ON public.checklists_instalacao FOR SELECT USING (true);
```
