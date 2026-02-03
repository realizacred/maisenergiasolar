import { Button } from "@/components/ui/button";

export function CTASection() {
  const scrollToForm = () => {
    const formSection = document.getElementById("orcamento");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 gradient-blue text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">
          Economize até 90% na sua conta de Energia!
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
          Solicite um orçamento agora sem compromisso!
        </p>
        <Button 
          onClick={scrollToForm}
          size="lg"
          className="bg-white text-secondary hover:bg-white/90 font-semibold px-8"
        >
          Orçamento
        </Button>
      </div>
    </section>
  );
}
