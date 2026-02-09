# Public Forms Security Documentation

**Data:** 2026-02-09

---

## Tabelas com INSERT público (anônimo)

| Tabela | Propósito | Campos aceitos |
|--------|-----------|----------------|
| `leads` | Formulário de captação de leads | nome, telefone, cidade, estado, area, tipo_telhado, rede_atendimento, media_consumo, consumo_previsto, endereço (rua/bairro/cep/numero/complemento), observacoes, vendedor |
| `orcamentos` | Novo orçamento vinculado a lead | Mesmos campos do lead + lead_id |
| `simulacoes` | Resultado da calculadora solar | consumo_kwh, valor_conta, cidade, estado, concessionaria, tipo_telhado, resultados calculados |

## Campos sensíveis NUNCA aceitos via fluxo público

Os formulários públicos **não enviam** e os triggers de sanitização **impedem** que campos sensíveis sejam inseridos via anônimo:

| Campo | Presente em | Protegido por |
|-------|-------------|---------------|
| CPF/CNPJ | `clientes` apenas | RLS: INSERT requer role (admin/gerente/financeiro/vendedor) |
| Identidade (URLs) | `clientes` apenas | RLS: INSERT requer role |
| Comprovante endereço | `clientes` apenas | RLS: INSERT requer role |
| Documentos financeiros | `recebimentos/parcelas/pagamentos` | RLS: INSERT requer role financeiro |

## Proteções Implementadas

### 1. Client-side (Frontend)

| Proteção | Implementação | Arquivo |
|----------|---------------|---------|
| Honeypot field | Campo invisível detecta bots | `src/hooks/useHoneypot.ts` |
| Rate limiting | Max 3 submissões/minuto, cooldown 5min | `src/hooks/useFormRateLimit.ts` |
| Zod validation | Schema validation com formatação | `src/lib/validations.ts` |
| Form progress autosave | Previne perda de dados | `src/hooks/useFormAutoSave.ts` |
| Duplicate detection | Verifica telefone duplicado via RPC | `check_phone_duplicate()` |

### 2. Server-side (Database Triggers)

| Trigger | Tabela | Ação |
|---------|--------|------|
| `sanitize_lead_insert` | `leads` | BEFORE INSERT: força defaults seguros para anônimo |
| `sanitize_orcamento_insert` | `orcamentos` | BEFORE INSERT: força defaults seguros para anônimo |

#### O que os triggers fazem para inserts anônimos:
- ✅ Força `status_id = NULL` (impede manipulação de status)
- ✅ Força `visto = false`, `visto_admin = false`
- ✅ Força `created_from = 'public_form'`
- ✅ Sanitiza `arquivos_urls` (default vazio)
- ✅ Valida tamanho: nome ≤ 200, telefone ≤ 30, observações ≤ 2000
- ✅ Valida campos obrigatórios: nome e telefone não-vazios

#### Para inserts autenticados:
- Marca `created_from = 'authenticated'` (rastreabilidade)

### 3. Rastreabilidade de Origem

Nova coluna `created_from` em:
- `leads` (default: `'public_form'`)
- `orcamentos` (default: `'public_form'`)
- `simulacoes` (default: `'calculadora'`)

Valores possíveis:
| Valor | Significado |
|-------|-------------|
| `public_form` | Formulário público (anônimo) |
| `authenticated` | Inserido por usuário logado |
| `calculadora` | Calculadora solar pública |
| `webhook` | Via webhook externo (n8n/Zapier) |
| `admin` | Criado manualmente pelo admin |

### 4. RPC de Validação (Duplicate Check)

```sql
-- Função SECURITY DEFINER que verifica duplicatas sem expor dados
public.check_phone_duplicate(_telefone text) → boolean
```

## Limitações Conhecidas

1. **Rate limiting é client-side apenas** — um atacante pode ignorá-lo via API direta. Mitigação: o trigger de sanitização no banco impede manipulação de campos, e o honeypot detecta bots simples.

2. **Sem CAPTCHA** — considerado mas não implementado para manter UX de formulário fluida. Se spam se tornar problema, implementar hCaptcha ou reCAPTCHA v3 (invisível).

3. **IP/User-Agent não registrados** — Supabase RLS triggers não têm acesso a headers HTTP. Para logging de IP, seria necessário rotear inserts via Edge Function.

## Recomendações Futuras

- [ ] Implementar Edge Function como proxy para inserts públicos (permite rate limiting server-side + logging de IP)
- [ ] Adicionar reCAPTCHA v3 se volume de spam aumentar
- [ ] Monitorar `created_from = 'public_form'` para detectar anomalias
