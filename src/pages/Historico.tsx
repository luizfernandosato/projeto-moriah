
import { useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FiltrosRecibos } from "@/components/historico/FiltrosRecibos";
import { ListaRecibos } from "@/components/historico/ListaRecibos";
import { AcoesRecibos } from "@/components/historico/AcoesRecibos";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useAuth";

interface Recibo {
  id: string;
  pagador: string;
  valor: number;
  data: string;
  pdf_url: string | null;
  numero_recibo: number;
}

const Historico = () => {
  const { user } = useUser();
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    mes: "",
    ano: new Date().getFullYear().toString(),
    dia: "",
  });

  const [selectedRecibos, setSelectedRecibos] = useState<string[]>([]);

  const { data: recibos, isLoading } = useQuery({
    queryKey: ["recibos", filtros, user?.id],
    queryFn: async () => {
      console.log("Buscando recibos com filtros:", filtros);
      
      if (!user) {
        console.log("Usuário não autenticado");
        throw new Error("Usuário não autenticado");
      }

      let query = supabase
        .from("recibos")
        .select("id, pagador, valor, data, pdf_url, numero_recibo")
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      // Aplicar filtros
      if (filtros.dataInicio) {
        query = query.gte('data', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query = query.lte('data', filtros.dataFim);
      }
      if (filtros.mes && filtros.ano) {
        const dataInicio = `${filtros.ano}-${filtros.mes.padStart(2, '0')}-01`;
        const dataFim = `${filtros.ano}-${filtros.mes.padStart(2, '0')}-31`;
        query = query.gte('data', dataInicio).lte('data', dataFim);
      } else if (filtros.ano) {
        const dataInicio = `${filtros.ano}-01-01`;
        const dataFim = `${filtros.ano}-12-31`;
        query = query.gte('data', dataInicio).lte('data', dataFim);
      }
      if (filtros.dia && filtros.mes && filtros.ano) {
        const data = `${filtros.ano}-${filtros.mes.padStart(2, '0')}-${filtros.dia.padStart(2, '0')}`;
        query = query.eq('data', data);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Erro ao buscar recibos:", error);
        toast.error("Erro ao carregar recibos");
        throw error;
      }
      
      console.log("Recibos encontrados:", data);
      return data as Recibo[];
    },
    enabled: !!user,
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
      .map(r => r.pdf_url)
      .filter(Boolean);

    selectedPdfs?.forEach(url => {
      if (url) window.open(url, "_blank");
    });
  };

  const handleDownloadSelected = async () => {
    if (selectedRecibos.length === 0) {
      toast.error("Selecione pelo menos um recibo");
      return;
    }

    const selectedPdfs = recibos
      ?.filter(r => selectedRecibos.includes(r.id))
      .map(r => r.pdf_url)
      .filter(Boolean);

    for (const url of selectedPdfs || []) {
      if (url) await handleDownload(url);
    }
  };

  const handleDownload = async (url: string) => {
    try {
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
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast.error("Erro ao baixar o arquivo");
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Você precisa estar logado para ver seus recibos.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
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
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !recibos || recibos.length === 0 ? (
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
