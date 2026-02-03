import { useState, useMemo } from "react";
import { differenceInDays } from "date-fns";
import { 
  AlertCircle, 
  MessageSquare, 
  X, 
  Sparkles,
  Clock,
  Phone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  created_at: string;
  ultimo_contato: string | null;
  visto: boolean;
}

interface LeadAlertsProps {
  leads: Lead[];
  diasAlerta?: number;
}

interface LeadAlert {
  lead: Lead;
  diasParado: number;
  tipo: 'critico' | 'atencao' | 'lembrete';
  mensagem: string;
}

export function LeadAlerts({ leads, diasAlerta = 3 }: LeadAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const alertas = useMemo(() => {
    const agora = new Date();
    const alertasList: LeadAlert[] = [];

    leads.forEach(lead => {
      // Calculate days since last contact or creation
      const ultimaData = lead.ultimo_contato 
        ? new Date(lead.ultimo_contato) 
        : new Date(lead.created_at);
      
      const diasParado = differenceInDays(agora, ultimaData);

      // Skip if already dismissed
      if (dismissedAlerts.has(lead.id)) return;

      if (diasParado >= 7) {
        alertasList.push({
          lead,
          diasParado,
          tipo: 'critico',
          mensagem: `${lead.nome} está sem contato há ${diasParado} dias. Que tal enviar uma mensagem hoje?`
        });
      } else if (diasParado >= diasAlerta) {
        alertasList.push({
          lead,
          diasParado,
          tipo: 'atencao',
          mensagem: `${lead.nome} está aguardando há ${diasParado} dias. Deseja enviar um follow-up?`
        });
      } else if (!lead.visto && diasParado >= 1) {
        alertasList.push({
          lead,
          diasParado,
          tipo: 'lembrete',
          mensagem: `Novo lead! ${lead.nome} ainda não foi visualizado.`
        });
      }
    });

    // Sort by priority (critico > atencao > lembrete) and then by days
    return alertasList.sort((a, b) => {
      const prioridade = { critico: 0, atencao: 1, lembrete: 2 };
      if (prioridade[a.tipo] !== prioridade[b.tipo]) {
        return prioridade[a.tipo] - prioridade[b.tipo];
      }
      return b.diasParado - a.diasParado;
    }).slice(0, 3); // Show max 3 alerts
  }, [leads, diasAlerta, dismissedAlerts]);

  const dismissAlert = (leadId: string) => {
    setDismissedAlerts(prev => new Set([...prev, leadId]));
  };

  const openWhatsApp = (telefone: string, nome: string) => {
    const mensagem = encodeURIComponent(
      `Olá ${nome.split(' ')[0]}! Tudo bem? Sou da Mais Energia Solar e gostaria de continuar nossa conversa sobre energia solar. Posso ajudar?`
    );
    const numero = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
  };

  if (alertas.length === 0) return null;

  const getAlertStyles = (tipo: LeadAlert['tipo']) => {
    switch (tipo) {
      case 'critico':
        return {
          bg: 'bg-destructive/5 border-destructive/20',
          icon: 'text-destructive',
          badge: 'bg-destructive/10 text-destructive'
        };
      case 'atencao':
        return {
          bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
          icon: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
        };
      case 'lembrete':
        return {
          bg: 'bg-primary/5 border-primary/20',
          icon: 'text-primary',
          badge: 'bg-primary/10 text-primary'
        };
    }
  };

  const getTipoLabel = (tipo: LeadAlert['tipo']) => {
    switch (tipo) {
      case 'critico': return 'Urgente';
      case 'atencao': return 'Atenção';
      case 'lembrete': return 'Lembrete';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Assistente Inteligente</span>
        </div>
        
        <div className="space-y-3">
          {alertas.map((alerta) => {
            const styles = getAlertStyles(alerta.tipo);
            
            return (
              <div 
                key={alerta.lead.id}
                className={`relative p-3 rounded-lg border ${styles.bg} transition-all duration-200`}
              >
                <button
                  onClick={() => dismissAlert(alerta.lead.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-background/50 transition-colors"
                  aria-label="Dispensar alerta"
                >
                  <X className="h-3 w-3" />
                </button>

                <div className="flex items-start gap-3 pr-6">
                  <div className={`mt-0.5 ${styles.icon}`}>
                    {alerta.tipo === 'critico' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : alerta.tipo === 'atencao' ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={`text-xs ${styles.badge}`}>
                        {getTipoLabel(alerta.tipo)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {alerta.diasParado} {alerta.diasParado === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {alerta.mensagem}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => openWhatsApp(alerta.lead.telefone, alerta.lead.nome)}
                      >
                        <Phone className="h-3 w-3" />
                        Enviar WhatsApp
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {alerta.lead.cidade}, {alerta.lead.estado}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {alertas.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            💡 Dica: Leads contactados regularmente têm 3x mais chance de fechar negócio
          </p>
        )}
      </CardContent>
    </Card>
  );
}
