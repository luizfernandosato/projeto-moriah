
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const checkApprovalStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_approvals')
      .select('status')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao verificar status de aprovação:', error);
      return null;
    }

    return data?.status;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
        console.error("Erro de login:", error);
        return;
      }

      if (data.user) {
        const status = await checkApprovalStatus(data.user.id);
        
        if (status === 'approved') {
          toast.success("Login realizado com sucesso!");
          navigate("/gerar-recibo");
        } else if (status === 'pending') {
          toast.error("Sua conta está aguardando aprovação do administrador.");
          await supabase.auth.signOut();
        } else if (status === 'rejected') {
          toast.error("Seu acesso foi negado pelo administrador.");
          await supabase.auth.signOut();
        } else {
          toast.error("Erro ao verificar status da conta.");
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !name) {
      toast.error("Por favor, preencha todos os campos");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        toast.error("Erro ao registrar usuário");
        console.error("Erro de registro:", error);
        return;
      }

      if (data.user) {
        // Notificar o administrador
        const { error: functionError } = await supabase.functions.invoke('notify-admin', {
          body: {
            adminEmail: 'luizfernandosato@gmail.com',
            newUserEmail: email,
            newUserName: name,
          }
        });

        if (functionError) {
          console.error("Erro ao notificar administrador:", functionError);
        }

        toast.success("Registro realizado com sucesso! Aguarde a aprovação do administrador.");
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (error) {
      console.error("Erro ao registrar:", error);
      toast.error("Erro ao registrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="text-center">
            <img 
              src="/lovable-uploads/c06539a6-198b-4a18-b7f4-6e3fdc4ffd9f.png" 
              alt="Logo Projeto Moriah" 
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold">Projeto Moriah</h1>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Registrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Senha</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registerName">Nome</Label>
                  <Input
                    id="registerName"
                    type="text"
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Senha</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
