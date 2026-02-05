import { useState } from "react";
import { MapPin, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: number;
  titulo: string;
  cidade: string;
  estado: string;
  potencia: string;
  economia: string;
  imagem: string;
}

// Projetos reais da Mais Energia Solar
const projects: Project[] = [
  {
    id: 1,
    titulo: "Projeto Fotovoltaico",
    cidade: "Cataguases",
    estado: "MG",
    potencia: "3.89 kWp",
    economia: "R$ 420/mês",
    imagem: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
  },
  {
    id: 2,
    titulo: "Projeto Fotovoltaico",
    cidade: "Argirita",
    estado: "MG",
    potencia: "3.35 kWp",
    economia: "R$ 360/mês",
    imagem: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=80",
  },
  {
    id: 3,
    titulo: "Projeto Fotovoltaico",
    cidade: "Cataguases",
    estado: "MG",
    potencia: "3.27 kWp",
    economia: "R$ 360/mês",
    imagem: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600&q=80",
  },
  {
    id: 4,
    titulo: "Projeto Fotovoltaico",
    cidade: "Dona Eusébia",
    estado: "MG",
    potencia: "7.22 kWp",
    economia: "R$ 780/mês",
    imagem: "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?w=600&q=80",
  },
];

export function ProjectsSection() {
  const [visibleProjects, setVisibleProjects] = useState(4);
  
  const loadMore = () => {
    setVisibleProjects(prev => Math.min(prev + 4, projects.length));
  };

  return (
    <section id="obras" className="py-16 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Obras Realizadas
          </h2>
          <p className="opacity-80 max-w-xl mx-auto">
            Confira nossas obras!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {projects.slice(0, visibleProjects).map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden bg-card text-foreground hover:shadow-xl transition-all group"
            >
              <div className="p-4 pb-2">
                <h3 className="text-lg font-bold text-brand-blue">
                  {project.titulo} de {project.potencia}
                </h3>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {project.cidade} - {project.estado}
                </p>
              </div>
              
              <div className="px-4 pb-2">
                <Button 
                  className="w-full bg-secondary hover:bg-secondary/90"
                  size="sm"
                >
                  Confira
                </Button>
              </div>
              
              <div className="relative overflow-hidden">
                <img
                  src={project.imagem}
                  alt={project.titulo}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-3">
                  <div className="flex items-center justify-between text-primary-foreground text-xs">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Sistema de {project.potencia}
                    </span>
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      {project.economia}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {visibleProjects < projects.length && (
          <div className="text-center mt-8">
            <Button 
              onClick={loadMore}
              variant="outline"
              className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary"
            >
              Carregar mais
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
