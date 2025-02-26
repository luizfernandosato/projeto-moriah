
import { useEffect } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Exportar = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Exportar Dados</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Funcionalidade de exportação em desenvolvimento.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Exportar;
