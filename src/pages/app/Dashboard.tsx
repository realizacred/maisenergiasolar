import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FolderKanban, 
  ClipboardCheck, 
  DollarSign, 
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalLeads: number;
  leadsNovos: number;
  totalProjetos: number;
  projetosEmAndamento: number;
  checklistsPendentes: number;
  recebimentosPendentes: number;
  valorPendente: number;
}

export default function AppDashboard() {
  const { profile, roles, isAdmin, isGerente, isVendedor, isInstalador, isFinanceiro } = useUserRoles();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    leadsNovos: 0,
    totalProjetos: 0,
    projetosEmAndamento: 0,
    checklistsPendentes: 0,
    recebimentosPendentes: 0,
    valorPendente: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch leads count
        const { count: leadsCount } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true });

        const { count: leadsNovosCount } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("visto", false);

        // Fetch projetos count
        const { count: projetosCount } = await supabase
          .from("projetos")
          .select("*", { count: "exact", head: true });

        const { count: projetosAndamentoCount } = await supabase
          .from("projetos")
          .select("*", { count: "exact", head: true })
          .in("status", ["em_analise", "aprovado", "em_instalacao"]);

        // Fetch recebimentos pendentes
        const { data: recebimentosData } = await supabase
          .from("recebimentos")
          .select("valor_total")
          .eq("status", "pendente");

        const valorPendente = recebimentosData?.reduce((acc, r) => acc + Number(r.valor_total), 0) || 0;

        setStats({
          totalLeads: leadsCount || 0,
          leadsNovos: leadsNovosCount || 0,
          totalProjetos: projetosCount || 0,
          projetosEmAndamento: projetosAndamentoCount || 0,
          checklistsPendentes: 0, // TODO: buscar quando implementar
          recebimentosPendentes: recebimentosData?.length || 0,
          valorPendente,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrador",
      gerente: "Gerente",
      vendedor: "Vendedor",
      instalador: "Instalador",
      financeiro: "Financeiro",
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {getGreeting()}, {profile?.nome?.split(" ")[0] || "Usuário"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está um resumo do seu dia
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <Badge key={role} variant="secondary" className="text-sm">
              {getRoleLabel(role)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Cards - baseado nas permissões */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(isAdmin || isGerente || isVendedor) && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Leads
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                {stats.leadsNovos > 0 && (
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {stats.leadsNovos} não vistos
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {(isAdmin || isGerente || isVendedor || isInstalador) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Projetos
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjetos}</div>
              {stats.projetosEmAndamento > 0 && (
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {stats.projetosEmAndamento} em andamento
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {isInstalador && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Instalações Pendentes
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checklistsPendentes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando execução
              </p>
            </CardContent>
          </Card>
        )}

        {(isAdmin || isGerente || isFinanceiro) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                A Receber
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                }).format(stats.valorPendente)}
              </div>
              {stats.recebimentosPendentes > 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {stats.recebimentosPendentes} pendentes
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(isAdmin || isGerente || isVendedor) && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/app/leads"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Gerenciar Leads
              </CardTitle>
              <CardDescription>
                Visualize e gerencie os leads captados
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {(isAdmin || isGerente || isVendedor || isInstalador) && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/app/projetos"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-blue-600" />
                Ver Projetos
              </CardTitle>
              <CardDescription>
                Acompanhe o status dos projetos
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {isInstalador && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/app/checklist-instalador"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-green-600" />
                Minhas Instalações
              </CardTitle>
              <CardDescription>
                Acesse os checklists de instalação
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {(isAdmin || isGerente || isFinanceiro) && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/app/financeiro"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-600" />
                Financeiro
              </CardTitle>
              <CardDescription>
                Gerencie contas a receber
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Sem roles atribuídas */}
      {roles.length === 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
              Aguardando Aprovação
            </CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-300">
              Sua conta foi criada com sucesso, mas ainda não possui permissões atribuídas.
              Entre em contato com um administrador para liberar seu acesso.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
