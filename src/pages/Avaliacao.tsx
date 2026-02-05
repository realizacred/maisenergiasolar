 import { useState } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { toast } from "@/hooks/use-toast";
 import { Loader2, Star, CheckCircle2, Sun } from "lucide-react";
 import logoImg from "@/assets/logo.png";
 
 const avaliacaoOptions = [
  { value: "otimo", label: "Ótimo", emoji: "😄", color: "bg-success hover:bg-success/90" },
  { value: "bom", label: "Bom", emoji: "🙂", color: "bg-secondary hover:bg-secondary/90" },
  { value: "razoavel", label: "Razoável", emoji: "😐", color: "bg-warning hover:bg-warning/90" },
  { value: "ruim", label: "Ruim", emoji: "😕", color: "bg-primary hover:bg-primary/90" },
  { value: "muito_ruim", label: "Muito Ruim", emoji: "😞", color: "bg-destructive hover:bg-destructive/90" },
 ];
 
 export default function Avaliacao() {
   const [nome, setNome] = useState("");
   const [endereco, setEndereco] = useState("");
   const [avaliacao, setAvaliacao] = useState("");
   const [observacoes, setObservacoes] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [submitted, setSubmitted] = useState(false);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!nome.trim() || !endereco.trim() || !avaliacao) {
       toast({
         title: "Campos obrigatórios",
         description: "Por favor, preencha seu nome, endereço e selecione uma avaliação.",
         variant: "destructive",
       });
       return;
     }
 
     setSubmitting(true);
     try {
       // Inserir avaliação na tabela checklists_instalacao
       // Usando um UUID fixo para instalador_id já que é avaliação pública
       const { error } = await supabase
         .from("checklists_instalacao")
         .insert({
           nome_cliente: nome.trim(),
           endereco: endereco.trim(),
           avaliacao_atendimento: avaliacao,
           observacoes: observacoes.trim() || null,
           data_instalacao: new Date().toISOString().split('T')[0],
           instalador_id: "00000000-0000-0000-0000-000000000000", // ID placeholder para avaliações públicas
         });
 
       if (error) throw error;
 
       setSubmitted(true);
       toast({
         title: "Avaliação enviada!",
         description: "Muito obrigado pelo seu feedback!",
       });
     } catch (error) {
       console.error("Error submitting evaluation:", error);
       toast({
         title: "Erro ao enviar",
         description: "Tente novamente em alguns instantes.",
         variant: "destructive",
       });
     } finally {
       setSubmitting(false);
     }
   };
 
   if (submitted) {
     return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
         <Card className="w-full max-w-md text-center">
           <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
             </div>
             <h2 className="text-2xl font-bold text-foreground mb-2">
               Obrigado pela sua avaliação!
             </h2>
             <p className="text-muted-foreground mb-6">
               Seu feedback é muito importante para continuarmos melhorando nossos serviços.
             </p>
             <div className="flex items-center justify-center gap-2 text-primary">
               <Sun className="h-5 w-5" />
               <span className="font-medium">Energia Solar - Mais Economia para Você!</span>
             </div>
           </CardContent>
         </Card>
       </div>
     );
   }
 
   return (
    <div className="min-h-screen gradient-mesh">
       {/* Header simples */}
       <header className="bg-primary text-primary-foreground py-4 shadow-lg">
         <div className="container mx-auto px-4 flex items-center justify-center">
           <img src={logoImg} alt="Logo" className="h-10" />
         </div>
       </header>
 
       <main className="container mx-auto px-4 py-8 max-w-lg">
         <Card className="shadow-xl border-0">
           <CardHeader className="text-center pb-2">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <Star className="h-8 w-8 text-primary" />
             </div>
             <CardTitle className="text-2xl">Avalie Nosso Atendimento</CardTitle>
             <CardDescription className="text-base">
               Sua opinião é muito importante para nós!
             </CardDescription>
           </CardHeader>
           
           <CardContent>
             <form onSubmit={handleSubmit} className="space-y-6">
               {/* Nome */}
               <div className="space-y-2">
                 <label className="text-sm font-medium">
                   Seu Nome <span className="text-destructive">*</span>
                 </label>
                 <Input
                   value={nome}
                   onChange={(e) => setNome(e.target.value)}
                   placeholder="Digite seu nome completo"
                   disabled={submitting}
                 />
               </div>
 
               {/* Endereço */}
               <div className="space-y-2">
                 <label className="text-sm font-medium">
                   Endereço da Instalação <span className="text-destructive">*</span>
                 </label>
                 <Input
                   value={endereco}
                   onChange={(e) => setEndereco(e.target.value)}
                   placeholder="Rua, número, bairro"
                   disabled={submitting}
                 />
               </div>
 
               {/* Avaliação */}
               <div className="space-y-3">
                 <label className="text-sm font-medium">
                   Como você avalia nosso atendimento? <span className="text-destructive">*</span>
                 </label>
                 <div className="grid grid-cols-1 gap-2">
                   {avaliacaoOptions.map((option) => (
                     <button
                       key={option.value}
                       type="button"
                       onClick={() => setAvaliacao(option.value)}
                       disabled={submitting}
                       className={`
                         p-4 rounded-lg border-2 transition-all flex items-center gap-3
                         ${avaliacao === option.value 
                           ? `${option.color} text-white border-transparent scale-[1.02] shadow-lg` 
                           : 'bg-card border-border hover:border-primary/50'
                         }
                       `}
                     >
                       <span className="text-2xl">{option.emoji}</span>
                       <span className="font-medium">{option.label}</span>
                     </button>
                   ))}
                 </div>
               </div>
 
               {/* Observações */}
               <div className="space-y-2">
                 <label className="text-sm font-medium">
                   Observações (opcional)
                 </label>
                 <Textarea
                   value={observacoes}
                   onChange={(e) => setObservacoes(e.target.value)}
                   placeholder="Conte-nos mais sobre sua experiência..."
                   rows={3}
                   disabled={submitting}
                 />
               </div>
 
               <Button 
                 type="submit" 
                 className="w-full h-12 text-lg"
                 disabled={submitting}
               >
                 {submitting ? (
                   <>
                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                     Enviando...
                   </>
                 ) : (
                   "Enviar Avaliação"
                 )}
               </Button>
             </form>
           </CardContent>
         </Card>
 
         <p className="text-center text-sm text-muted-foreground mt-6">
           Obrigado por escolher nossos serviços de energia solar! ☀️
         </p>
       </main>
     </div>
   );
 }