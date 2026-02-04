import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Smartphone, Check, AlertTriangle } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface NotificationSettingsProps {
  vendedorNome: string;
}

export default function NotificationSettings({ vendedorNome }: NotificationSettingsProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribeToOrcamentos,
    subscribeToLeads,
    disableNotifications,
  } = usePushNotifications();

  const [notifyOrcamentos, setNotifyOrcamentos] = useState(true);
  const [notifyLeads, setNotifyLeads] = useState(true);

  // Subscribe to realtime when enabled
  useEffect(() => {
    if (!isSubscribed || !vendedorNome) return;

    const channels: ReturnType<typeof subscribeToOrcamentos>[] = [];

    if (notifyOrcamentos) {
      const channel = subscribeToOrcamentos(vendedorNome);
      if (channel) channels.push(channel);
    }

    if (notifyLeads) {
      const channel = subscribeToLeads(vendedorNome);
      if (channel) channels.push(channel);
    }

    return () => {
      channels.forEach((channel) => channel?.unsubscribe());
    };
  }, [isSubscribed, vendedorNome, notifyOrcamentos, notifyLeads, subscribeToOrcamentos, subscribeToLeads]);

  const handleEnableNotifications = async () => {
    const success = await requestPermission();
    if (success) {
      localStorage.setItem("notify_orcamentos", "true");
      localStorage.setItem("notify_leads", "true");
    }
  };

  const handleDisableNotifications = () => {
    disableNotifications();
    setNotifyOrcamentos(false);
    setNotifyLeads(false);
  };

  // Load preferences
  useEffect(() => {
    setNotifyOrcamentos(localStorage.getItem("notify_orcamentos") !== "false");
    setNotifyLeads(localStorage.getItem("notify_leads") !== "false");
  }, []);

  // Save preferences
  const handleToggleOrcamentos = (enabled: boolean) => {
    setNotifyOrcamentos(enabled);
    localStorage.setItem("notify_orcamentos", String(enabled));
  };

  const handleToggleLeads = (enabled: boolean) => {
    setNotifyLeads(enabled);
    localStorage.setItem("notify_leads", String(enabled));
  };

  if (!isSupported) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">Notificações não suportadas</p>
            <p className="text-sm text-yellow-700">
              Seu navegador não suporta notificações push. Tente usar Chrome ou Firefox.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (permission === "denied") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <BellOff className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Notificações bloqueadas</p>
            <p className="text-sm text-red-700">
              As notificações foram bloqueadas. Para ativá-las, vá nas configurações do seu navegador.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas instantâneos de novos leads e orçamentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubscribed ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Smartphone className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Ative as notificações</p>
                <p className="text-xs text-muted-foreground">
                  Seja notificado instantaneamente quando novos leads ou orçamentos chegarem, 
                  mesmo com o aplicativo fechado.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleEnableNotifications} 
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isLoading ? "Ativando..." : "Ativar Notificações"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-green-700">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Notificações ativadas</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-orcamentos" className="flex items-center gap-2 cursor-pointer">
                  <span>Novos orçamentos</span>
                </Label>
                <Switch
                  id="notify-orcamentos"
                  checked={notifyOrcamentos}
                  onCheckedChange={handleToggleOrcamentos}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notify-leads" className="flex items-center gap-2 cursor-pointer">
                  <span>Novos leads</span>
                </Label>
                <Switch
                  id="notify-leads"
                  checked={notifyLeads}
                  onCheckedChange={handleToggleLeads}
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDisableNotifications}
              className="w-full text-muted-foreground"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Desativar notificações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
