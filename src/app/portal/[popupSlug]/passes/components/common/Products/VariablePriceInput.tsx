'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ProductsPass } from '@/types/Products';
import { validateCustomAmount, getVariablePriceConfig } from '@/helpers/variablePrice';

interface VariablePriceInputProps {
  product: ProductsPass;
  value: number | undefined;
  onChange: (amount: number | undefined) => void;
  disabled?: boolean;
  className?: string;
}

const VariablePriceInput = ({
  product,
  value,
  onChange,
  disabled = false,
  className
}: VariablePriceInputProps) => {
  const config = getVariablePriceConfig(product);
  const [inputValue, setInputValue] = useState<string>(value?.toString() ?? '');
  const [isFocused, setIsFocused] = useState(false);

  const validation = validateCustomAmount(product, value);

  // Sync external value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value?.toString() ?? '');
    }
  }, [value, isFocused]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(rawValue);
    
    const numValue = rawValue ? parseInt(rawValue, 10) : undefined;
    onChange(numValue);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Format the value on blur
    if (value) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  if (!config) return null;

  const showError = !validation.isValid && value !== undefined;
  const showSuccess = validation.isValid && value !== undefined && value > 0;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Suggested: ${config.suggestedPrice.toLocaleString()}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span 
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-sm",
              disabled ? "text-neutral-300" : "text-neutral-500"
            )}
          >
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={config.minPrice.toLocaleString()}
            aria-label={`Custom amount for ${product.name}`}
            aria-invalid={showError}
            aria-describedby={showError ? `error-${product.id}` : undefined}
            className={cn(
              'w-full pl-7 pr-3 py-2 text-sm rounded-md border transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              disabled && 'bg-neutral-100 text-neutral-400 cursor-not-allowed',
              showError && 'border-red-400 focus:ring-red-400 bg-red-50',
              showSuccess && 'border-green-400 focus:ring-green-400 bg-green-50',
              !showError && !showSuccess && 'border-neutral-200 focus:ring-neutral-400'
            )}
          />
        </div>
        
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          Min ${config.minPrice.toLocaleString()}
          {config.maxPrice && ` · Max $${config.maxPrice.toLocaleString()}`}
        </div>
      </div>

      {showError && (
        <p 
          id={`error-${product.id}`}
          className="text-xs text-red-600"
          role="alert"
        >
          {validation.error}
        </p>
      )}
    </div>
  );
};

export default VariablePriceInput;
