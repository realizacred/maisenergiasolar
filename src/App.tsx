import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RolesProvider } from "@/hooks/useUserRoles";

// Páginas públicas
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Calculadora from "./pages/Calculadora";
import Checklist from "./pages/Checklist";
import NotFound from "./pages/NotFound";

// Páginas do App (autenticadas)
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppDashboard from "./pages/app/Dashboard";
import Unauthorized from "./pages/app/Unauthorized";
import PendingApproval from "./pages/app/PendingApproval";
import UsersManager from "./pages/app/admin/UsersManager";

// Páginas legadas (serão migradas gradualmente)
// Admin legado removido - agora usa /app com RBAC

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RolesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/calculadora" element={<Calculadora />} />
              <Route path="/checklist" element={<Checklist />} />
              
              {/* Página de aprovação pendente */}
              <Route path="/app/pending" element={<PendingApproval />} />
              
              {/* Rotas do App (autenticadas com layout) */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AppDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/app/unauthorized"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Unauthorized />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Leads - Admin, Gerente, Vendedor */}
              <Route
                path="/app/leads"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
                    <AppLayout>
                      <LeadsPageWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Pipeline - Admin, Gerente, Vendedor */}
              <Route
                path="/app/pipeline"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
                    <AppLayout>
                      <PipelinePageWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Follow-up - Admin, Gerente, Vendedor */}
              <Route
                path="/app/followup"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
                    <AppLayout>
                      <FollowUpPageWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Clientes - Todos exceto público */}
              <Route
                path="/app/clientes"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor', 'instalador', 'financeiro']}>
                    <AppLayout>
                      <ClientesPageWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Projetos - Todos exceto público */}
              <Route
                path="/app/projetos"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor', 'instalador', 'financeiro']}>
                    <AppLayout>
                      <ProjetosPageWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Checklist Cliente - Admin, Gerente, Vendedor */}
              <Route
                path="/app/checklist-cliente"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
                    <AppLayout>
                      <ChecklistClientePageWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Checklist Instalador - Admin, Gerente, Instalador */}
              <Route
                path="/app/checklist-instalador"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'gerente', 'instalador']}>
                    <AppLayout>
                      <ChecklistInstaladorPageWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Financeiro - Admin, Gerente, Financeiro */}
              <Route
                path="/app/financeiro"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'gerente', 'financeiro']}>
                    <AppLayout>
                      <FinanceiroPageWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Admin - Apenas Admin */}
              <Route
                path="/app/admin/usuarios"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AppLayout>
                      <UsersManager />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/app/admin/calculadora"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AppLayout>
                      <CalculadoraConfigWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/app/admin/bancos"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AppLayout>
                      <BancosConfigWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/app/admin/webhooks"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AppLayout>
                      <WebhooksConfigWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/app/admin/config"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AppLayout>
                      <ConfigPageWrapper />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Rota legada do admin - redireciona para o novo dashboard */}
              <Route path="/admin" element={<Navigate to="/app" replace />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RolesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Wrappers temporários até as páginas serem totalmente migradas
import LeadsPipeline from "@/components/admin/LeadsPipeline";
import FollowUpManager from "@/components/admin/FollowUpManager";
import { ClientesManager } from "@/components/admin/ClientesManager";
import { RecebimentosManager } from "@/components/admin/RecebimentosManager";
import CalculadoraConfig from "@/components/admin/CalculadoraConfig";
import FinanciamentoConfig from "@/components/admin/FinanciamentoConfig";
import WebhookManager from "@/components/admin/WebhookManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LeadsPageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestão de Leads</h1>
      <Card>
        <CardHeader>
          <CardTitle>Leads Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de leads em desenvolvimento. Use a aba Pipeline por enquanto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PipelinePageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
      <LeadsPipeline />
    </div>
  );
}

function FollowUpPageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Follow-up</h1>
      <FollowUpManager />
    </div>
  );
}

function ClientesPageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
      <ClientesManager />
    </div>
  );
}

function ProjetosPageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projetos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Projetos em Andamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de projetos em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ChecklistClientePageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Checklist do Cliente</h1>
      <Card>
        <CardHeader>
          <CardTitle>Avaliações Pré-Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de checklist do cliente em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ChecklistInstaladorPageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Checklist do Instalador</h1>
      <Card>
        <CardHeader>
          <CardTitle>Instalações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use a rota /checklist para acessar o checklist de instalação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FinanceiroPageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financeiro</h1>
      <RecebimentosManager />
    </div>
  );
}

function CalculadoraConfigWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuração da Calculadora</h1>
      <CalculadoraConfig />
    </div>
  );
}

function BancosConfigWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuração de Bancos</h1>
      <FinanciamentoConfig />
    </div>
  );
}

function WebhooksConfigWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Webhooks</h1>
      <WebhookManager />
    </div>
  );
}

function ConfigPageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações Gerais</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de configurações em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
