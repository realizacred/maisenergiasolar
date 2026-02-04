import { useState, useMemo } from "react";
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
import { FollowUpStatsCards } from "@/components/vendor/FollowUpStatsCards";
import { VendorFollowUpManager } from "@/components/vendor/VendorFollowUpManager";
import { VendorPendingDocumentation } from "@/components/vendor/VendorPendingDocumentation";
import { PortalSwitcher } from "@/components/layout/PortalSwitcher";
import { VendorLeadFilters, VendorOrcamentosTable, VendorLeadViewDialog } from "@/components/vendor/leads";
import { ConvertLeadToClientDialog } from "@/components/leads/ConvertLeadToClientDialog";
import { OfflineConversionsManager } from "@/components/leads/OfflineConversionsManager";
import { OfflineDuplicateResolver } from "@/components/vendor/OfflineDuplicateResolver";
import { useOrcamentosVendedor, OrcamentoVendedor } from "@/hooks/useOrcamentosVendedor";
import logo from "@/assets/logo.png";
import type { Lead } from "@/types/lead";
import { useEffect } from "react";

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
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVisto, setFilterVisto] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  
  // Dialog states
  const [selectedOrcamento, setSelectedOrcamento] = useState<OrcamentoVendedor | null>(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [orcamentoToConvert, setOrcamentoToConvert] = useState<OrcamentoVendedor | null>(null);

  // Load vendedor profile
  useEffect(() => {
    if (!user) {
      navigate("/auth?from=vendedor", { replace: true });
      return;
    }
    
    loadVendedorProfile();
  }, [user, navigate]);

  const loadVendedorProfile = async () => {
    if (!user) return;

    console.log("VendedorPortal: Loading profile for user:", user.id);

    try {
      // First check user roles to determine proper redirect
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      console.log("VendedorPortal: User roles:", userRoles, "Error:", rolesError);

      const isAdmin = userRoles?.some(r => r.role === "admin" || r.role === "gerente" || r.role === "financeiro");
      
      // Get vendedor profile linked to user
      const { data: vendedorData, error: vendedorError } = await supabase
        .from("vendedores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log("VendedorPortal: Vendedor data:", vendedorData, "Error:", vendedorError);

      if (vendedorError || !vendedorData) {
        console.log("VendedorPortal: No vendedor found, isAdmin:", isAdmin);
        
        // If user is admin/gerente, allow access with admin mode (sees all orcamentos)
        if (isAdmin) {
          console.log("VendedorPortal: Admin mode - showing all orcamentos");
          setIsAdminMode(true);
          setVendedor(ADMIN_PROFILE);
        } else {
          toast({
            title: "Acesso negado",
            description: "Seu usuário não está vinculado a um vendedor. Entre em contato com o administrador.",
            variant: "destructive",
          });
          console.log("VendedorPortal: Signing out user without vendedor link");
          await signOut();
          navigate("/auth", { replace: true });
          return;
        }
      } else {
        console.log("VendedorPortal: Vendedor found:", vendedorData.nome);
        setVendedor(vendedorData);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // Use the orcamentos hook once vendedor is loaded
  const {
    orcamentos,
    statuses,
    loading: orcamentosLoading,
    stats,
    estados,
    fetchOrcamentos,
    toggleVisto,
    updateStatus,
    deleteOrcamento,
  } = useOrcamentosVendedor({
    vendedorNome: vendedor?.nome || null,
    isAdminMode,
  });

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

  const handleClearFilters = () => {
    setFilterVisto("todos");
    setFilterEstado("todos");
    setFilterStatus("todos");
  };

  // Convert orcamento to Lead format for conversion dialog
  const orcamentoToLead = (orc: OrcamentoVendedor): Lead => ({
    id: orc.lead_id,
    lead_code: orc.lead_code,
    nome: orc.nome,
    telefone: orc.telefone,
    telefone_normalized: orc.telefone.replace(/\D/g, ""),
    cep: orc.cep,
    estado: orc.estado,
    cidade: orc.cidade,
    bairro: orc.bairro,
    rua: orc.rua,
    numero: orc.numero,
    complemento: orc.complemento,
    area: orc.area,
    tipo_telhado: orc.tipo_telhado,
    rede_atendimento: orc.rede_atendimento,
    media_consumo: orc.media_consumo,
    consumo_previsto: orc.consumo_previsto,
    observacoes: orc.observacoes,
    arquivos_urls: orc.arquivos_urls,
    vendedor: orc.vendedor,
    visto: orc.visto,
    visto_admin: orc.visto_admin,
    status_id: orc.status_id,
    ultimo_contato: orc.ultimo_contato,
    proxima_acao: orc.proxima_acao,
    data_proxima_acao: orc.data_proxima_acao,
    created_at: orc.created_at,
    updated_at: orc.updated_at,
  });

  // Convert orcamentos to leads for components that expect Lead type
  const leadsForAlerts = useMemo(() => 
    orcamentos.map(orcamentoToLead), 
    [orcamentos]
  );

  const filteredOrcamentos = useMemo(() => {
    let filtered = orcamentos.filter(orc =>
      orc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.telefone.includes(searchTerm) ||
      orc.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orc.orc_code && orc.orc_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterVisto === "visto") {
      filtered = filtered.filter(orc => orc.visto);
    } else if (filterVisto === "nao_visto") {
      filtered = filtered.filter(orc => !orc.visto);
    }

    if (filterEstado !== "todos") {
      filtered = filtered.filter(orc => orc.estado === filterEstado);
    }

    if (filterStatus !== "todos") {
      if (filterStatus === "novo") {
        filtered = filtered.filter(orc => !orc.status_id);
      } else {
        filtered = filtered.filter(orc => orc.status_id === filterStatus);
      }
    }

    return filtered;
  }, [orcamentos, searchTerm, filterVisto, filterEstado, filterStatus]);

  const loading = initialLoading || orcamentosLoading;

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
                {isAdminMode ? "Visualizando todos os orçamentos" : vendedor?.nome}
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
              <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Orçamentos cadastrados com seu link
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orçamentos Novos</CardTitle>
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
                Orçamentos captados no mês atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Follow-Up Stats Cards (Urgentes, Pendentes, Em dia) */}
        <FollowUpStatsCards leads={leadsForAlerts} />

        {/* AI Assistant Alerts */}
        <LeadAlerts leads={leadsForAlerts} diasAlerta={3} />

        {/* Follow-Up Manager */}
        <VendorFollowUpManager 
          leads={leadsForAlerts} 
          diasAlerta={3}
          onViewLead={(lead) => {
            const orc = orcamentos.find(o => o.lead_id === lead.id);
            if (orc) setSelectedOrcamento(orc);
          }}
        />

        {/* Pending Documentation Widget */}
        <VendorPendingDocumentation 
          leads={leadsForAlerts}
          statuses={statuses}
          onConvertClick={(lead) => {
            const orc = orcamentos.find(o => o.lead_id === lead.id);
            if (orc) {
              setOrcamentoToConvert(orc);
              setIsConvertOpen(true);
            }
          }}
        />

        {/* Offline Duplicate Resolver */}
        <OfflineDuplicateResolver vendedorNome={vendedor?.nome} />

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
                Compartilhe este link com seus clientes para captar orçamentos
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

        {/* Orcamentos Table */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Orçamentos</CardTitle>
            <CardDescription>
              Lista de todos os orçamentos captados através do seu link
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
            <VendorOrcamentosTable
              orcamentos={filteredOrcamentos}
              statuses={statuses}
              onToggleVisto={toggleVisto}
              onView={(orc) => setSelectedOrcamento(orc)}
              onStatusChange={updateStatus}
              onDelete={(orc) => deleteOrcamento(orc.id)}
              onConvert={(orc) => {
                setOrcamentoToConvert(orc);
                setIsConvertOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </main>

      <ConvertLeadToClientDialog
        lead={orcamentoToConvert ? orcamentoToLead(orcamentoToConvert) : null}
        open={isConvertOpen}
        onOpenChange={setIsConvertOpen}
        orcamentoId={orcamentoToConvert?.id ?? null}
        onSuccess={fetchOrcamentos}
      />

      {/* Detalhes (botão do olho) */}
      <VendorLeadViewDialog
        lead={selectedOrcamento ? orcamentoToLead(selectedOrcamento) : null}
        open={!!selectedOrcamento}
        onOpenChange={(open) => {
          if (!open) setSelectedOrcamento(null);
        }}
      />
    </div>
  );
}
