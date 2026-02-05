 import { useState, useMemo, useEffect } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Switch } from "@/components/ui/switch";
 import { 
   Bell, 
   BellOff, 
   Clock, 
   MessageCircle,
   Zap,
   TrendingDown,
   Calendar,
   CheckCircle2
 } from "lucide-react";
 import { differenceInDays, differenceInHours, parseISO, format } from "date-fns";
 import type { Lead } from "@/types/lead";
 import { toast } from "@/hooks/use-toast";
 
 interface SmartRemindersProps {
   leads: Lead[];
   vendedorNome: string;
   onContactLead?: (lead: Lead) => void;
 }
 
 interface Reminder {
   id: string;
   type: "urgent" | "scheduled" | "opportunity" | "stale";
   lead: Lead;
   message: string;
   priority: number;
   icon: typeof Bell;
 }
 
 export function SmartReminders({ leads, vendedorNome, onContactLead }: SmartRemindersProps) {
   const STORAGE_KEY = `smart_reminders_settings_${vendedorNome.toLowerCase().replace(/\s/g, "_")}`;
   
   const [settings, setSettings] = useState(() => {
     const saved = localStorage.getItem(STORAGE_KEY);
     return saved ? JSON.parse(saved) : {
       enabled: true,
       urgentDays: 5,
       staleDays: 7,
       showOpportunities: true,
     };
   });
 
   const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(() => {
     const saved = localStorage.getItem(`${STORAGE_KEY}_dismissed`);
     return saved ? new Set(JSON.parse(saved)) : new Set();
   });
 
   useEffect(() => {
     localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
   }, [settings, STORAGE_KEY]);
 
   useEffect(() => {
     localStorage.setItem(`${STORAGE_KEY}_dismissed`, JSON.stringify([...dismissedReminders]));
   }, [dismissedReminders, STORAGE_KEY]);
 
   const reminders = useMemo(() => {
     if (!settings.enabled) return [];
     
     const now = new Date();
     const result: Reminder[] = [];
 
     leads.forEach((lead) => {
       const lastContact = lead.ultimo_contato 
         ? parseISO(lead.ultimo_contato) 
         : parseISO(lead.created_at);
       const daysSinceContact = differenceInDays(now, lastContact);
       
       // Urgent: hasn't been contacted in a while
       if (daysSinceContact >= settings.urgentDays * 2) {
         result.push({
           id: `urgent-${lead.id}`,
           type: "urgent",
           lead,
           message: `${daysSinceContact} dias sem contato! Cliente pode estar perdendo interesse.`,
           priority: 1,
           icon: Zap,
         });
       }
       
       // Scheduled: has a follow-up date today or overdue
       if (lead.data_proxima_acao) {
         const scheduledDate = parseISO(lead.data_proxima_acao);
         const daysUntil = differenceInDays(scheduledDate, now);
         
         if (daysUntil <= 0) {
           result.push({
             id: `scheduled-${lead.id}`,
             type: "scheduled",
             lead,
             message: daysUntil === 0 
               ? `Ação agendada para hoje: ${lead.proxima_acao || "Follow-up"}`
               : `Ação atrasada (${Math.abs(daysUntil)} dias): ${lead.proxima_acao || "Follow-up"}`,
             priority: daysUntil < 0 ? 0 : 2,
             icon: Calendar,
           });
         }
       }
       
       // Opportunity: new lead not yet contacted
       if (settings.showOpportunities && !lead.visto && !lead.ultimo_contato) {
         const hoursOld = differenceInHours(now, parseISO(lead.created_at));
         if (hoursOld >= 2 && hoursOld <= 48) {
           result.push({
             id: `opportunity-${lead.id}`,
             type: "opportunity",
             lead,
             message: `Lead novo há ${hoursOld}h! Contate rápido para aumentar conversão.`,
             priority: 3,
             icon: TrendingDown,
           });
         }
       }
       
       // Stale: no activity for too long
       if (daysSinceContact >= settings.staleDays && daysSinceContact < settings.urgentDays * 2) {
         result.push({
           id: `stale-${lead.id}`,
           type: "stale",
           lead,
           message: `${daysSinceContact} dias sem atualização. Considere fazer um follow-up.`,
           priority: 4,
           icon: Clock,
         });
       }
     });
 
     // Filter dismissed and sort by priority
     return result
       .filter((r) => !dismissedReminders.has(r.id))
       .sort((a, b) => a.priority - b.priority);
   }, [leads, settings, dismissedReminders]);
 
   const dismissReminder = (id: string) => {
     setDismissedReminders((prev) => new Set([...prev, id]));
     toast({ title: "Lembrete dispensado" });
   };
 
   const clearDismissed = () => {
     setDismissedReminders(new Set());
     toast({ title: "Lembretes restaurados" });
   };
 
   const openWhatsApp = (lead: Lead) => {
     const message = encodeURIComponent(`Olá ${lead.nome}! Tudo bem?`);
     const phone = lead.telefone.replace(/\D/g, "");
     const formattedPhone = phone.startsWith("55") ? phone : `55${phone}`;
     window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
   };
 
   const getTypeStyles = (type: Reminder["type"]) => {
     switch (type) {
       case "urgent":
         return "bg-destructive/10 border-destructive/30 text-destructive";
       case "scheduled":
         return "bg-primary/10 border-primary/30 text-primary";
       case "opportunity":
         return "bg-green-100 border-green-300 text-green-700";
       case "stale":
         return "bg-yellow-100 border-yellow-300 text-yellow-700";
     }
   };
 
   const getTypeBadge = (type: Reminder["type"]) => {
     switch (type) {
       case "urgent": return "Urgente";
       case "scheduled": return "Agendado";
       case "opportunity": return "Oportunidade";
       case "stale": return "Inativo";
     }
   };
 
   return (
     <Card>
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Bell className="h-5 w-5 text-primary" />
             <CardTitle className="text-base">Lembretes Inteligentes</CardTitle>
             {reminders.length > 0 && (
               <Badge variant="destructive" className="ml-2">
                 {reminders.length}
               </Badge>
             )}
           </div>
           <div className="flex items-center gap-2">
             <Switch
               checked={settings.enabled}
               onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
             />
           </div>
         </div>
         <CardDescription>
           Alertas automáticos baseados na atividade dos seus leads
         </CardDescription>
       </CardHeader>
       <CardContent>
         {!settings.enabled ? (
           <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
             <BellOff className="h-12 w-12 opacity-20 mb-2" />
             <p className="text-sm">Lembretes desativados</p>
             <Button 
               size="sm" 
               variant="link"
               onClick={() => setSettings({ ...settings, enabled: true })}
             >
               Ativar lembretes
             </Button>
           </div>
         ) : reminders.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
             <CheckCircle2 className="h-12 w-12 text-green-500 opacity-50 mb-2" />
             <p className="text-sm font-medium text-green-600">Tudo em dia! 🎉</p>
             <p className="text-xs mt-1">Nenhum lembrete pendente no momento</p>
             {dismissedReminders.size > 0 && (
               <Button 
                 size="sm" 
                 variant="link"
                 onClick={clearDismissed}
                 className="mt-2"
               >
                 Restaurar {dismissedReminders.size} dispensados
               </Button>
             )}
           </div>
         ) : (
           <div className="space-y-3 max-h-[400px] overflow-y-auto">
             {reminders.map((reminder) => {
               const Icon = reminder.icon;
               return (
                 <div
                   key={reminder.id}
                   className={`p-3 rounded-lg border ${getTypeStyles(reminder.type)}`}
                 >
                   <div className="flex items-start gap-3">
                     <div className="shrink-0 mt-0.5">
                       <Icon className="h-5 w-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                         <Badge variant="outline" className="text-xs">
                           {getTypeBadge(reminder.type)}
                         </Badge>
                         <span className="text-sm font-medium truncate">
                           {reminder.lead.nome}
                         </span>
                       </div>
                       <p className="text-xs opacity-80">{reminder.message}</p>
                       <p className="text-xs opacity-60 mt-1">
                         {reminder.lead.cidade}, {reminder.lead.estado}
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center justify-end gap-2 mt-3">
                     <Button
                       size="sm"
                       variant="ghost"
                       className="h-8 text-xs"
                       onClick={() => dismissReminder(reminder.id)}
                     >
                       Dispensar
                     </Button>
                     <Button
                       size="sm"
                       className="h-8 gap-1 text-xs bg-green-600 hover:bg-green-700"
                       onClick={() => openWhatsApp(reminder.lead)}
                     >
                       <MessageCircle className="h-3 w-3" />
                       WhatsApp
                     </Button>
                   </div>
                 </div>
               );
             })}
             
             {dismissedReminders.size > 0 && (
               <Button 
                 size="sm" 
                 variant="link"
                 onClick={clearDismissed}
                 className="w-full"
               >
                 Restaurar {dismissedReminders.size} lembretes dispensados
               </Button>
             )}
           </div>
         )}
       </CardContent>
     </Card>
   );
 }