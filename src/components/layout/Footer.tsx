
import { Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-6 border-t bg-background/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Todos os direitos reservados. © 2025 Fernando Sato.
          </p>
          <a 
            href="mailto:luizfernandosato@gmail.com"
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>luizfernandosato@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
