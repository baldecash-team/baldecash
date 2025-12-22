// Mock Data for Convenio Landing - BaldeCash v0.4
// Generated from PROMPT_17_LANDING_CONVENIOS.md

import {
  ConvenioData,
  ConvenioTestimonial,
  ConvenioFaqItem,
  ConvenioBenefit,
  ProductoConvenio,
} from '../types/convenio';

// ============================================
// Convenios Data
// ============================================

export const convenios: ConvenioData[] = [
  {
    slug: 'certus',
    nombre: 'CERTUS',
    nombreCorto: 'CERTUS',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77a99272a25a2e81ae6a_certus%202.png',
    colorPrimario: '#E31837',
    colorSecundario: '#1E3A5F',
    descuentoCuota: 10,
    descuentoInicial: 5,
    mensajeExclusivo: 'Descuento exclusivo para estudiantes CERTUS',
    dominioEmail: 'certus.edu.pe',
    activo: true,
    fechaInicio: '2024-01-01',
    fechaFin: null,
    tipo: 'instituto',
  },
  {
    slug: 'upn',
    nombre: 'Universidad Privada del Norte',
    nombreCorto: 'UPN',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/65d8fd7f1bc5a9cb0dcaebec_upn.png',
    colorPrimario: '#F7941D',
    colorSecundario: '#231F20',
    descuentoCuota: 8,
    mensajeExclusivo: 'Beneficio especial para alumnos UPN',
    dominioEmail: 'upn.edu.pe',
    activo: true,
    fechaInicio: '2024-01-01',
    fechaFin: null,
    tipo: 'universidad',
  },
  {
    slug: 'upc',
    nombre: 'Universidad Peruana de Ciencias Aplicadas',
    nombreCorto: 'UPC',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97232b703bfd964ee870_universidad-peruana-de-ciencias-aplicadas-upc-logo-B98C3A365C-seeklogo%201.png',
    colorPrimario: '#003366',
    colorSecundario: '#FFD700',
    descuentoCuota: 12,
    descuentoInicial: 10,
    mensajeExclusivo: 'Precio especial convenio UPC',
    dominioEmail: 'upc.edu.pe',
    activo: true,
    fechaInicio: '2024-01-01',
    fechaFin: null,
    tipo: 'universidad',
  },
  {
    slug: 'tecsup',
    nombre: 'TECSUP',
    nombreCorto: 'TECSUP',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97247f31ad0cf1646031_8%20TECSUP%202.png',
    colorPrimario: '#0033A0',
    colorSecundario: '#FFD100',
    descuentoCuota: 10,
    mensajeExclusivo: 'Descuento especial para alumnos TECSUP',
    dominioEmail: 'tecsup.edu.pe',
    activo: true,
    fechaInicio: '2024-01-01',
    fechaFin: null,
    tipo: 'instituto',
  },
  {
    slug: 'senati',
    nombre: 'SENATI',
    nombreCorto: 'SENATI',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97241f715c1e9ac6dfcb_4%20Senati%201.png',
    colorPrimario: '#00539F',
    colorSecundario: '#FDB913',
    descuentoCuota: 8,
    mensajeExclusivo: 'Beneficio exclusivo para estudiantes SENATI',
    dominioEmail: 'senati.edu.pe',
    activo: true,
    fechaInicio: '2024-01-01',
    fechaFin: null,
    tipo: 'instituto',
  },
  {
    slug: 'usil',
    nombre: 'Universidad San Ignacio de Loyola',
    nombreCorto: 'USIL',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/65d8fd70e4cfd2a1d90e6a08_usil.png',
    colorPrimario: '#1E4D8C',
    colorSecundario: '#C7A962',
    descuentoCuota: 10,
    mensajeExclusivo: 'Precio preferencial para alumnos USIL',
    dominioEmail: 'usil.edu.pe',
    activo: true,
    fechaInicio: '2024-01-01',
    fechaFin: null,
    tipo: 'universidad',
  },
];

// Helper to get convenio by slug
export const getConvenioBySlug = (slug: string): ConvenioData | undefined => {
  return convenios.find((c) => c.slug === slug);
};

// Default convenio for preview
export const defaultConvenio = convenios[0];

