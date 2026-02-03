import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: AppRole[];
  requireAnyRole?: boolean; // true = qualquer role da lista, false = todas as roles
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requireAnyRole = true,
  fallbackPath = "/app/unauthorized",
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading, hasAnyRole, hasRole } = useUserRoles();
  const location = useLocation();

  // Aguardar carregamento
  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não autenticado - redireciona para login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Se não requer roles específicas, apenas autenticação
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Verifica se o usuário tem as roles necessárias
  const hasAccess = requireAnyRole
    ? hasAnyRole(requiredRoles)
    : requiredRoles.every(role => hasRole(role));

  // Sem acesso - redireciona para página de não autorizado ou dashboard
  if (!hasAccess) {
    // Se não tem nenhuma role, provavelmente é um usuário novo
    if (roles.length === 0) {
      return <Navigate to="/app/pending" replace />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
