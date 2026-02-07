import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
  description: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
}

const MOBILE_TITLES: Record<string, string> = {
  "Seus Dados": "Dados",
  "Consumo": "Consumo",
  "Imóvel": "Imóvel",
  "Resultado": "Resultado",
};

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div className="w-full overflow-visible">
      <div className="flex items-center justify-between relative px-0">
        {/* Progress line behind */}
        <div className="absolute top-[18px] sm:top-5 left-0 right-0 h-0.5 bg-border mx-6 sm:mx-10" />
        <motion.div
          className="absolute top-[18px] sm:top-5 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary mx-6 sm:mx-10"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const Icon = step.icon;
          const mobileTitle = MOBILE_TITLES[step.title] || step.title;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 flex-1 min-w-0">
              <motion.div
                className={`
                  w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                  ${isCompleted
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-primary)]"
                    : isActive
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[var(--shadow-primary)]"
                      : "bg-muted text-muted-foreground border border-border"
                  }
                `}
                animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </motion.div>
              <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium text-center leading-tight truncate w-full px-0.5 ${
                isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
              }`}>
                <span className="sm:hidden">{mobileTitle}</span>
                <span className="hidden sm:inline">{step.title}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
