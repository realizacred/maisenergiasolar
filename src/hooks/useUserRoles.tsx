import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Tipos de roles disponíveis no sistema
export type AppRole = 'admin' | 'gerente' | 'vendedor' | 'instalador' | 'financeiro';

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  telefone: string | null;
  avatar_url: string | null;
  ativo: boolean;
}

interface RolesContextType {
  roles: AppRole[];
  profile: UserProfile | null;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  isAdmin: boolean;
  isGerente: boolean;
  isVendedor: boolean;
  isInstalador: boolean;
  isFinanceiro: boolean;
  canAccessLeads: boolean;
  canAccessClientes: boolean;
  canAccessProjetos: boolean;
  canAccessChecklistCliente: boolean;
  canAccessChecklistInstalador: boolean;
  canAccessFinanceiro: boolean;
  canAccessAdmin: boolean;
  refetch: () => Promise<void>;
}

const RolesContext = createContext<RolesContextType | undefined>(undefined);

export function RolesProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRolesAndProfile = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      // Buscar roles do usuário
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (rolesError) {
        console.error("Erro ao buscar roles:", rolesError);
      } else {
        const userRoles = rolesData?.map(r => r.role as AppRole) || [];
        setRoles(userRoles);
      }

      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Erro ao buscar perfil:", profileError);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchRolesAndProfile();
    }
  }, [authLoading, fetchRolesAndProfile]);

  const hasRole = useCallback((role: AppRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  const hasAnyRole = useCallback((checkRoles: AppRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role));
  }, [roles]);

  // Atalhos para verificar roles específicas
  const isAdmin = hasRole('admin');
  const isGerente = hasRole('gerente');
  const isVendedor = hasRole('vendedor');
  const isInstalador = hasRole('instalador');
  const isFinanceiro = hasRole('financeiro');

  // Permissões por módulo baseadas na tabela RBAC
  const canAccessLeads = hasAnyRole(['admin', 'gerente', 'vendedor']);
  const canAccessClientes = hasAnyRole(['admin', 'gerente', 'vendedor', 'instalador', 'financeiro']);
  const canAccessProjetos = hasAnyRole(['admin', 'gerente', 'vendedor', 'instalador', 'financeiro']);
  const canAccessChecklistCliente = hasAnyRole(['admin', 'gerente', 'vendedor']);
  const canAccessChecklistInstalador = hasAnyRole(['admin', 'gerente', 'instalador']);
  const canAccessFinanceiro = hasAnyRole(['admin', 'gerente', 'financeiro']);
  const canAccessAdmin = isAdmin;

  return (
    <RolesContext.Provider
      value={{
        roles,
        profile,
        loading: loading || authLoading,
        hasRole,
        hasAnyRole,
        isAdmin,
        isGerente,
        isVendedor,
        isInstalador,
        isFinanceiro,
        canAccessLeads,
        canAccessClientes,
        canAccessProjetos,
        canAccessChecklistCliente,
        canAccessChecklistInstalador,
        canAccessFinanceiro,
        canAccessAdmin,
        refetch: fetchRolesAndProfile,
      }}
    >
      {children}
    </RolesContext.Provider>
  );
}

export function useUserRoles() {
  const context = useContext(RolesContext);
  if (context === undefined) {
    throw new Error("useUserRoles must be used within a RolesProvider");
  }
  return context;
}
