import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  UserPlus, 
  Trash2, 
  Loader2,
  Users,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "gerente" | "vendedor" | "instalador" | "financeiro";
  created_at: string;
}

interface UserProfile {
  user_id: string;
  nome: string;
  ativo: boolean;
}

interface UserWithRoles {
  user_id: string;
  nome: string;
  ativo: boolean;
  roles: string[];
}

const ROLE_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: "Administrador", color: "bg-red-100 text-red-800 border-red-200", icon: ShieldAlert },
  gerente: { label: "Gerente", color: "bg-purple-100 text-purple-800 border-purple-200", icon: ShieldCheck },
  vendedor: { label: "Vendedor", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Users },
  instalador: { label: "Instalador", color: "bg-green-100 text-green-800 border-green-200", icon: Users },
  financeiro: { label: "Financeiro", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Users },
};

export function UsuariosManager() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, nome, ativo")
        .order("nome");

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
        ...profile,
        roles: (roles || [])
          .filter(r => r.user_id === profile.user_id)
          .map(r => r.role),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!selectedUser || !selectedRole) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: selectedUser.user_id,
          role: selectedRole as any,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Perfil já existe",
            description: "Este usuário já possui este perfil.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({ title: "Perfil adicionado com sucesso!" });
      setIsDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
      fetchUsers();
    } catch (error) {
      console.error("Error adding role:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o perfil.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as "admin" | "gerente" | "vendedor" | "instalador" | "financeiro");

      if (error) throw error;

      toast({ title: "Perfil removido!" });
      fetchUsers();
    } catch (error) {
      console.error("Error removing role:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o perfil.",
        variant: "destructive",
      });
    }
  };

  const openAddRoleDialog = (user: UserWithRoles) => {
    setSelectedUser(user);
    setSelectedRole("");
    setIsDialogOpen(true);
  };

  // Get available roles for user (ones they don't have yet)
  const getAvailableRoles = (user: UserWithRoles) => {
    return Object.keys(ROLE_LABELS).filter(role => !user.roles.includes(role));
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-blue">
            <Shield className="w-5 h-5" />
            Gestão de Usuários e Perfis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Perfis</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={user.ativo 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-gray-50 text-gray-500 border-gray-200"
                          }
                        >
                          {user.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles.length === 0 ? (
                            <span className="text-sm text-muted-foreground">Sem perfil</span>
                          ) : (
                            user.roles.map((role) => {
                              const roleInfo = ROLE_LABELS[role];
                              return (
                                <Badge 
                                  key={role} 
                                  variant="outline"
                                  className={`${roleInfo?.color || ""} gap-1`}
                                >
                                  {roleInfo?.label || role}
                                  <button
                                    onClick={() => handleRemoveRole(user.user_id, role)}
                                    className="ml-1 hover:text-destructive"
                                    title="Remover perfil"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </Badge>
                              );
                            })
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {getAvailableRoles(user).length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAddRoleDialog(user)}
                            className="gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            Adicionar Perfil
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Perfil</DialogTitle>
            <DialogDescription>
              Selecione um perfil para adicionar ao usuário {selectedUser?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                {selectedUser && getAvailableRoles(selectedUser).map((role) => {
                  const roleInfo = ROLE_LABELS[role];
                  return (
                    <SelectItem key={role} value={role}>
                      <span className="flex items-center gap-2">
                        {roleInfo?.label || role}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRole} disabled={!selectedRole || saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
