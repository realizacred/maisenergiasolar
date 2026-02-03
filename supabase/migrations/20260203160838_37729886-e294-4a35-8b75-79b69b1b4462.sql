-- =============================================
-- SISTEMA RBAC (Role-Based Access Control)
-- =============================================

-- 1. Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'vendedor', 'instalador', 'financeiro');

-- 2. Tabela de roles por usuário
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- 3. Tabela de perfis de usuário (dados adicionais)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    telefone TEXT,
    avatar_url TEXT,
    ativo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Função SECURITY DEFINER para verificar roles (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- 5. Função para verificar se usuário tem qualquer role de uma lista
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = ANY(_roles)
    )
$$;

-- 6. Função para obter roles do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(array_agg(role), ARRAY[]::app_role[])
    FROM public.user_roles
    WHERE user_id = _user_id
$$;

-- =============================================
-- TABELA DE PROJETOS (vincula lead → cliente → projeto)
-- =============================================

CREATE TYPE public.projeto_status AS ENUM (
    'aguardando_documentacao',
    'em_analise',
    'aprovado',
    'em_instalacao',
    'instalado',
    'comissionado',
    'concluido',
    'cancelado'
);

CREATE TABLE public.projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE,
    lead_id UUID REFERENCES public.leads(id),
    cliente_id UUID REFERENCES public.clientes(id),
    vendedor_id UUID REFERENCES auth.users(id),
    instalador_id UUID REFERENCES auth.users(id),
    
    -- Dados técnicos
    potencia_kwp NUMERIC,
    numero_modulos INTEGER,
    modelo_modulos TEXT,
    modelo_inversor TEXT,
    tipo_instalacao TEXT, -- residencial, comercial, rural
    
    -- Valores
    valor_total NUMERIC,
    valor_equipamentos NUMERIC,
    valor_mao_obra NUMERIC,
    
    -- Datas
    data_venda DATE,
    data_previsao_instalacao DATE,
    data_instalacao DATE,
    data_comissionamento DATE,
    
    -- Status e observações
    status projeto_status DEFAULT 'aguardando_documentacao' NOT NULL,
    observacoes TEXT,
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Gerar código do projeto automaticamente
CREATE SEQUENCE IF NOT EXISTS public.projeto_code_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_projeto_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.codigo := 'PROJ-' || LPAD(nextval('public.projeto_code_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_projeto_code
BEFORE INSERT ON public.projetos
FOR EACH ROW
WHEN (NEW.codigo IS NULL)
EXECUTE FUNCTION public.generate_projeto_code();

-- =============================================
-- SIMULAÇÕES (vinculadas a leads)
-- =============================================

CREATE TABLE public.simulacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    
    -- Dados de entrada
    tipo_conta TEXT, -- residencial, comercial
    valor_conta NUMERIC,
    consumo_kwh INTEGER,
    cidade TEXT,
    estado TEXT,
    concessionaria TEXT,
    tipo_telhado TEXT,
    
    -- Resultados
    potencia_recomendada_kwp NUMERIC,
    geracao_mensal_estimada INTEGER,
    economia_mensal NUMERIC,
    economia_anual NUMERIC,
    investimento_estimado NUMERIC,
    payback_meses INTEGER,
    co2_evitado_kg NUMERIC,
    
    -- Parâmetros usados no cálculo
    tarifa_kwh_usada NUMERIC,
    irradiacao_usada NUMERIC,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =============================================
-- CHECKLIST CLIENTE (Avaliação Pré-Venda) - Híbrido
-- =============================================

CREATE TYPE public.checklist_cliente_status AS ENUM (
    'pendente',
    'em_preenchimento', 
    'enviado',
    'em_revisao',
    'aprovado',
    'reprovado'
);

-- Templates de checklist (configurável pelo admin)
CREATE TABLE public.checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'cliente' ou 'instalador'
    descricao TEXT,
    ativo BOOLEAN DEFAULT true NOT NULL,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Itens do template (campos base)
CREATE TABLE public.checklist_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.checklist_templates(id) ON DELETE CASCADE NOT NULL,
    etapa TEXT NOT NULL, -- 'dados_imovel', 'consumo', 'estrutura', 'eletrica', 'fotos'
    campo TEXT NOT NULL,
    tipo_campo TEXT NOT NULL, -- 'text', 'number', 'boolean', 'select', 'photo', 'file'
    opcoes JSONB, -- para campos select
    obrigatorio BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Checklist do cliente (instância)
CREATE TABLE public.checklists_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.checklist_templates(id),
    
    -- Responsáveis
    vendedor_id UUID REFERENCES auth.users(id),
    revisor_id UUID REFERENCES auth.users(id),
    
    -- Status
    status checklist_cliente_status DEFAULT 'pendente' NOT NULL,
    data_envio TIMESTAMP WITH TIME ZONE,
    data_revisao TIMESTAMP WITH TIME ZONE,
    
    -- Observações
    observacoes_internas TEXT,
    observacoes_cliente TEXT,
    motivo_reprovacao TEXT,
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Respostas dos itens do checklist cliente
CREATE TABLE public.checklist_cliente_respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.checklists_cliente(id) ON DELETE CASCADE NOT NULL,
    template_item_id UUID REFERENCES public.checklist_template_items(id),
    
    -- Campo customizado (quando não vem do template)
    campo_custom TEXT,
    etapa TEXT,
    
    -- Resposta
    valor TEXT,
    valor_numerico NUMERIC,
    valor_boolean BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Arquivos do checklist cliente
CREATE TABLE public.checklist_cliente_arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.checklists_cliente(id) ON DELETE CASCADE NOT NULL,
    resposta_id UUID REFERENCES public.checklist_cliente_respostas(id) ON DELETE CASCADE,
    
    categoria TEXT NOT NULL, -- 'conta_luz', 'documento', 'foto_telhado', 'foto_padrao', 'foto_disjuntor'
    nome_arquivo TEXT NOT NULL,
    url TEXT NOT NULL,
    tipo_mime TEXT,
    tamanho_bytes INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- CHECKLIST INSTALADOR (Execução) - Melhorado
-- =============================================

CREATE TYPE public.checklist_instalador_status AS ENUM (
    'agendado',
    'em_execucao',
    'pausado',
    'pendente_correcao',
    'finalizado',
    'cancelado'
);

CREATE TYPE public.checklist_instalador_fase AS ENUM (
    'pre_instalacao',
    'instalacao_estrutura',
    'instalacao_modulos',
    'instalacao_eletrica',
    'comissionamento',
    'pos_instalacao'
);

-- Checklist do instalador (instância)
CREATE TABLE public.checklists_instalador (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id),
    template_id UUID REFERENCES public.checklist_templates(id),
    
    -- Responsáveis
    instalador_id UUID REFERENCES auth.users(id) NOT NULL,
    supervisor_id UUID REFERENCES auth.users(id),
    
    -- Datas
    data_agendada DATE,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status checklist_instalador_status DEFAULT 'agendado' NOT NULL,
    fase_atual checklist_instalador_fase DEFAULT 'pre_instalacao',
    
    -- Dados da instalação
    endereco TEXT,
    bairro TEXT,
    cidade TEXT,
    
    -- Assinaturas
    assinatura_instalador_url TEXT,
    assinatura_cliente_url TEXT,
    
    -- Observações
    observacoes TEXT,
    pendencias TEXT,
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Respostas dos itens do checklist instalador
CREATE TABLE public.checklist_instalador_respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.checklists_instalador(id) ON DELETE CASCADE NOT NULL,
    template_item_id UUID REFERENCES public.checklist_template_items(id),
    fase checklist_instalador_fase NOT NULL,
    
    -- Campo
    campo TEXT NOT NULL,
    
    -- Resposta
    valor TEXT,
    valor_boolean BOOLEAN,
    conforme BOOLEAN,
    
    -- Observação específica
    observacao TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    respondido_por UUID REFERENCES auth.users(id)
);

-- Arquivos do checklist instalador
CREATE TABLE public.checklist_instalador_arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.checklists_instalador(id) ON DELETE CASCADE NOT NULL,
    resposta_id UUID REFERENCES public.checklist_instalador_respostas(id) ON DELETE CASCADE,
    fase checklist_instalador_fase,
    
    categoria TEXT NOT NULL,
    nome_arquivo TEXT NOT NULL,
    url TEXT NOT NULL,
    tipo_mime TEXT,
    tamanho_bytes INTEGER,
    obrigatorio BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- ATIVIDADES DE LEADS (Histórico)
-- =============================================

CREATE TYPE public.atividade_tipo AS ENUM (
    'ligacao',
    'whatsapp',
    'email',
    'reuniao',
    'visita',
    'proposta',
    'negociacao',
    'anotacao',
    'status_change'
);

CREATE TABLE public.lead_atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    
    tipo atividade_tipo NOT NULL,
    descricao TEXT NOT NULL,
    
    -- Para agendamentos
    data_agendada TIMESTAMP WITH TIME ZONE,
    concluido BOOLEAN DEFAULT false,
    
    -- Metadados
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- AUDIT LOGS (Rastreabilidade)
-- =============================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Quem fez
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    
    -- O que foi feito
    acao TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    tabela TEXT NOT NULL,
    registro_id UUID,
    
    -- Dados
    dados_anteriores JSONB,
    dados_novos JSONB,
    
    -- Contexto
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_projetos_cliente_id ON public.projetos(cliente_id);
CREATE INDEX idx_projetos_lead_id ON public.projetos(lead_id);
CREATE INDEX idx_projetos_vendedor_id ON public.projetos(vendedor_id);
CREATE INDEX idx_projetos_instalador_id ON public.projetos(instalador_id);
CREATE INDEX idx_projetos_status ON public.projetos(status);
CREATE INDEX idx_simulacoes_lead_id ON public.simulacoes(lead_id);
CREATE INDEX idx_checklists_cliente_projeto_id ON public.checklists_cliente(projeto_id);
CREATE INDEX idx_checklists_cliente_status ON public.checklists_cliente(status);
CREATE INDEX idx_checklists_instalador_projeto_id ON public.checklists_instalador(projeto_id);
CREATE INDEX idx_checklists_instalador_instalador_id ON public.checklists_instalador(instalador_id);
CREATE INDEX idx_checklists_instalador_status ON public.checklists_instalador(status);
CREATE INDEX idx_lead_atividades_lead_id ON public.lead_atividades(lead_id);
CREATE INDEX idx_audit_logs_tabela ON public.audit_logs(tabela);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================
-- TRIGGERS UPDATED_AT
-- =============================================

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at
BEFORE UPDATE ON public.projetos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_templates_updated_at
BEFORE UPDATE ON public.checklist_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklists_cliente_updated_at
BEFORE UPDATE ON public.checklists_cliente
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_cliente_respostas_updated_at
BEFORE UPDATE ON public.checklist_cliente_respostas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklists_instalador_updated_at
BEFORE UPDATE ON public.checklists_instalador
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_instalador_respostas_updated_at
BEFORE UPDATE ON public.checklist_instalador_respostas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS (Row Level Security)
-- =============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_cliente_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_cliente_arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists_instalador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_instalador_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_instalador_arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas user_roles
CREATE POLICY "Admins podem gerenciar roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem ver suas próprias roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Políticas profiles
CREATE POLICY "Usuários autenticados podem ver perfis"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem editar próprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins podem gerenciar perfis"
ON public.profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas projetos
CREATE POLICY "Admin e Gerente veem todos projetos"
ON public.projetos FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente']::app_role[]));

CREATE POLICY "Vendedor vê projetos que vendeu"
ON public.projetos FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'vendedor') 
    AND vendedor_id = auth.uid()
);

