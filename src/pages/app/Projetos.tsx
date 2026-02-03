import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjetosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projetos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Projetos em Andamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de projetos em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
