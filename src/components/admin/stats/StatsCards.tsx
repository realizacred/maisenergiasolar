import { Users, Zap, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalLeads: number;
  totalKwh: number;
  uniqueEstados: number;
}

export function StatsCards({ totalLeads, totalKwh, uniqueEstados }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-l-4 border-l-primary">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
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
              {totalKwh.toLocaleString()}
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
            <p className="text-2xl font-bold text-foreground">{uniqueEstados}</p>
            <p className="text-sm text-muted-foreground">Estados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
