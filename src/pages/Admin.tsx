import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLeads } from "@/hooks/useLeads";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar/AdminSidebar";
import { StatsCards } from "@/components/admin/stats/StatsCards";
import { LeadsView } from "@/components/admin/views/LeadsView";
import LeadsPipeline from "@/components/admin/LeadsPipeline";
import FollowUpManager from "@/components/admin/FollowUpManager";
import DashboardCharts from "@/components/admin/DashboardCharts";
import VendedoresManager from "@/components/admin/VendedoresManager";
import CalculadoraConfig from "@/components/admin/CalculadoraConfig";
import FinanciamentoConfig from "@/components/admin/FinanciamentoConfig";
import WebhookManager from "@/components/admin/WebhookManager";
import { ClientesManager } from "@/components/admin/ClientesManager";
import { RecebimentosManager } from "@/components/admin/RecebimentosManager";
import { InstagramConfig } from "@/components/admin/InstagramConfig";
import { UsuariosManager } from "@/components/admin/UsuariosManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("leads");
  const { user, signOut, loading: authLoading } = useAuth();
  const { leads, loading, stats, fetchLeads } = useLeads();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "leads") {
      fetchLeads();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "leads":
        return <LeadsView />;
      case "pipeline":
        return <LeadsPipeline />;
      case "followup":
        return <FollowUpManager diasAlerta={3} />;
      case "clientes":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientesManager />
            </CardContent>
          </Card>
        );
      case "recebimentos":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Controle de Recebimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <RecebimentosManager />
            </CardContent>
          </Card>
        );
      case "dashboard":
        return <DashboardCharts leads={leads} />;
      case "vendedores":
        return <VendedoresManager leads={leads} />;
      case "usuarios":
        return <UsuariosManager />;
      case "config":
        return <CalculadoraConfig />;
      case "financiamento":
        return <FinanciamentoConfig />;
      case "instagram":
        return <InstagramConfig />;
      case "webhooks":
        return <WebhookManager />;
      default:
        return <LeadsView />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userEmail={user?.email}
          onSignOut={handleSignOut}
        />
        
        <SidebarInset className="flex-1">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger className="-ml-2">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold capitalize">{activeTab}</h1>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <StatsCards
              totalLeads={stats.total}
              totalKwh={stats.totalKwh}
              uniqueEstados={stats.uniqueEstados}
            />
            {renderContent()}
          </main>

          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
