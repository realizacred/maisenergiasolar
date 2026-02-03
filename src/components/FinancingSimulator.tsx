import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, Calculator, Check } from "lucide-react";

interface FinancingSimulatorProps {
  investimento: number;
  economia: number;
}

// Common financing options in Brazil for solar
const FINANCING_OPTIONS = [
  { name: "Santander Solar", taxa: 1.29, maxParcelas: 60 },
  { name: "BV Financeira", taxa: 1.49, maxParcelas: 72 },
  { name: "Banco do Brasil", taxa: 1.19, maxParcelas: 48 },
  { name: "Caixa Econômica", taxa: 1.09, maxParcelas: 60 },
];

export default function FinancingSimulator({ investimento, economia }: FinancingSimulatorProps) {
  const [parcelas, setParcelas] = useState(36);
  const [selectedBank, setSelectedBank] = useState(0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculations = useMemo(() => {
    const bank = FINANCING_OPTIONS[selectedBank];
    const taxaMensal = bank.taxa / 100;
    
    // PMT formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const fator = Math.pow(1 + taxaMensal, parcelas);
    const valorParcela = investimento * (taxaMensal * fator) / (fator - 1);
    
    const totalPago = valorParcela * parcelas;
    const juros = totalPago - investimento;
    
    // Net monthly cost (parcela - economia)
    const custoLiquido = valorParcela - economia;
    
    // If economia > parcela, customer actually profits from day 1
    const autoFinanciado = economia >= valorParcela;
    
    return {
      valorParcela,
      totalPago,
      juros,
      custoLiquido,
      autoFinanciado,
      banco: bank,
    };
  }, [investimento, parcelas, selectedBank, economia]);

  return (
    <Card className="shadow-lg border-t-4 border-t-secondary">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-secondary">
          <CreditCard className="w-5 h-5" />
          Simulador de Financiamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bank Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Banco</Label>
          <div className="grid grid-cols-2 gap-2">
            {FINANCING_OPTIONS.map((bank, index) => (
              <button
                key={bank.name}
                onClick={() => setSelectedBank(index)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  selectedBank === index
                    ? "border-secondary bg-secondary/10"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <p className="font-medium text-sm">{bank.name}</p>
                <p className="text-xs text-muted-foreground">{bank.taxa}% a.m.</p>
              </button>
            ))}
          </div>
        </div>

        {/* Parcelas Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Número de Parcelas</Label>
            <Badge variant="secondary" className="font-mono">
              {parcelas}x
            </Badge>
          </div>
          <Slider
            value={[parcelas]}
            onValueChange={(value) => setParcelas(value[0])}
            min={12}
            max={calculations.banco.maxParcelas}
            step={6}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12x</span>
            <span>{calculations.banco.maxParcelas}x</span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Valor da Parcela</span>
            <span className="font-bold text-lg">{formatCurrency(calculations.valorParcela)}</span>
          </div>

          {calculations.autoFinanciado ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                <Check className="w-4 h-4" />
                Sistema se paga sozinho!
              </div>
              <p className="text-sm text-green-600">
                Sua economia ({formatCurrency(economia)}/mês) é maior que a parcela. 
                Você ganha {formatCurrency(economia - calculations.valorParcela)}/mês desde o primeiro dia!
              </p>
            </div>
          ) : (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-primary font-medium mb-1">
                <TrendingUp className="w-4 h-4" />
                Custo Líquido Mensal
              </div>
              <p className="text-sm text-muted-foreground">
                Parcela - Economia = <span className="font-bold text-foreground">{formatCurrency(calculations.custoLiquido)}</span>/mês
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-muted/30 rounded">
              <p className="text-muted-foreground text-xs">Total Financiado</p>
              <p className="font-semibold">{formatCurrency(calculations.totalPago)}</p>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <p className="text-muted-foreground text-xs">Juros Total</p>
              <p className="font-semibold">{formatCurrency(calculations.juros)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
