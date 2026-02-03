-- Adicionar política para usuários criarem seu próprio perfil
CREATE POLICY "Usuários podem criar próprio perfil"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());