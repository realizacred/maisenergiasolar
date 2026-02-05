import { FileText, FileCheck, Wrench, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: FileText,
    title: "Projeto",
    description: "Elaboramos um projeto único e customizado para atender as suas necessidades.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80",
  },
  {
    icon: FileCheck,
    title: "Homologação",
    description: "Cuidamos de todo o processo de legalização junto à distribuidora.",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&q=80",
  },
  {
    icon: Wrench,
    title: "Instalação",
    description: "Instalamos o seu sistema usando os melhores equipamentos.",
    image: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=400&q=80",
  },
  {
    icon: Settings,
    title: "Manutenção",
    description: "Oferecemos uma assinatura de manutenção preventiva para o seu sistema.",
    image: "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?w=400&q=80",
  },
];

export function ServicesSection() {
  return (
    <section id="servicos" className="py-10 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Serviços
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Confira nossos serviços!
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-32 sm:h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center">
                  <service.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
              </div>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
                <CardTitle className="text-base sm:text-xl text-brand-blue">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">{service.description}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground text-xs sm:text-sm"
                >
                  Confira
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
