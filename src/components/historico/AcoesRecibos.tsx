
import { Button } from "@/components/ui/button";
import { Download, Printer, CheckSquare, Square } from "lucide-react";

interface AcoesRecibosProps {
  totalRecibos: number;
  selectedCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onPrintSelected: () => void;
  onDownloadSelected: () => void;
}

export const AcoesRecibos = ({
  totalRecibos,
  selectedCount,
  allSelected,
  onSelectAll,
  onPrintSelected,
  onDownloadSelected,
}: AcoesRecibosProps) => {
  if (totalRecibos === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          variant="outline"
          onClick={onSelectAll}
          className="whitespace-nowrap"
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4 mr-2" />
          ) : (
            <Square className="h-4 w-4 mr-2" />
          )}
          Selecionar Todos
        </Button>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {selectedCount} de {totalRecibos} selecionados
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onPrintSelected}
          disabled={selectedCount === 0}
          className="whitespace-nowrap"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDownloadSelected}
          disabled={selectedCount === 0}
          className="whitespace-nowrap"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar
        </Button>
      </div>
    </div>
  );
};
