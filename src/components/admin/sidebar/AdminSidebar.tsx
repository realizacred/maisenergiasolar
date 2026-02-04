import { Link } from "react-router-dom";
import {
  Users,
  Kanban,
  Bell,
  UserCheck,
  DollarSign,
  BarChart3,
  Calculator,
  Building2,
  Webhook,
  LogOut,
  Sun,
  Instagram,
  Shield,
  Plug,
  Lightbulb,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PortalSwitcher } from "@/components/layout/PortalSwitcher";
import logo from "@/assets/logo.png";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail?: string;
  onSignOut: () => void;
}

const mainMenuItems = [
  { id: "leads", title: "Leads", icon: Users },
  { id: "pipeline", title: "Pipeline", icon: Kanban },
  { id: "followup", title: "Follow-up", icon: Bell },
  { id: "clientes", title: "Clientes", icon: UserCheck },
  { id: "recebimentos", title: "Recebimentos", icon: DollarSign },
  { id: "dashboard", title: "Dashboard", icon: BarChart3 },
];

const configMenuItems = [
  { id: "vendedores", title: "Vendedores", icon: Users },
  { id: "usuarios", title: "Usuários", icon: Shield },
  { id: "equipamentos", title: "Equipamentos", icon: Plug },
  { id: "concessionarias", title: "Concessionárias", icon: Lightbulb },
  { id: "config", title: "Calculadora", icon: Calculator },
  { id: "financiamento", title: "Bancos", icon: Building2 },
  { id: "instagram", title: "Instagram", icon: Instagram },
  { id: "webhooks", title: "Webhooks", icon: Webhook },
];

export function AdminSidebar({ activeTab, onTabChange, userEmail, onSignOut }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4">
        <Link to="/" className="flex items-center gap-3">
          {collapsed ? (
            <Sun className="h-8 w-8 text-primary" />
          ) : (
            <img src={logo} alt="Mais Energia Solar" className="h-10 w-auto" />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 space-y-3">
        {!collapsed && userEmail && (
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        )}
        {!collapsed && <PortalSwitcher />}
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          onClick={onSignOut}
          className="w-full gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
