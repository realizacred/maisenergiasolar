import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Calculator, LogIn, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

interface MobileNavProps {
  showCalculadora?: boolean;
  showAdmin?: boolean;
}

const WHATSAPP_NUMBER = "5532998437675";

export function MobileNav({ showCalculadora = true, showAdmin = true }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/" onClick={() => setOpen(false)}>
              <img src={logo} alt="Mais Energia Solar" className="h-8" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <Link 
              to="/" 
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Home className="h-5 w-5 text-primary" />
              <span className="font-medium">Início</span>
            </Link>

            {showCalculadora && (
              <Link 
                to="/calculadora" 
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Calculator className="h-5 w-5 text-primary" />
                <span className="font-medium">Simulador</span>
              </Link>
            )}

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors w-full text-left"
            >
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-medium">Contato via WhatsApp</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-3">
            {showAdmin && (
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Acessar Sistema
                </Button>
              </Link>
            )}
            <p className="text-xs text-center text-muted-foreground">
              © {new Date().getFullYear()} Mais Energia Solar
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
