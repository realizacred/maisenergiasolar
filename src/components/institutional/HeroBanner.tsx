import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-solar.jpg";

const stats = [
  { value: "15+", label: "Anos de experiência" },
  { value: "500+", label: "Projetos realizados" },
  { value: "90%", label: "Economia na conta" },
];

export function HeroBanner() {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollDown = () => {
    document.getElementById("quem-somos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <img
        src={heroImage}
        alt="Painéis solares"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-secondary/80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <span className="inline-block px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold mb-6">
            Economia de até 90% na conta de luz
          </span>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            O futuro da{" "}
            <span className="text-primary">energia</span>{" "}
            é agora!
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
            Soluções em energia solar fotovoltaica para residências, comércios, 
            indústrias e propriedades rurais. Projetos personalizados com a melhor tecnologia.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Button
              size="lg"
              onClick={scrollToContact}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base rounded-full shadow-primary"
            >
              Solicitar Orçamento Grátis
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-6 text-base rounded-full"
            >
              <a href="https://wa.me/5532998437675" target="_blank" rel="noopener noreferrer">
                Fale no WhatsApp
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 sm:gap-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Down Arrow */}
      <button
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce-soft"
        aria-label="Rolar para baixo"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
}
