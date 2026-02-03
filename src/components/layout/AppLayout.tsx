import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Kanban,
  UserCheck,
  FolderKanban,
  ClipboardCheck,
  Wrench,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Building2,
  Calculator,
  Webhook,
  Bell,
} from "lucide-react";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles?: string[];
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { 
    profile, 
    roles,
    canAccessLeads,
    canAccessClientes,
    canAccessProjetos,
    canAccessChecklistCliente,
    canAccessChecklistInstalador,
    canAccessFinanceiro,
    canAccessAdmin,
  } = useUserRoles();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Menu items baseado em permissões
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/app",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    ...(canAccessLeads ? [
      {
        label: "Leads",
        href: "/app/leads",
        icon: <Users className="w-5 h-5" />,
      },
      {
        label: "Pipeline",
        href: "/app/pipeline",
        icon: <Kanban className="w-5 h-5" />,
      },
      {
        label: "Follow-up",
        href: "/app/followup",
        icon: <Bell className="w-5 h-5" />,
      },
    ] : []),
    ...(canAccessClientes ? [
      {
        label: "Clientes",
        href: "/app/clientes",
        icon: <UserCheck className="w-5 h-5" />,
      },
    ] : []),
    ...(canAccessProjetos ? [
      {
        label: "Projetos",
        href: "/app/projetos",
        icon: <FolderKanban className="w-5 h-5" />,
      },
    ] : []),
    ...(canAccessChecklistCliente ? [
      {
        label: "Checklist Cliente",
        href: "/app/checklist-cliente",
        icon: <ClipboardCheck className="w-5 h-5" />,
      },
    ] : []),
    ...(canAccessChecklistInstalador ? [
      {
        label: "Checklist Instalador",
        href: "/app/checklist-instalador",
        icon: <Wrench className="w-5 h-5" />,
      },
    ] : []),
    ...(canAccessFinanceiro ? [
      {
        label: "Financeiro",
        href: "/app/financeiro",
        icon: <DollarSign className="w-5 h-5" />,
      },
    ] : []),
    ...(canAccessAdmin ? [
      {
        label: "Usuários",
        href: "/app/admin/usuarios",
        icon: <Users className="w-5 h-5" />,
      },
      {
        label: "Calculadora",
        href: "/app/admin/calculadora",
        icon: <Calculator className="w-5 h-5" />,
      },
      {
        label: "Bancos",
        href: "/app/admin/bancos",
        icon: <Building2 className="w-5 h-5" />,
      },
      {
        label: "Webhooks",
        href: "/app/admin/webhooks",
        icon: <Webhook className="w-5 h-5" />,
      },
      {
        label: "Configurações",
        href: "/app/admin/config",
        icon: <Settings className="w-5 h-5" />,
      },
    ] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(href);
  };

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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Mais Energia Solar" className="h-10 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {profile?.nome?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.nome || user?.email}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {roles.slice(0, 2).map((role) => (
                <Badge key={role} variant="secondary" className={cn("text-xs px-1.5 py-0", getRoleBadgeColor(role))}>
                  {role}
                </Badge>
              ))}
              {roles.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  +{roles.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Page title - pode ser dinâmico */}
            <div className="hidden lg:block" />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {profile?.nome?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block max-w-32 truncate">
                    {profile?.nome || user?.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.nome || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/perfil")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
