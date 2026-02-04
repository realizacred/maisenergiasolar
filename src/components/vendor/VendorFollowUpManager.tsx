import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, Phone, CheckCircle, Bell, MessageCircle } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import type { Lead } from "@/types/lead";

interface VendorFollowUpManagerProps {
  leads: Lead[];
  diasAlerta?: number;
  onViewLead?: (lead: Lead) => void;
}

export function VendorFollowUpManager({ leads, diasAlerta = 3, onViewLead }: VendorFollowUpManagerProps) {
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

  const openWhatsApp = (telefone: string, nome: string) => {
    const message = encodeURIComponent(`Olá ${nome}! Tudo bem? Sou da equipe de energia solar e gostaria de dar continuidade ao seu interesse. Podemos conversar?`);
    const phone = telefone.replace(/\D/g, "");
    const formattedPhone = phone.startsWith("55") ? phone : `55${phone}`;
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
  };

  if (urgentLeads.length === 0 && pendingLeads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                    <TableCell>{getStatusBadge(lead)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWhatsApp(lead.telefone, lead.nome)}
                          className="gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </Button>
                        {onViewLead && (
                          <Button size="sm" onClick={() => onViewLead(lead)}>
                            Ver Detalhes
                          </Button>
                        )}
                      </div>
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                    <TableCell>{getStatusBadge(lead)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWhatsApp(lead.telefone, lead.nome)}
                          className="gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </Button>
                        {onViewLead && (
                          <Button size="sm" variant="outline" onClick={() => onViewLead(lead)}>
                            Ver Detalhes
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
