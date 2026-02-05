import { forwardRef } from "react";
import { Phone } from "lucide-react";
import logoBranca from "@/assets/logo-branca.png";

const Footer = forwardRef<HTMLElement>(function Footer(props, ref) {
  return (
    <footer className="py-8 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <img 
            src={logoBranca} 
            alt="Mais Energia Solar" 
            className="h-12 w-auto" 
          />
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <a 
              href="tel:+5532998437675" 
              className="flex items-center gap-2 text-secondary-foreground/90 hover:text-secondary-foreground transition-colors"
            >
              <Phone className="w-4 h-4" />
              (32) 99843-7675
            </a>
            <p className="text-sm opacity-80">
              © {new Date().getFullYear()} Mais Energia Solar. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
