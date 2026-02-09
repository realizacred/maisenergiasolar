# Auth Security Configuration

**Data:** 2026-02-09

---

## Configurações Aplicadas via API

| Configuração | Valor | Status |
|--------------|-------|--------|
| Auto-confirm email | ❌ Desabilitado | ✅ Verificação de email obrigatória |
| Disable signup | ❌ Habilitado | ✅ Signup permitido (necessário p/ formulários) |
| Anonymous users | ❌ Desabilitado | ✅ Sem acesso anônimo |

## Leaked Password Protection

### Status: ⚠️ PENDENTE — Requer ativação manual

A proteção contra senhas vazadas (HaveIBeenPwned) precisa ser ativada no painel do backend.

### Como ativar:

1. Acesse o painel do backend (Lovable Cloud)
2. Navegue até **Authentication → Settings → Password**
3. Ative a opção **"Leaked Password Protection"**
4. Defina o nível para **"Prevent use of leaked passwords"** (mais restritivo)
5. Salve as configurações

### Política de Senha Recomendada:
- Comprimento mínimo: **8 caracteres** (padrão Supabase)
- Leaked password protection: **Ativado**
- Email verification: **Obrigatória** ✅ (já configurado)

### Teste de Validação:
Após ativar, testar:
1. Tentar criar conta com senha "password123" → Deve ser bloqueado
2. Tentar criar conta com senha "123456" → Deve ser bloqueado
3. Criar conta com senha forte aleatória → Deve funcionar

---

## Resumo de Segurança Auth

| Item | Status |
|------|--------|
| Email verification obrigatória | ✅ Ativo |
| Anonymous users | ✅ Desabilitado |
| Auto-confirm | ✅ Desabilitado |
| Leaked password protection | ⚠️ Pendente ativação manual |
| RBAC via user_roles | ✅ Implementado |
| Edge Functions com JWT check | ✅ Implementado |
