import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LogOut, Search, Trash2, Users, Loader2, Phone, MapPin, Zap, Eye, FileText, Image, ExternalLink, BarChart3, Kanban, Calculator, Webhook, Bell, Building2, Filter, UserCheck, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import logo from "@/assets/logo.png";
import VendedoresManager from "@/components/admin/VendedoresManager";
import DashboardCharts from "@/components/admin/DashboardCharts";
import LeadsPipeline from "@/components/admin/LeadsPipeline";
import CalculadoraConfig from "@/components/admin/CalculadoraConfig";
import WebhookManager from "@/components/admin/WebhookManager";
import FollowUpManager from "@/components/admin/FollowUpManager";
import FinanciamentoConfig from "@/components/admin/FinanciamentoConfig";
import { ClientesManager } from "@/components/admin/ClientesManager";
import { RecebimentosManager } from "@/components/admin/RecebimentosManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/layout/Footer";
interface Lead {
  id: string;
  lead_code: string | null;
  nome: string;
  telefone: string;
  cep: string | null;
  estado: string;
  cidade: string;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  area: string;
  tipo_telhado: string;
  rede_atendimento: string;
  media_consumo: number;
  consumo_previsto: number;
  observacoes: string | null;
  vendedor: string | null;
  arquivos_urls: string[] | null;
  status_id: string | null;
  visto: boolean;
  created_at: string;
  updated_at: string;
}

