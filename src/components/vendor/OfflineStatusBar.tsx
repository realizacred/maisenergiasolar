import { WifiOff, Wifi, Cloud, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOfflineLeadSync } from "@/hooks/useOfflineLeadSync";

export function OfflineStatusBar() {
  const { isOnline, pendingCount, isSyncing, retrySync } = useOfflineLeadSync();

  // Não mostrar se está online e sem pendentes
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div 
      className={`py-3 px-4 ${
        isOnline 
          ? "bg-primary/10 border-b border-primary/20" 
          : "bg-amber-50 border-b border-amber-200"
      }`}
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Status de Conexão */}
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Badge className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Wifi className="w-3.5 h-3.5" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 text-amber-700 border-amber-400 bg-amber-100">
              <WifiOff className="w-3.5 h-3.5" />
              Sem Internet
            </Badge>
          )}

          {pendingCount > 0 && (
            <span className={`text-sm font-medium ${isOnline ? "text-foreground" : "text-amber-700"}`}>
              <Cloud className="w-4 h-4 inline mr-1" />
              {pendingCount} lead{pendingCount > 1 ? 's' : ''} aguardando sincronização
            </span>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="text-xs text-amber-600">
              Os dados serão enviados automaticamente quando a conexão voltar
            </span>
          )}
          
          {isOnline && pendingCount > 0 && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => retrySync()}
              disabled={isSyncing}
              className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sincronizar Agora
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}