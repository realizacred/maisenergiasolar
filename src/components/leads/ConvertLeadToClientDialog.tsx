import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShoppingCart, FileText, MapPin, Navigation, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { DocumentUpload } from "./DocumentUpload";
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
  const [savingAsLead, setSavingAsLead] = useState(false);
  const [disjuntores, setDisjuntores] = useState<Disjuntor[]>([]);
  const [transformadores, setTransformadores] = useState<Transformador[]>([]);
  
  // Multiple files support
  const [identidadeFiles, setIdentidadeFiles] = useState<File[]>([]);
  const [comprovanteFiles, setComprovanteFiles] = useState<File[]>([]);
  const [beneficiariaFiles, setBeneficiariaFiles] = useState<File[]>([]);
  
  const [gettingLocation, setGettingLocation] = useState(false);

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
      setIdentidadeFiles([]);
      setComprovanteFiles([]);
      setBeneficiariaFiles([]);
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

  const uploadMultipleFiles = async (files: File[], folder: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file, folder);
      if (url) urls.push(url);
    }
    return urls;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Geolocalização não é suportada pelo seu navegador.",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        form.setValue("localizacao", googleMapsLink);
        setGettingLocation(false);
        toast({
          title: "Localização obtida!",
          description: `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
      },
      (error) => {
        setGettingLocation(false);
        let message = "Erro ao obter localização.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permissão de localização negada.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Localização indisponível.";
            break;
          case error.TIMEOUT:
            message = "Tempo esgotado ao obter localização.";
            break;
        }
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Check if required documents are complete
  const isDocumentationComplete = () => {
    return (
      identidadeFiles.length > 0 &&
      comprovanteFiles.length > 0 &&
      form.getValues("disjuntor_id") &&
      form.getValues("transformador_id")
    );
  };

  // Save as lead with "Aguardando Documentação" status
  const handleSaveAsLead = async () => {
    if (!lead) return;

    const isValid = await form.trigger();
    if (!isValid) return;

    setSavingAsLead(true);

    try {
      // Get "Aguardando Documentação" status
      const { data: aguardandoStatus } = await supabase
        .from("lead_status")
        .select("id")
        .eq("nome", "Aguardando Documentação")
        .single();

      if (!aguardandoStatus) {
        throw new Error("Status 'Aguardando Documentação' não encontrado.");
      }

      // Build observation note about what's missing
      const missing: string[] = [];
      if (identidadeFiles.length === 0) missing.push("Identidade");
      if (comprovanteFiles.length === 0) missing.push("Comprovante de Endereço");
      if (!form.getValues("disjuntor_id")) missing.push("Disjuntor");
      if (!form.getValues("transformador_id")) missing.push("Transformador");

      const observacoesAtuais = form.getValues("observacoes") || "";
      const novaObservacao = missing.length > 0 
        ? `[Documentação Pendente: ${missing.join(", ")}] ${observacoesAtuais}`.trim()
        : observacoesAtuais;

      // Update lead with new data and status
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          status_id: aguardandoStatus.id,
          observacoes: novaObservacao,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lead.id);

      if (updateError) throw updateError;

      toast({
        title: "Lead atualizado!",
        description: `${lead.nome} foi marcado como "Aguardando Documentação".`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving lead:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o lead.",
        variant: "destructive",
      });
    } finally {
      setSavingAsLead(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    if (!lead) return;

    setLoading(true);

    try {
      // Upload all documents
      const identidadeUrls = await uploadMultipleFiles(identidadeFiles, "identidade");
      const comprovanteUrls = await uploadMultipleFiles(comprovanteFiles, "comprovante");
      const beneficiariaUrls = await uploadMultipleFiles(beneficiariaFiles, "beneficiaria");

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
          identidade_urls: identidadeUrls.length > 0 ? identidadeUrls : null,
          comprovante_endereco_urls: comprovanteUrls.length > 0 ? comprovanteUrls : null,
          comprovante_beneficiaria_urls: beneficiariaUrls.length > 0 ? beneficiariaUrls : null,
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
            Preencha os dados para transformar o lead em cliente. Se faltarem documentos, você pode salvar como "Aguardando Documentação".
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
              <div className="space-y-4">
                <DocumentUpload
                  label="Identidade (RG/CNH)"
                  description="Tire uma foto ou selecione arquivos (frente e verso)"
                  files={identidadeFiles}
                  onFilesChange={setIdentidadeFiles}
                  required
                />
                <DocumentUpload
                  label="Comprovante de Endereço"
                  description="Tire uma foto ou selecione arquivos"
                  files={comprovanteFiles}
                  onFilesChange={setComprovanteFiles}
                  required
                />
                <DocumentUpload
                  label="Comprovante Beneficiária da UC"
                  description="Comprovante da unidade consumidora (opcional)"
                  files={beneficiariaFiles}
                  onFilesChange={setBeneficiariaFiles}
                />
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
                      <FormLabel>Disjuntor *</FormLabel>
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
                      <FormLabel>Transformador *</FormLabel>
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
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: -23.5505, -46.6333 ou link do Google Maps"
                          className="flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        className="shrink-0"
                      >
                        {gettingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Navigation className="h-4 w-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">
                          {gettingLocation ? "Obtendo..." : "Minha Localização"}
                        </span>
                      </Button>
                    </div>
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

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || savingAsLead}
              >
                Cancelar
              </Button>
              
              {/* Save as Lead button - shown when documentation is incomplete */}
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveAsLead}
                disabled={loading || savingAsLead}
              >
                {savingAsLead ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Aguardando Documentação
                  </>
                )}
              </Button>

              <Button type="submit" disabled={loading || savingAsLead}>
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
