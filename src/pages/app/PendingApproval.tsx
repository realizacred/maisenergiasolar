import { Link } from "react-router-dom";
import { Clock, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function PendingApproval() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Aguardando Aprovação</CardTitle>
          <CardDescription className="space-y-2">
            <p>
              Sua conta foi criada com sucesso! Porém, você ainda não possui permissões atribuídas no sistema.
            </p>
            <p className="flex items-center justify-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Próximos passos:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Aguarde um administrador aprovar sua conta</li>
              <li>Você receberá acesso baseado no seu perfil</li>
              <li>Atualize esta página após a aprovação</li>
            </ol>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Site
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1"
              onClick={() => signOut()}
            >
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
