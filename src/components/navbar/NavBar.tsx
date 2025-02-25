
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Receipt, User, History, FileDown } from "lucide-react";
import { useUser, useAuth } from "@/hooks/useAuth";

export const NavBar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Receipt className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Recibo-Matic</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/gerar-recibo')}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Gerar Recibo
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/historico')}
                >
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/historico')}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="animated-border"
                onClick={() => navigate('/login')}
              >
                <User className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
