 import { useState } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { 
   MessageCircle, 
   Copy, 
   Send, 
   Plus, 
   Edit2, 
   Trash2, 
   Check,
   X
 } from "lucide-react";
 import { toast } from "@/hooks/use-toast";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 
 interface Template {
   id: string;
   nome: string;
   mensagem: string;
   categoria: "primeiro_contato" | "follow_up" | "proposta" | "fechamento" | "pos_venda";
 }
 
 const CATEGORIA_LABELS: Record<Template["categoria"], string> = {
   primeiro_contato: "Primeiro Contato",
   follow_up: "Follow-up",
   proposta: "Proposta",
   fechamento: "Fechamento",
   pos_venda: "Pós-venda",
 };
 
 const CATEGORIA_COLORS: Record<Template["categoria"], string> = {
   primeiro_contato: "bg-blue-100 text-blue-700 border-blue-200",
   follow_up: "bg-yellow-100 text-yellow-700 border-yellow-200",
   proposta: "bg-purple-100 text-purple-700 border-purple-200",
   fechamento: "bg-green-100 text-green-700 border-green-200",
   pos_venda: "bg-orange-100 text-orange-700 border-orange-200",
 };
 
 const DEFAULT_TEMPLATES: Template[] = [
   {
     id: "1",
     nome: "Apresentação",
     mensagem: "Olá {nome}! Tudo bem? Sou {vendedor} da equipe de energia solar. Vi que você demonstrou interesse em reduzir sua conta de luz. Posso te ajudar com isso! 🌞",
     categoria: "primeiro_contato",
   },
   {
     id: "2",
     nome: "Retorno após simulação",
     mensagem: "Oi {nome}! Passando para saber se conseguiu analisar a simulação que enviei. Com base no seu consumo de {consumo}kWh, você pode economizar até 95% na conta de luz! Alguma dúvida?",
     categoria: "follow_up",
   },
   {
     id: "3",
     nome: "Envio de proposta",
     mensagem: "Olá {nome}! Preparei uma proposta personalizada para você. O sistema ideal para sua residência em {cidade} tem {potencia}kWp. Quer que eu detalhe os valores e condições de pagamento?",
     categoria: "proposta",
   },
   {
     id: "4",
     nome: "Última tentativa",
     mensagem: "Oi {nome}, tudo bem? Ainda não recebi seu retorno sobre a proposta de energia solar. Sei que às vezes a correria do dia a dia atrapalha. Se tiver qualquer dúvida, estou à disposição! 😊",
     categoria: "follow_up",
   },
   {
     id: "5",
     nome: "Fechamento",
     mensagem: "Olá {nome}! 🎉 Excelente escolha! Para darmos continuidade, preciso de alguns documentos. Pode me enviar: RG/CPF, comprovante de residência e última conta de luz?",
     categoria: "fechamento",
   },
 ];
 
 interface WhatsAppTemplatesProps {
   vendedorNome?: string;
   onSendToLead?: (mensagem: string, telefone: string, nome: string) => void;
 }
 
 export function WhatsAppTemplates({ vendedorNome = "Vendedor", onSendToLead }: WhatsAppTemplatesProps) {
   const STORAGE_KEY = `whatsapp_templates_${vendedorNome.toLowerCase().replace(/\s/g, "_")}`;
   
   const [templates, setTemplates] = useState<Template[]>(() => {
     const saved = localStorage.getItem(STORAGE_KEY);
     return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
   });
   
   const [isEditing, setIsEditing] = useState<string | null>(null);
   const [isCreating, setIsCreating] = useState(false);
   const [editForm, setEditForm] = useState<Partial<Template>>({});
   const [previewOpen, setPreviewOpen] = useState(false);
   const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
   const [previewData, setPreviewData] = useState({
     nome: "João",
     consumo: "350",
     cidade: "São Paulo",
     potencia: "4.5",
   });
 
   const saveTemplates = (newTemplates: Template[]) => {
     setTemplates(newTemplates);
     localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
   };
 
   const replaceVariables = (mensagem: string, data: Record<string, string> = {}) => {
     let result = mensagem;
     result = result.replace(/{vendedor}/g, vendedorNome);
     Object.entries(data).forEach(([key, value]) => {
       result = result.replace(new RegExp(`{${key}}`, "g"), value);
     });
     return result;
   };
 
   const copyToClipboard = (template: Template) => {
     const mensagem = replaceVariables(template.mensagem, previewData);
     navigator.clipboard.writeText(mensagem);
     toast({
       title: "Copiado!",
       description: "Mensagem copiada para a área de transferência.",
     });
   };
 
   const openPreview = (template: Template) => {
     setPreviewTemplate(template);
     setPreviewOpen(true);
   };
 
   const sendViaWhatsApp = (template: Template, telefone?: string) => {
     const mensagem = replaceVariables(template.mensagem, previewData);
     const encoded = encodeURIComponent(mensagem);
     const phone = telefone ? telefone.replace(/\D/g, "") : "";
     const formattedPhone = phone.startsWith("55") ? phone : `55${phone}`;
     window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, "_blank");
   };
 
   const startEdit = (template: Template) => {
     setEditForm(template);
     setIsEditing(template.id);
   };
 
   const saveEdit = () => {
     if (!editForm.nome || !editForm.mensagem || !editForm.categoria) return;
     
     const updated = templates.map((t) =>
       t.id === isEditing ? { ...t, ...editForm } as Template : t
     );
     saveTemplates(updated);
     setIsEditing(null);
     setEditForm({});
     toast({ title: "Template atualizado!" });
   };
 
   const startCreate = () => {
     setEditForm({
       id: Date.now().toString(),
       nome: "",
       mensagem: "",
       categoria: "follow_up",
     });
     setIsCreating(true);
   };
 
   const saveCreate = () => {
     if (!editForm.nome || !editForm.mensagem || !editForm.categoria) return;
     
     const newTemplate: Template = {
       id: editForm.id || Date.now().toString(),
       nome: editForm.nome,
       mensagem: editForm.mensagem,
       categoria: editForm.categoria as Template["categoria"],
     };
     saveTemplates([...templates, newTemplate]);
     setIsCreating(false);
     setEditForm({});
     toast({ title: "Template criado!" });
   };
 
   const deleteTemplate = (id: string) => {
     saveTemplates(templates.filter((t) => t.id !== id));
     toast({ title: "Template removido." });
   };
 
   const cancelEdit = () => {
     setIsEditing(null);
     setIsCreating(false);
     setEditForm({});
   };
 
   const groupedTemplates = templates.reduce((acc, template) => {
     if (!acc[template.categoria]) acc[template.categoria] = [];
     acc[template.categoria].push(template);
     return acc;
   }, {} as Record<Template["categoria"], Template[]>);
 
   return (
      <Card className="flex flex-col h-full w-full min-h-0 overflow-hidden">
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <MessageCircle className="h-5 w-5 text-green-600" />
             <CardTitle className="text-base">Templates WhatsApp</CardTitle>
           </div>
           <Button size="sm" onClick={startCreate} className="gap-1">
             <Plus className="h-4 w-4" />
             Novo
           </Button>
         </div>
         <CardDescription>
           Mensagens prontas para agilizar seu atendimento
         </CardDescription>
       </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto pr-1 min-h-0">
         {/* Create Form */}
         {isCreating && (
           <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
             <Input
               placeholder="Nome do template"
               value={editForm.nome || ""}
               onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
             />
             <Textarea
               placeholder="Mensagem (use {nome}, {consumo}, {cidade}, {potencia}, {vendedor})"
               value={editForm.mensagem || ""}
               onChange={(e) => setEditForm({ ...editForm, mensagem: e.target.value })}
               rows={3}
             />
             <select
               className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
               value={editForm.categoria || "follow_up"}
               onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value as Template["categoria"] })}
             >
               {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
                 <option key={key} value={key}>{label}</option>
               ))}
             </select>
             <div className="flex gap-2">
               <Button size="sm" onClick={saveCreate} className="gap-1">
                 <Check className="h-4 w-4" />
                 Salvar
               </Button>
               <Button size="sm" variant="outline" onClick={cancelEdit}>
                 <X className="h-4 w-4" />
               </Button>
             </div>
           </div>
         )}
 
         {/* Templates by Category */}
         {Object.entries(groupedTemplates).map(([categoria, categoryTemplates]) => (
           <div key={categoria} className="space-y-2">
             <Badge variant="outline" className={CATEGORIA_COLORS[categoria as Template["categoria"]]}>
               {CATEGORIA_LABELS[categoria as Template["categoria"]]}
             </Badge>
             <div className="space-y-2">
               {categoryTemplates.map((template) => (
                 <div key={template.id}>
                   {isEditing === template.id ? (
                     <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
                       <Input
                         value={editForm.nome || ""}
                         onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                       />
                       <Textarea
                         value={editForm.mensagem || ""}
                         onChange={(e) => setEditForm({ ...editForm, mensagem: e.target.value })}
                         rows={3}
                       />
                       <div className="flex gap-2">
                         <Button size="sm" onClick={saveEdit}>
                           <Check className="h-4 w-4" />
                         </Button>
                         <Button size="sm" variant="outline" onClick={cancelEdit}>
                           <X className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   ) : (
                     <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                       <div className="flex items-start justify-between gap-2">
                         <div className="flex-1 min-w-0">
                           <p className="font-medium text-sm">{template.nome}</p>
                           <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                             {template.mensagem}
                           </p>
                         </div>
                         <div className="flex items-center gap-1 shrink-0">
                           <Button
                             size="icon"
                             variant="ghost"
                             className="h-8 w-8"
                             onClick={() => copyToClipboard(template)}
                           >
                             <Copy className="h-4 w-4" />
                           </Button>
                           <Button
                             size="icon"
                             variant="ghost"
                             className="h-8 w-8 text-green-600"
                             onClick={() => openPreview(template)}
                           >
                             <Send className="h-4 w-4" />
                           </Button>
                           <Button
                             size="icon"
                             variant="ghost"
                             className="h-8 w-8"
                             onClick={() => startEdit(template)}
                           >
                             <Edit2 className="h-4 w-4" />
                           </Button>
                           <Button
                             size="icon"
                             variant="ghost"
                             className="h-8 w-8 text-destructive"
                             onClick={() => deleteTemplate(template.id)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </div>
         ))}
 
         {templates.length === 0 && !isCreating && (
           <div className="text-center py-8 text-muted-foreground">
             <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
             <p className="text-sm">Nenhum template criado</p>
             <Button size="sm" variant="link" onClick={startCreate}>
               Criar primeiro template
             </Button>
           </div>
         )}
       </CardContent>
 
       {/* Preview Dialog */}
       <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Pré-visualização</DialogTitle>
             <DialogDescription>
               Veja como a mensagem ficará antes de enviar
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="text-xs text-muted-foreground">Nome do cliente</label>
                 <Input
                   value={previewData.nome}
                   onChange={(e) => setPreviewData({ ...previewData, nome: e.target.value })}
                 />
               </div>
               <div>
                 <label className="text-xs text-muted-foreground">Consumo (kWh)</label>
                 <Input
                   value={previewData.consumo}
                   onChange={(e) => setPreviewData({ ...previewData, consumo: e.target.value })}
                 />
               </div>
               <div>
                 <label className="text-xs text-muted-foreground">Cidade</label>
                 <Input
                   value={previewData.cidade}
                   onChange={(e) => setPreviewData({ ...previewData, cidade: e.target.value })}
                 />
               </div>
               <div>
                 <label className="text-xs text-muted-foreground">Potência (kWp)</label>
                 <Input
                   value={previewData.potencia}
                   onChange={(e) => setPreviewData({ ...previewData, potencia: e.target.value })}
                 />
               </div>
             </div>
             {previewTemplate && (
               <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                 <p className="text-sm whitespace-pre-wrap">
                   {replaceVariables(previewTemplate.mensagem, previewData)}
                 </p>
               </div>
             )}
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setPreviewOpen(false)}>
               Cancelar
             </Button>
             <Button
               className="gap-2 bg-green-600 hover:bg-green-700"
               onClick={() => {
                 if (previewTemplate) sendViaWhatsApp(previewTemplate);
                 setPreviewOpen(false);
               }}
             >
               <Send className="h-4 w-4" />
               Abrir WhatsApp
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </Card>
   );
 }