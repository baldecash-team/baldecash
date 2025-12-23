/**
 * Datos de pasos del Wizard + Solicitud - BaldeCash Web 4.0
 * PROMPT_18: Configuracion de pasos y campos
 */

import type { WizardSolicitudStep, FieldConfig, SelectedProduct } from '../types/wizard-solicitud';

// ============================================
// PASOS DEL WIZARD
// ============================================

export const WIZARD_STEPS: WizardSolicitudStep[] = [
  {
    id: '1',
    code: 'personal',
    name: 'Datos Personales',
    shortName: 'Personal',
    description: 'Informacion basica para identificarte',
    icon: 'User',
    estimatedMinutes: 2,
    motivationalMessage: '¡Empecemos! Solo necesitamos conocerte un poco.',
    fields: [
      {
        name: 'dni',
        type: 'text',
        label: 'DNI',
        placeholder: 'Ej: 12345678',
        required: true,
        description: 'Validaremos tu identidad automaticamente',
        helpText: 'Tu documento nacional de identidad de 8 digitos. Lo usamos para verificar tu identidad con RENIEC.',
        triggersBackendQuery: true,
        validation: [
          { type: 'required', message: 'El DNI es obligatorio' },
          { type: 'dni', message: 'Ingresa un DNI valido de 8 digitos' },
        ],
      },
      {
        name: 'nombres',
        type: 'text',
        label: 'Nombres',
        placeholder: 'Ej: Juan Carlos',
        required: true,
        validation: [
          { type: 'required', message: 'Los nombres son obligatorios' },
          { type: 'minLength', value: 2, message: 'Ingresa al menos 2 caracteres' },
        ],
      },
      {
        name: 'apellidos',
        type: 'text',
        label: 'Apellidos',
        placeholder: 'Ej: Perez Garcia',
        required: true,
        validation: [
          { type: 'required', message: 'Los apellidos son obligatorios' },
          { type: 'minLength', value: 2, message: 'Ingresa al menos 2 caracteres' },
        ],
      },
      {
        name: 'fechaNacimiento',
        type: 'date',
        label: 'Fecha de nacimiento',
        required: true,
        description: 'Debes ser mayor de 18 años',
        helpText: 'Usamos tu fecha de nacimiento para verificar tu edad y personalizar tu experiencia',
        validation: [
          { type: 'required', message: 'La fecha de nacimiento es obligatoria' },
        ],
      },
      {
        name: 'sexo',
        type: 'radio',
        label: 'Sexo',
        required: true,
        maxOptions: 2,
        options: [
          { value: 'M', label: 'Masculino', icon: 'User' },
          { value: 'F', label: 'Femenino', icon: 'User' },
        ],
        validation: [
          { type: 'required', message: 'Selecciona una opción' },
        ],
      },
      {
        name: 'celular',
        type: 'tel',
        label: 'Celular',
        placeholder: 'Ej: 999 888 777',
        required: true,
        helpText: 'Numero de 9 digitos',
        validation: [
          { type: 'required', message: 'El celular es obligatorio' },
          { type: 'phone', message: 'Ingresa un numero valido de 9 digitos' },
        ],
      },
      {
        name: 'email',
        type: 'email',
        label: 'Correo electronico',
        placeholder: 'Ej: juan@email.com',
        required: true,
        validation: [
          { type: 'required', message: 'El correo es obligatorio' },
          { type: 'email', message: 'Ingresa un correo valido' },
        ],
      },
    ],
  },
  {
    id: '2',
    code: 'academico',
    name: 'Datos Academicos',
    shortName: 'Estudios',
    description: 'Informacion sobre tu institucion educativa',
    icon: 'GraduationCap',
    estimatedMinutes: 2,
    motivationalMessage: '¡Excelente! Cuentanos sobre tus estudios.',
    fields: [
      {
        name: 'institucion',
        type: 'select',
        label: 'Institucion educativa',
        placeholder: 'Selecciona tu institucion',
        required: true,
        maxOptions: 6, // Usar cards si <= 6
        options: [
          { value: 'upc', label: 'UPC', icon: 'Building' },
          { value: 'pucp', label: 'PUCP', icon: 'Building' },
          { value: 'uni', label: 'UNI', icon: 'Building' },
          { value: 'usmp', label: 'USMP', icon: 'Building' },
          { value: 'ulima', label: 'U. Lima', icon: 'Building' },
          { value: 'otro', label: 'Otra', icon: 'MoreHorizontal' },
        ],
        validation: [
          { type: 'required', message: 'Selecciona tu institucion' },
        ],
      },
      {
        name: 'carrera',
        type: 'text',
        label: 'Carrera o programa',
        placeholder: 'Ej: Ingenieria de Sistemas',
        required: true,
        validation: [
          { type: 'required', message: 'La carrera es obligatoria' },
        ],
      },
      {
        name: 'ciclo',
        type: 'select',
        label: 'Ciclo actual',
        placeholder: 'Selecciona tu ciclo',
        required: true,
        maxOptions: 10,
        options: [
          { value: '1', label: '1er ciclo' },
          { value: '2', label: '2do ciclo' },
          { value: '3', label: '3er ciclo' },
          { value: '4', label: '4to ciclo' },
          { value: '5', label: '5to ciclo' },
          { value: '6', label: '6to ciclo' },
          { value: '7', label: '7mo ciclo' },
          { value: '8', label: '8vo ciclo' },
          { value: '9', label: '9no ciclo' },
          { value: '10', label: '10mo ciclo' },
        ],
        validation: [
          { type: 'required', message: 'Selecciona tu ciclo' },
        ],
      },
      {
        name: 'codigoAlumno',
        type: 'text',
        label: 'Codigo de alumno',
        placeholder: 'Ej: U202012345',
        required: true,
        helpText: 'Tu codigo de estudiante',
        validation: [
          { type: 'required', message: 'El codigo es obligatorio' },
        ],
      },
    ],
  },
  {
    id: '3',
    code: 'economico',
    name: 'Datos Economicos',
    shortName: 'Ingresos',
    description: 'Informacion sobre tus ingresos',
    icon: 'Wallet',
    estimatedMinutes: 3,
    motivationalMessage: '¡Ya casi! Solo falta un poco mas.',
    fields: [
      {
        name: 'fuenteIngreso',
        type: 'radio',
        label: 'Fuente principal de ingresos',
        required: true,
        maxOptions: 4, // Usar cards
        options: [
          { value: 'trabajo', label: 'Trabajo', icon: 'Briefcase', description: 'Empleo formal o informal' },
          { value: 'negocio', label: 'Negocio propio', icon: 'Store', description: 'Emprendimiento o freelance' },
          { value: 'familia', label: 'Apoyo familiar', icon: 'Users', description: 'Padres o familiares' },
          { value: 'otro', label: 'Otro', icon: 'MoreHorizontal', description: 'Otra fuente de ingresos' },
        ],
        validation: [
          { type: 'required', message: 'Selecciona tu fuente de ingresos' },
        ],
      },
      {
        name: 'montoIngreso',
        type: 'number',
        label: 'Ingreso mensual aproximado',
        placeholder: 'Ej: 1500',
        required: true,
        helpText: 'En soles (S/)',
        validation: [
          { type: 'required', message: 'El monto es obligatorio' },
        ],
      },
      {
        name: 'empleador',
        type: 'text',
        label: 'Nombre del empleador o negocio',
        placeholder: 'Ej: Empresa ABC',
        required: false,
        helpText: 'Opcional si trabajas',
      },
      {
        name: 'comprobante',
        type: 'upload',
        label: 'Comprobante de ingresos',
        required: true,
        helpText: 'Boleta, recibo por honorarios o estado de cuenta',
        showDocExamples: true,
        validation: [
          { type: 'required', message: 'El comprobante es obligatorio' },
        ],
      },
    ],
  },
  {
    id: '4',
    code: 'resumen',
    name: 'Confirmar Solicitud',
    shortName: 'Confirmar',
    description: 'Revisa y confirma tu solicitud',
    icon: 'CheckCircle',
    estimatedMinutes: 1,
    motivationalMessage: '¡Ultimo paso! Revisa que todo este correcto.',
    fields: [], // No hay campos, es solo resumen
  },
];

