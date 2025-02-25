
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FiltrosRecibosProps {
  filtros: {
    dataInicio: string;
    dataFim: string;
    mes: string;
    ano: string;
    dia: string;
  };
  onFiltrosChange: (filtros: {
    dataInicio: string;
    dataFim: string;
    mes: string;
    ano: string;
    dia: string;
  }) => void;
}

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

export const FiltrosRecibos = ({ filtros, onFiltrosChange }: FiltrosRecibosProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="space-y-2">
        <Label htmlFor="dataInicio">Data Início</Label>
        <Input
          id="dataInicio"
          type="date"
          value={filtros.dataInicio}
          onChange={(e) =>
            onFiltrosChange({
              ...filtros,
              dataInicio: e.target.value,
            })
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
            onFiltrosChange({
              ...filtros,
              dataFim: e.target.value,
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Dia</Label>
        <Select
          value={filtros.dia}
          onValueChange={(dia) =>
            onFiltrosChange({
              ...filtros,
              dia,
            })
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
            onFiltrosChange({
              ...filtros,
              mes,
            })
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
            onFiltrosChange({
              ...filtros,
              ano,
            })
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
  );
};
