import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export function AboutSection() {
  return (
    <section id="quem-somos" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-blue mb-4">
              Mais Energia Solar
            </h2>
            <div className="w-16 h-1 bg-brand-orange mb-6" />
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                A <strong className="text-foreground">Mais Energia Solar</strong> foi fundada em 2009, 
                atuando inicialmente no ramo de reparos em eletrônicos. A partir de 2019, acompanhando 
                as tendências do mercado e as necessidades de nossos clientes, passamos a nos 
                especializar em <strong className="text-foreground">Energia Solar Fotovoltaica, 
                Projetos Elétricos e Soluções Sustentáveis</strong>.
              </p>
              
              <p>
                Hoje, somos referência no desenvolvimento e instalação de{" "}
                <strong className="text-foreground">sistemas de energia solar</strong> e também em{" "}
                <strong className="text-foreground">bombas solares para irrigação</strong>, oferecendo 
                soluções inovadoras que unem tecnologia, economia e sustentabilidade para propriedades 
                residenciais, comerciais, industriais e rurais.
              </p>
              
              <p>
                Nosso time é formado por engenheiros e técnicos capacitados, que utilizam softwares 
                de cálculo avançados e seguem as normas técnicas do setor elétrico, garantindo 
                projetos seguros, de alta eficiência e personalizados para cada necessidade.
              </p>
              
              <p>
                Mais do que fornecer energia limpa, nosso propósito é{" "}
                <strong className="text-foreground">gerar economia, autonomia e impacto positivo</strong>{" "}
                no dia a dia de nossos clientes, ajudando a reduzir custos, aumentar a produtividade 
                no campo e contribuir para um futuro mais sustentável.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-4">
              <Button 
                asChild
                className="bg-green-500 hover:bg-green-600 gap-2"
              >
                <a href="https://wa.me/5532998437675" target="_blank" rel="noopener noreferrer">
                  <Phone className="w-4 h-4" />
                  Entre em contato pelo WhatsApp
                </a>
              </Button>
              <span className="text-brand-orange font-bold text-lg">(32) 99843-7675</span>
            </div>
          </div>
          
          <div className="flex justify-center">
            <img 
              src={logo} 
              alt="Mais Energia Solar" 
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
