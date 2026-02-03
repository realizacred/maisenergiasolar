import { Instagram, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Placeholder images - will be replaced with Instagram API integration
const instagramPosts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&q=80",
    likes: 45,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&q=80",
    likes: 32,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=300&q=80",
    likes: 67,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?w=300&q=80",
    likes: 28,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&q=80",
    likes: 54,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&q=80",
    likes: 41,
  },
];

const INSTAGRAM_URL = "https://www.instagram.com/maismaisenergiasolaroficial/";

export function InstagramSection() {
  return (
    <section id="instagram" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Instagram className="w-8 h-8 text-pink-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Nosso Instagram
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto mb-4">
            Confira nosso Instagram e acompanhe nossos projetos!
          </p>
          <Button asChild className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="gap-2">
              <Instagram className="w-4 h-4" />
              @maismaisenergiasolaroficial
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="overflow-hidden aspect-square">
                <div className="relative w-full h-full">
                  <img
                    src={post.image}
                    alt="Instagram post"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Clique nas imagens para ver mais no Instagram
          </p>
        </div>
      </div>
    </section>
  );
}
