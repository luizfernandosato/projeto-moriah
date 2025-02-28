
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Printer, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Recibo {
  id: string;
  pagador: string;
  valor: number;
  data: string;
  pdf_url: string | null;
  numero_recibo: number;
}

interface ListaRecibosProps {
  recibos: Recibo[];
  selectedRecibos: string[];
  onToggleSelect: (id: string) => void;
  onDownload: (url: string) => void;
}

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarNumeroRecibo = (numero: number) => {
  return numero.toString().padStart(6, '0');
};

const formatarDataCompleta = (dataString: string) => {
  const data = new Date(dataString);
  
  const dia = data.getDate();
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();
  
  return `${dia} de ${mes} de ${ano}`;
};

export const ListaRecibos = ({
  recibos,
  selectedRecibos,
  onToggleSelect,
  onDownload
}: ListaRecibosProps) => {
  return (
    <div className="grid gap-4">
      {Array.isArray(recibos) && recibos.map((recibo) => (
        <Card key={recibo.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="ghost"
                className="p-0"
                onClick={() => onToggleSelect(recibo.id)}
              >
                {selectedRecibos.includes(recibo.id) ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
              <div>
                <h3 className="font-semibold">
                  Recibo #{formatarNumeroRecibo(recibo.numero_recibo)} - {recibo.pagador}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(recibo.data), "dd/MM/yyyy")} - {formatarMoeda(recibo.valor)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!recibo.pdf_url}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  {recibo.pdf_url && (
                    <iframe
                      src={recibo.pdf_url}
                      className="w-full h-[80vh]"
                      title={`Recibo #${formatarNumeroRecibo(recibo.numero_recibo)}`}
                    />
                  )}
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="outline"
                onClick={() => recibo.pdf_url && window.open(recibo.pdf_url, "_blank")}
                disabled={!recibo.pdf_url}
                title="Imprimir"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => recibo.pdf_url && onDownload(recibo.pdf_url)}
                disabled={!recibo.pdf_url}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
