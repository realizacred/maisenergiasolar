import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5532998437675";

export function CTASection() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Olá! Gostaria de saber mais sobre energia solar e solicitar um orçamento."
    );
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
      "_blank"
    );
  };

  return (
    <section className="py-16 gradient-blue text-secondary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">
          Economize até 90% na sua conta de Energia!
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
          Entre em contato conosco e solicite um orçamento personalizado!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button 
            onClick={handleWhatsApp}
            size="lg"
            className="bg-white text-secondary hover:bg-white/90 font-semibold px-8 gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Fale pelo WhatsApp
          </Button>
          <Link to="/calculadora">
            <Button 
              variant="outline"
              size="lg"
              className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground/10 font-semibold px-8"
            >
              Simular Economia
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