// ============================================
// Testimonials Data
// ============================================

export const testimonios: ConvenioTestimonial[] = [
  // CERTUS testimonials
  {
    id: 'test-certus-1',
    nombre: 'María García',
    carrera: 'Administración de Negocios',
    universidad: 'certus',
    testimonio: 'Gracias al convenio CERTUS pude comprar mi laptop con un descuento increíble. El proceso fue súper rápido y ahora puedo hacer mis clases virtuales sin problemas.',
    foto: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: 5,
    equipoComprado: 'Lenovo IdeaPad 3',
    fechaCompra: '2024-10-15',
  },
  {
    id: 'test-certus-2',
    nombre: 'Carlos Mendoza',
    carrera: 'Contabilidad',
    universidad: 'certus',
    testimonio: 'No tenía historial crediticio pero igual me aprobaron. Las cuotas son súper accesibles y el 10% de descuento por ser de CERTUS me ayudó mucho.',
    foto: 'https://randomuser.me/api/portraits/men/2.jpg',
    rating: 5,
    equipoComprado: 'HP 15-ef2126wm',
    fechaCompra: '2024-09-20',
  },
  {
    id: 'test-certus-3',
    nombre: 'Ana Flores',
    carrera: 'Marketing Digital',
    universidad: 'certus',
    testimonio: 'Excelente servicio, me entregaron la laptop directamente en el campus. El descuento del convenio hizo que mis cuotas sean mucho más bajas de lo esperado.',
    foto: 'https://randomuser.me/api/portraits/women/3.jpg',
    rating: 5,
    equipoComprado: 'Acer Aspire 5',
    fechaCompra: '2024-11-01',
  },
  // UPN testimonials
  {
    id: 'test-upn-1',
    nombre: 'José Ramírez',
    carrera: 'Ingeniería de Sistemas',
    universidad: 'upn',
    testimonio: 'Como estudiante de UPN, el descuento del 8% me permitió acceder a una laptop más potente de la que había pensado. Perfecto para mis proyectos de programación.',
    foto: 'https://randomuser.me/api/portraits/men/4.jpg',
    rating: 5,
    equipoComprado: 'ASUS VivoBook 15',
    fechaCompra: '2024-10-05',
  },
  {
    id: 'test-upn-2',
    nombre: 'Lucía Torres',
    carrera: 'Arquitectura',
    universidad: 'upn',
    testimonio: 'Necesitaba una laptop potente para AutoCAD y gracias al convenio UPN conseguí financiamiento sin aval. Las cuotas son súper manejables.',
    foto: 'https://randomuser.me/api/portraits/women/5.jpg',
    rating: 5,
    equipoComprado: 'Dell Inspiron 15',
    fechaCompra: '2024-09-15',
  },
  // UPC testimonials
  {
    id: 'test-upc-1',
    nombre: 'Diego Sánchez',
    carrera: 'Ingeniería de Software',
    universidad: 'upc',
    testimonio: 'El convenio UPC tiene el mejor descuento, 12% menos en cada cuota. BaldeCash hizo todo súper fácil, solo necesité mi correo @upc.edu.pe para verificar.',
    foto: 'https://randomuser.me/api/portraits/men/6.jpg',
    rating: 5,
    equipoComprado: 'Lenovo ThinkPad E15',
    fechaCompra: '2024-10-20',
  },
  {
    id: 'test-upc-2',
    nombre: 'Valeria Castro',
    carrera: 'Diseño Gráfico',
    universidad: 'upc',
    testimonio: 'Increíble atención y el descuento por ser de UPC me ahorró bastante. Me entregaron mi laptop en menos de 48 horas.',
    foto: 'https://randomuser.me/api/portraits/women/7.jpg',
    rating: 5,
    equipoComprado: 'HP Pavilion x360',
    fechaCompra: '2024-11-05',
  },
  // TECSUP testimonials
  {
    id: 'test-tecsup-1',
    nombre: 'Fernando López',
    carrera: 'Electrónica Industrial',
    universidad: 'tecsup',
    testimonio: 'Como estudiante de TECSUP, el convenio me permitió comprar una laptop potente para mis proyectos técnicos. El 10% de descuento marca la diferencia.',
    foto: 'https://randomuser.me/api/portraits/men/8.jpg',
    rating: 5,
    equipoComprado: 'ASUS TUF Gaming F15',
    fechaCompra: '2024-09-30',
  },
  // SENATI testimonials
  {
    id: 'test-senati-1',
    nombre: 'Roberto Vargas',
    carrera: 'Mecatrónica',
    universidad: 'senati',
    testimonio: 'El proceso fue rapidísimo, en 24 horas ya tenía aprobado mi crédito. El descuento SENATI del 8% hace que las cuotas sean muy accesibles.',
    foto: 'https://randomuser.me/api/portraits/men/9.jpg',
    rating: 5,
    equipoComprado: 'Lenovo IdeaPad Gaming 3',
    fechaCompra: '2024-10-10',
  },
  // USIL testimonials
  {
    id: 'test-usil-1',
    nombre: 'Camila Reyes',
    carrera: 'Negocios Internacionales',
    universidad: 'usil',
    testimonio: 'Excelente experiencia con BaldeCash. El convenio USIL me dio un 10% de descuento y la laptop llegó perfecta a mi domicilio.',
    foto: 'https://randomuser.me/api/portraits/women/10.jpg',
    rating: 5,
    equipoComprado: 'Dell Inspiron 14',
    fechaCompra: '2024-11-10',
  },
];

