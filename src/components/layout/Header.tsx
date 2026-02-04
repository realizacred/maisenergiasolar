import { Link } from "react-router-dom";
import { Calculator, LogIn, Phone, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface HeaderProps {
  showCalculadora?: boolean;
  showAdmin?: boolean;
  children?: React.ReactNode;
}

const WHATSAPP_NUMBER = "5532998437675";

export default function Header({
  showCalculadora = true,
  showAdmin = true,
  children,
}: HeaderProps) {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
  };

  return (
    <header className="bg-card/80 backdrop-blur-xl sticky top-0 z-50 border-b border-border/50 shadow-xs">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 transition-all duration-200 hover:opacity-80 group"
        >
          <div className="relative">
            <img
              src={logo}
              alt="Mais Energia Solar"
              className="h-10 md:h-11 w-auto"
            />
            <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 md:gap-2">
          {showCalculadora && (
            <Link to="/calculadora">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 font-medium hover:bg-primary/5 hover:text-primary"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">Simulador</span>
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleWhatsApp}
            className="gap-2 font-medium hover:bg-success/10 hover:text-success"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden md:inline">Contato</span>
          </Button>

          {showAdmin && (
            <Link to="/auth">
              <Button
                variant="default"
                size="sm"
                className="gap-2 font-medium shadow-sm ml-1"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Acessar</span>
              </Button>
            </Link>
          )}

          {children}
        </nav>
      </div>
    </header>
  );
}