CREATE POLICY "Instalador vê projetos atribuídos"
ON public.projetos FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'instalador') 
    AND instalador_id = auth.uid()
);

CREATE POLICY "Financeiro vê todos projetos"
ON public.projetos FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'financeiro'));

CREATE POLICY "Admin e Gerente gerenciam projetos"
ON public.projetos FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente']::app_role[]));

-- Políticas simulações (público pode criar via calculadora)
CREATE POLICY "Qualquer um pode criar simulação"
ON public.simulacoes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Autenticados podem ver simulações"
ON public.simulacoes FOR SELECT
TO authenticated
USING (true);

-- Políticas templates (admin configura)
CREATE POLICY "Todos podem ver templates ativos"
ON public.checklist_templates FOR SELECT
TO authenticated
USING (ativo = true);

CREATE POLICY "Admin gerencia templates"
ON public.checklist_templates FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Todos podem ver itens de template"
ON public.checklist_template_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin gerencia itens de template"
ON public.checklist_template_items FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas checklists cliente
CREATE POLICY "Admin/Gerente/Vendedor veem checklists cliente"
ON public.checklists_cliente FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'vendedor']::app_role[]));

CREATE POLICY "Admin/Gerente/Vendedor gerenciam checklists cliente"
ON public.checklists_cliente FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'vendedor']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'vendedor']::app_role[]));

