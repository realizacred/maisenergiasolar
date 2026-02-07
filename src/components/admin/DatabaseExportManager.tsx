import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Database,
  CheckSquare,
  Square,
  Code,
} from "lucide-react";
import { format } from "date-fns";
import { TableSQLDialog } from "./TableSQLDialog";

const ALL_TABLES = [
  { name: "audit_logs", label: "Audit Logs", category: "Sistema" },
  { name: "calculadora_config", label: "Calculadora Config", category: "Configurações" },
  { name: "checklist_cliente_arquivos", label: "Checklist Cliente Arquivos", category: "Checklists" },
  { name: "checklist_cliente_respostas", label: "Checklist Cliente Respostas", category: "Checklists" },
  { name: "checklist_instalador_arquivos", label: "Checklist Instalador Arquivos", category: "Checklists" },
  { name: "checklist_instalador_respostas", label: "Checklist Instalador Respostas", category: "Checklists" },
  { name: "checklist_template_items", label: "Checklist Template Items", category: "Checklists" },
  { name: "checklist_templates", label: "Checklist Templates", category: "Checklists" },
  { name: "checklists_cliente", label: "Checklists Cliente", category: "Checklists" },
  { name: "checklists_instalacao", label: "Checklists Instalação", category: "Checklists" },
  { name: "checklists_instalador", label: "Checklists Instalador", category: "Checklists" },
  { name: "clientes", label: "Clientes", category: "Financeiro" },
  { name: "comissoes", label: "Comissões", category: "Financeiro" },
  { name: "concessionarias", label: "Concessionárias", category: "Configurações" },
  { name: "disjuntores", label: "Disjuntores", category: "Configurações" },
  { name: "financiamento_api_config", label: "Financiamento API Config", category: "Configurações" },
  { name: "financiamento_bancos", label: "Financiamento Bancos", category: "Configurações" },
  { name: "gamification_config", label: "Gamificação Config", category: "Configurações" },
  { name: "instagram_config", label: "Instagram Config", category: "APIs" },
  { name: "instagram_posts", label: "Instagram Posts", category: "APIs" },
  { name: "instalador_config", label: "Instalador Config", category: "Configurações" },
  { name: "instalador_metas", label: "Instalador Metas", category: "Operações" },
  { name: "instalador_performance_mensal", label: "Instalador Performance Mensal", category: "Operações" },
  { name: "layouts_solares", label: "Layouts Solares", category: "Operações" },
  { name: "lead_atividades", label: "Lead Atividades", category: "Vendas" },
  { name: "lead_status", label: "Lead Status", category: "Vendas" },
  { name: "leads", label: "Leads", category: "Vendas" },
  { name: "meta_notifications", label: "Meta Notifications", category: "Vendas" },
  { name: "orcamentos", label: "Orçamentos", category: "Vendas" },
  { name: "pagamentos", label: "Pagamentos", category: "Financeiro" },
  { name: "pagamentos_comissao", label: "Pagamentos Comissão", category: "Financeiro" },
  { name: "parcelas", label: "Parcelas", category: "Financeiro" },
  { name: "profiles", label: "Profiles", category: "Sistema" },
  { name: "projetos", label: "Projetos", category: "Operações" },
  { name: "recebimentos", label: "Recebimentos", category: "Financeiro" },
  { name: "servicos_agendados", label: "Serviços Agendados", category: "Operações" },
  { name: "simulacoes", label: "Simulações", category: "Vendas" },
  { name: "transformadores", label: "Transformadores", category: "Configurações" },
  { name: "user_roles", label: "User Roles", category: "Sistema" },
  { name: "vendedor_achievements", label: "Vendedor Achievements", category: "Vendas" },
  { name: "vendedor_metas", label: "Vendedor Metas", category: "Vendas" },
  { name: "vendedor_metricas", label: "Vendedor Métricas", category: "Vendas" },
  { name: "vendedor_performance_mensal", label: "Vendedor Performance Mensal", category: "Vendas" },
  { name: "vendedores", label: "Vendedores", category: "Vendas" },
  { name: "webhook_config", label: "Webhook Config", category: "APIs" },
  { name: "whatsapp_automation_config", label: "WhatsApp Automation Config", category: "APIs" },
  { name: "whatsapp_automation_logs", label: "WhatsApp Automation Logs", category: "APIs" },
  { name: "whatsapp_automation_templates", label: "WhatsApp Automation Templates", category: "APIs" },
  { name: "whatsapp_messages", label: "WhatsApp Messages", category: "APIs" },
  { name: "whatsapp_reminders", label: "WhatsApp Reminders", category: "APIs" },
] as const;

