import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações Gerais</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de configurações em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