-- Políticas checklists instalador
CREATE POLICY "Admin/Gerente veem todos checklists instalador"
ON public.checklists_instalador FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente']::app_role[]));

CREATE POLICY "Instalador vê seus checklists"
ON public.checklists_instalador FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'instalador') 
    AND instalador_id = auth.uid()
);

CREATE POLICY "Instalador gerencia seus checklists"
ON public.checklists_instalador FOR ALL
TO authenticated
USING (
    public.has_role(auth.uid(), 'instalador') 
    AND instalador_id = auth.uid()
)
WITH CHECK (
    public.has_role(auth.uid(), 'instalador') 
    AND instalador_id = auth.uid()
);

CREATE POLICY "Admin/Gerente gerenciam checklists instalador"
ON public.checklists_instalador FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente']::app_role[]));

-- Políticas respostas e arquivos seguem o checklist pai
CREATE POLICY "Acesso respostas checklist cliente"
ON public.checklist_cliente_respostas FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'vendedor']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'vendedor']::app_role[]));

CREATE POLICY "Acesso arquivos checklist cliente"
ON public.checklist_cliente_arquivos FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'vendedor']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'vendedor']::app_role[]));

CREATE POLICY "Acesso respostas checklist instalador"
ON public.checklist_instalador_respostas FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'instalador']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'instalador']::app_role[]));

CREATE POLICY "Acesso arquivos checklist instalador"
ON public.checklist_instalador_arquivos FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'instalador']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'instalador']::app_role[]));

-- Políticas atividades de lead
CREATE POLICY "Acesso atividades lead"
ON public.lead_atividades FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'vendedor']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'gerente', 'vendedor']::app_role[]));

-- Políticas audit logs (apenas admin pode ver)
CREATE POLICY "Admin pode ver logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sistema pode inserir logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);