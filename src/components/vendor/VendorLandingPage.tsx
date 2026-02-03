import Header from "@/components/layout/Header";
import LeadFormWizard from "@/components/LeadFormWizard";

export function VendorLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      <Header />

      {/* Form Section */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Solicite Seu Orçamento Gratuito
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Preencha o formulário abaixo e receba uma proposta personalizada para
              o seu imóvel.
            </p>
          </div>
          <LeadFormWizard />
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 bg-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} Mais Energia Solar. Todos os direitos reservados.
          </p>
          <p className="text-sm opacity-60 mt-1">
            <a href="tel:+5532998437675" className="hover:opacity-100">(32) 99843-7675</a>
          </p>
        </div>
      </footer>
    </div>
  );
}