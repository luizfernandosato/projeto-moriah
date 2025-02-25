
import { useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Recibo {
  id: string;
  pagador: string;
  valor: number;
  data: string;
  pdf_url: string;
}

const Historico = () => {
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
  });

  const { data: recibos, isLoading } = useQuery({
    queryKey: ["recibos", filtros],
    queryFn: async () => {
      let query = supabase
        .from("recibos")
        .select("*")
        .order("data", { ascending: false });

      if (filtros.dataInicio) {
        query = query.gte("data", filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query = query.lte("data", filtros.dataFim);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Recibo[];
    },
  });

  const handlePrint = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  const handleDownload = async (pdfUrl: string) => {
    const response = await fetch(pdfUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recibo.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Histórico de Recibos</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        dataInicio: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        dataFim: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Lista de Recibos */}
              <div className="space-y-4">
                {isLoading ? (
                  <p>Carregando...</p>
                ) : recibos?.length === 0 ? (
                  <p>Nenhum recibo encontrado.</p>
                ) : (
                  <div className="grid gap-4">
                    {recibos?.map((recibo) => (
                      <Card key={recibo.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{recibo.pagador}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(recibo.data), "dd/MM/yyyy")} - R${" "}
                              {recibo.valor.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrint(recibo.pdf_url)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(recibo.pdf_url)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Historico;
