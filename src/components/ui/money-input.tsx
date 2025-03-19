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
    // Remove everything except digits and comma
    let apenasDigitos = valor.replace(/[^\d,]/g, '');
    
    // If empty, return empty string
    if (!apenasDigitos) return '';
    
    // Split into integer and decimal parts
    const partes = apenasDigitos.split(',');
    let parteInteira = partes[0] || '';
    let parteDecimal = partes.length > 1 ? partes[1].substring(0, 2) : '';
    
    // If decimal part exists but is less than 2 digits, pad with zeros
    if (partes.length > 1 && parteDecimal.length < 2) {
      parteDecimal = parteDecimal.padEnd(2, '0');
    }
    
    // Remove leading zeros from integer part (except if it's just zero)
    parteInteira = parteInteira === '' ? '0' : parteInteira.replace(/^0+(?=\d)/, '');
    
    // Format integer part with dots
    let formattedInteger = '';
    for (let i = 0; i < parteInteira.length; i++) {
      if (i > 0 && (parteInteira.length - i) % 3 === 0) {
        formattedInteger += '.';
      }
      formattedInteger += parteInteira[i];
    }
    
    // Return formatted value
    if (partes.length > 1) {
      return `${formattedInteger},${parteDecimal}`;
    } else {
      return formattedInteger;
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Save cursor position before formatting
    if (inputRef.current) {
      cursorPosition.current = inputRef.current.selectionStart;
    }
    
    const rawValue = e.target.value;
    const formatted = formatarValor(rawValue);
    setDisplayValue(formatted);
    
    // For the value that goes to the parent component state,
    // we keep it formatted
    onChange(formatted);
  };

  // Update display value when external value changes
  useEffect(() => {
    const formattedValue = formatarValor(value);
    setDisplayValue(formattedValue);
  }, [value]);

  // Restore cursor position after rendering
  useEffect(() => {
    if (inputRef.current && cursorPosition.current !== null) {
      // Adjust cursor position to compensate for formatting
      let adjustedPosition = cursorPosition.current;
      
      try {
        inputRef.current.setSelectionRange(adjustedPosition, adjustedPosition);
      } catch (e) {
        console.error("Error setting selection range:", e);
      }
      
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
