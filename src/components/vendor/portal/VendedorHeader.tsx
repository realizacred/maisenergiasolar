 import { Button } from "@/components/ui/button";
 import { LogOut } from "lucide-react";
 import { PortalSwitcher } from "@/components/layout/PortalSwitcher";
 import logo from "@/assets/logo.png";
 
 interface VendedorHeaderProps {
   vendedorNome: string;
   isAdminMode: boolean;
   onSignOut: () => void;
 }
 
 export function VendedorHeader({ vendedorNome, isAdminMode, onSignOut }: VendedorHeaderProps) {
   return (
     <header className="bg-background border-b sticky top-0 z-50">
       <div className="container mx-auto px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-2 sm:gap-3 min-w-0">
           <img src={logo} alt="Logo" className="h-8 sm:h-10 shrink-0" />
           <div className="min-w-0">
             <h1 className="font-bold text-sm sm:text-lg truncate">
               Portal do Vendedor
               {isAdminMode && <span className="text-xs ml-1 sm:ml-2 text-primary">(Admin)</span>}
             </h1>
             <p className="text-xs sm:text-sm text-muted-foreground truncate">
               {isAdminMode ? "Todos os orçamentos" : vendedorNome}
             </p>
           </div>
         </div>
         <div className="flex items-center gap-1 sm:gap-2 shrink-0">
           <PortalSwitcher />
           <Button variant="outline" size="sm" onClick={onSignOut} className="gap-1 sm:gap-2">
             <LogOut className="h-4 w-4" />
             <span className="hidden sm:inline">Sair</span>
           </Button>
         </div>
       </div>
     </header>
   );
 }