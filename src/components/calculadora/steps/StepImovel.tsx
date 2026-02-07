import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { ChevronRight, ChevronLeft, Building2, TreePine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingSelect } from "@/components/ui/floating-select";
import { ESTADOS_BRASIL, TIPOS_TELHADO, REDES_ATENDIMENTO } from "@/lib/validations";
import { useCidadesPorEstado } from "@/hooks/useCidadesPorEstado";
import type { WizardFormData } from "../CalculadoraWizard";

interface StepImovelProps {
  form: UseFormReturn<WizardFormData>;
  onNext: () => void;
  onBack: () => void;
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const estadoOptions = ESTADOS_BRASIL.map((e) => ({ value: e.sigla, label: `${e.sigla} - ${e.nome}` }));
const telhadoOptions = TIPOS_TELHADO.map((t) => ({ value: t, label: t }));
const redeOptions = REDES_ATENDIMENTO.map((r) => ({ value: r, label: r }));

export function StepImovel({ form, onNext, onBack }: StepImovelProps) {
  const { setValue, watch, formState: { errors } } = form;
  const area = watch("area");
  const estado = watch("estado");
  const cidade = watch("cidade");
  const tipoTelhado = watch("tipo_telhado");
  const rede = watch("rede_atendimento");

  const { cidades, isLoading: isLoadingCidades } = useCidadesPorEstado(estado);

  const handleEstadoChange = (val: string) => {
    setValue("estado", val, { shouldValidate: true });
    // Clear city when state changes
    setValue("cidade", "", { shouldValidate: false });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div
        className="text-center px-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
          Sobre seu <span className="text-primary">imóvel</span>
        </h2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Essas informações nos ajudam a estimar o melhor sistema para você
        </p>
      </motion.div>

      <div className="max-w-md mx-auto space-y-4 px-1">
        {/* Area: Urbana/Rural toggle */}
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <label className="text-sm font-medium text-foreground mb-2 block">Tipo de Área</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "Urbana" as const, label: "Urbana", icon: Building2, desc: "Cidade" },
              { value: "Rural" as const, label: "Rural", icon: TreePine, desc: "Campo" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("area", opt.value, { shouldValidate: true })}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                  area === opt.value
                    ? "border-primary bg-primary/5 shadow-[var(--shadow-primary)]"
                    : "border-border hover:border-primary/30 bg-card"
                }`}
              >
                <opt.icon className={`w-5 h-5 mb-1 ${area === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                <p className="font-medium text-sm text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
          {errors.area && (
            <p className="text-sm text-destructive mt-1">{errors.area.message}</p>
          )}
        </motion.div>

        {/* Estado */}
        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <FloatingSelect
            label="Estado"
            value={estado}
            onValueChange={handleEstadoChange}
            options={estadoOptions}
            error={errors.estado?.message}
          />
        </motion.div>

        {/* Cidade - Select dropdown loaded from IBGE */}
        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          {isLoadingCidades ? (
            <div className="h-14 rounded-xl border-2 border-muted-foreground/25 bg-card flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando cidades...
            </div>
          ) : (
            <FloatingSelect
              label="Cidade"
              value={cidade}
              onValueChange={(val) => setValue("cidade", val, { shouldValidate: true })}
              options={cidades}
              error={errors.cidade?.message}
              placeholder={!estado ? "Selecione o estado primeiro" : "Selecione a cidade"}
            />
          )}
          {!estado && !errors.cidade && (
            <p className="text-xs text-muted-foreground mt-1 ml-1">Selecione o estado para ver as cidades</p>
          )}
        </motion.div>

        {/* Tipo de Telhado */}
        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <FloatingSelect
            label="Tipo de Telhado"
            value={tipoTelhado}
            onValueChange={(val) => setValue("tipo_telhado", val, { shouldValidate: true })}
            options={telhadoOptions}
            error={errors.tipo_telhado?.message}
          />
        </motion.div>

        {/* Rede */}
        <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
          <FloatingSelect
            label="Tipo de Rede Elétrica"
            value={rede}
            onValueChange={(val) => setValue("rede_atendimento", val, { shouldValidate: true })}
            options={redeOptions}
            error={errors.rede_atendimento?.message}
          />
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-md mx-auto pt-2 px-1">
        <Button type="button" variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-[var(--shadow-primary)] rounded-xl"
        >
          Ver Resultado
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
