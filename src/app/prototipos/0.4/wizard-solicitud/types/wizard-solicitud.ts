/**
 * Tipos para Wizard + Solicitud Completo - BaldeCash Web 4.0
 * PROMPT_18: Meta-prompt que integra PROMPT_08 a PROMPT_13 + SOLICITUD
 */

// ============================================
// CONFIGURACION PRINCIPAL
// ============================================

export interface WizardSolicitudConfig {
  // === VISTA SOLICITUD (B.x) ===
  headerVersion: 1 | 2 | 3 | 4 | 5 | 6;        // B.1 - Header
  titleVersion: 1 | 2 | 3 | 4 | 5 | 6;         // B.2 - Titulo desktop
  titleVersionMobile: 1 | 2 | 3 | 4 | 5 | 6;   // B.2 - Titulo mobile
  messageVersion: 1 | 2 | 3 | 4 | 5 | 6;       // B.3 - Mensaje motivacional
  heroVersion: 1 | 2 | 3 | 4 | 5 | 6;          // B.5 - Hero (Baldi)
  ctaVersion: 1 | 2 | 3 | 4 | 5 | 6;           // B.6 - CTA

  // === WIZARD ESTRUCTURA (C.x) ===
  wizardLayoutVersion: 1 | 2 | 3 | 4 | 5 | 6;  // C.1 - Layout general
  progressVersion: 1 | 2 | 3 | 4 | 5 | 6;      // C.5 - Indicador progreso
  navigationVersion: 1 | 2 | 3 | 4 | 5 | 6;    // C.14 - Navegacion
  stepLayoutVersion: 1 | 2 | 3 | 4 | 5 | 6;    // C.10 - Layout de paso
  motivationVersion: 1 | 2 | 3 | 4 | 5 | 6;    // C.18 - Mensajes
  celebrationVersion: 1 | 2 | 3 | 4 | 5 | 6;   // C.20 - Celebraciones

  // === CAMPOS (C1.x) ===
  inputVersion: 1 | 2 | 3 | 4 | 5 | 6;         // C1.1+C1.4 - InputField (Label integrado)
  optionsVersion: 1 | 2 | 3 | 4 | 5 | 6;       // C1.13 - Opciones (cards)
  uploadVersion: 1 | 2 | 3 | 4 | 5 | 6;        // C1.15 - Upload
  datePickerVersion: 1 | 2 | 3 | 4 | 5 | 6;    // C1.18 - DatePicker
  previewVersion: 1 | 2 | 3 | 4 | 5 | 6;       // C1.16 - Preview
  uploadProgressVersion: 1 | 2 | 3 | 4 | 5 | 6; // C1.17 - Progreso upload
  validationVersion: 1 | 2 | 3 | 4 | 5 | 6;    // C1.21 - Validacion
  errorVersion: 1 | 2 | 3 | 4 | 5 | 6;         // C1.23/24 - Errores
  helpVersion: 1 | 2 | 3 | 4 | 5 | 6;          // C1.28 - Ayuda
  docExamplesVersion: 1 | 2 | 3 | 4 | 5 | 6;   // C1.29 - Ejemplos docs

  // === OPCIONES ADICIONALES ===
  allowFreeNavigation: boolean;
  autoSave: boolean;
}

