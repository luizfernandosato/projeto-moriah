
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

  // Format value for display
  const formatValue = (rawValue: string): string => {
    // Remove anything that's not a digit or comma
    let cleanValue = rawValue.replace(/[^\d,]/g, '');
    
    // If empty, return empty string
    if (!cleanValue) return '';
    
    // Split into integer and decimal parts
    const parts = cleanValue.split(',');
    let integerPart = parts[0] || '';
    const decimalPart = parts.length > 1 ? parts[1].substring(0, 2) : '';
    
    // Remove leading zeros from integer part (except if it's just zero)
    integerPart = integerPart === '' ? '0' : integerPart.replace(/^0+(?=\d)/, '');
    
    // Format integer part with dots for thousand separators
    const integerValue = parseInt(integerPart, 10);
    const formattedInteger = !isNaN(integerValue) 
      ? integerValue.toLocaleString('pt-BR', { 
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          useGrouping: true 
        })
      : '0';
    
    // Build final string with two decimal places
    return `${formattedInteger},${decimalPart.padEnd(2, '0')}`;
  };

  // Handle input changes with proper cursor management
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;
    
    // Save cursor position before formatting
    const selectionStart = inputRef.current.selectionStart || 0;
    const selectionEnd = inputRef.current.selectionEnd || 0;
    const oldValue = e.target.value;
    
    // Get raw input value - filter to only allow digits and one comma
    let rawValue = e.target.value;
    
    // Format the value
    const formattedValue = formatValue(rawValue);
    
    // Check if we're dealing with a deletion
    const isDeletion = oldValue.length > rawValue.length;
    
    // Set the formatted value
    setDisplayValue(formattedValue);
    onChange(formattedValue);

    // Calculate new cursor position (will be set in useEffect after render)
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = calculateCursorPosition(
          oldValue, 
          formattedValue, 
          selectionStart, 
          isDeletion
        );
        
        try {
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        } catch (e) {
          console.error("Error setting selection range:", e);
        }
      }
    }, 0);
  };

  // Calculate cursor position after formatting
  const calculateCursorPosition = (
    oldValue: string,
    newValue: string,
    cursorPos: number,
    isDeletion: boolean
  ): number => {
    // If old and new are the same, don't move cursor
    if (oldValue === newValue) return cursorPos;
    
    // If the field was cleared, position at start
    if (!newValue) return 0;
    
    // Count dots before cursor in old value
    const oldDotsBeforeCursor = (oldValue.substring(0, cursorPos).match(/\./g) || []).length;
    
    // Count digits before cursor in old value (excluding dots)
    const oldDigitsBeforeCursor = oldValue.substring(0, cursorPos).replace(/\./g, '').replace(/[^\d,]/g, '').length;
    
    // Find position in new value with the same number of digits
    let newCursorPos = 0;
    let digitCount = 0;
    
    for (let i = 0; i < newValue.length; i++) {
      if (/\d|,/.test(newValue[i])) {
        digitCount++;
      }
      
      if (digitCount > oldDigitsBeforeCursor) {
        newCursorPos = i;
        break;
      }
      
      newCursorPos = i + 1;
    }

    // Adjust for deletion
    if (isDeletion) {
      // Find the position after the last digit before cursor
      let lastDigitPos = newCursorPos;
      while (lastDigitPos > 0 && !/\d/.test(newValue[lastDigitPos - 1])) {
        lastDigitPos--;
      }
      
      return lastDigitPos;
    }
    
    return newCursorPos;
  };

  // Update display value when external value changes
  useEffect(() => {
    const formattedValue = formatValue(value);
    if (formattedValue !== displayValue) {
      setDisplayValue(formattedValue);
    }
  }, [value]);

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
