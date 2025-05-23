
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Receipt, Menu, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logout realizado com sucesso");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/gerar-recibo" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/c06539a6-198b-4a18-b7f4-6e3fdc4ffd9f.png" 
              alt="Logo Projeto Moriah" 
              className="h-8 sm:h-12 w-auto"
            />
            <span className="text-lg sm:text-xl font-semibold">Projeto-Moriah</span>
          </Link>
          
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/gerar-recibo')} className="py-3">
                  <Receipt className="h-4 w-4 mr-2" />
                  Gerar Recibo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/exportar')} className="py-3">
                  <Receipt className="h-4 w-4 mr-2" />
                  Exportar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/minha-conta')} className="py-3">
                  <User className="h-4 w-4 mr-2" />
                  Minha Conta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="py-3">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
