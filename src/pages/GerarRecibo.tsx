import { useState, useEffect } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

const valorPorExtenso = (valor: number): string => {
  if (valor === 0) return "Zero reais";

  const unidades = ["", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez",
    "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove"];
  const dezenas = ["", "", "Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa"];
  const centenas = ["", "Cento", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seiscentos", "Setecentos", "Oitocentos", "Novecentos"];

  const partes = valor.toFixed(2).split(".");
  const reais = parseInt(partes[0]);
  const centavos = parseInt(partes[1]);

  const converterGrupo = (numero: number): string => {
    if (numero === 0) return "";
    if (numero === 100) return "Cem";
    if (numero <= 19) return unidades[numero];
    
    const centena = Math.floor(numero / 100);
    const dezena = Math.floor((numero % 100) / 10);
    const unidade = numero % 10;
    
    let resultado = "";
    
    if (centena > 0) {
      resultado += centenas[centena];
      if (dezena > 0 || unidade > 0) resultado += " e ";
    }
    
    if (dezena > 0) {
      if ((numero % 100) <= 19 && (numero % 100) > 0) {
        resultado += unidades[numero % 100];
        return resultado;
      }
      resultado += dezenas[dezena];
      if (unidade > 0) {
        resultado += " e " + unidades[unidade].toLowerCase();
      }
    } else if (unidade > 0) {
      resultado += unidades[unidade];
    }
    
    return resultado;
  };

  const converterValor = (numero: number): string => {
    if (numero === 0) return "";
    if (numero === 1000) return "Mil";
    if (numero === 1000000) return "Um milhão";
    if (numero === 1000000000) return "Um bilhão";
    
    if (numero >= 1000000000) {
      const bilhoes = Math.floor(numero / 1000000000);
      const resto = numero % 1000000000;
      let resultado = converterGrupo(bilhoes) + " bilhão" + (bilhoes > 1 ? "ões" : "");
      if (resto > 0) resultado += " e " + converterValor(resto);
      return resultado;
    }
    
    if (numero >= 1000000) {
      const milhoes = Math.floor(numero / 1000000);
      const resto = numero % 1000000;
      let resultado = converterGrupo(milhoes) + " milhão" + (milhoes > 1 ? "ões" : "");
      if (resto > 0) resultado += " e " + converterValor(resto);
      return resultado;
    }
    
    if (numero >= 1000) {
      const milhares = Math.floor(numero / 1000);
      const resto = numero % 1000;
      let resultado = "";
      if (milhares === 1) {
        resultado = "Mil";
      } else {
        resultado = converterGrupo(milhares) + " mil";
      }
      if (resto > 0) {
        if (resto < 100) {
          resultado += " e " + converterValor(resto);
        } else {
          resultado += " " + converterValor(resto);
        }
      }
      return resultado;
    }
    
    return converterGrupo(numero);
  };

  let resultado = "";
  
  if (reais > 0) {
    resultado += converterValor(reais);
    resultado += " " + (reais === 1 ? "real" : "reais");
  }
  
  if (centavos > 0) {
    if (reais > 0) resultado += " e ";
    resultado += converterValor(centavos).toLowerCase();
    resultado += " " + (centavos === 1 ? "centavo" : "centavos");
  }
  
  return resultado;
};

const formatarNumero = (valor: string) => {
  const numero = valor.replace(/\D/g, '');
  
  if (numero === '') return '';
  
  const valorNumerico = parseInt(numero) / 100;
  
  return valorNumerico.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatarNumeroRecibo = (numero: number) => {
  return numero.toString().padStart(6, '0');
};

const GerarRecibo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    pagador: "",
    cpfCnpj: "",
    valor: "",
    descricao: "",
    data: new Date().toISOString().split('T')[0],
    local: "",
    recebedor: "",
    cpfCnpjRecebedor: "",
    numeroRecibo: ""
  });

  useEffect(() => {
    fetchUltimoNumeroRecibo();
  }, []);

  const fetchUltimoNumeroRecibo = async () => {
    try {
      const { data, error } = await supabase
        .from('recibos')
        .select('numero_recibo')
        .order('numero_recibo', { ascending: false })
        .limit(1);

      if (error) throw error;

      const proximoNumero = data && data.length > 0 ? data[0].numero_recibo + 1 : 1;
      setFormData(prev => ({
        ...prev,
        numeroRecibo: proximoNumero.toString()
      }));
    } catch (error) {
      console.error('Erro ao buscar número do recibo:', error);
      toast.error("Erro ao gerar número do recibo");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'valor') {
      const numeroFormatado = formatarNumero(value);
      setFormData(prev => ({
        ...prev,
        [name]: numeroFormatado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const valorNumerico = parseFloat(formData.valor.replace(/\./g, '').replace(',', '.')) / 100;
    const valorExtenso = valorPorExtenso(valorNumerico);

    doc.setFont("helvetica");
    doc.setFontSize(16);

    const logoUrl = "/lovable-uploads/c06539a6-198b-4a18-b7f4-6e3fdc4ffd9f.png";
    const img = new Image();
    img.src = logoUrl;
    
    const maxWidth = 100;  // Largura máxima em mm
    const maxHeight = 30;  // Altura máxima em mm
    
    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    const width = img.width * ratio;
    const height = img.height * ratio;
    
    const x = (210 - width) / 2; // 210 é a largura da página A4 em mm
    
    doc.addImage(logoUrl, 'JPEG', x, 15, width, height);

    doc.text("RECIBO", 105, 60, { align: "center" });
    doc.setFontSize(12);

    doc.text(`R$ ${valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 105, 80, { align: "center" });

    doc.setFontSize(12);
    const texto = `Recebi de ${formData.pagador}, CPF/CNPJ ${formData.cpfCnpj}, ` +
      `a importância de ${valorExtenso}, referente a ${formData.descricao}.`;

    const linhas = doc.splitTextToSize(texto, 180);
    doc.text(linhas, 15, 100);

    doc.text(`${formData.local}, ${new Date(formData.data).toLocaleDateString()}`, 15, 140);

    doc.line(15, 170, 195, 170);

    doc.text(`${formData.recebedor}`, 105, 180, { align: "center" });
    doc.text(`CPF/CNPJ: ${formData.cpfCnpjRecebedor}`, 105, 186, { align: "center" });

    return doc;
  };

  const saveRecibo = async (pdfUrl: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    const valorNumerico = parseFloat(formData.valor.replace(/\./g, '')) / 100;

    const { error } = await supabase.from("recibos").insert({
      user_id: user.id,
      pagador: formData.pagador,
      cpf_cnpj: formData.cpfCnpj,
      valor: valorNumerico,
      valor_extenso: valorPorExtenso(valorNumerico),
      descricao: formData.descricao,
      data: formData.data,
      local: formData.local,
      recebedor: formData.recebedor,
      cpf_cnpj_recebedor: formData.cpfCnpjRecebedor,
      pdf_url: pdfUrl
    });

    if (error) {
      toast.error("Erro ao salvar recibo");
      console.error(error);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const doc = generatePDF();
      const pdfBlob = doc.output('blob');
      
      const fileName = `recibos/${Date.now()}_recibo.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recibos')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recibos')
        .getPublicUrl(fileName);

      const saved = await saveRecibo(publicUrl);
      if (!saved) throw new Error("Erro ao salvar recibo");

      setPdfUrl(publicUrl);
      toast.success("Recibo gerado com sucesso!");
      
      window.open(publicUrl, '_blank');
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar recibo");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleDownload = async () => {
    if (pdfUrl) {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recibo.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerar Recibo</h2>
              <div className="flex gap-2">
                <div className="text-right">
                  <Label>Nº do Recibo</Label>
                  <Input
                    value={formData.numeroRecibo ? formatarNumeroRecibo(parseInt(formData.numeroRecibo)) : ""}
                    readOnly
                    className="text-right font-mono bg-gray-50"
                  />
                </div>
                {pdfUrl && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="flex gap-8 items-start justify-center mb-6">
                <img 
                  src="/lovable-uploads/c06539a6-198b-4a18-b7f4-6e3fdc4ffd9f.png"
                  alt="Logo Projeto Moriah"
                  className="h-24 w-auto"
                />
                <div className="text-sm space-y-2">
                  <div className="font-medium space-y-1">
                    <p>Lei Federal n° 12.101 De 27/11/2009</p>
                    <p>Lei Estadual n° 12.816 27/01/2020</p>
                    <p>Lei Municipal n° 5089/2020</p>
                  </div>
                  <div className="space-y-1 mt-4">
                    <p>Estrada Pitanga, 1266 - Dist. Iguatemi</p>
                    <p>Cep: 87103-089 - Maringá - PR</p>
                    <p>Fone: (44) 3276-3569</p>
                    <p>CNPJ: 01.725.957.0001-40</p>
                  </div>
                </div>
              </div>

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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados do Recibo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      name="valor"
                      value={formData.valor}
                      onChange={handleInputChange}
                      required
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor por Extenso</Label>
                    <Input
                      value={formData.valor ? valorPorExtenso(parseFloat(formData.valor.replace(/\./g, '').replace(',', '.'))) : ""}
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
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  'Gerar Recibo'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GerarRecibo;
