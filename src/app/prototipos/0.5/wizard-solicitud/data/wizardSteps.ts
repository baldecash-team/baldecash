/**
 * Wizard Steps Data - v0.5
 * Fixed configuration for all wizard steps
 */

import { WizardStep, WizardStepId } from '../types/wizard-solicitud';

// Step order for navigation
export const STEP_ORDER: WizardStepId[] = [
  'datos-personales',
  'datos-academicos',
  'datos-economicos',
  'resumen',
];

// Step 1: Datos Personales
const datosPersonales: WizardStep = {
  id: 'datos-personales',
  title: 'Datos Personales',
  description: 'Información básica para identificarte',
  fields: [
    {
      id: 'nombres',
      type: 'text',
      label: 'Nombres',
      placeholder: 'Ingresa tus nombres',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      id: 'apellidos',
      type: 'text',
      label: 'Apellidos',
      placeholder: 'Ingresa tus apellidos',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      id: 'tipoDocumento',
      type: 'radio',
      label: 'Tipo de Documento',
      options: [
        { value: 'dni', label: 'DNI' },
        { value: 'ce', label: 'CE' },
        { value: 'pasaporte', label: 'Pasaporte' },
      ],
      validation: {
        required: true,
      },
    },
    {
      id: 'numeroDocumento',
      type: 'text',
      label: 'Número de Documento',
      placeholder: 'Ingresa tu número de documento',
      validation: {
        required: true,
        minLength: 8,
        maxLength: 12,
        pattern: /^[0-9]+$/,
        patternMessage: 'Solo se permiten números',
      },
    },
    {
      id: 'fechaNacimiento',
      type: 'date',
      label: 'Fecha de Nacimiento',
      validation: {
        required: true,
      },
    },
    {
      id: 'celular',
      type: 'tel',
      label: 'Celular',
      placeholder: '999 999 999',
      validation: {
        required: true,
        pattern: /^9\d{8}$/,
        patternMessage: 'Ingresa un celular válido (9 dígitos)',
      },
    },
    {
      id: 'email',
      type: 'email',
      label: 'Correo Electrónico',
      placeholder: 'correo@ejemplo.com',
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Ingresa un correo válido',
      },
    },
  ],
};

// Step 2: Datos Académicos
const datosAcademicos: WizardStep = {
  id: 'datos-academicos',
  title: 'Datos Académicos',
  description: 'Información sobre tus estudios',
  fields: [
    {
      id: 'institucion',
      type: 'text',
      label: 'Institución Educativa',
      placeholder: 'Universidad, instituto o colegio',
      validation: {
        required: true,
        minLength: 3,
      },
    },
    {
      id: 'tipoInstitucion',
      type: 'radio',
      label: 'Tipo de Institución',
      options: [
        { value: 'universidad', label: 'Universidad' },
        { value: 'instituto', label: 'Instituto' },
        { value: 'colegio', label: 'Colegio' },
      ],
      validation: {
        required: true,
      },
    },
    {
      id: 'carrera',
      type: 'text',
      label: 'Carrera o Especialidad',
      placeholder: 'Ingresa tu carrera',
      validation: {
        required: true,
        minLength: 3,
      },
    },
    {
      id: 'ciclo',
      type: 'select',
      label: 'Ciclo Actual',
      placeholder: 'Selecciona tu ciclo',
      options: [
        { value: '1', label: '1er Ciclo' },
        { value: '2', label: '2do Ciclo' },
        { value: '3', label: '3er Ciclo' },
        { value: '4', label: '4to Ciclo' },
        { value: '5', label: '5to Ciclo' },
        { value: '6', label: '6to Ciclo' },
        { value: '7', label: '7mo Ciclo' },
        { value: '8', label: '8vo Ciclo' },
        { value: '9', label: '9no Ciclo' },
        { value: '10', label: '10mo Ciclo' },
        { value: 'egresado', label: 'Egresado' },
      ],
      validation: {
        required: true,
      },
    },
    {
      id: 'constanciaEstudios',
      type: 'file',
      label: 'Constancia de Estudios',
      helpText: 'Sube tu constancia de estudios (PDF o imagen)',
      accept: '.pdf,.jpg,.jpeg,.png',
      maxFiles: 1,
      validation: {
        required: true,
      },
    },
  ],
};

// Step 3: Datos Económicos
const datosEconomicos: WizardStep = {
  id: 'datos-economicos',
  title: 'Datos Económicos',
  description: 'Información financiera para evaluar tu solicitud',
  fields: [
    {
      id: 'situacionLaboral',
      type: 'radio',
      label: 'Situación Laboral',
      options: [
        { value: 'empleado', label: 'Empleado' },
        { value: 'independiente', label: 'Independiente' },
        { value: 'practicante', label: 'Practicante' },
        { value: 'desempleado', label: 'Sin empleo actual' },
      ],
      validation: {
        required: true,
      },
    },
    {
      id: 'ingresoMensual',
      type: 'number',
      label: 'Ingreso Mensual Aproximado (S/)',
      placeholder: '0.00',
      validation: {
        required: true,
        min: 0,
      },
    },
    {
      id: 'tieneAval',
      type: 'radio',
      label: '¿Cuentas con un aval o codeudor?',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
      validation: {
        required: true,
      },
    },
    {
      id: 'comentarios',
      type: 'textarea',
      label: 'Comentarios Adicionales',
      placeholder: 'Cuéntanos más sobre tu situación...',
      helpText: 'Opcional: cualquier información que consideres relevante',
      rows: 4,
    },
  ],
};

// Step 4: Resumen (no fields, just display)
const resumen: WizardStep = {
  id: 'resumen',
  title: 'Resumen',
  description: 'Revisa tu información antes de enviar',
  fields: [],
};

// Export all steps
export const WIZARD_STEPS: WizardStep[] = [
  datosPersonales,
  datosAcademicos,
  datosEconomicos,
  resumen,
];

// Helper to get step by ID
export const getStepById = (id: WizardStepId): WizardStep | undefined => {
  return WIZARD_STEPS.find((step) => step.id === id);
};

// Helper to get step index
export const getStepIndex = (id: WizardStepId): number => {
  return STEP_ORDER.indexOf(id);
};

// Helper for navigation
export const getStepNavigation = (currentStepId: WizardStepId) => {
  const currentIndex = getStepIndex(currentStepId);
  return {
    canGoBack: currentIndex > 0,
    canGoNext: currentIndex < STEP_ORDER.length - 1,
    prevStep: currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : null,
    nextStep: currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : null,
  };
};
