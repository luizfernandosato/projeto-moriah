
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Receipt, FileText, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <section className="py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Projeto-Moriah
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crie, gerencie e organize seus recibos de forma simples e elegante.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => navigate('/login')}
            >
              <Receipt className="h-5 w-5" />
              Começar Agora
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow duration-300">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Recibos Personalizados</h3>
            <p className="text-muted-foreground">
              Crie recibos profissionais com seu logotipo e informações personalizadas.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow duration-300">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Histórico Completo</h3>
            <p className="text-muted-foreground">
              Acesse e gerencie todos os seus recibos em um só lugar.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow duration-300">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Exportação em PDF</h3>
            <p className="text-muted-foreground">
              Exporte seus recibos em PDF com apenas um clique.
            </p>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
