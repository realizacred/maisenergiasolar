import { ArrowRight } from "lucide-react";
import serviceProjeto from "@/assets/service-projeto.jpg";
import serviceHomologacao from "@/assets/service-homologacao.jpg";
import serviceInstalacao from "@/assets/service-instalacao.jpg";
import serviceManutencao from "@/assets/service-manutencao.jpg";

const services = [
  {
    title: "Projeto",
    description: "Elaboramos um projeto único e customizado para atender as suas necessidades, utilizando softwares de cálculo avançados.",
    image: serviceProjeto,
  },
  {
    title: "Homologação",
    description: "Cuidamos de todo o processo de legalização junto à distribuidora de energia, sem burocracia para você.",
    image: serviceHomologacao,
  },
  {
    title: "Instalação",
    description: "Instalamos o seu sistema usando os melhores equipamentos do mercado, com garantia e segurança total.",
    image: serviceInstalacao,
  },
  {
    title: "Manutenção",
    description: "Oferecemos manutenção preventiva para garantir que seu sistema funcione com máxima eficiência sempre.",
    image: serviceManutencao,
  },
];

export function ServicesSection() {
  return (
    <section id="servicos" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 text-center">
          Nossos Serviços
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
          Serviços
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 text-lg">
          Do projeto à manutenção, cuidamos de tudo para você ter a melhor experiência com energia solar.
        </p>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </p>
                <a
                  href="https://wa.me/5532998437675"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Saiba mais
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
