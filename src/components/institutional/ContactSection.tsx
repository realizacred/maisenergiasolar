import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const contactInfo = [
  {
    icon: Phone,
    label: "Telefone",
    value: "(32) 99843-7675",
    href: "tel:+5532998437675",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "contato@maisenergiasolar.com.br",
    href: "mailto:contato@maisenergiasolar.com.br",
  },
  {
    icon: MapPin,
    label: "Localização",
    value: "Cataguases - MG",
    href: null,
  },
];

export function ContactSection() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos seu nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Send via WhatsApp as fallback
      const message = encodeURIComponent(
        `Olá! Gostaria de solicitar um orçamento.\n\nNome: ${formData.nome}\nTelefone: ${formData.telefone}\nCidade: ${formData.cidade} - ${formData.estado}\n${formData.observacoes ? `Observações: ${formData.observacoes}` : ""}`
      );
      window.open(`https://wa.me/5532998437675?text=${message}`, "_blank");

      toast({
        title: "Redirecionado para WhatsApp!",
        description: "Complete o envio pelo WhatsApp.",
      });

      setFormData({ nome: "", email: "", telefone: "", cidade: "", estado: "", observacoes: "" });
    } catch {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou entre em contato pelo WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contato" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 text-center">
          Fale Conosco
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
          Solicite um Orçamento
        </h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">Informações de Contato</h3>
            <div className="space-y-5 mb-8">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{info.label}</p>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="font-semibold text-foreground">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              required
            />
            <Input
              placeholder="Cidade"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            />
            <Select
              value={formData.estado}
              onValueChange={(val) => setFormData({ ...formData, estado: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Observações"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={4}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 rounded-full py-6 text-base font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Enviando..." : "Enviar Orçamento"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
