import { useState, useEffect } from "react";
import { Instagram, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface InstagramPost {
  id: string;
  instagram_id: string;
  media_type: string | null;
  media_url: string;
  thumbnail_url: string | null;
  permalink: string | null;
  caption: string | null;
}

// Fallback images when no posts are synced
const fallbackPosts = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&q=80",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&q=80",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=300&q=80",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?w=300&q=80",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&q=80",
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&q=80",
  },
];

const INSTAGRAM_URL = "https://www.instagram.com/maismaisenergiasolaroficial/";

export function InstagramSection() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("maismaisenergiasolaroficial");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Fetch posts from database
      const { data: postsData, error: postsError } = await supabase
        .from("instagram_posts")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(6);

      if (postsError) throw postsError;

      if (postsData && postsData.length > 0) {
        setPosts(postsData);
      }

      // Try to get config for username (this is public readable)
      // Note: config is protected, so we'll just use default username
    } catch (error) {
      console.error("Error fetching Instagram posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (post: InstagramPost) => {
    // For videos, use thumbnail_url if available
    if (post.media_type === "VIDEO" && post.thumbnail_url) {
      return post.thumbnail_url;
    }
    return post.media_url;
  };

  const instagramProfileUrl = `https://www.instagram.com/${username}/`;

  return (
    <section id="instagram" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Instagram className="w-8 h-8 text-secondary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Nosso Instagram
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto mb-4">
            Confira nosso Instagram e acompanhe nossos projetos!
          </p>
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <a href={instagramProfileUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
              <Instagram className="w-4 h-4" />
              @{username}
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {posts.length > 0 ? (
            posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink || instagramProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="overflow-hidden aspect-square">
                  <div className="relative w-full h-full">
                    <img
                      src={getImageUrl(post)}
                      alt={post.caption || "Instagram post"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Card>
              </a>
            ))
          ) : (
            fallbackPosts.map((post) => (
              <a
                key={post.id}
                href={instagramProfileUrl}
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
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Card>
              </a>
            ))
          )}
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
