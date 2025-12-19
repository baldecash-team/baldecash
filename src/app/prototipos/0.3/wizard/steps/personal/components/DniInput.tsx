'use client';

/**
 * DniInput - Campo de DNI con busqueda RENIEC
 *
 * Busca automaticamente datos en RENIEC al completar 8 digitos.
 */

import React, { useState, useEffect } from 'react';
import { Input, Spinner } from '@nextui-org/react';
import { Check, AlertCircle, CreditCard } from 'lucide-react';
import type { ReniecData } from '../types';

interface DniInputProps {
  value: string;
  onChange: (value: string) => void;
  onDataFetched: (data: ReniecData) => void;
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
  error?: string;
  disabled?: boolean;
}

// Mock RENIEC data
const mockReniecData: Record<string, ReniecData> = {
  '12345678': {
    nombres: 'MARIA ELENA',
    apellidos: 'GARCIA RODRIGUEZ',
    fechaNacimiento: '1998-05-15',
  },
  '87654321': {
    nombres: 'CARLOS ANDRES',
    apellidos: 'LOPEZ MENDOZA',
    fechaNacimiento: '2000-08-22',
  },
  '11111111': {
    nombres: 'JUAN PABLO',
    apellidos: 'MARTINEZ SILVA',
    fechaNacimiento: '1999-03-10',
  },
};

export const DniInput: React.FC<DniInputProps> = ({
  value,
  onChange,
  onDataFetched,
  onSearchStart,
  onSearchEnd,
  error,
  disabled = false,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [dataFound, setDataFound] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (value.length === 8 && !hasSearched) {
      searchDni(value);
    } else if (value.length < 8) {
      setDataFound(false);
      setSearchError(null);
      setHasSearched(false);
    }
  }, [value]);

  const searchDni = async (dni: string) => {
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    onSearchStart?.();

    try {
      // Simular llamada a API RENIEC
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const data = mockReniecData[dni];
      if (data) {
        onDataFetched(data);
        setDataFound(true);
      } else {
        // Generate random data for demo
        const randomData: ReniecData = {
          nombres: 'NOMBRE DEMO',
          apellidos: 'APELLIDO DEMO',
          fechaNacimiento: '1999-01-01',
        };
        onDataFetched(randomData);
        setDataFound(true);
      }
    } catch {
      setSearchError('No pudimos encontrar tus datos. Verifica tu DNI.');
      setDataFound(false);
    } finally {
      setIsSearching(false);
      onSearchEnd?.();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 8);
    onChange(newValue);
  };

  const displayError = error || searchError;

  return (
    <div className="space-y-2">
      <Input
        id="dni"
        name="dni"
        label="DNI"
        placeholder="Ej: 12345678"
        value={value}
        onChange={handleChange}
        maxLength={8}
        inputMode="numeric"
        isDisabled={disabled || isSearching}
        startContent={<CreditCard className="w-4 h-4 text-neutral-400" />}
        endContent={
          <div className="flex items-center gap-1">
            {isSearching && <Spinner size="sm" color="primary" />}
            {dataFound && !isSearching && <Check className="w-5 h-5 text-[#22c55e]" />}
            {displayError && !isSearching && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
          </div>
        }
        classNames={{
          base: 'w-full',
          input: 'text-base tracking-wider outline-none',
          innerWrapper: 'bg-transparent',
          inputWrapper: `
            border-2 rounded-lg transition-all duration-200 bg-white shadow-none
            data-[focus-visible=true]:ring-0 data-[focus-visible=true]:ring-offset-0
            data-[hover=true]:bg-white
            ${displayError ? 'border-[#ef4444] bg-[#ef4444]/5 data-[hover=true]:bg-[#ef4444]/5' : ''}
            ${dataFound && !displayError ? 'border-[#22c55e]' : ''}
            ${!displayError && !dataFound ? 'border-neutral-300 hover:border-neutral-400 data-[focus=true]:border-[#4654CD]' : ''}
          `,
        }}
        description={
          value.length > 0 && value.length < 8
            ? `${8 - value.length} digitos restantes`
            : undefined
        }
        errorMessage={displayError}
        isInvalid={!!displayError}
      />

      {isSearching && (
        <p className="text-sm text-[#4654CD] flex items-center gap-2">
          <Spinner size="sm" color="primary" />
          Buscando tus datos en RENIEC...
        </p>
      )}
    </div>
  );
};

export default DniInput;
