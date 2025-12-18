/**
 * Types for Personal Data Step - BaldeCash Web 3.0
 * Section C.2 - Form Datos Personales
 */

// ============================================
// RENIEC DATA
// ============================================

export interface ReniecData {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  direccion?: string;
}

// ============================================
// PERSONAL DATA
// ============================================

export interface PersonalFormData {
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  celular: string;
  email: string;
  whatsappDiferente: boolean;
  whatsapp: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccionDetalle: string;
  referencia: string;
  aceptaTerminos: boolean;
}

export const defaultPersonalFormData: PersonalFormData = {
  dni: '',
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  celular: '',
  email: '',
  whatsappDiferente: false,
  whatsapp: '',
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  direccionDetalle: '',
  referencia: '',
  aceptaTerminos: false,
};

// ============================================
// STEP CONFIGURATION
// ============================================

export interface PersonalStepConfig {
  // C2.1 - DNI loading animation
  dniLoadingVersion: 1 | 2 | 3;
  // C2.2 - Data appear animation
  dataAppearVersion: 1 | 2 | 3;
  // C2.8 - Map confirmation
  mapConfirmVersion: 1 | 2 | 3;
  // C2.9 - Address fallback
  addressFallbackVersion: 1 | 2 | 3;
  // C2.13 - Terms link behavior
  termsLinkVersion: 1 | 2 | 3;
}

export const defaultPersonalStepConfig: PersonalStepConfig = {
  dniLoadingVersion: 1,
  dataAppearVersion: 1,
  mapConfirmVersion: 3,
  addressFallbackVersion: 2,
  termsLinkVersion: 1,
};

export const versionDescriptions = {
  dniLoading: {
    1: 'Skeleton en campos mientras carga',
    2: 'Spinner + mensaje "Buscando tus datos..."',
    3: 'Progress bar con pasos',
  },
  dataAppear: {
    1: 'Fade in todos juntos',
    2: 'Cascada uno por uno',
    3: 'Aparicion instantanea',
  },
  mapConfirm: {
    1: 'Mapa pequeno debajo del campo',
    2: 'Mapa en modal de confirmacion',
    3: 'Sin mapa, solo texto',
  },
  addressFallback: {
    1: 'Cambiar a campos manuales automaticamente',
    2: 'Boton "Ingresar manualmente"',
    3: 'Tooltip con instrucciones',
  },
  termsLink: {
    1: 'Modal overlay',
    2: 'Nueva pestana',
    3: 'Expandible inline',
  },
};

// ============================================
// LOCATION DATA
// ============================================

export interface LocationOption {
  value: string;
  label: string;
}

export interface PeruLocation {
  departamento: string;
  provincia: string;
  distrito: string;
}

// Mock data for Peru locations
export const departamentos: LocationOption[] = [
  { value: 'lima', label: 'Lima' },
  { value: 'arequipa', label: 'Arequipa' },
  { value: 'cusco', label: 'Cusco' },
  { value: 'la-libertad', label: 'La Libertad' },
  { value: 'piura', label: 'Piura' },
  { value: 'lambayeque', label: 'Lambayeque' },
  { value: 'junin', label: 'Junin' },
  { value: 'callao', label: 'Callao' },
];

export const provincias: Record<string, LocationOption[]> = {
  lima: [
    { value: 'lima', label: 'Lima' },
    { value: 'huaral', label: 'Huaral' },
    { value: 'canete', label: 'Canete' },
    { value: 'huaura', label: 'Huaura' },
  ],
  arequipa: [
    { value: 'arequipa', label: 'Arequipa' },
    { value: 'camana', label: 'Camana' },
    { value: 'islay', label: 'Islay' },
  ],
  cusco: [
    { value: 'cusco', label: 'Cusco' },
    { value: 'urubamba', label: 'Urubamba' },
    { value: 'calca', label: 'Calca' },
  ],
  callao: [
    { value: 'callao', label: 'Callao' },
  ],
};

export const distritos: Record<string, LocationOption[]> = {
  lima: [
    { value: 'miraflores', label: 'Miraflores' },
    { value: 'san-isidro', label: 'San Isidro' },
    { value: 'surco', label: 'Santiago de Surco' },
    { value: 'san-borja', label: 'San Borja' },
    { value: 'la-molina', label: 'La Molina' },
    { value: 'jesus-maria', label: 'Jesus Maria' },
    { value: 'lince', label: 'Lince' },
    { value: 'magdalena', label: 'Magdalena del Mar' },
    { value: 'pueblo-libre', label: 'Pueblo Libre' },
    { value: 'barranco', label: 'Barranco' },
    { value: 'chorrillos', label: 'Chorrillos' },
    { value: 'san-miguel', label: 'San Miguel' },
    { value: 'lima-cercado', label: 'Lima (Cercado)' },
    { value: 'san-juan-lurigancho', label: 'San Juan de Lurigancho' },
    { value: 'ate', label: 'Ate' },
    { value: 'los-olivos', label: 'Los Olivos' },
    { value: 'comas', label: 'Comas' },
    { value: 'villa-el-salvador', label: 'Villa El Salvador' },
  ],
  arequipa: [
    { value: 'arequipa', label: 'Arequipa' },
    { value: 'cayma', label: 'Cayma' },
    { value: 'yanahuara', label: 'Yanahuara' },
    { value: 'jose-luis-bustamante', label: 'Jose Luis Bustamante y Rivero' },
  ],
  cusco: [
    { value: 'cusco', label: 'Cusco' },
    { value: 'wanchaq', label: 'Wanchaq' },
    { value: 'san-sebastian', label: 'San Sebastian' },
  ],
  callao: [
    { value: 'callao', label: 'Callao' },
    { value: 'bellavista', label: 'Bellavista' },
    { value: 'la-perla', label: 'La Perla' },
    { value: 'la-punta', label: 'La Punta' },
    { value: 'ventanilla', label: 'Ventanilla' },
  ],
};
