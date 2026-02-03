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

// Layout e proteção de rotas
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Páginas do App (autenticadas)
import Dashboard from "./pages/app/Dashboard";
import Unauthorized from "./pages/app/Unauthorized";
import PendingApproval from "./pages/app/PendingApproval";
import LeadsPage from "./pages/app/Leads";
import PipelinePage from "./pages/app/Pipeline";
import FollowUpPage from "./pages/app/FollowUp";
import ClientesPage from "./pages/app/Clientes";
import ProjetosPage from "./pages/app/Projetos";
import ChecklistClientePage from "./pages/app/ChecklistCliente";
import ChecklistInstaladorPage from "./pages/app/ChecklistInstalador";
import FinanceiroPage from "./pages/app/Financeiro";

// Páginas Admin
import UsersManager from "./pages/app/admin/UsersManager";
import CalculadoraConfigPage from "./pages/app/admin/CalculadoraConfigPage";
import BancosConfigPage from "./pages/app/admin/BancosConfigPage";
import WebhooksPage from "./pages/app/admin/WebhooksPage";
import ConfigPage from "./pages/app/admin/ConfigPage";

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
              
              {/* Dashboard */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <AppLayout><Dashboard /></AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Unauthorized */}
              <Route path="/app/unauthorized" element={
                <ProtectedRoute>
                  <AppLayout><Unauthorized /></AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Vendas - Admin, Gerente, Vendedor */}
              <Route path="/app/leads" element={
                <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
                  <AppLayout><LeadsPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/pipeline" element={
                <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
                  <AppLayout><PipelinePage /></AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/followup" element={
                <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
                  <AppLayout><FollowUpPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Clientes e Projetos - Todos os cargos internos */}
              <Route path="/app/clientes" element={
                <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor', 'instalador', 'financeiro']}>
                  <AppLayout><ClientesPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/projetos" element={
                <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor', 'instalador', 'financeiro']}>
                  <AppLayout><ProjetosPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Checklists */}
              <Route path="/app/checklist-cliente" element={
                <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
                  <AppLayout><ChecklistClientePage /></AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/checklist-instalador" element={
                <ProtectedRoute requiredRoles={['admin', 'gerente', 'instalador']}>
                  <AppLayout><ChecklistInstaladorPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Financeiro */}
              <Route path="/app/financeiro" element={
                <ProtectedRoute requiredRoles={['admin', 'gerente', 'financeiro']}>
                  <AppLayout><FinanceiroPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Administração - Apenas Admin */}
              <Route path="/app/admin/usuarios" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AppLayout><UsersManager /></AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/admin/calculadora" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AppLayout><CalculadoraConfigPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/admin/bancos" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AppLayout><BancosConfigPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/admin/webhooks" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AppLayout><WebhooksPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/admin/config" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AppLayout><ConfigPage /></AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Redirect legado */}
              <Route path="/admin" element={<Navigate to="/app" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RolesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
