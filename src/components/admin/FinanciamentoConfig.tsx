import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit2, Loader2, Building2, Percent, CreditCard, Link2, RefreshCw, Key, GripVertical } from "lucide-react";

interface Banco {
  id: string;
  nome: string;
  taxa_mensal: number;
  max_parcelas: number;
  ativo: boolean;
  ordem: number;
}

interface ApiConfig {
  id: string;
  nome: string;
  url: string | null;
  api_key: string | null;
  ativo: boolean;
  ultima_sincronizacao: string | null;
}

export default function FinanciamentoConfig() {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingBanco, setEditingBanco] = useState<Banco | null>(null);
  const [bancoToDelete, setBancoToDelete] = useState<Banco | null>(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    taxa_mensal: "",
    max_parcelas: "60",
  });
  
  const [apiFormData, setApiFormData] = useState({
    url: "",
    api_key: "",
    ativo: false,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bancosRes, apiRes] = await Promise.all([
        supabase.from("financiamento_bancos").select("*").order("ordem"),
        supabase.from("financiamento_api_config").select("*").limit(1).single(),
      ]);

      if (bancosRes.error) throw bancosRes.error;
      setBancos(bancosRes.data || []);

      if (apiRes.data) {
        setApiConfig(apiRes.data);
        setApiFormData({
          url: apiRes.data.url || "",
          api_key: apiRes.data.api_key || "",
          ativo: apiRes.data.ativo,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanco = async () => {
    if (!formData.nome.trim() || !formData.taxa_mensal) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e taxa mensal.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const taxa = parseFloat(formData.taxa_mensal.replace(",", "."));
      const parcelas = parseInt(formData.max_parcelas);

      if (isNaN(taxa) || taxa <= 0 || taxa > 10) {
        throw new Error("Taxa inválida (deve ser entre 0.01 e 10%)");
      }

      if (editingBanco) {
        const { error } = await supabase
          .from("financiamento_bancos")
          .update({
            nome: formData.nome,
            taxa_mensal: taxa,
            max_parcelas: parcelas,
          })
          .eq("id", editingBanco.id);

        if (error) throw error;
        toast({ title: "Banco atualizado!" });
      } else {
        const maxOrdem = bancos.length > 0 ? Math.max(...bancos.map(b => b.ordem)) : 0;
        const { error } = await supabase
          .from("financiamento_bancos")
          .insert({
            nome: formData.nome,
            taxa_mensal: taxa,
            max_parcelas: parcelas,
            ordem: maxOrdem + 1,
          });

        if (error) throw error;
        toast({ title: "Banco cadastrado!" });
      }

      setIsDialogOpen(false);
      setEditingBanco(null);
      setFormData({ nome: "", taxa_mensal: "", max_parcelas: "60" });
      fetchData();
    } catch (error: any) {
      console.error("Erro ao salvar banco:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o banco.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAtivo = async (banco: Banco) => {
    try {
      const { error } = await supabase
        .from("financiamento_bancos")
        .update({ ativo: !banco.ativo })
        .eq("id", banco.id);

      if (error) throw error;
      
      setBancos(prev => 
        prev.map(b => b.id === banco.id ? { ...b, ativo: !b.ativo } : b)
      );
      
      toast({
        title: banco.ativo ? "Banco desativado" : "Banco ativado",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!bancoToDelete) return;

    try {
      const { error } = await supabase
        .from("financiamento_bancos")
        .delete()
        .eq("id", bancoToDelete.id);

      if (error) throw error;
      
      setBancos(prev => prev.filter(b => b.id !== bancoToDelete.id));
      toast({ title: "Banco excluído!" });
    } catch (error) {
      console.error("Erro ao excluir banco:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o banco.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteOpen(false);
      setBancoToDelete(null);
    }
  };

  const handleSaveApiConfig = async () => {
    if (!apiConfig) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("financiamento_api_config")
        .update({
          url: apiFormData.url || null,
          api_key: apiFormData.api_key || null,
          ativo: apiFormData.ativo,
        })
        .eq("id", apiConfig.id);

      if (error) throw error;
      
      toast({ title: "Configuração de API salva!" });
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar API config:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncBCB = async () => {
    setSyncing(true);
    try {
      // Chamar a edge function que sincroniza com o Banco Central
      const { data, error } = await supabase.functions.invoke('sync-taxas-bcb');

      if (error) throw error;

      if (data?.success) {
        toast({ 
          title: "Sincronização concluída!",
          description: `${data.resultados?.length || 0} bancos atualizados com taxas do Banco Central.`,
        });
        fetchData();
      } else {
        throw new Error(data?.error || "Erro na sincronização");
      }
    } catch (error: any) {
      console.error("Erro ao sincronizar:", error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível conectar à API do Banco Central.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncApi = async () => {
    if (!apiFormData.url) {
      // Se não tem URL customizada, usar API do Banco Central
      return handleSyncBCB();
    }

    setSyncing(true);
    try {
      // Chamar API customizada do usuário
      const response = await fetch(apiFormData.url, {
        headers: apiFormData.api_key ? { 'Authorization': `Bearer ${apiFormData.api_key}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      // Espera um array de { nome, taxa_mensal, max_parcelas }
      if (Array.isArray(data)) {
        for (const banco of data) {
          if (banco.nome && banco.taxa_mensal) {
            await supabase
              .from("financiamento_bancos")
              .update({ 
                taxa_mensal: banco.taxa_mensal,
                max_parcelas: banco.max_parcelas || 60,
              })
              .ilike("nome", `%${banco.nome}%`);
          }
        }
      }

      if (apiConfig) {
        await supabase
          .from("financiamento_api_config")
          .update({ ultima_sincronizacao: new Date().toISOString() })
          .eq("id", apiConfig.id);
      }

      toast({ 
        title: "Sincronização concluída!",
        description: "As taxas foram atualizadas com sucesso.",
      });
      fetchData();
    } catch (error: any) {
      console.error("Erro ao sincronizar:", error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível conectar à API.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const openEditDialog = (banco: Banco) => {
    setEditingBanco(banco);
    setFormData({
      nome: banco.nome,
      taxa_mensal: banco.taxa_mensal.toString(),
      max_parcelas: banco.max_parcelas.toString(),
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingBanco(null);
    setFormData({ nome: "", taxa_mensal: "", max_parcelas: "60" });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bancos Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-brand-blue">
                <Building2 className="w-5 h-5" />
                Bancos e Taxas
              </CardTitle>
              <CardDescription>
                Configure os bancos disponíveis no simulador de financiamento
              </CardDescription>
            </div>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Banco
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bancos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum banco cadastrado</p>
              <Button onClick={openNewDialog} variant="outline" className="mt-4">
                Cadastrar primeiro banco
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Taxa Mensal</TableHead>
                    <TableHead>Máx. Parcelas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bancos.map((banco) => (
                    <TableRow key={banco.id} className={!banco.ativo ? "opacity-50" : ""}>
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell className="font-medium">{banco.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                          <Percent className="w-3 h-3 mr-1" />
                          {banco.taxa_mensal.toFixed(2)}% a.m.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <CreditCard className="w-3 h-3 mr-1" />
                          {banco.max_parcelas}x
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={banco.ativo}
                            onCheckedChange={() => handleToggleAtivo(banco)}
                          />
                          <span className={`text-sm ${banco.ativo ? "text-green-600" : "text-muted-foreground"}`}>
                            {banco.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(banco)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setBancoToDelete(banco);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banco Central Integration */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <RefreshCw className="w-5 h-5" />
            API do Banco Central do Brasil
          </CardTitle>
          <CardDescription>
            Sincronize automaticamente com as taxas oficiais do Banco Central (gratuito e sem configuração)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium">Taxas de Juros - Dados Abertos BCB</p>
              <p className="text-sm text-muted-foreground">
                {apiConfig?.ultima_sincronizacao 
                  ? `Última sincronização: ${new Date(apiConfig.ultima_sincronizacao).toLocaleString('pt-BR')}`
                  : "Nunca sincronizado"
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Fonte: olinda.bcb.gov.br/olinda/servico/taxaJuros
              </p>
            </div>
            <Button
              onClick={handleSyncBCB}
              disabled={syncing}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sincronizar com BCB
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-blue">
            <Link2 className="w-5 h-5" />
            API Customizada (Opcional)
          </CardTitle>
          <CardDescription>
            Configure sua própria API para buscar taxas de parceiros ou sistemas internos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api_url">URL da API</Label>
              <Input
                id="api_url"
                value={apiFormData.url}
                onChange={(e) => setApiFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://api.exemplo.com/taxas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_key">Chave da API (opcional)</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="api_key"
                  type="password"
                  value={apiFormData.api_key}
                  onChange={(e) => setApiFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="sk-..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Sincronização com API customizada</p>
              <p className="text-sm text-muted-foreground">
                Configure a URL acima para usar sua própria fonte de dados
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSyncApi}
                disabled={syncing || !apiFormData.url}
                className="gap-2"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sincronizar
              </Button>
              <Button onClick={handleSaveApiConfig} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Formato esperado:</strong> A API deve retornar um array JSON com objetos contendo: 
              <code className="bg-muted px-1 rounded mx-1">nome</code>, 
              <code className="bg-muted px-1 rounded mx-1">taxa_mensal</code> e 
              <code className="bg-muted px-1 rounded mx-1">max_parcelas</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBanco ? "Editar Banco" : "Novo Banco"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Banco *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Santander Solar"
                maxLength={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxa_mensal">Taxa Mensal (%) *</Label>
                <Input
                  id="taxa_mensal"
                  value={formData.taxa_mensal}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxa_mensal: e.target.value }))}
                  placeholder="1.29"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_parcelas">Máx. Parcelas</Label>
                <Input
                  id="max_parcelas"
                  type="number"
                  value={formData.max_parcelas}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_parcelas: e.target.value }))}
                  min={6}
                  max={120}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBanco} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingBanco ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Banco</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {bancoToDelete?.nome}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