// Helper to get testimonials by convenio
export const getTestimoniosByConvenio = (slug: string): ConvenioTestimonial[] => {
  return testimonios.filter((t) => t.universidad === slug);
};

// ============================================
// Benefits Data (Template - personalized per convenio)
// ============================================

export const getBenefitsByConvenio = (convenio: ConvenioData): ConvenioBenefit[] => [
  {
    id: 'benefit-1',
    icon: 'Percent',
    titulo: `${convenio.descuentoCuota}% menos en cada cuota`,
    descripcion: `Descuento exclusivo por ser estudiante de ${convenio.nombreCorto}`,
  },
  {
    id: 'benefit-2',
    icon: 'Clock',
    titulo: 'Aprobación en 24 horas',
    descripcion: 'Proceso simplificado para estudiantes con convenio',
  },
  {
    id: 'benefit-3',
    icon: 'Shield',
    titulo: 'Sin historial crediticio',
    descripcion: 'No necesitas historial bancario previo',
  },
  {
    id: 'benefit-4',
    icon: 'Truck',
    titulo: 'Entrega en tu campus',
    descripcion: `Recibe tu equipo directamente en ${convenio.nombreCorto}`,
  },
  {
    id: 'benefit-5',
    icon: 'CreditCard',
    titulo: 'Sin tarjeta de crédito',
    descripcion: 'Solo necesitas tu DNI y correo institucional',
  },
  {
    id: 'benefit-6',
    icon: 'Calendar',
    titulo: 'Hasta 24 cuotas',
    descripcion: 'Elige el plazo que mejor se adapte a tu presupuesto',
  },
];

// ============================================
// FAQ Data (Template - personalized per convenio)
// ============================================

