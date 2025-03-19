import { useState, useEffect } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Download, Printer, Star } from "lucide-react";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { MoneyInput } from "@/components/ui/money-input";

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
  const apenasDigitosEVirgula = valor.replace(/[^\d,]/g, '');
  
  if (!apenasDigitosEVirgula || !apenasDigitosEVirgula.match(/\d/)) return '';
  
  const partes = apenasDigitosEVirgula.split(',');
  let parteInteira = partes[0] || '0';
  const parteDecimal = partes.length > 1 ? partes[1].slice(0, 2) : '00';
  
  parteInteira = parteInteira === '0' ? '0' : parteInteira.replace(/^0+/, '');
  
  let parteInteiraFormatada = '';
  for (let i = 0; i < parteInteira.length; i++) {
    if (i > 0 && (parteInteira.length - i) % 3 === 0) {
      parteInteiraFormatada += '.';
    }
    parteInteiraFormatada += parteInteira[i];
  }
  
  const centavosFormatados = parteDecimal.padEnd(2, '0');
  
  return `${parteInteiraFormatada},${centavosFormatados}`;
};

const converterParaNumero = (valorFormatado: string): number => {
  if (!valorFormatado) return 0;
  
  try {
    const valorNumerico = valorFormatado.replace(/\./g, '').replace(',', '.');
    return parseFloat(valorNumerico);
  } catch (error) {
    console.error("Erro ao converter para número:", error);
    return 0;
  }
};

const formatarNumeroRecibo = (numero: number) => {
  return numero.toString().padStart(6, '0');
};

const formatarDataNumerica = (dataString: string) => {
  const data = new Date(dataString);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
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

interface Estado {
  sigla: string;
  nome: string;
}

interface Cidade {
  nome: string;
  estado: string;
}

interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
  cep: string;
}

interface RecebedorFavorito {
  id: string;
  nome: string;
  cpfCnpj: string;
  endereco: Endereco;
}

interface PagadorFavorito {
  id: string;
  nome: string;
  cpfCnpj: string;
}

const estados: Estado[] = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

