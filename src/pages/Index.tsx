import { Link } from "react-router-dom";
import { Sun, Zap, Leaf, TrendingDown, Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadForm from "@/components/LeadForm";

export default function Index() {
  return (
    <div className="min-h-screen gradient-solar-soft">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-solar flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Solar Energy</span>
          </div>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="w-4 h-4" />
              Área Administrativa
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Economize na Conta de Luz com{" "}
              <span className="text-primary">Energia Solar</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Reduza até 95% da sua conta de energia com a instalação de painéis
              solares. Solicite já seu orçamento gratuito!
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Economia de até</p>
                <p className="text-primary font-bold">95%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Energia</p>
                <p className="text-green-600 font-bold">Sustentável</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Garantia de</p>
                <p className="text-blue-600 font-bold">25 Anos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Instalação</p>
                <p className="text-yellow-600 font-bold">Rápida</p>
              </div>
            </div>
          </div>

          {/* Lead Form */}
          <LeadForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-border mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Solar Energy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Solar Energy. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