export const getFaqsByConvenio = (convenio: ConvenioData): ConvenioFaqItem[] => [
  {
    id: 'faq-1',
    pregunta: '¿Cómo funciona el descuento por convenio?',
    respuesta: `Por ser estudiante de ${convenio.nombreCorto}, tienes un ${convenio.descuentoCuota}% de descuento automático en cada cuota mensual. El descuento se aplica automáticamente al verificar tu correo institucional (@${convenio.dominioEmail}).`,
    categoria: 'descuento',
  },
  {
    id: 'faq-2',
    pregunta: '¿Cómo verifico que soy estudiante?',
    respuesta: `Solo necesitas tu correo institucional de ${convenio.nombreCorto} (@${convenio.dominioEmail}) o tu carnet de estudiante vigente. La verificación es automática y toma menos de 1 minuto.`,
    categoria: 'verificacion',
  },
  {
    id: 'faq-3',
    pregunta: '¿Puedo recibir el equipo en el campus?',
    respuesta: `Sí, coordinamos entregas en el campus de ${convenio.nombreCorto} en horarios de atención. También puedes elegir delivery a tu domicilio sin costo adicional.`,
    categoria: 'entrega',
  },
  {
    id: 'faq-4',
    pregunta: '¿Qué requisitos necesito para aplicar?',
    respuesta: 'Solo necesitas: DNI vigente, correo institucional activo, y un recibo de servicios (luz, agua o teléfono). No necesitas historial crediticio ni aval.',
    categoria: 'proceso',
  },
  {
    id: 'faq-5',
    pregunta: '¿Cuánto tiempo toma la aprobación?',
    respuesta: 'El proceso de evaluación toma máximo 24 horas hábiles. Una vez aprobado, recibes tu equipo en 24-48 horas adicionales dependiendo de tu ubicación.',
    categoria: 'proceso',
  },
  {
    id: 'faq-6',
    pregunta: '¿El descuento aplica a todos los equipos?',
    respuesta: `Sí, el ${convenio.descuentoCuota}% de descuento por convenio ${convenio.nombreCorto} aplica a todos los equipos de nuestro catálogo: laptops, tablets y celulares.`,
    categoria: 'descuento',
  },
  {
    id: 'faq-7',
    pregunta: '¿Puedo pagar mi cuota por adelantado?',
    respuesta: 'Sí, puedes adelantar cuotas sin penalidad. También puedes pagar el total del crédito antes del plazo sin ningún costo adicional.',
    categoria: 'general',
  },
  {
    id: 'faq-8',
    pregunta: '¿Qué pasa si me atraso en una cuota?',
    respuesta: 'Entendemos que a veces hay imprevistos. Si tienes dificultades, contáctanos antes de la fecha de vencimiento y buscaremos una solución juntos. Hay intereses por mora después de los 8 días de atraso.',
    categoria: 'general',
  },
];

// ============================================
// Products Data (Featured for convenio landing)
// ============================================

export const productosDestacados: ProductoConvenio[] = [
  {
    id: 'prod-1',
    slug: 'lenovo-ideapad-3',
    nombre: 'Lenovo IdeaPad 3 15.6"',
    imagen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop',
    cuotaMensual: 89,
    precioTotal: 2499,
    marca: 'Lenovo',
    destacado: true,
  },
  {
    id: 'prod-2',
    slug: 'hp-pavilion-15',
    nombre: 'HP Pavilion 15.6" Touch',
    imagen: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&fit=crop',
    cuotaMensual: 109,
    precioTotal: 2999,
    marca: 'HP',
    destacado: true,
  },
  {
    id: 'prod-3',
    slug: 'asus-vivobook-15',
    nombre: 'ASUS VivoBook 15 OLED',
    imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
    cuotaMensual: 129,
    precioTotal: 3499,
    marca: 'ASUS',
    destacado: true,
  },
  {
    id: 'prod-4',
    slug: 'dell-inspiron-14',
    nombre: 'Dell Inspiron 14"',
    imagen: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop',
    cuotaMensual: 99,
    precioTotal: 2799,
    marca: 'Dell',
    destacado: false,
  },
  {
    id: 'prod-5',
    slug: 'acer-aspire-5',
    nombre: 'Acer Aspire 5 15.6"',
    imagen: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&h=400&fit=crop',
    cuotaMensual: 79,
    precioTotal: 2199,
    marca: 'Acer',
    destacado: false,
  },
  {
    id: 'prod-6',
    slug: 'lenovo-thinkpad-e15',
    nombre: 'Lenovo ThinkPad E15',
    imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    cuotaMensual: 149,
    precioTotal: 3999,
    marca: 'Lenovo',
    destacado: true,
  },
];

// Helper to calculate discounted price
export const calcularCuotaConDescuento = (cuotaOriginal: number, descuento: number): number => {
  return Math.round(cuotaOriginal * (1 - descuento / 100));
};

// Helper to calculate total savings
export const calcularAhorroTotal = (cuotaOriginal: number, descuento: number, plazo: number): number => {
  const cuotaDescuento = calcularCuotaConDescuento(cuotaOriginal, descuento);
  return (cuotaOriginal - cuotaDescuento) * plazo;
};

// Alias for backwards compatibility
export const conveniosList = convenios;
