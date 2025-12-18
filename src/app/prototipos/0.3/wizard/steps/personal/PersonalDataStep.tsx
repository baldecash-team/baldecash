'use client';

/**
 * PersonalDataStep - Paso de datos personales del wizard
 *
 * Incluye:
 * - Input de DNI con busqueda RENIEC
 * - Autocompletado de nombres y fecha
 * - Campos de contacto
 * - Ubicacion con selects cascada
 * - Direccion con Google Places
 * - Checkbox de terminos
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';

import { DniInput } from './components/DniInput';
import { DniAutocompleteFeedback } from './components/DniAutocompleteFeedback';
import { ContactFields } from './components/ContactFields';
import { LocationSelects } from './components/LocationSelects';
import { AddressFields } from './components/AddressFields';
import { TermsCheckbox } from './components/TermsCheckbox';
import {
  PersonalFormData,
  defaultPersonalFormData,
  PersonalStepConfig,
  defaultPersonalStepConfig,
  ReniecData,
} from './types';

interface PersonalDataStepProps {
  config?: PersonalStepConfig;
  onComplete?: (data: PersonalFormData) => void;
  initialData?: Partial<PersonalFormData>;
}

export const PersonalDataStep: React.FC<PersonalDataStepProps> = ({
  config = defaultPersonalStepConfig,
  onComplete,
  initialData,
}) => {
  // Form state
  const [formData, setFormData] = useState<PersonalFormData>({
    ...defaultPersonalFormData,
    ...initialData,
  });

  // RENIEC state
  const [isLoadingReniec, setIsLoadingReniec] = useState(false);
  const [reniecData, setReniecData] = useState<ReniecData | null>(null);

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof PersonalFormData>(
    field: K,
    value: PersonalFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    let error = '';

    switch (field) {
      case 'dni':
        if (!formData.dni) error = 'Ingresa tu DNI';
        else if (formData.dni.length !== 8) error = 'El DNI debe tener 8 digitos';
        break;
      case 'celular':
        if (!formData.celular) error = 'Ingresa tu numero de celular';
        else if (!formData.celular.startsWith('9')) error = 'El numero debe empezar con 9';
        else if (formData.celular.length !== 9) error = 'El numero debe tener 9 digitos';
        break;
      case 'email':
        if (!formData.email) error = 'Ingresa tu correo electronico';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) error = 'Ingresa un correo valido';
        break;
      case 'whatsapp':
        if (formData.whatsappDiferente && !formData.whatsapp) error = 'Ingresa tu numero de WhatsApp';
        else if (formData.whatsappDiferente && !formData.whatsapp.startsWith('9')) error = 'El numero debe empezar con 9';
        break;
      case 'departamento':
        if (!formData.departamento) error = 'Selecciona tu departamento';
        break;
      case 'provincia':
        if (!formData.provincia) error = 'Selecciona tu provincia';
        break;
      case 'distrito':
        if (!formData.distrito) error = 'Selecciona tu distrito';
        break;
      case 'direccion':
        if (!formData.direccion) error = 'Ingresa tu direccion de entrega';
        break;
      case 'aceptaTerminos':
        if (!formData.aceptaTerminos) error = 'Debes aceptar los terminos y condiciones';
        break;
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }

    return !error;
  };

  const handleReniecData = (data: ReniecData) => {
    setReniecData(data);
    setFormData((prev) => ({
      ...prev,
      nombres: data.nombres,
      apellidos: data.apellidos,
      fechaNacimiento: data.fechaNacimiento,
    }));
  };

  const validateForm = (): boolean => {
    const fields = [
      'dni', 'celular', 'email', 'departamento', 'provincia',
      'distrito', 'direccion', 'aceptaTerminos'
    ];

    if (formData.whatsappDiferente) {
      fields.push('whatsapp');
    }

    let isValid = true;
    fields.forEach((field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete?.(formData);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
          <User className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-800">
            Datos Personales
          </h2>
          <p className="text-sm text-neutral-500">
            Ingresa tu DNI y completaremos tus datos
          </p>
        </div>
      </div>

      {/* DNI Section */}
      <section className="space-y-4">
        <DniInput
          value={formData.dni}
          onChange={(value) => updateField('dni', value)}
          onDataFetched={handleReniecData}
          onSearchStart={() => setIsLoadingReniec(true)}
          onSearchEnd={() => setIsLoadingReniec(false)}
          error={touched.dni ? errors.dni : undefined}
        />

        {/* Autocomplete feedback */}
        {(isLoadingReniec || reniecData) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DniAutocompleteFeedback
              isLoading={isLoadingReniec}
              data={reniecData}
              version={config.dniLoadingVersion}
              dataAppearVersion={config.dataAppearVersion}
            />
          </motion.div>
        )}
      </section>

      {/* Contact Section - Only show after RENIEC data */}
      {reniecData && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 pt-4 border-t border-neutral-200"
        >
          <h3 className="text-sm font-semibold text-[#4654CD]">
            Datos de Contacto
          </h3>
          <ContactFields
            celular={formData.celular}
            onCelularChange={(value) => updateField('celular', value)}
            email={formData.email}
            onEmailChange={(value) => updateField('email', value)}
            whatsappDiferente={formData.whatsappDiferente}
            onWhatsappDiferenteChange={(value) => updateField('whatsappDiferente', value)}
            whatsapp={formData.whatsapp}
            onWhatsappChange={(value) => updateField('whatsapp', value)}
            errors={{
              celular: errors.celular,
              email: errors.email,
              whatsapp: errors.whatsapp,
            }}
            touched={{
              celular: touched.celular,
              email: touched.email,
              whatsapp: touched.whatsapp,
            }}
            onBlur={handleBlur}
          />
        </motion.section>
      )}

      {/* Location Section - Only show after contact */}
      {reniecData && formData.celular && formData.email && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 pt-4 border-t border-neutral-200"
        >
          <LocationSelects
            departamento={formData.departamento}
            onDepartamentoChange={(value) => updateField('departamento', value)}
            provincia={formData.provincia}
            onProvinciaChange={(value) => updateField('provincia', value)}
            distrito={formData.distrito}
            onDistritoChange={(value) => updateField('distrito', value)}
            errors={{
              departamento: errors.departamento,
              provincia: errors.provincia,
              distrito: errors.distrito,
            }}
            touched={{
              departamento: touched.departamento,
              provincia: touched.provincia,
              distrito: touched.distrito,
            }}
            onBlur={handleBlur}
          />
        </motion.section>
      )}

      {/* Address Section - Only show after location */}
      {formData.distrito && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 pt-4 border-t border-neutral-200"
        >
          <AddressFields
            direccion={formData.direccion}
            onDireccionChange={(value) => updateField('direccion', value)}
            direccionDetalle={formData.direccionDetalle}
            onDireccionDetalleChange={(value) => updateField('direccionDetalle', value)}
            referencia={formData.referencia}
            onReferenciaChange={(value) => updateField('referencia', value)}
            mapVersion={config.mapConfirmVersion}
            fallbackVersion={config.addressFallbackVersion}
            error={errors.direccion}
            touched={touched.direccion}
            onBlur={() => handleBlur('direccion')}
          />
        </motion.section>
      )}

      {/* Terms Section - Only show after address */}
      {formData.direccion && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 pt-4 border-t border-neutral-200"
        >
          <TermsCheckbox
            checked={formData.aceptaTerminos}
            onChange={(value) => updateField('aceptaTerminos', value)}
            version={config.termsLinkVersion}
            error={touched.aceptaTerminos ? errors.aceptaTerminos : undefined}
          />
        </motion.section>
      )}

      {/* Submit button */}
      {formData.direccion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="pt-4"
        >
          <Button
            className="w-full bg-[#4654CD] text-white font-semibold h-12 cursor-pointer"
            endContent={<ArrowRight className="w-5 h-5" />}
            onPress={handleSubmit}
          >
            Continuar
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default PersonalDataStep;
