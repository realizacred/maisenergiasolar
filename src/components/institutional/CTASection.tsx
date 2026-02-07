import { Button } from "@/components/ui/button";
import financingBg from "@/assets/financing-bg.jpg";

export function CTASection() {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background Image */}
      <img
        src={financingBg}
        alt="Painéis solares"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-secondary/85" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
          Financiamento
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
          Deseja financiar seu sistema de energia solar?
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Envie suas informações que nossa equipe irá fazer uma cotação com as instituições 
          financeiras parceiras e enviar a melhor proposta para você.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base rounded-full shadow-primary"
          >
            <a href="https://wa.me/5532998437675" target="_blank" rel="noopener noreferrer">
              Solicitar Orçamento
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToContact}
            className="border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-6 text-base rounded-full"
          >
            Preencher Formulário
          </Button>
        </div>
      </div>
    </section>
  );
}
