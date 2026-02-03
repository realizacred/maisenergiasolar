import { Zap, Leaf, TrendingDown, Shield } from "lucide-react";
import LeadFormWizard from "@/components/LeadFormWizard";
import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// WhatsApp da Mais Energia Solar
const WHATSAPP_NUMBER = "5532998437675";

export default function Index() {
  return (
    <div className="min-h-screen gradient-solar-soft">
      <Header />

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Economize até 90% na sua{" "}
              <span className="text-brand-orange">Conta de Energia!</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Desde 2009 gerando economia, autonomia e impacto positivo. 
              Soluções em energia solar para residências, comércios, indústrias e propriedades rurais.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Economia de até</p>
                <p className="text-primary font-bold">90%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-border">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Energia</p>
                <p className="text-green-600 font-bold">Sustentável</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-border">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Garantia de</p>
                <p className="text-secondary font-bold">25 Anos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Instalação</p>
                <p className="text-primary font-bold">Rápida</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Form Section - Separated with different background */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Solicite Seu Orçamento Gratuito
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Preencha o formulário abaixo e receba uma proposta personalizada para o seu imóvel.
            </p>
          </div>
          <LeadFormWizard />
        </div>
      </section>

      <Footer />

      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber={WHATSAPP_NUMBER} />
    </div>
  );
}
