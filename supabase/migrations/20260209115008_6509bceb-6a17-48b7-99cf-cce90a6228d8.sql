
-- ====================================================
-- PUBLIC FORMS HARDENING
-- ====================================================
-- 1. Add created_from column to track origin
-- 2. Add server-side trigger to sanitize public inserts
-- 3. Prevent sensitive fields from being set via public flow
-- ====================================================

-- Add created_from to leads
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS created_from text NOT NULL DEFAULT 'public_form';

-- Add created_from to orcamentos
ALTER TABLE public.orcamentos 
  ADD COLUMN IF NOT EXISTS created_from text NOT NULL DEFAULT 'public_form';

-- Add created_from to simulacoes
ALTER TABLE public.simulacoes 
  ADD COLUMN IF NOT EXISTS created_from text NOT NULL DEFAULT 'calculadora';

-- ====================================================
-- Trigger: sanitize public lead inserts
-- When an anonymous/public user inserts a lead, ensure:
-- - No status_id manipulation (force NULL for public)
-- - No visto/visto_admin manipulation (force false)
-- - created_from is set to 'public_form'
-- - Required fields are validated
-- ====================================================

CREATE OR REPLACE FUNCTION public.sanitize_public_lead_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If no authenticated user (public form submission)
  IF auth.uid() IS NULL THEN
    -- Force safe defaults for public submissions
    NEW.status_id := NULL;
    NEW.visto := false;
    NEW.visto_admin := false;
    NEW.created_from := 'public_form';
    NEW.arquivos_urls := COALESCE(NEW.arquivos_urls, '{}'::text[]);
    
    -- Validate required fields
    IF NEW.nome IS NULL OR trim(NEW.nome) = '' THEN
      RAISE EXCEPTION 'Nome é obrigatório';
    END IF;
    IF NEW.telefone IS NULL OR trim(NEW.telefone) = '' THEN
      RAISE EXCEPTION 'Telefone é obrigatório';
    END IF;
    IF length(NEW.nome) > 200 THEN
      RAISE EXCEPTION 'Nome excede o limite de caracteres';
    END IF;
    IF length(NEW.telefone) > 30 THEN
      RAISE EXCEPTION 'Telefone excede o limite de caracteres';
    END IF;
    IF NEW.observacoes IS NOT NULL AND length(NEW.observacoes) > 2000 THEN
      RAISE EXCEPTION 'Observações excedem o limite de caracteres';
    END IF;
  ELSE
    -- Authenticated user - mark origin
    IF NEW.created_from IS NULL OR NEW.created_from = 'public_form' THEN
      NEW.created_from := 'authenticated';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sanitize_lead_insert
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_public_lead_insert();

-- ====================================================
-- Same for orcamentos
-- ====================================================

CREATE OR REPLACE FUNCTION public.sanitize_public_orcamento_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    NEW.status_id := NULL;
    NEW.visto := false;
    NEW.visto_admin := false;
    NEW.created_from := 'public_form';
    NEW.arquivos_urls := COALESCE(NEW.arquivos_urls, '{}'::text[]);
  ELSE
    IF NEW.created_from IS NULL OR NEW.created_from = 'public_form' THEN
      NEW.created_from := 'authenticated';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sanitize_orcamento_insert
  BEFORE INSERT ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_public_orcamento_insert();
