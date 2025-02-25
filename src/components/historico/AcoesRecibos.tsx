
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
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={onSelectAll}
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4 mr-2" />
          ) : (
            <Square className="h-4 w-4 mr-2" />
          )}
          Selecionar Todos
        </Button>
        <span className="text-sm text-muted-foreground">
          {selectedCount} recibos selecionados
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onPrintSelected}
          disabled={selectedCount === 0}
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Selecionados
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDownloadSelected}
          disabled={selectedCount === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Selecionados
        </Button>
      </div>
    </>
  );
};
