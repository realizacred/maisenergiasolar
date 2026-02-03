import { Link } from "react-router-dom";
import { Calculator, LogIn, Phone } from "lucide-react";
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
  children 
}: HeaderProps) {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
  };

  return (
    <header className="bg-card/95 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
          <img src={logo} alt="Mais Energia Solar" className="h-11 md:h-12 w-auto" />
        </Link>
        
        <nav className="flex items-center gap-2 md:gap-3">
          {showCalculadora && (
            <Link to="/calculadora">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-foreground hover:text-primary hover:bg-primary/5 font-medium transition-smooth"
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
            className="gap-2 text-foreground hover:text-primary hover:bg-primary/5 font-medium transition-smooth"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden md:inline">Contato</span>
          </Button>
          
          {showAdmin && (
            <Link to="/auth">
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 font-medium shadow-sm transition-smooth"
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
