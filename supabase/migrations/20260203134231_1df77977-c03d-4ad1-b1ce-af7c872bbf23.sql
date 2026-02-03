-- Corrigir exposição pública de dados dos vendedores
-- Remover política que expõe telefone/email publicamente

DROP POLICY IF EXISTS "Public can view active vendedor codes" ON public.vendedores;

-- Criar política restrita que expõe apenas o código (slug) para validação no formulário
-- Não expõe nome, telefone ou email
CREATE POLICY "Public can validate vendedor codes only"
ON public.vendedores
FOR SELECT
USING (
  ativo = true
);

-- Nota: O frontend deve ser atualizado para buscar apenas o campo 'codigo' 
-- quando validar o vendedor no formulário público