// Configuracion con decisiones aplicadas del PROMPT_18
export const defaultWizardSolicitudConfig: WizardSolicitudConfig = {
  // Vista Solicitud - Decisiones B.x
  headerVersion: 1,          // B.1 - Con producto seleccionado
  titleVersion: 1,           // B.2 - Con "Ahora" (desktop)
  titleVersionMobile: 1,     // B.2 - Sin "Ahora" (mobile)
  messageVersion: 1,         // B.3 - Beneficios
  heroVersion: 1,            // B.5 - Caricatura Baldi
  ctaVersion: 1,             // B.6 - Card con Baldi

  // Wizard Estructura - Decisiones C.x
  wizardLayoutVersion: 1,
  progressVersion: 1,
  navigationVersion: 1,
  stepLayoutVersion: 1,
  motivationVersion: 1,
  celebrationVersion: 1,

  // Campos - Decisiones C1.x
  inputVersion: 1,           // C1.1+C1.4 - InputField con Label integrado
  optionsVersion: 1,         // C1.13 - Cards (si <= 6 opciones)
  uploadVersion: 1,          // C1.15 - Drag & drop + boton
  datePickerVersion: 1,      // C1.18 - Calendario clasico popup
  previewVersion: 1,         // C1.16 - [CORREGIR]
  uploadProgressVersion: 1,  // C1.17 - [CORREGIR]
  validationVersion: 1,      // C1.21 - Errores arriba
  errorVersion: 1,           // C1.23/24 - Inline + borde rojo
  helpVersion: 1,            // C1.28 - Tooltip
  docExamplesVersion: 1,     // C1.29 - Gallery modal

  // Opciones adicionales
  allowFreeNavigation: false,
  autoSave: true,
};

// ============================================
// TIPOS DE PASOS
// ============================================

export type WizardStepCode = 'intro' | 'personal' | 'academico' | 'economico' | 'resumen';

export interface WizardSolicitudStep {
  id: string;
  code: WizardStepCode;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  fields: FieldConfig[];
  motivationalMessage?: string;
}

// ============================================
// TIPOS DE CAMPOS
// ============================================

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'select' | 'radio' | 'checkbox' | 'upload' | 'date';

export interface FieldConfig {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule[];
  options?: FieldOption[];
  helpText?: string;
  description?: string; // Descripción breve debajo del label
  showDocExamples?: boolean;
  maxOptions?: number; // Para C1.13 - si > 6, no usar cards
  triggersBackendQuery?: boolean; // Para mostrar loader al consultar backend
}

export interface FieldOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'dni' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: string | number;
  message: string;
}

// ============================================
// ESTADO DEL WIZARD
// ============================================

export type WizardPhase = 'intro' | 'wizard';

export interface WizardState {
  phase: WizardPhase;
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, unknown>;
  isSubmitting: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  startedAt?: Date;
  lastSavedAt?: Date;
}

export interface WizardNavigation {
  canGoBack: boolean;
  canGoForward: boolean;
  canSubmit: boolean;
  nextStep?: WizardSolicitudStep;
  prevStep?: WizardSolicitudStep;
}

// ============================================
// PRODUCTO SELECCIONADO
// ============================================

export interface SelectedProduct {
  id: string;
  name: string;
  brand: string;
  thumbnail: string;
  monthlyQuota: number;
  totalPrice: number;
  months: number;
}

// ============================================
// DESCRIPCIONES DE VERSIONES PARA SETTINGS
// ============================================

