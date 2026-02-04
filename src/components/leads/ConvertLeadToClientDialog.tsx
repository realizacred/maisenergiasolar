import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, ShoppingCart, FileText, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Lead } from "@/types/lead";

interface Disjuntor {
  id: string;
  amperagem: number;
  descricao: string | null;
}

interface Transformador {
  id: string;
  potencia_kva: number;
  descricao: string | null;
}

const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  cpf_cnpj: z.string().optional(),
  cep: z.string().optional(),
  estado: z.string().min(2, "Estado é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  bairro: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  disjuntor_id: z.string().optional(),
  transformador_id: z.string().optional(),
  localizacao: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ConvertLeadToClientDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConvertLeadToClientDialog({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: ConvertLeadToClientDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [disjuntores, setDisjuntores] = useState<Disjuntor[]>([]);
  const [transformadores, setTransformadores] = useState<Transformador[]>([]);
  const [identidadeFile, setIdentidadeFile] = useState<File | null>(null);
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [uploadingIdentidade, setUploadingIdentidade] = useState(false);
  const [uploadingComprovante, setUploadingComprovante] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      cpf_cnpj: "",
      cep: "",
      estado: "",
      cidade: "",
      bairro: "",
      rua: "",
      numero: "",
      complemento: "",
      disjuntor_id: "",
      transformador_id: "",
      localizacao: "",
      observacoes: "",
    },
  });

  // Load equipment options
  useEffect(() => {
    const loadEquipment = async () => {
      const [disjuntoresRes, transformadoresRes] = await Promise.all([
        supabase.from("disjuntores").select("*").eq("ativo", true).order("amperagem"),
        supabase.from("transformadores").select("*").eq("ativo", true).order("potencia_kva"),
      ]);

      if (disjuntoresRes.data) setDisjuntores(disjuntoresRes.data);
      if (transformadoresRes.data) setTransformadores(transformadoresRes.data);
    };

    loadEquipment();
  }, []);

  // Pre-fill form when lead changes
  useEffect(() => {
    if (lead && open) {
      form.reset({
        nome: lead.nome || "",
        telefone: lead.telefone || "",
        email: "",
        cpf_cnpj: "",
        cep: lead.cep || "",
        estado: lead.estado || "",
        cidade: lead.cidade || "",
        bairro: lead.bairro || "",
        rua: lead.rua || "",
        numero: lead.numero || "",
        complemento: lead.complemento || "",
        disjuntor_id: "",
        transformador_id: "",
        localizacao: "",
        observacoes: lead.observacoes || "",
      });
      setIdentidadeFile(null);
      setComprovanteFile(null);
    }
  }, [lead, open, form]);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("documentos-cliente")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    return fileName;
  };

  const handleSubmit = async (data: FormData) => {
    if (!lead) return;

    setLoading(true);

    try {
      let identidadeUrl: string | null = null;
      let comprovanteUrl: string | null = null;

      // Upload documents if provided
      if (identidadeFile) {
        setUploadingIdentidade(true);
        identidadeUrl = await uploadFile(identidadeFile, "identidade");
        setUploadingIdentidade(false);
        if (!identidadeUrl) {
          throw new Error("Erro ao enviar identidade");
        }
      }

      if (comprovanteFile) {
        setUploadingComprovante(true);
        comprovanteUrl = await uploadFile(comprovanteFile, "comprovante");
        setUploadingComprovante(false);
        if (!comprovanteUrl) {
          throw new Error("Erro ao enviar comprovante de endereço");
        }
      }

      // Create client
      const { data: cliente, error: clienteError } = await supabase
        .from("clientes")
        .insert({
          nome: data.nome,
          telefone: data.telefone,
          email: data.email || null,
          cpf_cnpj: data.cpf_cnpj || null,
          cep: data.cep || null,
          estado: data.estado,
          cidade: data.cidade,
          bairro: data.bairro || null,
          rua: data.rua || null,
          numero: data.numero || null,
          complemento: data.complemento || null,
          lead_id: lead.id,
          disjuntor_id: data.disjuntor_id || null,
          transformador_id: data.transformador_id || null,
          localizacao: data.localizacao || null,
          observacoes: data.observacoes || null,
          identidade_url: identidadeUrl,
          comprovante_endereco_url: comprovanteUrl,
        })
        .select()
        .single();

      if (clienteError) throw clienteError;

      // Update lead status to "Convertido"
      const { data: convertidoStatus } = await supabase
        .from("lead_status")
        .select("id")
        .eq("nome", "Convertido")
        .single();

      if (convertidoStatus) {
        await supabase
          .from("leads")
          .update({ status_id: convertidoStatus.id })
          .eq("id", lead.id);
      }

      toast({
        title: "Lead convertido!",
        description: `${data.nome} foi cadastrado como cliente com sucesso.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error converting lead:", error);
      toast({
        title: "Erro ao converter lead",
        description: error.message || "Não foi possível converter o lead em cliente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Converter Lead em Venda
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para transformar o lead em cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf_cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Endereço
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rua"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Documentos */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Identidade (RG/CNH)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIdentidadeFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {identidadeFile && (
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {identidadeFile.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Comprovante de Endereço</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setComprovanteFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {comprovanteFile && (
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {comprovanteFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dados Técnicos */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Dados Técnicos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="disjuntor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disjuntor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o disjuntor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {disjuntores.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.amperagem}A {d.descricao ? `- ${d.descricao}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transformador_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transformador</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o transformador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transformadores.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.potencia_kva} kVA {t.descricao ? `- ${t.descricao}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="localizacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localização (Coordenadas/Link do Mapa)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ex: -23.5505, -46.6333 ou link do Google Maps"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      placeholder="Informações adicionais sobre o cliente ou instalação..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Convertendo...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Converter em Venda
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
