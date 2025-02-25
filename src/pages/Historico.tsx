
import { useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FiltrosRecibos } from "@/components/historico/FiltrosRecibos";
import { ListaRecibos } from "@/components/historico/ListaRecibos";
import { AcoesRecibos } from "@/components/historico/AcoesRecibos";

interface Recibo {
  id: string;
  pagador: string;
  valor: number;
  data: string;
  pdf_url: string;
  numero_recibo: number;
}

const Historico = () => {
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    mes: "",
    ano: new Date().getFullYear().toString(),
    dia: "",
  });

  const [selectedRecibos, setSelectedRecibos] = useState<string[]>([]);

  const { data: recibos, isLoading } = useQuery({
    queryKey: ["recibos", filtros],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let query = supabase
        .from("recibos")
        .select("id, pagador, valor, data, pdf_url, numero_recibo")
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (filtros.dataInicio) {
        query = query.gte('data', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query = query.lte('data', filtros.dataFim);
      }
      if (filtros.mes && filtros.ano) {
        const dataInicio = `${filtros.ano}-${filtros.mes}-01`;
        const dataFim = `${filtros.ano}-${filtros.mes}-31`;
        query = query.gte('data', dataInicio).lte('data', dataFim);
      } else if (filtros.ano) {
        const dataInicio = `${filtros.ano}-01-01`;
        const dataFim = `${filtros.ano}-12-31`;
        query = query.gte('data', dataInicio).lte('data', dataFim);
      }
      if (filtros.dia && filtros.mes && filtros.ano) {
        const data = `${filtros.ano}-${filtros.mes}-${filtros.dia}`;
        query = query.eq('data', data);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Erro ao buscar recibos:", error);
        throw error;
      }
      return data as Recibo[];
    },
  });

  const handleSelectAll = () => {
    if (recibos) {
      if (selectedRecibos.length === recibos.length) {
        setSelectedRecibos([]);
      } else {
        setSelectedRecibos(recibos.map(r => r.id));
      }
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedRecibos(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  const handlePrintSelected = () => {
    if (selectedRecibos.length === 0) {
      toast.error("Selecione pelo menos um recibo");
      return;
    }

    const selectedPdfs = recibos
      ?.filter(r => selectedRecibos.includes(r.id))
      .map(r => r.pdf_url);

    selectedPdfs?.forEach(url => {
      window.open(url, "_blank");
    });
  };

  const handleDownloadSelected = async () => {
    if (selectedRecibos.length === 0) {
      toast.error("Selecione pelo menos um recibo");
      return;
    }

    const selectedPdfs = recibos
      ?.filter(r => selectedRecibos.includes(r.id))
      .map(r => r.pdf_url);

    for (const url of selectedPdfs || []) {
      await handleDownload(url);
    }
  };

  const handleDownload = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `recibo-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Histórico de Recibos</h2>
              <AcoesRecibos
                totalRecibos={recibos?.length || 0}
                selectedCount={selectedRecibos.length}
                allSelected={recibos ? selectedRecibos.length === recibos.length : false}
                onSelectAll={handleSelectAll}
                onPrintSelected={handlePrintSelected}
                onDownloadSelected={handleDownloadSelected}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <FiltrosRecibos
                filtros={filtros}
                onFiltrosChange={setFiltros}
              />

              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recibos?.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">Nenhum recibo encontrado.</p>
                  </div>
                ) : (
                  <ListaRecibos
                    recibos={recibos}
                    selectedRecibos={selectedRecibos}
                    onToggleSelect={handleToggleSelect}
                    onDownload={handleDownload}
                  />
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
