import { Link } from "react-router-dom";
import { Zap, Leaf, TrendingDown, Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadForm from "@/components/LeadForm";
import logo from "@/assets/logo.png";

export default function Index() {
  return (
    <div className="min-h-screen gradient-solar-soft">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Mais Energia Solar" className="h-12 md:h-14 w-auto" />
          </div>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Área Administrativa</span>
              <span className="sm:hidden">Admin</span>
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
              <span className="text-brand-orange">Energia Solar</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Reduza até 95% da sua conta de energia com a instalação de painéis
              solares. Solicite já seu orçamento gratuito!
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
                <p className="text-primary font-bold">95%</p>
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

          {/* Lead Form */}
          <LeadForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-secondary text-secondary-foreground mt-12">
        <div className="container mx-auto px-4 text-center">
          <img src={logo} alt="Mais Energia Solar" className="h-10 w-auto mx-auto mb-4 brightness-0 invert" />
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} Mais Energia Solar. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
