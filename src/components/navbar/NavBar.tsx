
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Receipt, Menu } from "lucide-react";
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
            <img 
              src="/lovable-uploads/c06539a6-198b-4a18-b7f4-6e3fdc4ffd9f.png" 
              alt="Logo Projeto Moriah" 
              className="h-12 w-auto"
            />
            <span className="text-xl font-semibold">Projeto-Moriah</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/gerar-recibo')}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Gerar Recibo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/historico')}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Histórico
                </DropdownMenuItem>
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/exportar')}>
                      <Receipt className="h-4 w-4 mr-2" />
                      Exportar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      signOut();
                      navigate('/');
                    }}>
                      Sair
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    Entrar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
