import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checkingRole, setCheckingRole] = useState(false);
  const [showPortalChoice, setShowPortalChoice] = useState(false);
  const [hasVendedorRole, setHasVendedorRole] = useState(false);
  const [hasAdminRole, setHasAdminRole] = useState(false);

  // Show message if redirected from protected route
  useEffect(() => {
    const redirectFrom = searchParams.get("from");
    if (redirectFrom) {
      const messages: Record<string, string> = {
        vendedor: "Faça login para acessar o Portal do Vendedor",
        admin: "Faça login para acessar o Painel Administrativo",
      };
      toast({
        title: "Login necessário",
        description: messages[redirectFrom] || "Faça login para continuar",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      if (!loading && user) {
        setCheckingRole(true);
        try {
          // Check user roles
          const { data: roles, error: rolesError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);

          console.log("Auth: User roles fetched:", roles, "Error:", rolesError);

          const isVendedor = roles?.some(r => r.role === "vendedor");
          const isAdmin = roles?.some(r => r.role === "admin" || r.role === "gerente");

          console.log("Auth: isVendedor:", isVendedor, "isAdmin:", isAdmin);

          // Check if user has a vendedor record
          let hasVendedorRecord = false;
          if (isVendedor) {
            const { data: vendedorData } = await supabase
              .from("vendedores")
              .select("id")
              .eq("user_id", user.id)
              .single();
            hasVendedorRecord = !!vendedorData;
          }

          // If user has both roles AND a vendedor record, let them choose
          if (isVendedor && isAdmin && hasVendedorRecord) {
            setHasVendedorRole(true);
            setHasAdminRole(true);
            setShowPortalChoice(true);
            setCheckingRole(false);
            return;
          }

          // Vendedor-only users go to vendor portal
          if (isVendedor && !isAdmin && hasVendedorRecord) {
            console.log("Auth: Redirecting to /vendedor");
            navigate("/vendedor", { replace: true });
          } else {
            console.log("Auth: Redirecting to /admin");
            navigate("/admin", { replace: true });
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          navigate("/admin", { replace: true });
        } finally {
          setCheckingRole(false);
        }
      }
    };

    checkUserRoleAndRedirect();
  }, [user, loading, navigate]);

  const handlePortalChoice = (portal: "vendedor" | "admin") => {
    setShowPortalChoice(false);
    navigate(`/${portal}`, { replace: true });
  };

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-solar-soft flex flex-col">
      <Header showCalculadora={false} showAdmin={false}>
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar ao site</span>
        </Link>
      </Header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-brand-blue">
              Área Restrita
            </CardTitle>
            <CardDescription>
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Portal Choice Dialog */}
      <Dialog open={showPortalChoice} onOpenChange={setShowPortalChoice}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha o Portal</DialogTitle>
            <DialogDescription>
              Você tem acesso a múltiplos portais. Qual deseja acessar?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {hasVendedorRole && (
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-1"
                onClick={() => handlePortalChoice("vendedor")}
              >
                <span className="font-semibold">Portal do Vendedor</span>
                <span className="text-sm text-muted-foreground">
                  Visualize seus leads e acompanhe suas vendas
                </span>
              </Button>
            )}
            {hasAdminRole && (
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-1"
                onClick={() => handlePortalChoice("admin")}
              >
                <span className="font-semibold">Painel Administrativo</span>
                <span className="text-sm text-muted-foreground">
                  Gerencie leads, clientes, projetos e configurações
                </span>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
