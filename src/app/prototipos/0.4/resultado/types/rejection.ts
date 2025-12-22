// types/rejection.ts - Tipos para Pantalla de Rechazo
// Segmento G - BaldeCash v0.4

export interface RejectionConfig {
  // G.1 - Colores y tono visual
  visualVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.2 - Tipo de ilustración
  illustrationVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.3 - Nivel de branding
  brandingVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.5 - Personalización del mensaje
  messageVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.8 - Detalle de explicación
  explanationDetailVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.9 - Framing de explicación
  explanationFramingVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.10 - Layout de alternativas
  alternativesLayoutVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.11 - Productos alternativos
  productAlternativesVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.12 - Calculadora de enganche
  calculatorVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.14 - Captura de email
  emailCaptureVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.16 - Tiempo de reintento
  retryTimelineVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.17 - CTA de asesor
  advisorCTAVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // G.19 - Mensaje del asesor
  advisorMessageVersion: 1 | 2 | 3 | 4 | 5 | 6;
}

export const defaultRejectionConfig: RejectionConfig = {
  visualVersion: 3,
  illustrationVersion: 1,
  brandingVersion: 3,
  messageVersion: 1,
  explanationDetailVersion: 3,
  explanationFramingVersion: 1,
  alternativesLayoutVersion: 1,
  productAlternativesVersion: 1,
  calculatorVersion: 2,
  emailCaptureVersion: 1,
  retryTimelineVersion: 1,
  advisorCTAVersion: 1,
  advisorMessageVersion: 1,
};

export type RejectionCategory = 'credit' | 'income' | 'documentation' | 'other';

export interface RequestedProduct {
  name: string;
  price: number;
  monthlyQuota: number;
  image?: string;
}

export interface RejectionData {
  applicationId: string;
  userName?: string;
  requestedProduct: RequestedProduct;
  rejectionCategory?: RejectionCategory;
  canRetryIn?: number; // días
  alternatives: RejectionAlternative[];
}

export type AlternativeType = 'lower_product' | 'down_payment' | 'cosigner' | 'wait';

export interface RejectionAlternative {
  id: string;
  type: AlternativeType;
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
  calculator?: DownPaymentCalculator;
}

export interface DownPaymentCalculator {
  productPrice: number;
  minDownPayment: number;
  maxDownPayment: number;
  step: number;
}

export interface AlternativeProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  monthlyQuota: number;
  specs?: string[];
}

// Datos mock para desarrollo
export const mockRejectionData: RejectionData = {
  applicationId: 'APP-2024-001234',
  userName: 'María',
  requestedProduct: {
    name: 'MacBook Air M2',
    price: 5499,
    monthlyQuota: 458,
    image: '/images/products/macbook-air.png',
  },
  rejectionCategory: 'credit',
  canRetryIn: 90,
  alternatives: [
    {
      id: 'lower',
      type: 'lower_product',
      title: 'Opciones más accesibles',
      description: 'Tenemos laptops con cuotas desde S/49/mes',
      icon: 'Laptop',
      action: { label: 'Ver opciones', href: '/catalogo?price=low' },
    },
    {
      id: 'down',
      type: 'down_payment',
      title: 'Pagar una inicial',
      description: 'Con una cuota inicial, reduces el monto a financiar',
      icon: 'Wallet',
      calculator: {
        productPrice: 5499,
        minDownPayment: 500,
        maxDownPayment: 3000,
        step: 100,
      },
    },
    {
      id: 'cosigner',
      type: 'cosigner',
      title: 'Aplicar con un codeudor',
      description: 'Un familiar puede respaldar tu solicitud',
      icon: 'Users',
      action: { label: 'Más información', href: '/codeudor' },
    },
    {
      id: 'wait',
      type: 'wait',
      title: 'Intentar más adelante',
      description: 'Puedes volver a aplicar en 90 días',
      icon: 'Calendar',
    },
  ],
};

