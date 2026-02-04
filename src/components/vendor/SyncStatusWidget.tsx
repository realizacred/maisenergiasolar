import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudOff, RefreshCw, Check, AlertTriangle, Clock } from "lucide-react";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SyncStatusWidget() {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncErrors,
    manualSync,
    clearFailedItems,
  } = useBackgroundSync();

  const handleSync = () => {
    manualSync();
  };

  return (
    <Card className={!isOnline ? "border-yellow-200 bg-yellow-50/50" : undefined}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <CloudOff className="w-5 h-5 text-yellow-600" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {isOnline ? "Conectado" : "Offline"}
                </span>
                {pendingCount > 0 && (
                  <Badge variant={isOnline ? "secondary" : "destructive"} className="text-xs">
                    {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {pendingCount === 0 && isOnline && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    <Check className="w-3 h-3 mr-1" />
                    Sincronizado
                  </Badge>
                )}
              </div>
              {lastSyncTime && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Última sync: {formatDistanceToNow(lastSyncTime, { addSuffix: true, locale: ptBR })}
                </p>
              )}
            </div>
          </div>

          {isOnline && pendingCount > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Sincronizando..." : "Sincronizar"}
            </Button>
          )}
        </div>

        {/* Sync Errors */}
        {syncErrors.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-red-700">Erros de sincronização:</p>
                <ul className="text-xs text-red-600 mt-1 space-y-0.5">
                  {syncErrors.slice(0, 3).map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={clearFailedItems}
                  className="text-xs text-red-600 p-0 h-auto mt-1"
                >
                  Limpar itens com falha
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Offline Message */}
        {!isOnline && (
          <p className="text-xs text-yellow-700 mt-2">
            Você está offline. As alterações serão sincronizadas automaticamente quando a conexão for restaurada.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
