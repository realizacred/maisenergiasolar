import { ClientesManager } from "@/components/admin/ClientesManager";

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
      <ClientesManager />
    </div>
  );
}
