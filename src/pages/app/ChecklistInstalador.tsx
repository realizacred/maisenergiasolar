import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChecklistInstaladorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Checklist do Instalador</h1>
      <Card>
        <CardHeader>
          <CardTitle>Instalações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use a rota /checklist para acessar o checklist de instalação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
