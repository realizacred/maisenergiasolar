import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { User, Phone, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { formatPhone } from "@/lib/validations";
import type { WizardFormData } from "../CalculadoraWizard";

interface StepContatoProps {
  form: UseFormReturn<WizardFormData>;
  onNext: () => void;
}

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export function StepContato({ form, onNext }: StepContatoProps) {
  const { register, setValue, formState: { errors } } = form;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Simulação Gratuita
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Descubra quanto você pode
          <span className="text-primary"> economizar</span>
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Preencha seus dados para receber uma simulação personalizada de energia solar
        </p>
      </motion.div>

      {/* Form */}
      <div className="max-w-md mx-auto space-y-5">
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <FloatingInput
              id="nome"
              label="Seu nome completo"
              className="pl-11 h-14 text-base rounded-xl border-border/60 focus:border-primary bg-card"
              autoComplete="off"
              data-lpignore="true"
              {...register("nome")}
              onKeyDown={handleKeyDown}
            />
          </div>
          {errors.nome && (
            <p className="text-sm text-destructive mt-1.5 ml-1">{errors.nome.message}</p>
          )}
        </motion.div>

        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <FloatingInput
              id="telefone"
              label="Seu WhatsApp"
              type="tel"
              className="pl-11 h-14 text-base rounded-xl border-border/60 focus:border-primary bg-card"
              autoComplete="off"
              data-lpignore="true"
              {...register("telefone", {
                onChange: (e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue("telefone", formatted, { shouldValidate: false });
                },
              })}
              onKeyDown={handleKeyDown}
              maxLength={15}
            />
          </div>
          {errors.telefone && (
            <p className="text-sm text-destructive mt-1.5 ml-1">{errors.telefone.message}</p>
          )}
        </motion.div>

        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          <Button
            type="button"
            size="lg"
            onClick={onNext}
            className="w-full h-14 text-base rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-[var(--shadow-primary)]"
          >
            Simular Minha Economia
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
