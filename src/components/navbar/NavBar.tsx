
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Receipt, User } from "lucide-react";

export const NavBar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Receipt className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Recibo-Matic</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="animated-border">
              <User className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
