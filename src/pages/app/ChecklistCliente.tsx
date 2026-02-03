import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChecklistClientePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Checklist do Cliente</h1>
      <Card>
        <CardHeader>
          <CardTitle>Avaliações Pré-Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de checklist do cliente em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
