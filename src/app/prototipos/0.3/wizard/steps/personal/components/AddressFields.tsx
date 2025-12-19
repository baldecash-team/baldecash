'use client';

/**
 * AddressFields - Campos de direccion con Google Places
 *
 * 3 versiones para mapa de confirmacion:
 * V1 - Mapa pequeno debajo del campo
 * V2 - Mapa en modal de confirmacion
 * V3 - Sin mapa, solo texto
 *
 * 3 versiones para fallback:
 * V1 - Cambiar a campos manuales automaticamente
 * V2 - Boton "Ingresar manualmente"
 * V3 - Tooltip con instrucciones
 */

import React, { useState } from 'react';
import { Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { MapPin, Search, Check, AlertCircle, ChevronRight, HelpCircle, Edit } from 'lucide-react';

interface AddressFieldsProps {
  direccion: string;
  onDireccionChange: (value: string) => void;
  direccionDetalle: string;
  onDireccionDetalleChange: (value: string) => void;
  referencia: string;
  onReferenciaChange: (value: string) => void;
  mapVersion?: 1 | 2 | 3;
  fallbackVersion?: 1 | 2 | 3;
  error?: string;
  touched?: boolean;
  onBlur?: () => void;
}

// Mock address suggestions
const mockSuggestions = [
  'Av. Javier Prado Este 4200, La Molina, Lima',
  'Av. Javier Prado Oeste 1234, San Isidro, Lima',
  'Av. La Marina 2000, San Miguel, Lima',
  'Av. Arequipa 4500, Miraflores, Lima',
  'Av. Brasil 3000, Jesus Maria, Lima',
];

export const AddressFields: React.FC<AddressFieldsProps> = ({
  direccion,
  onDireccionChange,
  direccionDetalle,
  onDireccionDetalleChange,
  referencia,
  onReferenciaChange,
  mapVersion = 3,
  fallbackVersion = 2,
  error,
  touched,
  onBlur,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = async (value: string) => {
    onDireccionChange(value);
    setAddressConfirmed(false);

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setNoResults(false);
      return;
    }

    setIsSearching(true);
    setNoResults(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filtered = mockSuggestions.filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );

    if (filtered.length === 0 && value.length > 5) {
      setNoResults(true);
      handleFallback();
    }

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setIsSearching(false);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onDireccionChange(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);

    if (mapVersion === 2) {
      setShowMapModal(true);
    } else {
      setAddressConfirmed(true);
    }
  };

  const handleFallback = () => {
    switch (fallbackVersion) {
      case 1:
        // Auto switch to manual
        setShowManualFields(true);
        break;
      case 2:
        // Show button (handled in render)
        break;
      case 3:
        // Show tooltip (handled in render)
        break;
    }
  };

  const confirmAddress = () => {
    setAddressConfirmed(true);
    setShowMapModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Google Places Search */}
      {!showManualFields && (
        <div className="relative">
          <Input
            id="direccion"
            name="direccion"
            label="Direccion de entrega"
            placeholder="Busca tu direccion..."
            value={direccion}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
              onBlur?.();
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            startContent={<MapPin className="w-4 h-4 text-neutral-400" />}
            endContent={
              <>
                {isSearching && <div className="w-4 h-4 border-2 border-[#4654CD] border-t-transparent rounded-full animate-spin" />}
                {addressConfirmed && <Check className="w-5 h-5 text-[#22c55e]" />}
                {error && touched && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
              </>
            }
            classNames={{
              base: 'w-full',
              input: 'text-base outline-none',
              innerWrapper: 'bg-transparent',
              inputWrapper: `
                border-2 rounded-lg transition-all duration-200 bg-white shadow-none
                data-[focus-visible=true]:ring-0 data-[focus-visible=true]:ring-offset-0
                data-[hover=true]:bg-white
                ${error && touched ? 'border-[#ef4444] bg-[#ef4444]/5 data-[hover=true]:bg-[#ef4444]/5' : ''}
                ${addressConfirmed ? 'border-[#22c55e]' : ''}
                ${!error && !addressConfirmed ? 'border-neutral-300 hover:border-neutral-400 data-[focus=true]:border-[#4654CD]' : ''}
              `,
            }}
            description="Usaremos Google Maps para encontrar tu direccion exacta"
            errorMessage={touched ? error : undefined}
            isInvalid={!!error && touched}
          />

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-[#4654CD]/10 hover:text-[#4654CD] transition-colors cursor-pointer flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results + fallback */}
          {noResults && fallbackVersion === 2 && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700 mb-2">
                No encontramos tu direccion en Google Maps
              </p>
              <Button
                size="sm"
                variant="bordered"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => setShowManualFields(true)}
                className="cursor-pointer"
              >
                Ingresar manualmente
              </Button>
            </div>
          )}

          {noResults && fallbackVersion === 3 && (
            <div className="mt-2 flex items-start gap-2 text-sm text-amber-600">
              <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Intenta escribir tu direccion con mas detalle, incluyendo distrito y ciudad.
                Ej: "Av. Arequipa 1234, Miraflores, Lima"
              </span>
            </div>
          )}
        </div>
      )}

      {/* Map V1 - Small map below field */}
      {mapVersion === 1 && addressConfirmed && !showManualFields && (
        <div className="rounded-lg border border-neutral-200 overflow-hidden">
          <div className="h-32 bg-neutral-100 flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Mapa de Google Maps</p>
            </div>
          </div>
          <div className="p-3 bg-white border-t border-neutral-100">
            <p className="text-sm text-neutral-600 flex items-center gap-2">
              <Check className="w-4 h-4 text-[#22c55e]" />
              Direccion confirmada
            </p>
          </div>
        </div>
      )}

      {/* Manual fields (shown when fallback V1 or button clicked) */}
      {showManualFields && (
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700">Ingresa tu direccion manualmente</p>
            <Button
              size="sm"
              variant="light"
              onPress={() => {
                setShowManualFields(false);
                setNoResults(false);
              }}
              className="cursor-pointer text-[#4654CD]"
            >
              Volver a buscar
            </Button>
          </div>

          <Input
            label="Direccion"
            placeholder="Ej: Av. Javier Prado Este 4200"
            value={direccion}
            onChange={(e) => onDireccionChange(e.target.value)}
            classNames={{
              input: 'outline-none',
              innerWrapper: 'bg-transparent',
              inputWrapper: 'border-2 border-neutral-300 bg-white shadow-none data-[focus-visible=true]:ring-0 data-[focus-visible=true]:ring-offset-0 data-[hover=true]:bg-white data-[focus=true]:border-[#4654CD]',
            }}
          />
        </div>
      )}

      {/* Detail fields */}
      <Input
        id="direccionDetalle"
        name="direccionDetalle"
        label="Departamento, piso, oficina"
        placeholder="Ej: Dpto 401, Piso 4"
        value={direccionDetalle}
        onChange={(e) => onDireccionDetalleChange(e.target.value)}
        classNames={{
          base: 'w-full',
          input: 'outline-none',
          innerWrapper: 'bg-transparent',
          inputWrapper: 'border-2 border-neutral-300 bg-white shadow-none data-[focus-visible=true]:ring-0 data-[focus-visible=true]:ring-offset-0 data-[hover=true]:bg-white data-[focus=true]:border-[#4654CD]',
        }}
        description="Opcional"
      />

      <Input
        id="referencia"
        name="referencia"
        label="Referencia"
        placeholder="Ej: Frente al parque, al lado de la bodega"
        value={referencia}
        onChange={(e) => onReferenciaChange(e.target.value)}
        classNames={{
          base: 'w-full',
          input: 'outline-none',
          innerWrapper: 'bg-transparent',
          inputWrapper: 'border-2 border-neutral-300 bg-white shadow-none data-[focus-visible=true]:ring-0 data-[focus-visible=true]:ring-offset-0 data-[hover=true]:bg-white data-[focus=true]:border-[#4654CD]',
        }}
        description="Nos ayuda a ubicarte mas facil"
      />

      {/* Map Modal V2 */}
      <Modal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        backdrop="blur"
        scrollBehavior="outside"
        placement="center"
        classNames={{
          base: 'bg-white my-8',
          wrapper: 'items-center justify-center py-8 min-h-full',
          backdrop: 'bg-black/50',
          closeButton: 'cursor-pointer',
        }}
      >
        <ModalContent className="bg-white">
          <ModalHeader className="border-b border-neutral-100">
            Confirma tu direccion
          </ModalHeader>
          <ModalBody className="py-4">
            <div className="h-48 bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center text-neutral-500">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>Mapa de Google Maps</p>
              </div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="font-medium text-neutral-800">{direccion}</p>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-neutral-100">
            <Button
              variant="light"
              onPress={() => setShowMapModal(false)}
              className="cursor-pointer"
            >
              Corregir
            </Button>
            <Button
              className="bg-[#4654CD] text-white cursor-pointer"
              onPress={confirmAddress}
            >
              Confirmar direccion
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AddressFields;
