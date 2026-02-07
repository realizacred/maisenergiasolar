import { MapPin } from "lucide-react";
import obra1 from "@/assets/obra-1.jpg";
import obra2 from "@/assets/obra-2.jpg";
import obra3 from "@/assets/obra-3.jpg";
import obra4 from "@/assets/obra-4.jpg";

const projects = [
  {
    titulo: "Projeto Fotovoltaico de 3.89 kWp",
    cidade: "Cataguases - MG",
    imagem: obra1,
  },
  {
    titulo: "Projeto Fotovoltaico de 3,35 kWp",
    cidade: "Argirita - MG",
    imagem: obra2,
  },
  {
    titulo: "Projeto Fotovoltaico de 3,27 kWp",
    cidade: "Cataguases - MG",
    imagem: obra3,
  },
  {
    titulo: "Projeto Fotovoltaico de 7,22 kWp",
    cidade: "Cataguases - MG",
    imagem: obra4,
  },
];

export function ProjectsSection() {
  return (
    <section id="obras" className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 text-center">
          Nosso Portfólio
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
          Obras Realizadas
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 text-lg">
          Conheça alguns dos projetos que já realizamos em Minas Gerais.
        </p>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {projects.map((project) => (
            <div
              key={project.titulo}
              className="group rounded-2xl overflow-hidden bg-card border border-border/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-56 sm:h-64 overflow-hidden">
                <img
                  src={project.imagem}
                  alt={project.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-base mb-1">{project.titulo}</h3>
                  <p className="text-white/80 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.cidade}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