// ============================================
// PRODUCTO MOCK
// ============================================

export const MOCK_PRODUCT: SelectedProduct = {
  id: 'hp-15-2024',
  name: 'HP Laptop 15-fd0013la',
  brand: 'HP',
  thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
  monthlyQuota: 149,
  totalPrice: 2499,
  months: 18,
};

// ============================================
// HELPERS
// ============================================

/**
 * Calcula los minutos restantes estimados
 */
export const getRemainingMinutes = (currentStep: number): number => {
  return WIZARD_STEPS.slice(currentStep).reduce(
    (acc, step) => acc + step.estimatedMinutes,
    0
  );
};

/**
 * Obtiene el paso por codigo
 */
export const getStepByCode = (code: string): WizardSolicitudStep | undefined => {
  return WIZARD_STEPS.find((step) => step.code === code);
};

/**
 * Calcula el progreso en porcentaje
 */
export const getProgressPercentage = (currentStep: number): number => {
  if (WIZARD_STEPS.length <= 1) return 100;
  return Math.round((currentStep / (WIZARD_STEPS.length - 1)) * 100);
};

// ============================================
// MENSAJES MOTIVACIONALES
// ============================================

export const MOTIVATIONAL_MESSAGES: Record<string, string[]> = {
  personal: [
    '¡Empecemos! Solo necesitamos conocerte un poco.',
    '¡Genial! Ya diste el primer paso.',
    'Tus datos estan seguros con nosotros.',
  ],
  academico: [
    '¡Excelente! Cuentanos sobre tus estudios.',
    '¡Vas muy bien! Ya completaste el 25%.',
    'Esta informacion nos ayuda a darte la mejor oferta.',
  ],
  economico: [
    '¡Ya casi! Solo falta un poco mas.',
    '¡Increible! Ya completaste el 50%.',
    'Tu laptop esta cada vez mas cerca.',
  ],
  resumen: [
    '¡Ultimo paso! Revisa que todo este correcto.',
    '¡Lo lograste! Solo confirma y listo.',
    'En menos de 24h tendras tu respuesta.',
  ],
};

// ============================================
// EJEMPLOS DE DOCUMENTOS
// ============================================

export const DOCUMENT_EXAMPLES = [
  {
    id: 'boleta',
    title: 'Boleta de pago',
    description: 'Documento mensual de tu empleador',
    image: '/images/docs/ejemplo-boleta.jpg',
  },
  {
    id: 'ruc',
    title: 'Recibo por honorarios',
    description: 'Si trabajas como independiente',
    image: '/images/docs/ejemplo-ruc.jpg',
  },
  {
    id: 'estado-cuenta',
    title: 'Estado de cuenta',
    description: 'De los ultimos 3 meses',
    image: '/images/docs/ejemplo-estado-cuenta.jpg',
  },
];