export default function Admin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVisto, setFilterVisto] = useState<string>("nao_visto");
  const [activeTab, setActiveTab] = useState<string>("leads");
  const [filterVendedor, setFilterVendedor] = useState<string>("todos");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  useEffect(() => {
    let filtered = leads.filter((lead) =>
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone.includes(searchTerm) ||
      lead.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.vendedor && lead.vendedor.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Filter by visto
    if (filterVisto === "visto") {
      filtered = filtered.filter((lead) => lead.visto);
    } else if (filterVisto === "nao_visto") {
      filtered = filtered.filter((lead) => !lead.visto);
    }
    
    // Filter by vendedor
    if (filterVendedor !== "todos") {
      filtered = filtered.filter((lead) => lead.vendedor === filterVendedor);
    }
    
    // Filter by estado
    if (filterEstado !== "todos") {
      filtered = filtered.filter((lead) => lead.estado === filterEstado);
    }
    
    setFilteredLeads(filtered);
  }, [searchTerm, leads, filterVisto, filterVendedor, filterEstado]);
  
  // Get unique vendedores and estados for filters
  const uniqueVendedores = [...new Set(leads.map((l) => l.vendedor).filter(Boolean))] as string[];
  const uniqueEstados = [...new Set(leads.map((l) => l.estado))].sort();
  
  const handleToggleVisto = async (lead: Lead) => {
    const newVisto = !lead.visto;
    
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, visto: newVisto } : l))
    );
    
    try {
      const { error } = await supabase
        .from("leads")
        .update({ visto: newVisto })
        .eq("id", lead.id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar visto:", error);
      // Revert on error
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, visto: lead.visto } : l))
      );
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
      setFilteredLeads(data || []);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;

    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadToDelete.id);

      if (error) throw error;

      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
      toast({
        title: "Lead excluído",
        description: "O lead foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lead.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Mais Energia Solar" className="h-12 w-auto" />
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {leads.reduce((acc, l) => acc + l.media_consumo, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">kWh Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-secondary">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(leads.map((l) => l.estado)).size}
                </p>
                <p className="text-sm text-muted-foreground">Estados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Recarrega leads ao entrar na aba
          if (value === "leads") {
            fetchLeads();
          }
        }} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 lg:inline-flex">
            <TabsTrigger value="leads" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="followup" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Follow-up</span>
            </TabsTrigger>
            <TabsTrigger value="clientes" className="gap-2">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="recebimentos" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Recebimentos</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="vendedores" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Vendedores</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculadora</span>
            </TabsTrigger>
            <TabsTrigger value="financiamento" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Bancos</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="w-4 h-4" />
              <span className="hidden sm:inline">Webhooks</span>
            </TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-brand-blue">Leads Cadastrados</CardTitle>
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, telefone, cidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Filter className="w-4 h-4" />
                      <span>Filtros:</span>
                    </div>
                    
                    <Select value={filterVisto} onValueChange={setFilterVisto}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="visto">Vistos</SelectItem>
                        <SelectItem value="nao_visto">Não Vistos</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                      <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="Vendedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos Vendedores</SelectItem>
                        {uniqueVendedores.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterEstado} onValueChange={setFilterEstado}>
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos Estados</SelectItem>
                        {uniqueEstados.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {(filterVisto !== "todos" || filterVendedor !== "todos" || filterEstado !== "todos") && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setFilterVisto("todos");
                          setFilterVendedor("todos");
                          setFilterEstado("todos");
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Visto</TableHead>
                        <TableHead className="w-24">Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Consumo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Nenhum lead encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeads.map((lead) => (
                          <TableRow 
                            key={lead.id} 
                            className={lead.visto ? "bg-green-50 dark:bg-green-950/20" : ""}
                          >
                            <TableCell>
                              <Checkbox
                                checked={lead.visto}
                                onCheckedChange={() => handleToggleVisto(lead)}
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                {lead.lead_code || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{lead.nome}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {lead.telefone}
                              </div>
                            </TableCell>
                            <TableCell>
                              {lead.vendedor ? (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  {lead.vendedor}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                                {lead.cidade}, {lead.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>{lead.media_consumo} kWh</TableCell>
                            <TableCell>
                              {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-secondary hover:text-secondary"
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setIsViewOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setLeadToDelete(lead);
                                    setIsDeleteOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline">
            <LeadsPipeline />
          </TabsContent>

          {/* Follow-up Tab */}
          <TabsContent value="followup">
            <FollowUpManager diasAlerta={3} />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <DashboardCharts leads={leads} />
          </TabsContent>

          {/* Vendedores Tab */}
          <TabsContent value="vendedores">
            <VendedoresManager leads={leads} />
          </TabsContent>

          {/* Calculadora Config Tab */}
          <TabsContent value="config">
            <CalculadoraConfig />
          </TabsContent>

          {/* Financiamento Tab */}
          <TabsContent value="financiamento">
            <FinanciamentoConfig />
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <WebhookManager />
          </TabsContent>

          {/* Clientes Tab */}
          <TabsContent value="clientes">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientesManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recebimentos Tab */}
          <TabsContent value="recebimentos">
            <Card>
              <CardHeader>
                <CardTitle>Controle de Recebimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <RecebimentosManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* View Lead Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-brand-blue">Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              {selectedLead.lead_code && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                    {selectedLead.lead_code}
                  </Badge>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedLead.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedLead.telefone}</p>
                </div>
              </div>
              
              {/* Endereço */}
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Endereço</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">CEP</p>
                    <p className="font-medium text-sm">{selectedLead.cep || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cidade/Estado</p>
                    <p className="font-medium text-sm">{selectedLead.cidade}, {selectedLead.estado}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bairro</p>
                    <p className="font-medium text-sm">{selectedLead.bairro || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rua</p>
                    <p className="font-medium text-sm">{selectedLead.rua || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Número</p>
                    <p className="font-medium text-sm">{selectedLead.numero || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Complemento</p>
                    <p className="font-medium text-sm">{selectedLead.complemento || "-"}</p>
                  </div>
                </div>
              </div>
              
              {/* Imóvel */}
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Imóvel e Consumo</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Área</p>
                    <p className="font-medium text-sm">{selectedLead.area}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo de Telhado</p>
                    <p className="font-medium text-sm">{selectedLead.tipo_telhado}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rede</p>
                    <p className="font-medium text-sm">{selectedLead.rede_atendimento}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Consumo Médio</p>
                    <p className="font-medium text-sm">{selectedLead.media_consumo} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Consumo Previsto</p>
                    <p className="font-medium text-sm">{selectedLead.consumo_previsto} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Cadastro</p>
                    <p className="font-medium text-sm">
                      {format(new Date(selectedLead.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedLead.observacoes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-medium text-sm">{selectedLead.observacoes}</p>
                </div>
              )}
              
              {/* Arquivos Anexados */}
              {selectedLead.arquivos_urls && selectedLead.arquivos_urls.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Arquivos Anexados ({selectedLead.arquivos_urls.length})
                  </p>
                  <div className="space-y-2">
                    {selectedLead.arquivos_urls.map((filePath, index) => {
                      const fileName = filePath.split('/').pop() || `Arquivo ${index + 1}`;
                      const isImage = /\.(jpg|jpeg|png)$/i.test(fileName);
                      
                      const handleOpenFile = async () => {
                        const { data, error } = await supabase.storage
                          .from('contas-luz')
                          .createSignedUrl(filePath, 3600); // 1 hour expiry
                        
                        if (data?.signedUrl) {
                          window.open(data.signedUrl, '_blank');
                        } else {
                          toast({
                            title: "Erro",
                            description: "Não foi possível abrir o arquivo.",
                            variant: "destructive",
                          });
                        }
                      };
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {isImage ? (
                              <Image className="w-5 h-5 text-primary" />
                            ) : (
                              <FileText className="w-5 h-5 text-destructive" />
                            )}
                            <span className="text-sm font-medium truncate">
                              {fileName}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleOpenFile}
                            className="flex items-center gap-1 text-primary hover:text-primary"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Abrir
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lead de {leadToDelete?.nome}? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
