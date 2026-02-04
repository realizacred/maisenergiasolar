import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftRight, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { clearPortalPreference } from "@/pages/PortalSelector";

interface PortalAccess {
  vendedor: boolean;
  admin: boolean;
  vendedorRecord: boolean;
}

export function PortalSwitcher() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [access, setAccess] = useState<PortalAccess>({ vendedor: false, admin: false, vendedorRecord: false });
  const [loading, setLoading] = useState(true);

  const currentPortal = location.pathname.startsWith("/vendedor") ? "vendedor" : "admin";

  useEffect(() => {
    if (user) {
      checkAccess();
    }
  }, [user]);

  const checkAccess = async () => {
    if (!user) return;

    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isVendedor = roles?.some(r => r.role === "vendedor");
      const isAdmin = roles?.some(r => r.role === "admin" || r.role === "gerente" || r.role === "financeiro");

      let hasVendedorRecord = false;
      if (isVendedor) {
        const { data: vendedorData } = await supabase
          .from("vendedores")
          .select("id")
          .eq("user_id", user.id)
          .single();
        hasVendedorRecord = !!vendedorData;
      }

      setAccess({
        vendedor: isVendedor || false,
        admin: isAdmin || false,
        vendedorRecord: hasVendedorRecord,
      });
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (portal: "vendedor" | "admin") => {
    if (portal !== currentPortal) {
      navigate(`/${portal}`);
    }
  };

  const handleResetPreference = () => {
    clearPortalPreference();
    navigate("/portal");
  };

  // Show if admin (can access all portals) or has both roles with vendedor record
  const hasMultipleAccess = access.admin || (access.vendedor && access.vendedorRecord);
  
  if (loading || !hasMultipleAccess) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          <span className="hidden sm:inline">Alternar Portal</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Alternar Portal</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleSwitch("vendedor")}
          className={currentPortal === "vendedor" ? "bg-primary/10" : ""}
        >
          <Users className="mr-2 h-4 w-4" />
          <span>Portal do Vendedor</span>
          {currentPortal === "vendedor" && (
            <span className="ml-auto text-xs text-muted-foreground">Atual</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleSwitch("admin")}
          className={currentPortal === "admin" ? "bg-primary/10" : ""}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Painel Admin</span>
          {currentPortal === "admin" && (
            <span className="ml-auto text-xs text-muted-foreground">Atual</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleResetPreference} className="text-muted-foreground">
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          <span className="text-sm">Redefinir preferência</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
