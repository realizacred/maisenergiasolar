import { RecebimentosManager } from "@/components/admin/RecebimentosManager";

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financeiro</h1>
      <RecebimentosManager />
    </div>
  );
}
