import { Link } from "react-router-dom";
import { Calculator, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface HeaderProps {
  showCalculadora?: boolean;
  showAdmin?: boolean;
  children?: React.ReactNode;
}

export default function Header({ 
  showCalculadora = true, 
  showAdmin = true,
  children 
}: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Mais Energia Solar" className="h-12 md:h-14 w-auto" />
        </Link>
        
        <div className="flex items-center gap-2">
          {showCalculadora && (
            <Link to="/calculadora">
              <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">Calculadora Solar</span>
                <span className="sm:hidden">Calcular</span>
              </Button>
            </Link>
          )}
          
          {showAdmin && (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Área Administrativa</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            </Link>
          )}
          
          {children}
        </div>
      </div>
    </header>
  );
}
