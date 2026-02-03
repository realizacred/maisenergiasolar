import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  nome: string;
  cidade: string;
  estado: string;
  texto: string;
  economia: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    nome: "Carlos Silva",
    cidade: "São Paulo",
    estado: "SP",
    texto: "Instalei o sistema há 6 meses e minha conta de luz caiu de R$450 para R$80. Melhor investimento que fiz!",
    economia: "82%",
    rating: 5,
  },
  {
    nome: "Maria Santos",
    cidade: "Belo Horizonte",
    estado: "MG",
    texto: "Equipe super profissional, instalação rápida e limpa. O sistema funciona perfeitamente desde o primeiro dia.",
    economia: "90%",
    rating: 5,
  },
  {
    nome: "Roberto Oliveira",
    cidade: "Curitiba",
    estado: "PR",
    texto: "Fiz o financiamento e a parcela é menor que a economia na conta. Já estou lucrando!",
    economia: "95%",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Mais de 500 sistemas instalados em todo o Brasil. Veja o que nossos clientes dizem sobre a experiência.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-primary/20 mb-2" />
                
                <p className="text-foreground mb-4 leading-relaxed">
                  "{testimonial.texto}"
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.cidade}, {testimonial.estado}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Economia</p>
                    <p className="text-lg font-bold text-primary">{testimonial.economia}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
