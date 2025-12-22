'use client';

/**
 * StepContent - Renderiza el contenido de cada paso
 * Maneja los campos del formulario segun la configuracion
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { CheckCircle } from 'lucide-react';
import type { WizardSolicitudStep, WizardSolicitudConfig, SelectedProduct } from '../../../types/wizard-solicitud';

// Field components - dynamic version selection
import { getInputField, getSelectCards, getUploadField } from '../fields';
import { DatePickerField } from '../fields/DatePickerField';

interface StepContentProps {
  step: WizardSolicitudStep;
  config: WizardSolicitudConfig;
  formData: Record<string, unknown>;
  errors: Record<string, string>;
  onFieldChange: (name: string, value: unknown) => void;
  selectedProduct?: SelectedProduct;
}

export const StepContent: React.FC<StepContentProps> = ({
  step,
  config,
  formData,
  errors,
  onFieldChange,
  selectedProduct,
}) => {
  // Paso de resumen
  if (step.code === 'resumen') {
    return (
      <div className="space-y-4">
        <Card className="border border-neutral-200">
          <CardBody className="p-4">
            <h3 className="font-semibold text-neutral-800 mb-3">Datos Personales</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Nombre:</span>
                <span className="text-neutral-800">
                  {String(formData.nombres || '')} {String(formData.apellidos || '')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">DNI:</span>
                <span className="text-neutral-800">{String(formData.dni || '-')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Email:</span>
                <span className="text-neutral-800">{String(formData.email || '-')}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-neutral-200">
          <CardBody className="p-4">
            <h3 className="font-semibold text-neutral-800 mb-3">Datos Academicos</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Institucion:</span>
                <span className="text-neutral-800">{String(formData.institucion || '-')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Carrera:</span>
                <span className="text-neutral-800">{String(formData.carrera || '-')}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {selectedProduct && (
          <Card className="border-2 border-[#4654CD]/20 bg-[#4654CD]/5">
            <CardBody className="p-4">
              <h3 className="font-semibold text-neutral-800 mb-3">Tu Producto</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.thumbnail}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div>
                  <p className="font-medium text-neutral-800">{selectedProduct.name}</p>
                  <p className="text-2xl font-bold text-[#4654CD]">
                    S/{selectedProduct.monthlyQuota}/mes
                  </p>
                  <p className="text-xs text-neutral-500">
                    x {selectedProduct.months} meses = S/{selectedProduct.totalPrice}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="flex items-center gap-2 text-sm text-[#22c55e] bg-[#22c55e]/10 p-3 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span>Al enviar, recibiras respuesta en menos de 24 horas</span>
        </div>
      </div>
    );
  }

  // Obtener componentes segun config
  const InputField = getInputField(config.inputVersion);
  const SelectCards = getSelectCards(config.optionsVersion);
  const UploadField = getUploadField(config.uploadVersion);

  // Pasos con campos
  return (
    <div className="space-y-4 pb-24">
      {step.fields.map((field) => {
        const value = formData[field.name];
        const error = errors[field.name];

        // Campos de tipo select/radio con pocas opciones -> usar cards
        if (
          (field.type === 'select' || field.type === 'radio') &&
          field.options &&
          field.options.length <= (field.maxOptions || 6)
        ) {
          return (
            <SelectCards
              key={field.name}
              field={field}
              value={value as string}
              error={error}
              onChange={(val) => onFieldChange(field.name, val)}
              helpVersion={config.helpVersion}
            />
          );
        }

        // Campos de upload
        if (field.type === 'upload') {
          return (
            <UploadField
              key={field.name}
              field={field}
              value={value}
              error={error}
              onChange={(val) => onFieldChange(field.name, val)}
              helpVersion={config.helpVersion}
            />
          );
        }

        // Campos de fecha
        if (field.type === 'date') {
          return (
            <DatePickerField
              key={field.name}
              field={field}
              value={value as string}
              error={error}
              onChange={(val) => onFieldChange(field.name, val)}
              helpVersion={config.helpVersion}
              inputVersion={config.inputVersion}
            />
          );
        }

        // Campos de texto y otros
        return (
          <InputField
            key={field.name}
            field={field}
            value={value as string}
            error={error}
            onChange={(val) => onFieldChange(field.name, val)}
            helpVersion={config.helpVersion}
          />
        );
      })}
    </div>
  );
};

export default StepContent;