export const versionDescriptions = {
  // Vista Solicitud (B.x)
  header: {
    1: 'Generico - "Solicita tu laptop"',
    2: 'Con producto - Thumbnail + nombre',
    3: 'Ilustracion flat del producto',
    4: 'Datos del producto destacados (fintech)',
    5: 'Split: producto izquierda + titulo derecha',
    6: 'Minimalista solo texto grande',
  },
  title: {
    1: 'Solo titulo "Completa tu solicitud"',
    2: 'Titulo + "Ahora" + tiempo',
    3: 'Titulo + tiempo (sin "Ahora")',
    4: 'Tiempo como badge flotante (fintech)',
    5: 'Titulo grande + tiempo en subtitle',
    6: 'Solo tiempo gigante centrado',
  },
  message: {
    1: 'Beneficios del financiamiento',
    2: 'Testimonios de estudiantes con fotos',
    3: 'Estadisticas ilustradas flat ("95% aprobados")',
    4: 'Numeros grandes destacados (fintech)',
    5: 'Lista de beneficios en panel lateral',
    6: 'Un solo beneficio gigante centrado',
  },
  hero: {
    1: 'Foto de producto laptop',
    2: 'Foto lifestyle estudiante',
    3: 'Caricatura de Baldi',
    4: 'Ilustracion abstracta shapes (fintech)',
    5: 'Split: Baldi izquierda + info derecha',
    6: 'Baldi grande centrado con animacion',
  },
  cta: {
    1: 'Boton directo "Empezar solicitud"',
    2: 'Boton + badges de seguridad',
    3: 'Card con Baldi + boton + tiempo',
    4: 'Boton prominente con glow (fintech)',
    5: 'CTA en panel lateral sticky',
    6: 'Boton gigante fullwidth',
  },

  // Wizard Estructura (C.x)
  wizardLayout: {
    1: 'Fullscreen - Sin distracciones',
    2: 'Header minimalista - Logo + cerrar',
    3: 'Header + Progress sticky',
    4: 'Shapes flotantes animados (fintech)',
    5: 'Split: sidebar + form',
    6: 'Centrado hero maximo impacto',
  },
  progress: {
    1: 'Steps numerados clasico',
    2: 'Circulos con fotos (lifestyle)',
    3: 'Iconos flat ilustrados',
    4: 'Barra con % animado + glow (fintech)',
    5: 'Split: numero + barra',
    6: 'Porcentaje gigante centrado',
  },
  navigation: {
    1: 'Fixed bottom siempre',
    2: 'Fixed + preview siguiente paso',
    3: 'Al final con iconos flat',
    4: 'Fixed + animacion progreso (fintech)',
    5: 'Split: regresar izq, continuar der',
    6: 'Fixed bottom boton gigante',
  },
  celebration: {
    1: 'Checkmark minimalista (800ms)',
    2: 'Mensaje personalizado + flecha',
    3: 'Confetti + estrellas animadas',
    4: 'Estilo fintech con glow',
    5: 'Preview del siguiente paso',
    6: 'Pantalla completa branded',
  },

  // Campos (C1.x) - InputField con Label integrado
  input: {
    1: 'Bordes clasicos + Label arriba visible',
    2: 'Material Design + Label flotante animado',
    3: 'Minimalista + Solo placeholder (sin label)',
    4: 'Filled redondeado + Label con badge',
    5: 'Glassmorphism + Label inline izquierdo',
    6: 'Fintech Premium + Label flotante con check',
  },
  options: {
    1: 'Radio buttons tradicionales',
    2: 'Segmented control (tabs)',
    3: 'Cards clickeables',
    4: 'Cards con iconos grandes',
    5: 'Lista con checkmarks',
    6: 'Grid de opciones',
  },
  upload: {
    1: 'Drag & drop prominente + boton',
    2: 'Solo boton (simple)',
    3: 'Area drag & drop que es boton',
    4: 'Upload con preview inline',
    5: 'Upload minimalista',
    6: 'Upload con animacion',
  },
  datePicker: {
    1: 'Calendario popup clasico',
    2: 'Calendario inline siempre visible',
    3: 'Spinner estilo iOS (ruedas)',
    4: 'Inputs segmentados dia/mes/año',
    5: 'Input con autocompletado inteligente',
    6: 'Selector basado en edad',
  },
  validation: {
    1: 'Mostrar todos los errores arriba',
    2: 'Scroll al primer error',
    3: 'Shake en campos con error',
    4: 'Toast con errores',
    5: 'Modal con lista de errores',
    6: 'Highlight secuencial',
  },
  error: {
    1: 'Borde rojo + mensaje inline',
    2: 'Borde rojo + fondo rojo suave',
    3: 'Solo mensaje rojo',
    4: 'Icono + mensaje',
    5: 'Tooltip con error',
    6: 'Badge de error',
  },
  help: {
    1: 'Tooltip hover/click',
    2: 'Texto siempre visible debajo',
    3: 'Expandible con link "Ayuda?"',
    4: 'Icono con popover',
    5: 'Panel lateral de ayuda',
    6: 'Modal de ayuda',
  },
  docExamples: {
    1: 'Imagen de ejemplo en tooltip',
    2: 'Gallery de ejemplos en modal',
    3: 'Inline pequeno al lado',
    4: 'Carrusel de ejemplos',
    5: 'Drawer lateral con ejemplos',
    6: 'Lightbox fullscreen',
  },
};
