import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export function AboutSection() {
  return (
    <section id="quem-somos" className="py-10 sm:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-blue mb-3 sm:mb-4">
              Mais Energia Solar
            </h2>
            <div className="w-12 sm:w-16 h-1 bg-brand-orange mb-4 sm:mb-6" />
            
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
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
              
              <p className="hidden sm:block">
                Nosso time é formado por engenheiros e técnicos capacitados, que utilizam softwares 
                de cálculo avançados e seguem as normas técnicas do setor elétrico, garantindo 
                projetos seguros, de alta eficiência e personalizados para cada necessidade.
              </p>
              
              <p className="hidden sm:block">
                Mais do que fornecer energia limpa, nosso propósito é{" "}
                <strong className="text-foreground">gerar economia, autonomia e impacto positivo</strong>{" "}
                no dia a dia de nossos clientes, ajudando a reduzir custos, aumentar a produtividade 
                no campo e contribuir para um futuro mais sustentável.
              </p>
            </div>
            
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Button 
                asChild
                size="sm"
                className="bg-green-500 hover:bg-green-600 gap-2 w-full sm:w-auto"
              >
                <a href="https://wa.me/5532998437675" target="_blank" rel="noopener noreferrer">
                  <Phone className="w-4 h-4" />
                  <span className="sm:hidden">WhatsApp</span>
                  <span className="hidden sm:inline">Entre em contato pelo WhatsApp</span>
                </a>
              </Button>
              <span className="text-brand-orange font-bold text-base sm:text-lg">(32) 99843-7675</span>
            </div>
          </div>
          
          <div className="flex justify-center order-first md:order-last">
            <img 
              src={logo} 
              alt="Mais Energia Solar" 
              className="w-full max-w-xs sm:max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
