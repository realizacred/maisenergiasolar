
-- ====================================================
-- P0 SECURITY HARDENING MIGRATION
-- ====================================================
-- Fixes:
-- P0-1: profiles - restrict SELECT to own user + admin/gerente
-- P0-2: clientes - restrict INSERT/UPDATE/DELETE to proper roles
-- P0-3: recebimentos/parcelas/pagamentos - restrict to financeiro roles
-- P0-4: Remove dangerous WITH CHECK(true) and overly broad authenticated policies
-- Also: financiamento_api_config, financiamento_bancos, whatsapp_messages, checklists_instalacao
-- ====================================================

-- ====================================================
-- P0-1: PROFILES
-- ====================================================

-- Drop old overly permissive SELECT policy
DROP POLICY IF EXISTS "Usuários autenticados podem ver perfis" ON public.profiles;

-- New: Users can see own profile + admin/gerente can see all
CREATE POLICY "Usuário vê próprio perfil"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin/Gerente podem ver todos perfis"
  ON public.profiles FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role]));

-- ====================================================
-- P0-2: CLIENTES - restrict write operations
-- ====================================================

-- Drop overly permissive write policies
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem criar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar clientes" ON public.clientes;

-- New: Only admin/gerente/financeiro can INSERT/UPDATE/DELETE
CREATE POLICY "Admin/Gerente/Financeiro podem criar clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

CREATE POLICY "Vendedor pode criar clientes de seus leads"
  ON public.clientes FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'vendedor'::app_role)
    AND lead_id IS NOT NULL
    AND lead_id IN (
      SELECT id FROM public.leads WHERE vendedor = get_vendedor_nome(auth.uid())
    )
  );

CREATE POLICY "Admin/Gerente/Financeiro podem atualizar clientes"
  ON public.clientes FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

CREATE POLICY "Vendedor pode atualizar clientes de seus leads"
  ON public.clientes FOR UPDATE
  USING (
    has_role(auth.uid(), 'vendedor'::app_role)
    AND lead_id IN (
      SELECT id FROM public.leads WHERE vendedor = get_vendedor_nome(auth.uid())
    )
  );

CREATE POLICY "Admin/Gerente podem deletar clientes"
  ON public.clientes FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role]));

-- ====================================================
-- P0-3: RECEBIMENTOS - restrict to financial roles
-- ====================================================

DROP POLICY IF EXISTS "Usuários autenticados podem criar recebimentos" ON public.recebimentos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar recebimentos" ON public.recebimentos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar recebimentos" ON public.recebimentos;

CREATE POLICY "Admin/Gerente/Financeiro podem criar recebimentos"
  ON public.recebimentos FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

CREATE POLICY "Admin/Gerente/Financeiro podem atualizar recebimentos"
  ON public.recebimentos FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

CREATE POLICY "Admin/Gerente/Financeiro podem deletar recebimentos"
  ON public.recebimentos FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

-- ====================================================
-- P0-3: PARCELAS - restrict to financial roles
-- ====================================================

DROP POLICY IF EXISTS "Usuários autenticados podem criar parcelas" ON public.parcelas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar parcelas" ON public.parcelas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar parcelas" ON public.parcelas;

CREATE POLICY "Admin/Gerente/Financeiro podem criar parcelas"
  ON public.parcelas FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

CREATE POLICY "Admin/Gerente/Financeiro podem atualizar parcelas"
  ON public.parcelas FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

CREATE POLICY "Admin/Gerente/Financeiro podem deletar parcelas"
  ON public.parcelas FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

-- ====================================================
-- P0-3: PAGAMENTOS - restrict to financial roles
-- ====================================================

DROP POLICY IF EXISTS "Usuários autenticados podem criar pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar pagamentos" ON public.pagamentos;

CREATE POLICY "Admin/Gerente/Financeiro podem criar pagamentos"
  ON public.pagamentos FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

CREATE POLICY "Admin/Gerente/Financeiro podem atualizar pagamentos"
  ON public.pagamentos FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

CREATE POLICY "Admin/Gerente/Financeiro podem deletar pagamentos"
  ON public.pagamentos FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'financeiro'::app_role]));

-- ====================================================
-- P0-4: CHECKLISTS_INSTALACAO - remove public access
-- ====================================================

DROP POLICY IF EXISTS "Anyone can submit checklists via public link" ON public.checklists_instalacao;
DROP POLICY IF EXISTS "Anyone can view their submitted checklist" ON public.checklists_instalacao;

-- Admin/Gerente can see all checklists
CREATE POLICY "Admin/Gerente podem ver checklists instalacao"
  ON public.checklists_instalacao FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role]));

-- Admin/Gerente can manage all checklists
CREATE POLICY "Admin/Gerente podem gerenciar checklists instalacao"
  ON public.checklists_instalacao FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role]));

-- ====================================================
-- P0-4: FINANCIAMENTO_API_CONFIG - restrict to admin
-- ====================================================

DROP POLICY IF EXISTS "Authenticated users can manage API config" ON public.financiamento_api_config;
DROP POLICY IF EXISTS "Authenticated users can view API config" ON public.financiamento_api_config;

CREATE POLICY "Admin/Gerente podem gerenciar API config"
  ON public.financiamento_api_config FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role]));

CREATE POLICY "Usuários autenticados podem ver API config"
  ON public.financiamento_api_config FOR SELECT
  USING (auth.role() = 'authenticated'::text);

-- ====================================================
-- P0-4: FINANCIAMENTO_BANCOS - restrict write to admin
-- ====================================================

DROP POLICY IF EXISTS "Authenticated users can manage banks" ON public.financiamento_bancos;

CREATE POLICY "Admin/Gerente podem gerenciar bancos"
  ON public.financiamento_bancos FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role]));

-- ====================================================
-- P0-4: WHATSAPP_MESSAGES - restrict to proper roles
-- ====================================================

DROP POLICY IF EXISTS "Usuários autenticados podem ver mensagens" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Usuários autenticados podem criar mensagens" ON public.whatsapp_messages;

CREATE POLICY "Admin/Gerente/Vendedor podem ver mensagens WhatsApp"
  ON public.whatsapp_messages FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'vendedor'::app_role]));

CREATE POLICY "Admin/Gerente/Vendedor podem criar mensagens WhatsApp"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'gerente'::app_role, 'vendedor'::app_role]));
