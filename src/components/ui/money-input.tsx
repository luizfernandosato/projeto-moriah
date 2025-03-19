
import React, { useState, useRef, useEffect } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function MoneyInput({ 
  value, 
  onChange, 
  className, 
  placeholder = "0,00",
  ...props 
}: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPosition = useRef<number | null>(null);

  // Format the value for display
  const formatarValor = (valor: string): string => {
    // Remove tudo exceto dígitos e vírgula
    let apenasDigitos = valor.replace(/[^\d,]/g, '');
    
    // Se estiver vazio, retorna vazio
    if (!apenasDigitos) return '';
    
    // Separa em parte inteira e decimal
    const partes = apenasDigitos.split(',');
    let parteInteira = partes[0] || '';
    let parteDecimal = partes.length > 1 ? partes[1] : '';
    
    // Remove zeros à esquerda da parte inteira (exceto se for só zero)
    parteInteira = parteInteira === '' ? '0' : parteInteira.replace(/^0+(?=\d)/, '');
    
    // Formata a parte inteira com pontos
    let formattedInteger = '';
    for (let i = 0; i < parteInteira.length; i++) {
      if (i > 0 && (parteInteira.length - i) % 3 === 0) {
        formattedInteger += '.';
      }
      formattedInteger += parteInteira[i];
    }
    
    // Retorna o valor formatado
    if (partes.length > 1) {
      return `${formattedInteger},${parteDecimal}`;
    } else {
      return formattedInteger;
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Salva a posição do cursor antes da formatação
    if (inputRef.current) {
      cursorPosition.current = inputRef.current.selectionStart;
    }
    
    const rawValue = e.target.value;
    const formatted = formatarValor(rawValue);
    setDisplayValue(formatted);
    
    // Para o valor que vai para o estado do componente pai, 
    // mantemos apenas dígitos e vírgula
    const valueForState = formatted;
    onChange(valueForState);
  };

  // Atualiza o display value quando o valor externo muda
  useEffect(() => {
    setDisplayValue(formatarValor(value));
  }, [value]);

  // Restaura a posição do cursor após renderização
  useEffect(() => {
    if (inputRef.current && cursorPosition.current !== null) {
      // Ajusta a posição do cursor para compensar a formatação
      let adjustedPosition = cursorPosition.current;
      const prevValueLength = displayValue.length;
      const currentValueLength = inputRef.current.value.length;
      
      // Se o comprimento mudou devido à formatação, ajusta a posição
      if (prevValueLength !== currentValueLength) {
        const diff = currentValueLength - prevValueLength;
        adjustedPosition = Math.min(adjustedPosition + diff, currentValueLength);
      }
      
      inputRef.current.setSelectionRange(adjustedPosition, adjustedPosition);
      cursorPosition.current = null;
    }
  }, [displayValue]);

  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
        R$
      </span>
      <Input
        ref={inputRef}
        type="text"
        inputMode="text"
        className={cn("pl-10", className)}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        autoComplete="off"
        {...props}
      />
    </div>
  );
}
