/**
 * Wizard Steps Data - PROMPT_08
 * Definición de los pasos del wizard de solicitud
 */

import type { WizardStep } from '../types/wizard';

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: '1',
    code: 'personal',
    name: 'Datos Personales',
    shortName: 'Personal',
    description: 'Información básica para identificarte',
    icon: 'User',
    estimatedMinutes: 2,
    fields: ['dni', 'nombres', 'apellidos', 'fechaNacimiento', 'celular', 'email'],
    validationRules: [
      { field: 'dni', type: 'required', message: 'El DNI es obligatorio' },
      { field: 'dni', type: 'pattern', value: '^[0-9]{8}$', message: 'El DNI debe tener 8 dígitos' },
      { field: 'celular', type: 'required', message: 'El celular es obligatorio' },
      { field: 'celular', type: 'pattern', value: '^9[0-9]{8}$', message: 'Ingresa un celular válido' },
      { field: 'email', type: 'required', message: 'El email es obligatorio' },
      { field: 'email', type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Ingresa un email válido' },
    ],
    motivationalMessage: '¡Empecemos! Solo necesitamos conocerte un poco.',
  },
  {
    id: '2',
    code: 'academico',
    name: 'Datos Académicos',
    shortName: 'Estudios',
    description: 'Información sobre tu institución',
    icon: 'GraduationCap',
    estimatedMinutes: 2,
    fields: ['institucion', 'carrera', 'ciclo', 'codigoAlumno'],
    validationRules: [
      { field: 'institucion', type: 'required', message: 'Selecciona tu institución' },
      { field: 'carrera', type: 'required', message: 'Selecciona tu carrera' },
      { field: 'ciclo', type: 'required', message: 'Indica tu ciclo actual' },
    ],
    motivationalMessage: '¡Excelente! Cuéntanos sobre tus estudios.',
  },
  {
    id: '3',
    code: 'economico',
    name: 'Datos Económicos',
    shortName: 'Ingresos',
    description: 'Información sobre tus ingresos',
    icon: 'Wallet',
    estimatedMinutes: 3,
    fields: ['fuenteIngreso', 'montoIngreso', 'empleador', 'antiguedadLaboral'],
    validationRules: [
      { field: 'fuenteIngreso', type: 'required', message: 'Indica tu fuente de ingresos' },
      { field: 'montoIngreso', type: 'required', message: 'Indica tu ingreso mensual' },
    ],
    motivationalMessage: '¡Ya casi! Solo falta un poco más.',
  },
  {
    id: '4',
    code: 'resumen',
    name: 'Confirmar Solicitud',
    shortName: 'Confirmar',
    description: 'Revisa y confirma tu solicitud',
    icon: 'CheckCircle',
    estimatedMinutes: 1,
    fields: [],
    validationRules: [],
    motivationalMessage: '¡Último paso! Revisa que todo esté correcto.',
  },
];

// Helper functions
export const getStepByCode = (code: string): WizardStep | undefined => {
  return WIZARD_STEPS.find((step) => step.code === code);
};

export const getStepByIndex = (index: number): WizardStep | undefined => {
  return WIZARD_STEPS[index];
};

export const getTotalEstimatedMinutes = (): number => {
  return WIZARD_STEPS.reduce((total, step) => total + step.estimatedMinutes, 0);
};

export const getRemainingMinutes = (currentStep: number): number => {
  return WIZARD_STEPS
    .slice(currentStep)
    .reduce((total, step) => total + step.estimatedMinutes, 0);
};

// Mock user data for testing
export const mockUserData = {
  dni: '12345678',
  nombres: 'María',
  apellidos: 'García López',
  fechaNacimiento: '1999-05-15',
  celular: '987654321',
  email: 'maria.garcia@email.com',
  institucion: 'Universidad Nacional Mayor de San Marcos',
  carrera: 'Ingeniería de Sistemas',
  ciclo: '6',
  codigoAlumno: '20190123',
  fuenteIngreso: 'trabajo-tiempo-parcial',
  montoIngreso: 1500,
  empleador: 'Startup Tech',
  antiguedadLaboral: '6',
};

// Product summary for testing
export const mockProductSummary = {
  name: 'Laptop Lenovo V15 G4',
  image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
  price: 2499,
  monthlyQuota: 89,
  term: 24,
  color: 'Gris',
};
