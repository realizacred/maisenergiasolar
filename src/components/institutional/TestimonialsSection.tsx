import { Star, Quote } from "lucide-react";

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
    name: "Carlos Eduardo",
    text: "Empresa séria e comprometida com o cliente. O sistema funciona perfeitamente e a economia na conta de luz é real. Super recomendo!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="py-16 sm:py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 text-center">
          Depoimentos
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
          O que dizem nossos Clientes
        </h2>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative p-6 sm:p-8 rounded-2xl bg-background border border-border/50 hover:shadow-lg transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <span className="font-semibold text-foreground">{testimonial.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