const GerarRecibo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [cidadesRecebedor, setCidadesRecebedor] = useState<Cidade[]>([]);
  const [favoritos, setFavoritos] = useState<RecebedorFavorito[]>([]);
  const [pagadoresFavoritos, setPagadoresFavoritos] = useState<PagadorFavorito[]>([]);
  const [formData, setFormData] = useState({
    pagador: "",
    cpfCnpj: "",
    valor: "",
    descricao: "",
    data: new Date().toISOString().split('T')[0],
    local: "",
    estado: "PR",
    cidade: "Maringá",
    recebedor: "PROJETO MORIAH MARINGÁ",
    cpfCnpjRecebedor: "01.725.975/0001-40",
    enderecoRecebedor: {
      rua: "Estrada Pitanga",
      numero: "1266",
      bairro: "Distrito de Iguatemi",
      cidade: "Maringá",
      estado: "PR",
      complemento: "",
      cep: "87103-089"
    },
    numeroRecibo: ""
  });

  useEffect(() => {
    fetchUltimoNumeroRecibo();
    loadFavoritos();
    loadPagadoresFavoritos();
    
    handleEstadoChange(formData.estado);
    handleRecebedorEstadoChange(formData.enderecoRecebedor.estado);
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

  const loadFavoritos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('recebedores_favoritos')
        .select('*')
        .eq('is_public', true);

      if (error) throw error;
      
      const favoritosFormatados: RecebedorFavorito[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        cpfCnpj: item.cpf_cnpj,
        endereco: {
          rua: item.rua,
          numero: item.numero,
          bairro: item.bairro,
          cidade: item.cidade,
          estado: item.estado,
          complemento: item.complemento || '',
          cep: item.cep
        }
      }));
      
      setFavoritos(favoritosFormatados);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const loadPagadoresFavoritos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('pagadores_favoritos')
        .select('*')
        .eq('is_public', true);

      if (error) throw error;
      
      const favoritosFormatados: PagadorFavorito[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        cpfCnpj: item.cpf_cnpj,
      }));
      
      setPagadoresFavoritos(favoritosFormatados);
    } catch (error) {
      console.error('Erro ao carregar pagadores favoritos:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('enderecoRecebedor.')) {
      const campo = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        enderecoRecebedor: {
          ...prev.enderecoRecebedor,
          [campo]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleValorChange = (valor: string) => {
    setFormData(prev => ({
      ...prev,
      valor: valor
    }));
  };

  const handleEstadoChange = async (estado: string) => {
    setFormData(prev => ({
      ...prev,
      estado
    }));

    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
      const data = await response.json();
      setCidades(data.map((cidade: any) => ({
        nome: cidade.nome,
        estado: estado
      })));

      if (estado === 'PR') {
        setFormData(prev => ({
          ...prev,
          cidade: 'Maringá'
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          cidade: ""
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      toast.error("Erro ao carregar cidades");
    }
  };

  const handleRecebedorEstadoChange = async (estado: string) => {
    setFormData(prev => ({
      ...prev,
      enderecoRecebedor: {
        ...prev.enderecoRecebedor,
        estado
      }
    }));

    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
      const data = await response.json();
      setCidadesRecebedor(data.map((cidade: any) => ({
        nome: cidade.nome,
        estado: estado
      })));

      if (estado === 'PR') {
        setFormData(prev => ({
          ...prev,
          enderecoRecebedor: {
            ...prev.enderecoRecebedor,
            cidade: 'Maringá'
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          enderecoRecebedor: {
            ...prev.enderecoRecebedor,
            cidade: ""
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      toast.error("Erro ao carregar cidades");
    }
  };

  const handleFavoritoSelect = (favorito: RecebedorFavorito) => {
    setFormData(prev => ({
      ...prev,
      recebedor: favorito.nome,
      cpfCnpjRecebedor: favorito.cpfCnpj,
      enderecoRecebedor: favorito.endereco
    }));
    
    if (favorito.endereco.estado) {
      handleRecebedorEstadoChange(favorito.endereco.estado);
    }
  };

  const handlePagadorFavoritoSelect = (favorito: PagadorFavorito) => {
    setFormData(prev => ({
      ...prev,
      pagador: favorito.nome,
      cpfCnpj: favorito.cpfCnpj
    }));
  };

  const handleSaveFavorito = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para salvar favoritos");
        return;
      }

      const novoFavorito = {
        user_id: user.id,
        nome: formData.recebedor,
        cpf_cnpj: formData.cpfCnpjRecebedor,
        rua: formData.enderecoRecebedor.rua,
        numero: formData.enderecoRecebedor.numero,
        bairro: formData.enderecoRecebedor.bairro,
        cidade: formData.enderecoRecebedor.cidade,
        estado: formData.enderecoRecebedor.estado,
        complemento: formData.enderecoRecebedor.complemento || '',
        cep: formData.enderecoRecebedor.cep,
        is_public: true
      };

      const { data, error } = await supabase
        .from('recebedores_favoritos')
        .insert(novoFavorito)
        .select();

      if (error) throw error;
      
      toast.success("Recebedor salvo nos favoritos");
      loadFavoritos();
    } catch (error) {
      console.error('Erro ao salvar favorito:', error);
      toast.error("Erro ao salvar favorito");
    }
  };

  const handleSavePagadorFavorito = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para salvar favoritos");
        return;
      }

      if (!formData.pagador || !formData.cpfCnpj) {
        toast.error("Nome e CPF/CNPJ do pagador são obrigatórios");
        return;
      }

      const novoPagadorFavorito = {
        user_id: user.id,
        nome: formData.pagador,
        cpf_cnpj: formData.cpfCnpj,
        is_public: true
      };

      const { data, error } = await supabase
        .from('pagadores_favoritos')
        .insert(novoPagadorFavorito)
        .select();

      if (error) throw error;
      
      toast.success("Pagador salvo nos favoritos");
      loadPagadoresFavoritos();
    } catch (error) {
      console.error('Erro ao salvar pagador favorito:', error);
      toast.error("Erro ao salvar pagador favorito");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const valorExtenso = valorPorExtenso(converterParaNumero(formData.valor));
    const dataCompleta = formatarDataCompleta(formData.data);

    doc.setFont("helvetica");
    
    const logoUrl = "/lovable-uploads/c06539a6-198b-4a18-b7f4-6e3fdc4ffd9f.png";
    
    doc.setFillColor(76, 175, 80); // verde
    doc.rect(0, 0, 10, 297, 'F');
    
    doc.addImage(logoUrl, 'PNG', 15, 10, 60, 45);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE DOAÇÃO", 105, 90, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`RECIBO Nº: ${formData.numeroRecibo ? formatarNumeroRecibo(parseInt(formData.numeroRecibo)) : ""}`, 195, 30, { align: "right" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Lei Federal n° 12.101 De 27/11/2009", 195, 40, { align: "right" });
    doc.text("Lei Estadual n° 12.816 27/01/2020", 195, 45, { align: "right" });
    doc.text("Lei Municipal n° 5089/2020", 195, 50, { align: "right" });
    doc.text("Estrada Pitanga, 1266 - Dist. Iguatemi", 195, 60, { align: "right" });
    doc.text("Cep: 87103-089 - Maringá - PR", 195, 65, { align: "right" });
    doc.text("Fone: (44) 3276-3569", 195, 70, { align: "right" });
    doc.text("CNPJ: 01.725.957.0001-40", 195, 75, { align: "right" });

    doc.setFontSize(11);
    const inicioY = 120;
    const coluna1 = 20;
    const coluna2 = 65;

    doc.setFont("helvetica", "normal");
    doc.text("RECEBEMOS DE", coluna1, inicioY);
    
    doc.setFont("helvetica", "bold");
    doc.text(formData.pagador.toUpperCase() + ",", coluna2, inicioY);
    
    doc.setFont("helvetica", "normal");
    doc.text("A IMPORTÂNCIA DE", coluna1, inicioY + 20);
    
    doc.setFont("helvetica", "bold");
    doc.text(`R$ ${formData.valor}, (${valorExtenso.toUpperCase()}),`, coluna2, inicioY + 20);
    
    doc.setFont("helvetica", "normal");
    doc.text("REFERENTE A:", coluna1, inicioY + 40);
    
    doc.setFont("helvetica", "bold");
    doc.text(formData.descricao.toUpperCase(), coluna2, inicioY + 40);

    doc.setFont("helvetica", "italic");
    doc.text("e para clareza firmo(amos) o presente", 20, inicioY + 60);
    
    doc.setLineWidth(0.5);
    doc.line(105, inicioY + 95, 190, inicioY + 95);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${formData.recebedor} | ${formData.cpfCnpjRecebedor}`, 190, inicioY + 105, { align: "right" });
    doc.text(`${formData.enderecoRecebedor.cidade}/${formData.enderecoRecebedor.estado} | ${dataCompleta}`, 190, inicioY + 112, { align: "right" });
    
    doc.setFontSize(9);
    doc.text(`Endereço: ${formData.enderecoRecebedor.rua.toUpperCase()}`, 190, inicioY + 122, { align: "right" });
    doc.text(`${formData.enderecoRecebedor.cep}, ${formData.enderecoRecebedor.cidade.toUpperCase()}/${formData.enderecoRecebedor.estado}, ${formData.enderecoRecebedor.bairro.toUpperCase()}`, 190, inicioY + 129, { align: "right" });

    return doc;
  };

  const saveRecibo = async (pdfUrl: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    const valorNumerico = converterParaNumero(formData.valor);

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

  const resetToDefaultRecebedor = () => {
    setFormData(prev => ({
      ...prev,
      recebedor: "PROJETO MORIAH MARINGÁ",
      cpfCnpjRecebedor: "01.725.975/0001-40",
      enderecoRecebedor: {
        rua: "Estrada Pitanga",
        numero: "1266",
        bairro: "Distrito de Iguatemi",
        cidade: "Maringá",
        estado: "PR",
        complemento: "",
        cep: "87103-089"
      }
    }));

    handleRecebedorEstadoChange("PR");
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <Card className="max-w-4xl mx-auto shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Gerar Recibo</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="text-right w-full sm:w-auto">
                  <Label>Nº do Recibo</Label>
                  <Input
                    value={formData.numeroRecibo ? formatarNumeroRecibo(parseInt(formData.numeroRecibo)) : ""}
                    readOnly
                    className="text-right font-mono bg-gray-50"
                  />
                </div>
                {pdfUrl && (
                  <div className="flex gap-2 mt-4 sm:mt-auto">
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
              <div className="flex flex-col sm:flex-row gap-4 items-start justify-between mb-4 sm:mb-6">
                <img 
                  src="/lovable-uploads/c06539a6-198b-4a18-b7f4-6e3fdc4ffd9f.png"
                  alt="Logo Projeto Moriah"
                  className="h-20 sm:h-32 w-auto mx-auto sm:mx-0"
                />
                <div className="text-sm space-y-1 text-right w-full sm:w-auto">
                  <div className="font-medium space-y-1">
                    <p>Lei Federal n° 12.101 De 27/11/2009</p>
                    <p>Lei Estadual n° 12.816 27/01/2020</p>
                    <p>Lei Municipal n° 5089/2020</p>
                  </div>
                  <div className="space-y-1 mt-2 sm:mt-4">
                    <p>Estrada Pitanga, 1266 - Dist. Iguatemi</p>
                    <p>Cep: 87103-089 - Maringá - PR</p>
                    <p>Fone: (44) 3276-3569</p>
                    <p>CNPJ: 01.725.957.0001-40</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-row justify-between items-center">
                  <h3 className="text-lg font-semibold">Dados do Pagador</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleSavePagadorFavorito}
                  >
                    <Star className="h-4 w-4 mr-1" /> Salvar
                  </Button>
                </div>

                {pagadoresFavoritos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Favoritos</Label>
                    <Select onValueChange={(id) => {
                      const favorito = pagadoresFavoritos.find(f => f.id === id);
                      if (favorito) handlePagadorFavoritoSelect(favorito);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um
