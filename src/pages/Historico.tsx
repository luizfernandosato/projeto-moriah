
import { useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, Printer, CheckSquare, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
    mes: "",
    ano: new Date().getFullYear().toString(),
    dia: "",
  });

  const [selectedRecibos, setSelectedRecibos] = useState<string[]>([]);

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
      if (filtros.mes) {
        query = query.like("data", `%-${filtros.mes}-%`);
      }
      if (filtros.ano) {
        query = query.like("data", `${filtros.ano}-%`);
      }
      if (filtros.dia) {
        query = query.like("data", `%-${filtros.dia}`);
      }

      const { data, error } = await query;
      if (error) throw error;
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

  const meses = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const dias = Array.from({ length: 31 }, (_, i) => {
    const dia = (i + 1).toString().padStart(2, "0");
    return { value: dia, label: dia };
  });

  const anos = Array.from({ length: 10 }, (_, i) => {
    const ano = (new Date().getFullYear() - i).toString();
    return { value: ano, label: ano };
  });

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Histórico de Recibos</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrintSelected}
                  disabled={selectedRecibos.length === 0}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Selecionados
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadSelected}
                  disabled={selectedRecibos.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Selecionados
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <div className="space-y-2">
                  <Label>Dia</Label>
                  <Select
                    value={filtros.dia}
                    onValueChange={(dia) =>
                      setFiltros((prev) => ({ ...prev, dia }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um dia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {dias.map((dia) => (
                        <SelectItem key={dia.value} value={dia.value}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select
                    value={filtros.mes}
                    onValueChange={(mes) =>
                      setFiltros((prev) => ({ ...prev, mes }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um mês" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {meses.map((mes) => (
                        <SelectItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Select
                    value={filtros.ano}
                    onValueChange={(ano) =>
                      setFiltros((prev) => ({ ...prev, ano }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {anos.map((ano) => (
                        <SelectItem key={ano.value} value={ano.value}>
                          {ano.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lista de Recibos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAll}
                  >
                    {recibos && selectedRecibos.length === recibos.length ? (
                      <CheckSquare className="h-4 w-4 mr-2" />
                    ) : (
                      <Square className="h-4 w-4 mr-2" />
                    )}
                    Selecionar Todos
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedRecibos.length} recibos selecionados
                  </span>
                </div>

                {isLoading ? (
                  <p>Carregando...</p>
                ) : recibos?.length === 0 ? (
                  <p>Nenhum recibo encontrado.</p>
                ) : (
                  <div className="grid gap-4">
                    {recibos?.map((recibo) => (
                      <Card key={recibo.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-0"
                              onClick={() => handleToggleSelect(recibo.id)}
                            >
                              {selectedRecibos.includes(recibo.id) ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </Button>
                            <div>
                              <h3 className="font-semibold">{recibo.pagador}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(recibo.data), "dd/MM/yyyy")} - R${" "}
                                {recibo.valor.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(recibo.pdf_url, "_blank")}
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