export const mockAlternativeProducts: AlternativeProduct[] = [
  {
    id: 'alt-1',
    name: 'Lenovo IdeaPad 3',
    brand: 'Lenovo',
    image: '/images/products/lenovo-ideapad.png',
    price: 1899,
    monthlyQuota: 158,
    specs: ['Intel Core i5', '8GB RAM', '256GB SSD'],
  },
  {
    id: 'alt-2',
    name: 'HP Pavilion 15',
    brand: 'HP',
    image: '/images/products/hp-pavilion.png',
    price: 2199,
    monthlyQuota: 183,
    specs: ['Intel Core i5', '8GB RAM', '512GB SSD'],
  },
  {
    id: 'alt-3',
    name: 'Acer Aspire 5',
    brand: 'Acer',
    image: '/images/products/acer-aspire.png',
    price: 1599,
    monthlyQuota: 133,
    specs: ['AMD Ryzen 5', '8GB RAM', '256GB SSD'],
  },
];

// Labels para versiones del Settings Modal
export const versionLabels = {
  visual: {
    1: { name: 'Neutros fríos', description: 'Grises suaves, sin color prominente' },
    2: { name: 'Cálidos acogedores', description: 'Beige, crema, sensación cálida' },
    3: { name: 'Marca suavizada', description: 'Color primario al 10% de opacidad' },
    4: { name: 'Fintech minimalista', description: 'Neutros con acentos sutiles' },
    5: { name: 'Split visual', description: 'Neutro arriba + color abajo' },
    6: { name: 'Máxima calma', description: 'Colores muy suaves, casi blancos' },
  },
  illustration: {
    1: { name: 'Persona reflexiva', description: 'Persona pensativa mirando adelante' },
    2: { name: 'Camino bifurcado', description: 'Ilustración de opciones' },
    3: { name: 'Sin ilustración', description: 'Solo iconografía minimalista' },
    4: { name: 'Shapes abstractos', description: 'Formas flotantes fintech' },
    5: { name: 'Lateral pequeña', description: 'Ilustración lateral, no central' },
    6: { name: 'Grande emocional', description: 'Ilustración de impacto' },
  },
  branding: {
    1: { name: 'Minimalista extremo', description: 'Menos elementos posibles' },
    2: { name: 'Branding completo', description: 'Logo, colores, footer normal' },
    3: { name: 'Reducido', description: 'Solo logo pequeño en header' },
    4: { name: 'Fintech sutil', description: 'Minimalista con toques de marca' },
    5: { name: 'Split', description: 'Header con marca + contenido limpio' },
    6: { name: 'Un acento', description: 'Minimalista con elemento destacado' },
  },
  message: {
    1: { name: 'Nombre prominente', description: '"María, en este momento..."' },
    2: { name: 'Genérico', description: 'Sin nombre, menos personal' },
    3: { name: 'Nombre sutil', description: 'Solo en saludo inicial' },
    4: { name: 'Contextual', description: 'Nombre si mejora el tono' },
    5: { name: 'En mensaje', description: 'Nombre en texto, no título' },
    6: { name: 'Nombre grande', description: 'Prominente para conexión' },
  },
  explanationDetail: {
    1: { name: 'General vago', description: '"No cumples requisitos actuales"' },
    2: { name: 'Categoría', description: 'Relacionado con historial' },
    3: { name: 'Accionable', description: 'Qué puedes hacer para mejorar' },
    4: { name: 'Técnico amigable', description: 'Explicación con tooltips' },
    5: { name: 'Expandible', description: 'Razón breve + más detalle' },
    6: { name: 'Prominente', description: 'Explicación clara y visible' },
  },
  explanationFraming: {
    1: { name: '100% positivo', description: 'Qué puedes hacer futuro' },
    2: { name: 'Neutral', description: 'Sin juicio ni optimismo' },
    3: { name: 'Directo honesto', description: 'Razones claras sin adornar' },
    4: { name: 'Positivo realista', description: 'Oportunidades con contexto' },
    5: { name: 'Split', description: 'Razón breve + acciones' },
    6: { name: 'Enfoque acción', description: 'Qué hacer ahora prominente' },
  },
  alternativesLayout: {
    1: { name: 'Cards grandes', description: 'Iconos prominentes y CTA' },
    2: { name: 'Lista elegante', description: 'Bullets y links sutiles' },
    3: { name: 'Accordion', description: 'Expandible por alternativa' },
    4: { name: 'Cards animadas', description: 'Hover atractivo fintech' },
    5: { name: 'Split', description: 'Principales en cards + resto lista' },
    6: { name: 'Cards hero', description: 'Una alternativa por sección' },
  },
  productAlternatives: {
    1: { name: 'Cards completas', description: 'Imagen + nombre + precio + cuota' },
    2: { name: 'Lista simple', description: 'Nombre + precio, sin imágenes' },
    3: { name: 'Solo link', description: '"Ver opciones más accesibles"' },
    4: { name: 'Mini cards', description: 'Imagen pequeña + precio' },
    5: { name: 'Featured + lista', description: 'Un producto destacado + otros' },
    6: { name: 'Cards hero', description: 'Productos alternativos grandes' },
  },
  calculator: {
    1: { name: 'Slider interactivo', description: 'Calculadora prominente' },
    2: { name: 'Ejemplos fijos', description: '"Con S/500 accedes a..."' },
    3: { name: 'Link externo', description: '"Calcula tu opción"' },
    4: { name: 'Animada', description: 'Resultados en tiempo real' },
    5: { name: 'Split', description: 'Calculadora izquierda + resultados' },
    6: { name: 'Hero central', description: 'Calculadora como elemento principal' },
  },
  emailCapture: {
    1: { name: 'Campo prominente', description: '"Avísame cuando pueda aplicar"' },
    2: { name: 'Checkbox discreto', description: '"Quiero recibir novedades"' },
    3: { name: 'No pedir', description: 'Muy intrusivo en este momento' },
    4: { name: 'Input elegante', description: 'Animación de confirmación' },
    5: { name: 'Split', description: 'Beneficio + input' },
    6: { name: 'CTA grande', description: 'Suscripción a oportunidades' },
  },
  retryTimeline: {
    1: { name: 'Fecha específica', description: '"En 90 días puedes intentar"' },
    2: { name: 'General vago', description: '"En unos meses..."' },
    3: { name: 'No mencionar', description: 'Puede frustrar' },
    4: { name: 'Countdown sutil', description: 'Fintech con cuenta regresiva' },
    5: { name: 'Tiempo + acción', description: '"En 90 días, mientras..."' },
    6: { name: 'Calendario visual', description: 'Tiempo prominente' },
  },
  advisorCTA: {
    1: { name: 'CTA prominente', description: 'Botón grande "Habla con asesor"' },
    2: { name: 'Link secundario', description: 'Sutil al final de página' },
    3: { name: 'Solo info', description: 'Sin CTA directo' },
    4: { name: 'Chat flotante', description: 'WhatsApp animado' },
    5: { name: 'Split', description: 'Asesor + autoservicio' },
    6: { name: 'Solución principal', description: 'Asesor destacado' },
  },
  advisorMessage: {
    1: { name: 'Optimista', description: '"Puede revisar opciones contigo"' },
    2: { name: 'Neutral', description: '"¿Preguntas? Estamos aquí"' },
    3: { name: 'Realista', description: '"No garantizamos, pero ayudamos"' },
    4: { name: 'Promesa específica', description: '"Te ayudamos a entender"' },
    5: { name: 'Split', description: 'Qué puede hacer + qué no' },
    6: { name: 'Esperanza', description: 'Mensaje prominente de esperanza' },
  },
};
