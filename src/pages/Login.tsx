
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
import { Loader2 } from "lucide-react";

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
      // 1. Fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro de login:", error);
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
        setLoading(false);
        return;
      }

      if (!data.user) {
        toast.error("Usuário não encontrado");
        setLoading(false);
        return;
      }

      console.log("Login bem-sucedido para o usuário ID:", data.user.id);

      try {
        // 2. Verificar se o usuário está aprovado
        console.log("Verificando aprovação para o usuário:", data.user.id);
        
        // Método 1: Consulta direta
        const { data: approvalData, error: approvalError } = await supabase
          .from('user_approvals')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle(); // Usando maybeSingle em vez de single para evitar erro se não encontrar
        
        console.log("Resultado da consulta de aprovação:", { approvalData, approvalError });
        
        if (approvalError) {
          console.error("Erro ao verificar aprovação:", approvalError);
          toast.error("Não foi possível verificar o status da sua conta");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Se não existir um registro, verificar se o usuário precisa ser aprovado
        if (!approvalData) {
          console.log("Registro de aprovação não encontrado, criando um novo");
          
          // Criando um registro de aprovação pendente
          const { error: insertError } = await supabase
            .from('user_approvals')
            .insert([
              { id: data.user.id, status: 'pending' }
            ]);
          
          if (insertError) {
            console.error("Erro ao criar registro de aprovação:", insertError);
            toast.error("Não foi possível configurar sua conta");
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
          
          toast.error("Sua conta está pendente de aprovação pelo administrador");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        // Verificar status da aprovação
        console.log("Status de aprovação:", approvalData.status);
        
        if (approvalData.status !== 'approved') {
          toast.error("Sua conta ainda não foi aprovada pelo administrador");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        // Login bem-sucedido e usuário aprovado
        console.log("Usuário aprovado, redirecionando...");
        toast.success("Login realizado com sucesso!");
        navigate("/gerar-recibo");
      } catch (error) {
        console.error("Erro ao processar verificação de aprovação:", error);
        toast.error("Erro ao verificar status da sua conta");
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Erro geral no login:", error);
      toast.error("Ocorreu um erro durante o login");
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
      // Registrar a solicitação na função de edge
      const { error: notifyError } = await supabase.functions.invoke('notify-admin', {
        body: {
          nome: nome,
          email: emailSolicitacao,
          setor: setor,
        }
      });
      
      if (notifyError) {
        console.error("Erro ao notificar administrador:", notifyError);
        toast.error("Erro ao enviar solicitação. Tente novamente mais tarde.");
        return;
      }

      toast.success("Solicitação enviada com sucesso! O administrador criará sua conta em breve.");
      
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
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : "Entrar"}
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
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : "Solicitar Acesso"}
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
