
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
  const previousFormattedLength = useRef<number>(0);

  // Format value for display
  const formatValue = (rawValue: string): string => {
    // Remove anything that's not a digit or comma
    const cleanValue = rawValue.replace(/[^\d,]/g, '');
    
    // If empty, return empty string
    if (!cleanValue) return '';
    
    // Split into integer and decimal parts
    const parts = cleanValue.split(',');
    let integerPart = parts[0] || '';
    let decimalPart = parts.length > 1 ? parts[1].substring(0, 2) : '';
    
    // Remove leading zeros from integer part (except if it's just zero)
    integerPart = integerPart === '' ? '0' : integerPart.replace(/^0+(?=\d)/, '');
    
    // Format integer part with dots for thousand separators
    let formattedInteger = '';
    for (let i = 0; i < integerPart.length; i++) {
      if (i > 0 && (integerPart.length - i) % 3 === 0) {
        formattedInteger += '.';
      }
      formattedInteger += integerPart[i];
    }
    
    // For display, always show two decimal places
    if (parts.length > 1) {
      return `${formattedInteger},${decimalPart.padEnd(2, '0')}`;
    } else {
      return `${formattedInteger},00`;
    }
  };

  // Calculate cursor position after formatting
  const calculateCursorPosition = (
    oldValue: string, 
    newValue: string, 
    currentCursorPosition: number
  ): number => {
    if (!oldValue || !newValue) return newValue.length;

    const oldDotCountBeforeCursor = (oldValue.substring(0, currentCursorPosition).match(/\./g) || []).length;
    const newDotCountBeforeCursor = (newValue.substring(0, currentCursorPosition).match(/\./g) || []).length;
    const dotDifference = newDotCountBeforeCursor - oldDotCountBeforeCursor;

    return currentCursorPosition + dotDifference;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;
    
    // Save cursor position before formatting
    const currentCursorPosition = inputRef.current.selectionStart || 0;
    const oldFormattedValue = displayValue;
    
    // Get raw input and format it
    const rawValue = e.target.value;
    const formatted = formatValue(rawValue);
    
    // Calculate new cursor position
    if (formatted !== oldFormattedValue) {
      cursorPosition.current = calculateCursorPosition(
        oldFormattedValue,
        formatted,
        currentCursorPosition
      );
      previousFormattedLength.current = formatted.length;
    }
    
    setDisplayValue(formatted);
    onChange(formatted);
  };

  // Update display value when external value changes
  useEffect(() => {
    const formattedValue = formatValue(value);
    if (formattedValue !== displayValue) {
      setDisplayValue(formattedValue);
    }
  }, [value]);

  // Restore cursor position after rendering
  useEffect(() => {
    if (inputRef.current && cursorPosition.current !== null) {
      const pos = Math.min(cursorPosition.current, displayValue.length);
      
      try {
        inputRef.current.setSelectionRange(pos, pos);
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
        inputMode="decimal"
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
