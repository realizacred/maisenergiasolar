import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Code, Copy, Check, Loader2, Download } from "lucide-react";

interface TableSQLDialogProps {
  tableName: string;
  tableLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TableSQLDialog({ tableName, tableLabel, open, onOpenChange }: TableSQLDialogProps) {
  const [sql, setSql] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDDL = async () => {
    if (sql) return; // Already loaded
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_table_ddl", { _table_name: tableName });
      if (error) throw error;
      setSql(data as string);
    } catch (error: any) {
      console.error("DDL fetch error:", error);
      setSql(`-- Erro ao obter DDL: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) fetchDDL();
    else {
      setSql(null);
      setCopied(false);
    }
    onOpenChange(isOpen);
  };

  const handleCopy = async () => {
    if (!sql) return;
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    toast({ title: "SQL copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!sql) return;
    const blob = new Blob([sql], { type: "text/sql;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tableName}.sql`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            SQL — {tableLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!sql || loading} className="gap-2">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado!" : "Copiar SQL"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!sql || loading} className="gap-2">
            <Download className="h-4 w-4" />
            Baixar .sql
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[400px] rounded-lg border bg-muted/30">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words text-foreground">
              {sql || "Carregando..."}
            </pre>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