type TableName = typeof ALL_TABLES[number]["name"];

const CATEGORY_COLORS: Record<string, string> = {
  Sistema: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Configurações: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  Checklists: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Financeiro: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  Vendas: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Operações: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  APIs: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
};

function arrayToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      const str = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(";")
  );
  return [headers.join(";"), ...rows].join("\n");
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function DatabaseExportManager() {
  const [selected, setSelected] = useState<Set<TableName>>(new Set());
  const [exporting, setExporting] = useState<TableName | "all" | null>(null);
  const [sqlDialog, setSqlDialog] = useState<{ name: TableName; label: string } | null>(null);
  const [exportingAllSql, setExportingAllSql] = useState(false);

  const categories = Array.from(new Set(ALL_TABLES.map((t) => t.category)));

  const toggleTable = (name: TableName) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === ALL_TABLES.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ALL_TABLES.map((t) => t.name)));
    }
  };

  const selectCategory = (category: string) => {
    const tablesInCat = ALL_TABLES.filter((t) => t.category === category).map((t) => t.name);
    const allSelected = tablesInCat.every((t) => selected.has(t));
    setSelected((prev) => {
      const next = new Set(prev);
      tablesInCat.forEach((t) => {
        if (allSelected) next.delete(t);
        else next.add(t);
      });
      return next;
    });
  };

  const fetchTableData = async (tableName: string): Promise<Record<string, unknown>[]> => {
    // Fetch all rows (paginated in chunks of 1000)
    const allRows: Record<string, unknown>[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await (supabase.from(tableName as any).select("*").range(from, from + pageSize - 1) as any);
      if (error) throw error;
      if (data && data.length > 0) {
        allRows.push(...data);
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    return allRows;
  };

  const exportSingleTable = async (tableName: TableName) => {
    setExporting(tableName);
    try {
      const data = await fetchTableData(tableName);
      if (data.length === 0) {
        toast({ title: `Tabela "${tableName}" está vazia`, description: "Nenhum dado para exportar." });
        return;
      }
      const csv = arrayToCSV(data);
      downloadCSV(csv, `${tableName}_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`);
      toast({ title: `Exportado: ${tableName}`, description: `${data.length} registros exportados.` });
    } catch (error: any) {
      console.error(`Export error for ${tableName}:`, error);
      toast({ title: `Erro ao exportar ${tableName}`, description: error.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const exportSelected = async () => {
    if (selected.size === 0) {
      toast({ title: "Nenhuma tabela selecionada", variant: "destructive" });
      return;
    }

    setExporting("all");
    let successCount = 0;
    let errorCount = 0;

    for (const tableName of selected) {
      try {
        const data = await fetchTableData(tableName);
        if (data.length > 0) {
          const csv = arrayToCSV(data);
          downloadCSV(csv, `${tableName}_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`);
          successCount++;
        }
      } catch (error) {
        console.error(`Export error for ${tableName}:`, error);
        errorCount++;
      }
    }

    toast({
      title: "Exportação concluída",
      description: `${successCount} tabelas exportadas${errorCount > 0 ? `, ${errorCount} erros` : ""}.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });
    setExporting(null);
  };

  const exportAllSQL = async () => {
    const tablesToExport = selected.size > 0 ? Array.from(selected) : ALL_TABLES.map(t => t.name);
    setExportingAllSql(true);
    try {
      const sqlSections: string[] = [];

      // Section 0: Extension
      sqlSections.push("-- ==============================================");
      sqlSections.push("-- PARTE 0: Extensões necessárias");
      sqlSections.push("-- ==============================================");
      sqlSections.push("CREATE EXTENSION IF NOT EXISTS pgcrypto;\n");

      // Section 1: ENUM types
      sqlSections.push("-- ==============================================");
      sqlSections.push("-- PARTE 1: Tipos ENUM");
      sqlSections.push("-- ==============================================\n");

      const { data: enumsData, error: enumsError } = await supabase.rpc("get_enums_ddl");
      if (enumsError) {
        sqlSections.push(`-- Erro ao obter ENUMs: ${enumsError.message}\n`);
      } else if (enumsData) {
        sqlSections.push(enumsData as string);
      }

      // Section 2: CREATE TABLE statements without foreign keys
      sqlSections.push("-- ==============================================");
      sqlSections.push("-- PARTE 2: Criação das tabelas (sem foreign keys)");
      sqlSections.push("-- ==============================================\n");

      for (const tableName of tablesToExport) {
        const { data, error } = await supabase.rpc("get_table_ddl", { _table_name: tableName, _include_fks: false } as any);
        if (error) {
          sqlSections.push(`-- Erro ao obter DDL de ${tableName}: ${error.message}\n`);
        } else {
          sqlSections.push(`-- Table: ${tableName}\n${data}\n`);
        }
      }

      // Section 3: Foreign keys (after all tables exist)
      sqlSections.push("-- ==============================================");
      sqlSections.push("-- PARTE 3: Foreign Keys");
      sqlSections.push("-- ==============================================\n");

      for (const tableName of tablesToExport) {
        const { data, error } = await supabase.rpc("get_table_fks", { _table_name: tableName });
        if (!error && data && (data as string).trim().length > 0) {
          sqlSections.push(`-- FK: ${tableName}\n${data}`);
        }
      }

      const fullSql = sqlSections.join("\n");
      const blob = new Blob([fullSql], { type: "text/sql;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `schema_completo_${format(new Date(), "yyyy-MM-dd_HHmm")}.sql`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast({ title: "SQL exportado!", description: `${tablesToExport.length} tabelas incluídas.` });
    } catch (error: any) {
      toast({ title: "Erro ao exportar SQL", description: error.message, variant: "destructive" });
    } finally {
      setExportingAllSql(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={selectAll} className="gap-2">
          {selected.size === ALL_TABLES.length ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          {selected.size === ALL_TABLES.length ? "Desmarcar Tudo" : "Selecionar Tudo"}
        </Button>

        <Button
          onClick={exportSelected}
          disabled={selected.size === 0 || exporting !== null}
          className="gap-2"
        >
          {exporting === "all" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar CSV ({selected.size})
        </Button>

        <Button
          variant="outline"
          onClick={exportAllSQL}
          disabled={exportingAllSql}
          className="gap-2"
        >
          {exportingAllSql ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Code className="h-4 w-4" />
          )}
          {selected.size > 0
            ? `Exportar SQL (${selected.size})`
            : "Exportar SQL (Todas)"}
        </Button>

        {selected.size > 0 && (
          <span className="text-sm text-muted-foreground">
            {selected.size} de {ALL_TABLES.length} tabelas selecionadas
          </span>
        )}
      </div>

      {/* Tables by Category */}
      {categories.map((category) => {
        const tablesInCat = ALL_TABLES.filter((t) => t.category === category);
        const allCatSelected = tablesInCat.every((t) => selected.has(t.name));

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={CATEGORY_COLORS[category] || ""}>
                    {category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {tablesInCat.length} tabelas
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectCategory(category)}
                  className="text-xs"
                >
                  {allCatSelected ? "Desmarcar" : "Selecionar"} todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {tablesInCat.map((table) => (
                  <div
                    key={table.name}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border transition-colors
                      ${selected.has(table.name)
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:bg-muted/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={selected.has(table.name)}
                        onCheckedChange={() => toggleTable(table.name)}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{table.label}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {table.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSqlDialog({ name: table.name, label: table.label })}
                        disabled={exporting !== null}
                        title={`Ver SQL de ${table.label}`}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => exportSingleTable(table.name)}
                        disabled={exporting !== null}
                        title={`Exportar CSV de ${table.label}`}
                      >
                        {exporting === table.name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* SQL Dialog */}
      {sqlDialog && (
        <TableSQLDialog
          tableName={sqlDialog.name}
          tableLabel={sqlDialog.label}
          open={!!sqlDialog}
          onOpenChange={(open) => { if (!open) setSqlDialog(null); }}
        />
      )}
    </div>
  );
}
