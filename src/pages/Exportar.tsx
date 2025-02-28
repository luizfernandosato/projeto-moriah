
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ListaRecibos } from "@/components/historico/ListaRecibos";
import { AcoesRecibos } from "@/components/historico/AcoesRecibos";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PDFDocument } from 'pdf-lib';

interface Recibo {
  id: string;
  pagador: string;
  valor: number;
  data: string;
  created_at: string;
  pdf_url: string | null;
  numero_recibo: number;
}

const Exportar = () => {
  const [selectedRecibos, setSelectedRecibos] = useState<string[]>([]);

  const { data: recibos, isLoading } = useQuery({
    queryKey: ["recibos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recibos")
        .select("id, pagador, valor, data, created_at, pdf_url, numero_recibo")
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar recibos:", error);
        toast.error("Erro ao carregar recibos");
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

  const handlePrintSelected = async () => {
    if (selectedRecibos.length === 0) {
      toast.error("Selecione pelo menos um recibo");
      return;
    }

    try {
      const selectedPdfs = recibos
        ?.filter(r => selectedRecibos.includes(r.id))
        .map(r => r.pdf_url)
        .filter((url): url is string => url !== null);

      if (!selectedPdfs || selectedPdfs.length === 0) {
        toast.error("Nenhum PDF disponível para impressão");
        return;
      }

      // Se for apenas um PDF, abre direto
      if (selectedPdfs.length === 1) {
        window.open(selectedPdfs[0], "_blank");
        return;
      }

      toast.loading("Combinando PDFs para impressão...");

      // Para múltiplos PDFs, mescla em um único arquivo
      const mergedPdf = await PDFDocument.create();

      for (const url of selectedPdfs) {
        const pdfBytes = await fetch(url).then(res => res.arrayBuffer());
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      window.open(url, '_blank');
      toast.dismiss();
      
      // Limpa o URL criado após um tempo
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error('Erro ao mesclar PDFs:', error);
      toast.error("Erro ao preparar PDFs para impressão");
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedRecibos.length === 0) {
      toast.error("Selecione pelo menos um recibo");
      return;
    }

    try {
      const selectedPdfs = recibos
        ?.filter(r => selectedRecibos.includes(r.id))
        .map(r => r.pdf_url)
        .filter((url): url is string => url !== null);

      if (!selectedPdfs || selectedPdfs.length === 0) {
        toast.error("Nenhum PDF disponível para download");
        return;
      }

      // Se for apenas um PDF, baixa direto
      if (selectedPdfs.length === 1) {
        await handleDownload(selectedPdfs[0]);
        return;
      }

      toast.loading("Combinando PDFs para download...");

      // Para múltiplos PDFs, mescla em um único arquivo
      const mergedPdf = await PDFDocument.create();

      for (const url of selectedPdfs) {
        const pdfBytes = await fetch(url).then(res => res.arrayBuffer());
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `recibos_combinados_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(downloadUrl);
      toast.dismiss();
      toast.success("Download concluído!");
      
    } catch (error) {
      console.error("Erro ao combinar PDFs para download:", error);
      toast.error("Erro ao preparar PDFs para download");
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Exportar;
