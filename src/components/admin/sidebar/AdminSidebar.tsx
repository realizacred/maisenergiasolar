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
  Trophy,
  Wallet,
  ClipboardCheck,
  TrendingUp,
  Settings,
  Coins,
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

// Seção Financeira (destaque)
const financeMenuItems = [
  { id: "recebimentos", title: "Recebimentos", icon: DollarSign },
  { id: "comissoes", title: "Comissões", icon: Wallet },
  { id: "clientes", title: "Clientes", icon: UserCheck },
];

// Seção de Vendas
const salesMenuItems = [
  { id: "leads", title: "Leads", icon: Users },
  { id: "pipeline", title: "Pipeline", icon: Kanban },
  { id: "followup", title: "Follow-up", icon: Bell },
  { id: "validacao", title: "Validar Vendas", icon: ClipboardCheck },
];

// Seção de Análises
const analyticsMenuItems = [
  { id: "dashboard", title: "Dashboard", icon: BarChart3 },
];

// Configurações
const configMenuItems = [
  { id: "vendedores", title: "Vendedores", icon: Users },
  { id: "usuarios", title: "Usuários", icon: Shield },
  { id: "gamificacao", title: "Gamificação", icon: Trophy },
  { id: "equipamentos", title: "Equipamentos", icon: Plug },
  { id: "concessionarias", title: "Concessionárias", icon: Lightbulb },
  { id: "config", title: "Calculadora", icon: Calculator },
  { id: "financiamento", title: "Bancos", icon: Building2 },
  { id: "instagram", title: "Instagram", icon: Instagram },
  { id: "webhooks", title: "Webhooks", icon: Webhook },
];

export function AdminSidebar({
  activeTab,
  onTabChange,
  userEmail,
  onSignOut,
}: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <Link
          to="/"
          className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80"
        >
          {collapsed ? (
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sun className="h-6 w-6 text-primary" />
            </div>
          ) : (
            <img
              src={logo}
              alt="Mais Energia Solar"
              className="h-9 w-auto"
            />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {/* Seção de Análises - Primeiro */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 px-3 py-2 flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3" />
            Análises
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsMenuItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                    className={`
                      transition-all duration-200 rounded-lg mx-2
                      ${activeTab === item.id 
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium shadow-xs" 
                        : "hover:bg-violet-500/5"
                      }
                    `}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção Financeira */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-3 py-2 flex items-center gap-1.5">
            <Coins className="h-3 w-3" />
            Financeiro
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeMenuItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                    className={`
                      transition-all duration-200 rounded-lg mx-2
                      ${activeTab === item.id 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium shadow-xs" 
                        : "hover:bg-emerald-500/5"
                      }
                    `}
                    style={{ animationDelay: `${(analyticsMenuItems.length + index) * 50}ms` }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção de Vendas */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-3 py-2 flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            Vendas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {salesMenuItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                    className={`
                      transition-all duration-200 rounded-lg mx-2
                      ${activeTab === item.id 
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium shadow-xs" 
                        : "hover:bg-blue-500/5"
                      }
                    `}
                    style={{ animationDelay: `${(analyticsMenuItems.length + financeMenuItems.length + index) * 50}ms` }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configurações */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-3 py-2 flex items-center gap-1.5">
            <Settings className="h-3 w-3" />
            Configurações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configMenuItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                    className={`
                      transition-all duration-200 rounded-lg mx-2
                      ${activeTab === item.id 
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium shadow-xs" 
                        : "hover:bg-amber-500/5"
                      }
                    `}
                    style={{ animationDelay: `${(analyticsMenuItems.length + financeMenuItems.length + salesMenuItems.length + index) * 50}ms` }}
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

      <SidebarFooter className="border-t border-border/50 p-4 space-y-3">
        {!collapsed && userEmail && (
          <div className="px-2 py-1.5 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        )}
        {!collapsed && <PortalSwitcher />}
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          onClick={onSignOut}
          className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}