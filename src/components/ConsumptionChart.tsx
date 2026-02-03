import { useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ConsumptionChartProps {
  mediaConsumo: number;
  consumoPrevisto: number;
}

export default function ConsumptionChart({ mediaConsumo, consumoPrevisto }: ConsumptionChartProps) {
  const { mediaPercentage, previstoPercentage, changePercentage, isIncrease } = useMemo(() => {
    const maxValue = Math.max(mediaConsumo, consumoPrevisto);
    const mediaPercentage = (mediaConsumo / maxValue) * 100;
    const previstoPercentage = (consumoPrevisto / maxValue) * 100;
    const changePercentage = ((consumoPrevisto - mediaConsumo) / mediaConsumo) * 100;
    const isIncrease = changePercentage > 0;

    return { mediaPercentage, previstoPercentage, changePercentage, isIncrease };
  }, [mediaConsumo, consumoPrevisto]);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-0">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4 text-foreground font-semibold">
          <BarChart3 className="w-5 h-5 text-primary" />
          Comparativo de Consumo
        </div>

        {/* Media Atual */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">Média Atual</span>
            </div>
            <span className="text-sm font-bold text-blue-600">
              {mediaConsumo.toLocaleString()} kWh
            </span>
          </div>
          <Progress value={mediaPercentage} className="h-3 bg-gray-200" />
        </div>

        {/* Consumo Previsto */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Consumo Previsto</span>
            </div>
            <span className="text-sm font-bold text-green-600">
              {consumoPrevisto.toLocaleString()} kWh
            </span>
          </div>
          <Progress value={previstoPercentage} className="h-3 bg-gray-200 [&>div]:bg-green-500" />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              {isIncrease ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              Variação Prevista
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${isIncrease ? "text-green-600" : "text-red-600"}`}>
                {isIncrease ? "+" : ""}
                {changePercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {isIncrease ? "Aumento" : "Redução"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
