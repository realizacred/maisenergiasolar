import { Shield, Award, HeadphonesIcon, Leaf, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const values = [
  { icon: Shield, label: "Segurança" },
  { icon: Award, label: "Qualidade" },
  { icon: HeadphonesIcon, label: "Atendimento" },
  { icon: Leaf, label: "Sustentabilidade" },
];

const purposes = [
  "Reduzir custos com energia",
  "Aumentar produtividade no campo",
  "Contribuir para um futuro sustentável",
];

export function AboutSection() {
  return (
    <section id="quem-somos" className="py-16 sm:py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Label */}
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 text-center">
          Quem Somos
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
          Mais Energia Solar
        </h2>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 text-muted-foreground text-base sm:text-lg leading-relaxed mb-10">
            <p>
              A <strong className="text-foreground">Mais Energia Solar</strong> foi fundada em 2009, 
              atuando inicialmente no ramo de reparos em eletrônicos. A partir de 2019, acompanhando 
              as tendências do mercado, passamos a nos especializar em{" "}
              <strong className="text-foreground">Energia Solar Fotovoltaica, Projetos Elétricos e Soluções Sustentáveis</strong>.
            </p>
            <p>
              Hoje, somos referência no desenvolvimento e instalação de sistemas de energia solar 
              e também em bombas solares para irrigação, oferecendo soluções inovadoras para 
              propriedades residenciais, comerciais, industriais e rurais.
            </p>
            <p>
              Nosso time é formado por engenheiros e técnicos capacitados, que utilizam softwares 
              de cálculo avançados e seguem as normas técnicas do setor elétrico, garantindo 
              projetos seguros e de alta eficiência.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {values.map((v) => (
              <div
                key={v.label}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="font-semibold text-foreground text-sm">{v.label}</span>
              </div>
            ))}
          </div>

          {/* Purpose */}
          <div className="bg-secondary/5 rounded-2xl p-8 sm:p-10 border border-secondary/10">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Nosso Propósito</h3>
            <p className="text-muted-foreground mb-6">
              Mais do que fornecer energia limpa, nosso propósito é gerar economia, 
              autonomia e impacto positivo no dia a dia de nossos clientes.
            </p>
            <ul className="space-y-3 mb-8">
              {purposes.map((p) => (
                <li key={p} className="flex items-center gap-3 text-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 rounded-full px-6"
            >
              <a href="https://wa.me/5532998437675" target="_blank" rel="noopener noreferrer">
                <Phone className="w-4 h-4 mr-2" />
                Fale Conosco
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
