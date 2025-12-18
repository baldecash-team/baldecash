'use client';

/**
 * LocationSelects - Selects cascada Departamento/Provincia/Distrito
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Select, SelectItem, Spinner } from '@nextui-org/react';
import { MapPin, ChevronDown, Check, AlertCircle } from 'lucide-react';
import {
  departamentos,
  provincias,
  distritos,
  type LocationOption,
} from '../types';

interface LocationSelectsProps {
  departamento: string;
  onDepartamentoChange: (value: string) => void;
  provincia: string;
  onProvinciaChange: (value: string) => void;
  distrito: string;
  onDistritoChange: (value: string) => void;
  errors?: {
    departamento?: string;
    provincia?: string;
    distrito?: string;
  };
  touched?: {
    departamento?: boolean;
    provincia?: boolean;
    distrito?: boolean;
  };
  onBlur?: (field: string) => void;
}

export const LocationSelects: React.FC<LocationSelectsProps> = ({
  departamento,
  onDepartamentoChange,
  provincia,
  onProvinciaChange,
  distrito,
  onDistritoChange,
  errors = {},
  touched = {},
  onBlur,
}) => {
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingDistritos, setLoadingDistritos] = useState(false);

  // Get available options based on selections
  const availableProvincias = useMemo(() => {
    return provincias[departamento] || [];
  }, [departamento]);

  const availableDistritos = useMemo(() => {
    return distritos[provincia] || [];
  }, [provincia]);

  // Simulate loading when parent changes
  useEffect(() => {
    if (departamento) {
      setLoadingProvincias(true);
      const timer = setTimeout(() => {
        setLoadingProvincias(false);
        onProvinciaChange('');
        onDistritoChange('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [departamento]);

  useEffect(() => {
    if (provincia) {
      setLoadingDistritos(true);
      const timer = setTimeout(() => {
        setLoadingDistritos(false);
        onDistritoChange('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [provincia]);

  const selectClassNames = (hasError: boolean, isValid: boolean) => ({
    base: 'w-full',
    trigger: `
      h-11 min-h-11 bg-white border-2 transition-all cursor-pointer
      ${hasError ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
      ${isValid && !hasError ? 'border-[#22c55e]' : ''}
      ${!hasError && !isValid ? 'border-neutral-300 hover:border-neutral-400 data-[focus=true]:border-[#4654CD]' : ''}
    `,
    value: 'text-sm text-neutral-700',
    popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
    listbox: 'p-1 bg-white',
    listboxWrapper: 'max-h-[300px] bg-white',
  });

  const itemClassNames = {
    base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
      text-neutral-700
      data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
      data-[selected=false]:data-[hover=true]:text-[#4654CD]
      data-[selected=true]:bg-[#4654CD]
      data-[selected=true]:text-white`,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
        <MapPin className="w-4 h-4 text-[#4654CD]" />
        Ubicacion de entrega
      </div>

      {/* Departamento */}
      <Select
        label="Departamento"
        placeholder="Selecciona departamento"
        selectedKeys={departamento ? [departamento] : []}
        onChange={(e) => onDepartamentoChange(e.target.value)}
        aria-label="Departamento"
        classNames={selectClassNames(
          !!errors.departamento && !!touched.departamento,
          !!departamento
        )}
        popoverProps={{
          classNames: {
            base: 'bg-white',
            content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
          },
        }}
        endContent={
          departamento && !errors.departamento ? (
            <Check className="w-4 h-4 text-[#22c55e]" />
          ) : errors.departamento && touched.departamento ? (
            <AlertCircle className="w-4 h-4 text-[#ef4444]" />
          ) : null
        }
        errorMessage={touched.departamento ? errors.departamento : undefined}
        isInvalid={!!errors.departamento && touched.departamento}
      >
        {departamentos.map((dep) => (
          <SelectItem key={dep.value} value={dep.value} classNames={itemClassNames}>
            {dep.label}
          </SelectItem>
        ))}
      </Select>

      {/* Provincia */}
      <Select
        label="Provincia"
        placeholder={
          !departamento
            ? 'Primero selecciona departamento'
            : loadingProvincias
              ? 'Cargando...'
              : 'Selecciona provincia'
        }
        selectedKeys={provincia ? [provincia] : []}
        onChange={(e) => onProvinciaChange(e.target.value)}
        isDisabled={!departamento || loadingProvincias}
        aria-label="Provincia"
        classNames={selectClassNames(
          !!errors.provincia && !!touched.provincia,
          !!provincia
        )}
        popoverProps={{
          classNames: {
            base: 'bg-white',
            content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
          },
        }}
        endContent={
          loadingProvincias ? (
            <Spinner size="sm" color="primary" />
          ) : provincia && !errors.provincia ? (
            <Check className="w-4 h-4 text-[#22c55e]" />
          ) : errors.provincia && touched.provincia ? (
            <AlertCircle className="w-4 h-4 text-[#ef4444]" />
          ) : null
        }
        errorMessage={touched.provincia ? errors.provincia : undefined}
        isInvalid={!!errors.provincia && touched.provincia}
      >
        {availableProvincias.map((prov) => (
          <SelectItem key={prov.value} value={prov.value} classNames={itemClassNames}>
            {prov.label}
          </SelectItem>
        ))}
      </Select>

      {/* Distrito */}
      <Select
        label="Distrito"
        placeholder={
          !provincia
            ? 'Primero selecciona provincia'
            : loadingDistritos
              ? 'Cargando...'
              : 'Selecciona distrito'
        }
        selectedKeys={distrito ? [distrito] : []}
        onChange={(e) => onDistritoChange(e.target.value)}
        isDisabled={!provincia || loadingDistritos}
        aria-label="Distrito"
        classNames={selectClassNames(
          !!errors.distrito && !!touched.distrito,
          !!distrito
        )}
        popoverProps={{
          classNames: {
            base: 'bg-white',
            content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
          },
        }}
        endContent={
          loadingDistritos ? (
            <Spinner size="sm" color="primary" />
          ) : distrito && !errors.distrito ? (
            <Check className="w-4 h-4 text-[#22c55e]" />
          ) : errors.distrito && touched.distrito ? (
            <AlertCircle className="w-4 h-4 text-[#ef4444]" />
          ) : null
        }
        errorMessage={touched.distrito ? errors.distrito : undefined}
        isInvalid={!!errors.distrito && touched.distrito}
      >
        {availableDistritos.map((dist) => (
          <SelectItem key={dist.value} value={dist.value} classNames={itemClassNames}>
            {dist.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default LocationSelects;
