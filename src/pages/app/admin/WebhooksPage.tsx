import WebhookManager from "@/components/admin/WebhookManager";

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Webhooks</h1>
      <WebhookManager />
    </div>
  );
}
