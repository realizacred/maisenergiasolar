import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  TrendingUp, 
  Eye, 
  LogOut, 
  Search,
  Phone,
  MapPin,
  Calendar,
  Copy,
  ExternalLink,
  Loader2,
  User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { LeadAlerts } from "@/components/vendor/LeadAlerts";
import { LeadStatusSelector } from "@/components/vendor/LeadStatusSelector";
import logo from "@/assets/logo.png";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  media_consumo: number;
  created_at: string;
  ultimo_contato: string | null;
  visto: boolean;
  lead_code: string | null;
  status_id: string | null;
}

interface VendedorProfile {
  id: string;
  nome: string;
  codigo: string;
  telefone: string;
  email: string | null;
}

interface LeadStatus {
  id: string;
  nome: string;
  cor: string;
}

export default function VendedorPortal() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [vendedor, setVendedor] = useState<VendedorProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    loadVendedorData();
  }, [user, navigate]);

  const loadVendedorData = async () => {
    if (!user) return;

    try {
      // First check user roles to determine proper redirect
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdmin = userRoles?.some(r => r.role === "admin" || r.role === "gerente");
      
      // Get vendedor profile linked to user
      const { data: vendedorData, error: vendedorError } = await supabase
        .from("vendedores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (vendedorError || !vendedorData) {
        // If user is admin/gerente, redirect to admin panel
        if (isAdmin) {
          navigate("/admin");
          return;
        }
        
        toast({
          title: "Acesso negado",
          description: "Seu usuário não está vinculado a um vendedor. Entre em contato com o administrador.",
          variant: "destructive",
        });
        // Sign out to prevent redirect loop
        await signOut();
        navigate("/auth");
        return;
      }

      setVendedor(vendedorData);

      // Load leads for this vendedor (include ultimo_contato for AI alerts)
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("id, nome, telefone, cidade, estado, media_consumo, created_at, ultimo_contato, visto, lead_code, status_id")
        .eq("vendedor", vendedorData.nome)
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

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
    const link = `${window.location.origin}/?v=${vendedor.codigo}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Seu link de vendedor foi copiado para a área de transferência.",
    });
  };

  const getStatusName = (statusId: string | null) => {
    if (!statusId) return "Novo";
    const status = statuses.find(s => s.id === statusId);
    return status?.nome || "Desconhecido";
  };

  const handleLocalStatusChange = (leadId: string, newStatusId: string | null) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status_id: newStatusId, ultimo_contato: new Date().toISOString() } 
          : lead
      )
    );
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone.includes(searchTerm) ||
      lead.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "novos") return matchesSearch && !lead.visto;
    if (activeTab === "vistos") return matchesSearch && lead.visto;
    return matchesSearch;
  });

  const stats = {
    total: leads.length,
    novos: leads.filter(l => !l.visto).length,
    esteMes: leads.filter(l => {
      const date = new Date(l.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  };

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
              <h1 className="font-bold text-lg">Portal do Vendedor</h1>
              <p className="text-sm text-muted-foreground">{vendedor?.nome}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
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

        {/* Share Link Card */}
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
                value={`${window.location.origin}/?v=${vendedor?.codigo || ''}`}
                className="bg-background"
              />
              <Button onClick={copyLink} variant="secondary">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Leads</CardTitle>
            <CardDescription>
              Lista de todos os leads captados através do seu link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="todos">Todos ({leads.length})</TabsTrigger>
                  <TabsTrigger value="novos">Novos ({stats.novos})</TabsTrigger>
                  <TabsTrigger value="vistos">Vistos ({leads.length - stats.novos})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Table */}
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum lead encontrado</p>
                <p className="text-sm mt-1">
                  Compartilhe seu link para começar a captar leads
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead className="hidden md:table-cell">Localização</TableHead>
                      <TableHead className="hidden sm:table-cell">Consumo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{lead.nome}</span>
                              {!lead.visto && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                  Novo
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <a 
                                href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline"
                              >
                                {lead.telefone}
                              </a>
                            </div>
                            {lead.lead_code && (
                              <span className="text-xs text-muted-foreground">
                                {lead.lead_code}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {lead.cidade}, {lead.estado}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm">{lead.media_consumo} kWh</span>
                        </TableCell>
                        <TableCell>
                          <LeadStatusSelector
                            leadId={lead.id}
                            currentStatusId={lead.status_id}
                            statuses={statuses}
                            onStatusChange={(newStatusId) => handleLocalStatusChange(lead.id, newStatusId)}
                          />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
