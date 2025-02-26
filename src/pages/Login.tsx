
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar se as credenciais correspondem às esperadas
      if (email === "projetomoriahrecibos" && password === "#Yasashi27#") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: "projetomoriahrecibos@projetomoriahrecibos.com", // Email cadastrado no Supabase
          password: "#Yasashi27#"
        });

        if (error) {
          toast.error("Erro ao fazer login. Verifique suas credenciais.");
          console.error("Erro de login:", error);
          return;
        }

        if (data.user) {
          toast.success("Login realizado com sucesso!");
          navigate("/gerar-recibo");
        }
      } else {
        toast.error("Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao fazer login");
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
            <h1 className="text-2xl font-bold">Projeto Moriah - Login</h1>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Login</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
