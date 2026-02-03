import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Ricardo Nunes",
    text: "Atendimento maravilhoso, rápido e um pós venda excelente, um investimento que vale a pena fazer. Feliz demais em ver a economia que tenho a cada conta que chega.",
    rating: 5,
  },
  {
    id: 2,
    name: "Maria Lucia",
    text: "Não poderíamos ter feito um investimento melhor! Estamos muito satisfeitos com o serviço e com o sistema!!! Parabéns para toda a equipe! Nota mil!",
    rating: 5,
  },
  {
    id: 3,
    name: "João Carlos",
    text: "Excelente empresa! Profissionais capacitados e muito atenciosos. Minha conta de luz reduziu drasticamente. Super recomendo!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            O que dizem nossos Clientes!
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
              alt="Google" 
              className="h-6"
            />
            <span className="text-muted-foreground">Avaliações</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative overflow-hidden">
              <CardContent className="pt-8 pb-6">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-orange/20" />
                
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-foreground">{testimonial.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
