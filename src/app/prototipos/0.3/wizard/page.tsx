'use client';

/**
 * Wizard Fields Preview - v0.3
 *
 * Pagina de preview para probar todos los componentes de campos
 * con configuracion de versiones A/B
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { FloatingControls } from '@/app/prototipos/_shared/components/FloatingControls';

// Types
import { WizardConfig, defaultWizardConfig, UploadedFile, FieldOption } from './types/fields';

// Components
import { TextInputV1, TextInputV2, TextInputV3 } from './components/fields/inputs';
import { CheckboxV1, CheckboxV2, RadioGroupV1, RadioGroupV2, RadioGroupV3 } from './components/fields/checkboxes';
import { SelectDropdown, SearchableSelect, DependentSelect } from './components/fields/selects';
import { FileUploadV1, FileUploadV2, FileUploadV3 } from './components/fields/upload';
import { FieldError, FieldSuccess, ValidationSummary } from './components/fields/validation';
import { FieldTooltip, ContextualHelp, DocumentExample } from './components/fields/help';
import { FieldsSettingsModal } from './components/fields/FieldsSettingsModal';

// Mock data
const mockUniversidades: FieldOption[] = [
  { value: 'pucp', label: 'PUCP - Pontificia Universidad Catolica del Peru' },
  { value: 'unmsm', label: 'UNMSM - Universidad Nacional Mayor de San Marcos' },
  { value: 'ulima', label: 'Universidad de Lima' },
  { value: 'up', label: 'Universidad del Pacifico' },
  { value: 'upc', label: 'UPC - Universidad Peruana de Ciencias Aplicadas' },
  { value: 'usil', label: 'USIL - Universidad San Ignacio de Loyola' },
];

const mockCarreras: Record<string, FieldOption[]> = {
  pucp: [
    { value: 'ing-info', label: 'Ingenieria Informatica' },
    { value: 'ing-civil', label: 'Ingenieria Civil' },
    { value: 'derecho', label: 'Derecho' },
  ],
  unmsm: [
    { value: 'medicina', label: 'Medicina Humana' },
    { value: 'contab', label: 'Contabilidad' },
    { value: 'ing-sistemas', label: 'Ingenieria de Sistemas' },
  ],
  ulima: [
    { value: 'admin', label: 'Administracion' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'economia', label: 'Economia' },
  ],
};

const occupationOptions: FieldOption[] = [
  { value: 'estudiante', label: 'Solo estudiante' },
  { value: 'trabajador', label: 'Trabajador dependiente' },
  { value: 'independiente', label: 'Trabajador independiente' },
  { value: 'emprendedor', label: 'Emprendedor / Negocio propio' },
];

const documentExamples = [
  {
    id: '1',
    title: 'DNI frontal',
    description: 'Foto clara, bien iluminada',
    imageUrl: undefined,
    isValid: true,
  },
  {
    id: '2',
    title: 'DNI borroso',
    description: 'Foto fuera de foco, no aceptada',
    imageUrl: undefined,
    isValid: false,
  },
];

export default function WizardPreviewPage() {
  // Settings
  const [config, setConfig] = useState<WizardConfig>(defaultWizardConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [universidad, setUniversidad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [ocupacion, setOcupacion] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPromo, setAceptaPromo] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);

  // Get input component based on version
  const TextInput = config.inputVersion === 1 ? TextInputV1 : config.inputVersion === 2 ? TextInputV2 : TextInputV3;
  const RadioGroup = config.radioVersion === 1 ? RadioGroupV1 : config.radioVersion === 2 ? RadioGroupV2 : RadioGroupV3;
  const FileUpload = config.uploadVersion === 1 ? FileUploadV1 : config.uploadVersion === 2 ? FileUploadV2 : FileUploadV3;

  const handleSubmit = () => {
    setShowErrors(true);
    setTouched({
      nombre: true,
      email: true,
      telefono: true,
      universidad: true,
      ocupacion: true,
    });
  };

  const loadCarreras = async (universidadId: string): Promise<FieldOption[]> => {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockCarreras[universidadId] || [];
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/prototipos/0.3" className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-neutral-800">
                Campos de Formulario
              </h1>
              <p className="text-xs text-neutral-500">
                Seccion 09 - Form Campos v0.3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/prototipos/0.3">
              <Button
                isIconOnly
                variant="light"
                className="cursor-pointer"
              >
                <Home className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Section: Datos Personales */}
          <section>
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
              Datos Personales
            </h2>
            <div className="space-y-4">
              <TextInput
                id="nombre"
                name="nombre"
                label="Nombre completo"
                placeholder="Ej: Juan Carlos Perez"
                required
                value={nombre}
                onChange={setNombre}
                onBlur={() => setTouched({ ...touched, nombre: true })}
                error={touched.nombre && !nombre ? 'Este campo es requerido' : undefined}
                isValid={touched.nombre && !!nombre}
              />

              <TextInput
                id="email"
                name="email"
                label="Correo electronico"
                placeholder="Ej: juan@universidad.edu.pe"
                type="email"
                required
                value={email}
                onChange={setEmail}
                onBlur={() => setTouched({ ...touched, email: true })}
                error={touched.email && !email ? 'Este campo es requerido' : undefined}
                isValid={touched.email && !!email}
                helpText="Usaremos este correo para enviarte informacion de tu solicitud"
              />

              <TextInput
                id="telefono"
                name="telefono"
                label="Celular"
                placeholder="Ej: 999 999 999"
                type="tel"
                required
                value={telefono}
                onChange={setTelefono}
                onBlur={() => setTouched({ ...touched, telefono: true })}
                error={touched.telefono && !telefono ? 'Este campo es requerido' : undefined}
                isValid={touched.telefono && !!telefono}
                maxLength={9}
              />
            </div>
          </section>

          {/* Section: Informacion Academica */}
          <section>
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
              Informacion Academica
            </h2>
            <div className="space-y-4">
              <SearchableSelect
                id="universidad"
                name="universidad"
                label="Universidad"
                placeholder="Busca tu universidad..."
                required
                value={universidad}
                onChange={(v) => {
                  setUniversidad(v);
                  setCarrera(''); // Reset carrera when university changes
                }}
                onBlur={() => setTouched({ ...touched, universidad: true })}
                options={mockUniversidades}
                error={touched.universidad && !universidad ? 'Selecciona tu universidad' : undefined}
                isValid={touched.universidad && !!universidad}
                helpText="Si no encuentras tu universidad, contactanos"
              />

              <DependentSelect
                id="carrera"
                name="carrera"
                label="Carrera"
                placeholder="Selecciona tu carrera"
                parentValue={universidad}
                parentLabel="tu universidad"
                loadOptions={loadCarreras}
                value={carrera}
                onChange={setCarrera}
                searchable
              />
            </div>
          </section>

          {/* Section: Situacion Laboral */}
          <section>
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
              Situacion Laboral
            </h2>
            <div className="space-y-4">
              <RadioGroup
                name="ocupacion"
                label="¿Cual es tu ocupacion actual?"
                options={occupationOptions}
                value={ocupacion}
                onChange={setOcupacion}
                required
                error={showErrors && !ocupacion ? 'Selecciona una opcion' : undefined}
              />
            </div>
          </section>

          {/* Section: Documentos */}
          <section>
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
              Documentos
              <span className="ml-2">
                <DocumentExample
                  title="Ejemplo de DNI"
                  examples={documentExamples}
                  version={config.documentExampleVersion}
                />
              </span>
            </h2>
            <div className="space-y-4">
              <FileUpload
                id="dni"
                label="DNI (ambos lados)"
                accept="image/*,.pdf"
                maxSize={5 * 1024 * 1024}
                files={files}
                onFilesChange={setFiles}
                helpText="Sube una foto clara de tu DNI"
                multiple
              />
            </div>
          </section>

          {/* Section: Terminos */}
          <section>
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
              Terminos y Condiciones
            </h2>
            <div className="space-y-3">
              <CheckboxV1
                id="terminos"
                label="Acepto los terminos y condiciones"
                description="He leido y acepto los terminos de uso y la politica de privacidad"
                checked={aceptaTerminos}
                onChange={setAceptaTerminos}
                error={showErrors && !aceptaTerminos ? 'Debes aceptar los terminos' : undefined}
              />

              <CheckboxV1
                id="promo"
                label="Quiero recibir promociones"
                description="Acepto recibir ofertas y novedades por correo electronico"
                checked={aceptaPromo}
                onChange={setAceptaPromo}
              />
            </div>
          </section>

          {/* Validation feedback demo */}
          {showErrors && (!nombre || !email || !telefono || !ocupacion || !aceptaTerminos) && (
            <section>
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                Demo: Resumen de Errores
              </h2>
              <ValidationSummary
                errors={[
                  !nombre ? { field: 'nombre', message: 'Ingresa tu nombre completo' } : null,
                  !email ? { field: 'email', message: 'Ingresa tu correo electronico' } : null,
                  !telefono ? { field: 'telefono', message: 'Ingresa tu numero de celular' } : null,
                  !ocupacion ? { field: 'ocupacion', message: 'Selecciona tu ocupacion' } : null,
                  !aceptaTerminos ? { field: 'terminos', message: 'Debes aceptar los terminos' } : null,
                ].filter(Boolean) as Array<{ field: string; message: string }>}
              />
            </section>
          )}

          {/* Help Components Demo */}
          <section>
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
              Demo: Componentes de Ayuda
            </h2>
            <div className="space-y-4 bg-white p-4 rounded-lg border border-neutral-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-600">Tooltip:</span>
                <FieldTooltip content="Este es un tooltip de ayuda con informacion adicional sobre el campo." />
              </div>

              <div>
                <ContextualHelp
                  title="¿Que es el DNI?"
                  content="El Documento Nacional de Identidad (DNI) es tu documento oficial de identificacion. Necesitamos una foto clara de ambos lados para verificar tu identidad."
                  defaultExpanded={false}
                />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-600">FieldSuccess:</span>
                <FieldSuccess show={true} message="Campo validado correctamente" />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-600">FieldError:</span>
                <FieldError message="Este es un mensaje de error" />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <Button
              variant="bordered"
              className="flex-1 cursor-pointer"
            >
              Guardar borrador
            </Button>
            <Button
              className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer"
              onPress={handleSubmit}
            >
              Continuar
            </Button>
          </div>
        </form>
      </main>

      {/* Floating Controls */}
      <FloatingControls
        config={config}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <FieldsSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}
