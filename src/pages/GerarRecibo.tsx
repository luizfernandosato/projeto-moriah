
import { useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Função para converter número em texto por extenso
const valorPorExtenso = (valor: number): string => {
  if (valor === 0) return "zero";
  
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
  const milhares = ["", "mil", "milhões", "bilhões"];

  const partes = valor.toFixed(2).split(".");
  const reais = parseInt(partes[0]);
  const centavos = parseInt(partes[1]);

  const converterGrupo = (numero: number): string => {
    if (numero === 0) return "";
    
    const centena = Math.floor(numero / 100);
    const dezena = Math.floor((numero % 100) / 10);
    const unidade = numero % 10;
    
    let resultado = "";
    
    if (centena > 0) {
      resultado += centenas[centena] + " ";
    }
    
    if (dezena > 0) {
      if (dezena === 1 && unidade > 0) {
        const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
        resultado += especiais[unidade] + " ";
        return resultado.trim();
      }
      resultado += dezenas[dezena] + " ";
    }
    
    if (unidade > 0) {
      if (dezena > 0) resultado += "e ";
      resultado += unidades[unidade] + " ";
    }
    
    return resultado.trim();
  };

  let resultado = "";
  
  if (reais > 0) {
    resultado += converterGrupo(reais);
    resultado += " " + (reais === 1 ? "real" : "reais");
  }
  
  if (centavos > 0) {
    if (reais > 0) resultado += " e ";
    resultado += converterGrupo(centavos);
    resultado += " " + (centavos === 1 ? "centavo" : "centavos");
  }
  
  return resultado.charAt(0).toUpperCase() + resultado.slice(1);
};

const GerarRecibo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pagador: "",
    cpfCnpj: "",
    valor: "",
    descricao: "",
    data: new Date().toISOString().split('T')[0],
    local: "",
    recebedor: "",
    cpfCnpjRecebedor: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode implementar a lógica para gerar o PDF do recibo
    toast.success("Recibo gerado com sucesso!");
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">Gerar Recibo</h2>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Dados do Pagador */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados do Pagador</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pagador">Nome do Pagador</Label>
                    <Input
                      id="pagador"
                      name="pagador"
                      value={formData.pagador}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                    <Input
                      id="cpfCnpj"
                      name="cpfCnpj"
                      value={formData.cpfCnpj}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Recibo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados do Recibo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      name="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor por Extenso</Label>
                    <Input
                      value={formData.valor ? valorPorExtenso(parseFloat(formData.valor)) : ""}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      name="data"
                      type="date"
                      value={formData.data}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      name="local"
                      value={formData.local}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Recebedor */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados do Recebedor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recebedor">Nome do Recebedor</Label>
                    <Input
                      id="recebedor"
                      name="recebedor"
                      value={formData.recebedor}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpjRecebedor">CPF/CNPJ do Recebedor</Label>
                    <Input
                      id="cpfCnpjRecebedor"
                      name="cpfCnpjRecebedor"
                      value={formData.cpfCnpjRecebedor}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Gerar Recibo
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GerarRecibo;
