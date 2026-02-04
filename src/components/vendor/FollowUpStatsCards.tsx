import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Lead {
  id: string;
  ultimo_contato: string | null;
  created_at: string;
}

interface FollowUpStatsCardsProps {
  leads: Lead[];
}

export function FollowUpStatsCards({ leads }: FollowUpStatsCardsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    let urgentes = 0;
    let pendentes = 0;
    let emDia = 0;

    leads.forEach(lead => {
      const lastContactDate = lead.ultimo_contato 
        ? new Date(lead.ultimo_contato) 
        : new Date(lead.created_at);
      
      const daysSinceContact = differenceInDays(now, lastContactDate);

      if (daysSinceContact >= 6) {
        urgentes++;
      } else if (daysSinceContact >= 3) {
        pendentes++;
      } else {
        emDia++;
      }
    });

    return { urgentes, pendentes, emDia };
  }, [leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Urgentes (6+ dias) */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-full border-2 border-destructive p-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.urgentes}</p>
            <p className="text-sm text-muted-foreground">Urgentes (6+ dias)</p>
          </div>
        </CardContent>
      </Card>

      {/* Pendentes (3+ dias) */}
      <Card className="border-amber-400/30 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-full border-2 border-amber-500 p-2">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.pendentes}</p>
            <p className="text-sm text-muted-foreground">Pendentes (3+ dias)</p>
          </div>
        </CardContent>
      </Card>

      {/* Em dia */}
      <Card className="border-emerald-400/30 bg-emerald-50 dark:bg-emerald-950/20">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-full border-2 border-emerald-500 p-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.emDia}</p>
            <p className="text-sm text-muted-foreground">Em dia</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
