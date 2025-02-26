
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ListaRecibos } from "@/components/historico/ListaRecibos";
import { AcoesRecibos } from "@/components/historico/AcoesRecibos";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Recibo {
  id: string;
  pagador: string;
  valor: number;
  data: string;
  pdf_url: string | null;
  numero_recibo: number;
}

const meses = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const Exportar = () => {
  const [selectedRecibos, setSelectedRecibos] = useState<string[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string>("");

  const fetchRecibos = async () => {
    let query = supabase
      .from("recibos")
      .select("id, pagador, valor, data, pdf_url, numero_recibo");

    if (mesSelecionado) {
      query = query.eq('EXTRACT(month FROM data)::integer', parseInt(mesSelecionado));
    }

    const { data, error } = await query.order('data', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar recibos:", error);
      toast.error("Erro ao carregar recibos");
      throw error;
    }
    
    return data as Recibo[];
  };

  const { data: recibos, isLoading } = useQuery({
    queryKey: ["recibos", mesSelecionado],
    queryFn: fetchRecibos
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

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold">Exportar Recibos</h2>
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
              <div className="w-[200px]">
                <Label>Filtrar por Mês</Label>
                <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os meses</SelectItem>
                    {meses.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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

export default Exportar;
