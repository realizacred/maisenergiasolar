import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  UserPlus, 
  Search, 
  Loader2, 
  Shield, 
  Trash2, 
  Edit,
  Mail,
  Phone,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  profile: {
    nome: string;
    telefone: string | null;
    ativo: boolean;
  } | null;
  roles: AppRole[];
}

const ALL_ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: "admin", label: "Administrador", description: "Acesso total ao sistema" },
  { value: "gerente", label: "Gerente", description: "Gerencia equipe e visualiza tudo" },
  { value: "vendedor", label: "Vendedor", description: "Leads, clientes e propostas" },
  { value: "instalador", label: "Instalador", description: "Checklists de instalação" },
  { value: "financeiro", label: "Financeiro", description: "Contas a receber" },
];

export default function UsersManager() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nome: "",
    telefone: "",
    roles: [] as AppRole[],
  });
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();
  const { isAdmin } = useUserRoles();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Buscar perfis
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Buscar roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combinar dados
      const usersMap = new Map<string, UserWithRoles>();

      profiles?.forEach((profile) => {
        usersMap.set(profile.user_id, {
          id: profile.user_id,
          email: "", // Não temos acesso ao email via profiles
          created_at: profile.created_at,
          profile: {
            nome: profile.nome,
            telefone: profile.telefone,
            ativo: profile.ativo,
          },
          roles: [],
        });
      });

      rolesData?.forEach((role) => {
        const user = usersMap.get(role.user_id);
        if (user) {
          user.roles.push(role.role as AppRole);
        } else {
          usersMap.set(role.user_id, {
            id: role.user_id,
            email: "",
            created_at: role.created_at,
            profile: null,
            roles: [role.role as AppRole],
          });
        }
      });

      setUsers(Array.from(usersMap.values()));
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email, senha e nome.",
        variant: "destructive",
      });
      return;
    }

    if (formData.roles.length === 0) {
      toast({
        title: "Selecione ao menos uma role",
        description: "O usuário precisa ter pelo menos uma permissão.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Criar usuário via edge function ou diretamente
      // Por segurança, precisamos de uma edge function para criar usuários
      // Por enquanto, vamos apenas criar o perfil e roles para usuários existentes
      
      toast({
        title: "Em desenvolvimento",
        description: "A criação de usuários via admin será implementada em breve. Por enquanto, os usuários devem se cadastrar pela página de login.",
      });
      
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoles = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      // Remover roles antigas
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id);

      if (deleteError) throw deleteError;

      // Adicionar novas roles
      if (formData.roles.length > 0) {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert(
            formData.roles.map((role) => ({
              user_id: selectedUser.id,
              role,
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso.",
      });

      setIsEditOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Erro ao atualizar roles:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as permissões.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoles = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Permissões removidas. O usuário não terá mais acesso ao sistema.",
      });

      setIsDeleteOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Erro ao remover roles:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover as permissões.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      nome: "",
      telefone: "",
      roles: [],
    });
    setSelectedUser(null);
  };

  const openEditDialog = (user: UserWithRoles) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      nome: user.profile?.nome || "",
      telefone: user.profile?.telefone || "",
      roles: user.roles,
    });
    setIsEditOpen(true);
  };

  const toggleRole = (role: AppRole) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.profile?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roles.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      gerente: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      vendedor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      instalador: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      financeiro: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários e suas permissões no sistema
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo usuário ao sistema com as permissões adequadas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>Permissões *</Label>
                <div className="space-y-2">
                  {ALL_ROLES.map((role) => (
                    <div
                      key={role.value}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => toggleRole(role.value)}
                    >
                      <Checkbox
                        checked={formData.roles.includes(role.value)}
                        onCheckedChange={() => toggleRole(role.value)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{role.label}</p>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Usuários Cadastrados</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.profile?.nome || "Sem nome"}</p>
                          {user.profile?.telefone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.profile.telefone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length === 0 ? (
                            <Badge variant="outline" className="text-muted-foreground">
                              Sem permissões
                            </Badge>
                          ) : (
                            user.roles.map((role) => (
                              <Badge key={role} className={getRoleBadgeColor(role)}>
                                {role}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.profile?.ativo !== false ? (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <Check className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            <X className="w-3 h-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Roles Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Permissões</DialogTitle>
            <DialogDescription>
              Altere as permissões do usuário {selectedUser?.profile?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Permissões</Label>
              <div className="space-y-2">
                {ALL_ROLES.map((role) => (
                  <div
                    key={role.value}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => toggleRole(role.value)}
                  >
                    <Checkbox
                      checked={formData.roles.includes(role.value)}
                      onCheckedChange={() => toggleRole(role.value)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRoles} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover permissões?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá todas as permissões do usuário {selectedUser?.profile?.nome}.
              O usuário não terá mais acesso ao sistema até que novas permissões sejam atribuídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoles}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover Permissões
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
