import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  TrendingUp, 
  Eye, 
  LogOut, 
  Copy,
  ExternalLink,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LeadAlerts } from "@/components/vendor/LeadAlerts";
import { PortalSwitcher } from "@/components/layout/PortalSwitcher";
import { VendorLeadFilters, VendorLeadsTable, VendorLeadViewDialog } from "@/components/vendor/leads";
import { ConvertLeadToClientDialog } from "@/components/leads/ConvertLeadToClientDialog";
import { OfflineConversionsManager } from "@/components/leads/OfflineConversionsManager";
import logo from "@/assets/logo.png";
import type { Lead, LeadStatus } from "@/types/lead";

interface VendedorProfile {
  id: string;
  nome: string;
  codigo: string;
  telefone: string;
  email: string | null;
}

// Special admin profile when admin accesses without vendedor record
const ADMIN_PROFILE: VendedorProfile = {
  id: "admin",
  nome: "Administrador",
  codigo: "admin",
  telefone: "",
  email: null,
};

export default function VendedorPortal() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [vendedor, setVendedor] = useState<VendedorProfile | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVisto, setFilterVisto] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  
  // Dialog states
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth?from=vendedor", { replace: true });
      return;
    }
    
    loadVendedorData();
  }, [user, navigate]);

  const loadVendedorData = async () => {
    if (!user) return;

    console.log("VendedorPortal: Loading data for user:", user.id);

    try {
      // First check user roles to determine proper redirect
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      console.log("VendedorPortal: User roles:", userRoles, "Error:", rolesError);

      const isAdmin = userRoles?.some(r => r.role === "admin" || r.role === "gerente");
      
      // Get vendedor profile linked to user
      const { data: vendedorData, error: vendedorError } = await supabase
        .from("vendedores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log("VendedorPortal: Vendedor data:", vendedorData, "Error:", vendedorError);

      if (vendedorError || !vendedorData) {
        console.log("VendedorPortal: No vendedor found, isAdmin:", isAdmin);
        
        // If user is admin/gerente, allow access with admin mode (sees all leads)
        if (isAdmin) {
          console.log("VendedorPortal: Admin mode - showing all leads");
          setIsAdminMode(true);
          setVendedor(ADMIN_PROFILE);
          
          // Load ALL leads for admin
          const { data: leadsData, error: leadsError } = await supabase
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false });

          if (leadsError) throw leadsError;
          setLeads(leadsData || []);
        } else {
          toast({
            title: "Acesso negado",
            description: "Seu usuário não está vinculado a um vendedor. Entre em contato com o administrador.",
            variant: "destructive",
          });
          // Sign out to prevent redirect loop
          console.log("VendedorPortal: Signing out user without vendedor link");
          await signOut();
          navigate("/auth", { replace: true });
          return;
        }
      } else {
        console.log("VendedorPortal: Vendedor found, loading leads");

        setVendedor(vendedorData);

        // Load leads for this vendedor with all fields
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .eq("vendedor", vendedorData.nome)
          .order("created_at", { ascending: false });

        if (leadsError) throw leadsError;
        setLeads(leadsData || []);
      }

      // Load lead statuses
      const { data: statusData } = await supabase
        .from("lead_status")
        .select("*")
        .order("ordem");
      
      setStatuses(statusData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const copyLink = () => {
    if (!vendedor) return;
    const link = `${window.location.origin}/v/${vendedor.codigo}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Seu link de vendedor foi copiado para a área de transferência.",
    });
  };

  const handleToggleVisto = async (lead: Lead) => {
    const newVisto = !lead.visto;
    
    // Optimistic update
    setLeads(prev => 
      prev.map(l => l.id === lead.id ? { ...l, visto: newVisto } : l)
    );

    const { error } = await supabase
      .from("leads")
      .update({ visto: newVisto })
      .eq("id", lead.id);

    if (error) {
      // Revert on error
      setLeads(prev => 
        prev.map(l => l.id === lead.id ? { ...l, visto: !newVisto } : l)
      );
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (leadId: string, newStatusId: string | null) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status_id: newStatusId, ultimo_contato: new Date().toISOString() } 
          : lead
      )
    );
  };

  const handleDeleteLead = async (lead: Lead) => {
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", lead.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lead.",
        variant: "destructive",
      });
      return;
    }

    setLeads(prev => prev.filter(l => l.id !== lead.id));
    toast({
      title: "Lead excluído",
      description: `O lead "${lead.nome}" foi excluído com sucesso.`,
    });
  };

  const handleClearFilters = () => {
    setFilterVisto("todos");
    setFilterEstado("todos");
    setFilterStatus("todos");
  };

  // Derived data
  const estados = useMemo(() => 
    [...new Set(leads.map(l => l.estado))].sort(), 
    [leads]
  );

  const filteredLeads = useMemo(() => {
    let filtered = leads.filter(lead =>
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone.includes(searchTerm) ||
      lead.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterVisto === "visto") {
      filtered = filtered.filter(lead => lead.visto);
    } else if (filterVisto === "nao_visto") {
      filtered = filtered.filter(lead => !lead.visto);
    }

    if (filterEstado !== "todos") {
      filtered = filtered.filter(lead => lead.estado === filterEstado);
    }

    if (filterStatus !== "todos") {
      if (filterStatus === "novo") {
        filtered = filtered.filter(lead => !lead.status_id);
      } else {
        filtered = filtered.filter(lead => lead.status_id === filterStatus);
      }
    }

    return filtered;
  }, [leads, searchTerm, filterVisto, filterEstado, filterStatus]);

  const stats = useMemo(() => ({
    total: leads.length,
    novos: leads.filter(l => !l.visto).length,
    esteMes: leads.filter(l => {
      const date = new Date(l.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  }), [leads]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10" />
            <div>
              <h1 className="font-bold text-lg">
                Portal do Vendedor
                {isAdminMode && <span className="text-xs ml-2 text-primary">(Modo Admin)</span>}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAdminMode ? "Visualizando todos os leads" : vendedor?.nome}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PortalSwitcher />
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Leads cadastrados com seu link
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Leads Novos</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.novos}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando primeiro contato
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.esteMes}</div>
              <p className="text-xs text-muted-foreground">
                Leads captados no mês atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Alerts */}
        <LeadAlerts leads={leads} diasAlerta={3} />

        {/* Offline Conversions Manager */}
        <OfflineConversionsManager />

        {/* Share Link Card - only show for actual vendedores, not admin mode */}
        {!isAdminMode && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Seu Link de Vendedor
              </CardTitle>
              <CardDescription>
                Compartilhe este link com seus clientes para captar leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={`${window.location.origin}/v/${vendedor?.codigo || ''}`}
                  className="bg-background"
                />
                <Button onClick={copyLink} variant="secondary">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Leads</CardTitle>
            <CardDescription>
              Lista de todos os leads captados através do seu link
            </CardDescription>
            <VendorLeadFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterVisto={filterVisto}
              onFilterVistoChange={setFilterVisto}
              filterEstado={filterEstado}
              onFilterEstadoChange={setFilterEstado}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              estados={estados}
              statuses={statuses}
              onClearFilters={handleClearFilters}
            />
          </CardHeader>
          <CardContent>
            <VendorLeadsTable
              leads={filteredLeads}
              statuses={statuses}
              onToggleVisto={handleToggleVisto}
              onView={(lead) => {
                setSelectedLead(lead);
                setIsViewOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteLead}
              onConvert={(lead) => {
                setLeadToConvert(lead);
                setIsConvertOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </main>

      <VendorLeadViewDialog
        lead={selectedLead}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

      <ConvertLeadToClientDialog
        lead={leadToConvert}
        open={isConvertOpen}
        onOpenChange={setIsConvertOpen}
        onSuccess={loadVendedorData}
      />
    </div>
  );
}
