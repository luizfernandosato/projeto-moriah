
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footer } from "@/components/layout/Footer";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Estado para login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estado para solicitação de acesso
  const [nome, setNome] = useState("");
  const [emailSolicitacao, setEmailSolicitacao] = useState("");
  const [setor, setSetor] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Aguardando aprovação do administrador.");
        } else {
          toast.error("Erro ao fazer login. Verifique suas credenciais.");
        }
        console.error("Erro de login:", error);
        return;
      }

      if (data.user) {
        toast.success("Login realizado com sucesso!");
        navigate("/gerar-recibo");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarAcesso = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!nome || !emailSolicitacao || !setor) {
      toast.error("Por favor, preencha todos os campos");
      setLoading(false);
      return;
    }

    try {
      const response = await supabase.functions.invoke('solicitar-acesso', {
        body: {
          nome: nome,
          email: emailSolicitacao,
          setor: setor,
        }
      });

      if (response.error) {
        toast.error("Erro ao enviar solicitação");
        console.error("Erro ao solicitar acesso:", response.error);
        return;
      }

      toast.success("Solicitação enviada com sucesso! O administrador entrará em contato.");
      setNome("");
      setEmailSolicitacao("");
      setSetor("");
    } catch (error) {
      console.error("Erro ao solicitar acesso:", error);
      toast.error("Erro ao enviar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
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
                <TabsTrigger value="solicitar">Solicitar Acesso</TabsTrigger>
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
              <TabsContent value="solicitar">
                <form onSubmit={handleSolicitarAcesso} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailSolicitacao">Email</Label>
                    <Input
                      id="emailSolicitacao"
                      type="email"
                      placeholder="Digite seu email"
                      value={emailSolicitacao}
                      onChange={(e) => setEmailSolicitacao(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setor">Setor</Label>
                    <Input
                      id="setor"
                      type="text"
                      placeholder="Em qual setor você trabalha"
                      value={setor}
                      onChange={(e) => setSetor(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Solicitar Acesso"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
