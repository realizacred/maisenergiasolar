import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestão de Leads</h1>
      <Card>
        <CardHeader>
          <CardTitle>Leads Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de leads em desenvolvimento. Use a aba Pipeline por enquanto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
