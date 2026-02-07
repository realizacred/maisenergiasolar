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

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-between relative">
      {/* Progress line behind */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10 hidden sm:block" />
      <motion.div
        className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary mx-10 hidden sm:block"
        initial={{ width: "0%" }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />

      {steps.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex flex-col items-center relative z-10">
            <motion.div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
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
                <Check className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </motion.div>
            <p className={`text-xs mt-2 font-medium text-center hidden sm:block ${
              isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
            }`}>
              {step.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
