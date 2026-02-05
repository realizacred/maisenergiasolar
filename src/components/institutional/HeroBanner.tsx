import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1920&q=80",
    title: "O futuro",
    highlight: "é agora!",
    categories: ["Residenciais", "Comerciais", "Industriais", "Rurais"],
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1920&q=80",
    title: "Energia limpa",
    highlight: "para você!",
    categories: ["Economia", "Sustentabilidade", "Autonomia", "Tecnologia"],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1920&q=80",
    title: "Sua economia",
    highlight: "começa aqui!",
    categories: ["Projeto", "Instalação", "Homologação", "Manutenção"],
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-secondary/80" />
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl ml-auto text-right text-primary-foreground">
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-1 sm:mb-2">
                  {slide.title}
                </h1>
                <p className="text-xl sm:text-3xl md:text-5xl font-bold text-brand-orange mb-3 sm:mb-6">
                  {slide.highlight}
                </p>
                <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
                  {slide.categories.map((cat, i) => (
                    <span 
                      key={i}
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-medium ${
                        i === 0 
                          ? "bg-brand-orange text-white" 
                          : "bg-white/20 backdrop-blur-sm"
                      }`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-primary-foreground rounded-full h-8 w-8 sm:h-10 sm:w-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-primary-foreground rounded-full h-8 w-8 sm:h-10 sm:w-10"
        onClick={nextSlide}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-brand-orange" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
