import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Clock, Phone, Calendar, CheckCircle, Loader2, Bell } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Lead {
  id: string;
  lead_code: string | null;
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  vendedor: string | null;
  ultimo_contato: string | null;
  proxima_acao: string | null;
  data_proxima_acao: string | null;
  created_at: string;
}

interface FollowUpManagerProps {
  diasAlerta?: number;
}

export default function FollowUpManager({ diasAlerta = 3 }: FollowUpManagerProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    proxima_acao: "",
    data_proxima_acao: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("id, lead_code, nome, telefone, cidade, estado, vendedor, ultimo_contato, proxima_acao, data_proxima_acao, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const { urgentLeads, pendingLeads, upToDateLeads } = useMemo(() => {
    const now = new Date();
    
    const urgent: Lead[] = [];
    const pending: Lead[] = [];
    const upToDate: Lead[] = [];

    leads.forEach((lead) => {
      const lastContact = lead.ultimo_contato ? parseISO(lead.ultimo_contato) : parseISO(lead.created_at);
      const daysSinceContact = differenceInDays(now, lastContact);
      
      if (daysSinceContact >= diasAlerta * 2) {
        urgent.push(lead);
      } else if (daysSinceContact >= diasAlerta) {
        pending.push(lead);
      } else {
        upToDate.push(lead);
      }
    });

    return { urgentLeads: urgent, pendingLeads: pending, upToDateLeads: upToDate };
  }, [leads, diasAlerta]);

  const handleOpenDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      proxima_acao: lead.proxima_acao || "",
      data_proxima_acao: lead.data_proxima_acao || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedLead) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          ultimo_contato: new Date().toISOString(),
          proxima_acao: formData.proxima_acao || null,
          data_proxima_acao: formData.data_proxima_acao || null,
        })
        .eq("id", selectedLead.id);

      if (error) throw error;

      toast({ title: "Contato registrado!", description: "O lead foi atualizado com sucesso." });
      setIsDialogOpen(false);
      fetchLeads();
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (lead: Lead) => {
    const lastContact = lead.ultimo_contato ? parseISO(lead.ultimo_contato) : parseISO(lead.created_at);
    const daysSinceContact = differenceInDays(new Date(), lastContact);

    if (daysSinceContact >= diasAlerta * 2) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          {daysSinceContact} dias
        </Badge>
      );
    } else if (daysSinceContact >= diasAlerta) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600 bg-yellow-50">
          <Clock className="w-3 h-3" />
          {daysSinceContact} dias
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1 border-green-500 text-green-600 bg-green-50">
          <CheckCircle className="w-3 h-3" />
          Em dia
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{urgentLeads.length}</p>
              <p className="text-sm text-muted-foreground">Urgentes ({diasAlerta * 2}+ dias)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingLeads.length}</p>
              <p className="text-sm text-muted-foreground">Pendentes ({diasAlerta}+ dias)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{upToDateLeads.length}</p>
              <p className="text-sm text-muted-foreground">Em dia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Leads */}
      {urgentLeads.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-destructive" />
              <CardTitle className="text-destructive">Leads Urgentes - Precisam de Contato!</CardTitle>
            </div>
            <CardDescription>
              Estes leads estão há mais de {diasAlerta * 2} dias sem contato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Próxima Ação</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urgentLeads.map((lead) => (
                  <TableRow key={lead.id} className="bg-destructive/5">
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.nome}</p>
                        <p className="text-xs text-muted-foreground">{lead.cidade}, {lead.estado}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`tel:${lead.telefone}`}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {lead.telefone}
                      </a>
                    </TableCell>
                    <TableCell>{lead.vendedor || "-"}</TableCell>
                    <TableCell>{getStatusBadge(lead)}</TableCell>
                    <TableCell className="max-w-32 truncate text-sm text-muted-foreground">
                      {lead.proxima_acao || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleOpenDialog(lead)}>
                        Registrar Contato
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pending Leads */}
      {pendingLeads.length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <CardTitle className="text-yellow-700">Leads Pendentes</CardTitle>
            </div>
            <CardDescription>
              Estes leads estão há {diasAlerta} a {diasAlerta * 2} dias sem contato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeads.map((lead) => (
                  <TableRow key={lead.id} className="bg-yellow-50/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.nome}</p>
                        <p className="text-xs text-muted-foreground">{lead.cidade}, {lead.estado}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`tel:${lead.telefone}`}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {lead.telefone}
                      </a>
                    </TableCell>
                    <TableCell>{lead.vendedor || "-"}</TableCell>
                    <TableCell>{getStatusBadge(lead)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => handleOpenDialog(lead)}>
                        Registrar Contato
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog for registering contact */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Contato - {selectedLead?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="proxima_acao">Próxima Ação</Label>
              <Textarea
                id="proxima_acao"
                value={formData.proxima_acao}
                onChange={(e) => setFormData((prev) => ({ ...prev, proxima_acao: e.target.value }))}
                placeholder="Ex: Ligar novamente, enviar proposta, agendar visita..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_proxima_acao">Data da Próxima Ação</Label>
              <Input
                id="data_proxima_acao"
                type="date"
                value={formData.data_proxima_acao}
                onChange={(e) => setFormData((prev) => ({ ...prev, data_proxima_acao: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar Contato
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
