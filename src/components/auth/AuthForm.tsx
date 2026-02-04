import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2, CheckCircle, KeyRound, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, LoginData } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const newPasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type NewPasswordData = z.infer<typeof newPasswordSchema>;

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const newPasswordForm = useForm<NewPasswordData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Detecta o evento de recuperação de senha
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
    });

    // Também verifica se há hash na URL indicando recuperação
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    if (type === "recovery") {
      setIsPasswordRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (data: NewPasswordData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast({
          title: "Erro ao atualizar senha",
          description:
            error.message || "Não foi possível atualizar a senha. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setPasswordUpdated(true);
        toast({
          title: "Senha atualizada! 🎉",
          description: "Sua senha foi alterada com sucesso.",
        });

        // Limpa a URL e redireciona após alguns segundos
        setTimeout(() => {
          window.location.href = "/auth";
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Digite seu email para receber o link de recuperação.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível enviar o email. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: "Email enviado! 📧",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        let message = "Erro ao fazer login. Tente novamente.";
        if (error.message.includes("Invalid login credentials")) {
          message = "Email ou senha incorretos.";
        } else if (error.message.includes("Email not confirmed")) {
          message = "Por favor, confirme seu email antes de fazer login.";
        }
        toast({
          title: "Erro no login",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password);
      if (error) {
        let message = "Erro ao criar conta. Tente novamente.";
        if (error.message.includes("User already registered")) {
          message = "Este email já está cadastrado.";
        } else if (error.message.includes("Password should be")) {
          message = "A senha deve ter pelo menos 6 caracteres.";
        }
        toast({
          title: "Erro no cadastro",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada! 🎉",
          description: "Verifique seu email para confirmar o cadastro.",
        });
        form.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de redefinição de senha
  if (isPasswordRecovery) {
    if (passwordUpdated) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Senha Atualizada!
          </h3>
          <p className="text-sm text-muted-foreground">
            Redirecionando para o login...
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Definir Nova Senha
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Digite sua nova senha abaixo
          </p>
        </div>

        <Form {...newPasswordForm}>
          <form
            onSubmit={newPasswordForm.handleSubmit(handleUpdatePassword)}
            className="space-y-4"
          >
            <FormField
              control={newPasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Nova Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={newPasswordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirmar Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Repita a senha"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Atualizar Senha
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 bg-muted/50">
          <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg font-medium">
            Entrar
          </TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg font-medium">
            Criar Conta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="animate-fade-in">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline"
                  disabled={isLoading}
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {resetEmailSent && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm font-medium animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  Email de recuperação enviado!
                </div>
              )}
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="signup" className="animate-fade-in">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}