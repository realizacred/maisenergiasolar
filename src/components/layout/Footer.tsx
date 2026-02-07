import { forwardRef } from "react";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";

const Footer = forwardRef<HTMLElement>(function Footer(props, ref) {
  return (
    <footer ref={ref} className="py-12 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-xl font-black text-primary">MAIS</span>
              <span className="text-xl font-bold text-secondary-foreground">ENERGIA SOLAR</span>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              Soluções em energia solar fotovoltaica para residências, comércios, indústrias e propriedades rurais.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="tel:+5532998437675"
                className="flex items-center gap-2 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-primary" />
                (32) 99843-7675
              </a>
              <a
                href="mailto:contato@maisenergiasolar.com.br"
                className="flex items-center gap-2 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-primary" />
                contato@maisenergiasolar.com.br
              </a>
              <div className="flex items-center gap-2 text-secondary-foreground/80 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                Cataguases - MG
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-lg mb-4">Redes Sociais</h4>
            <a
              href="https://www.instagram.com/maismaisenergiasolaroficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-sm"
            >
              <Instagram className="w-4 h-4 text-primary" />
              @maismaisenergiasolaroficial
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-secondary-foreground/10 text-center">
          <p className="text-sm text-secondary-foreground/60">
            © {new Date().getFullYear()} Mais Energia Solar. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
