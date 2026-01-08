// Mock Data for Convenio Landing - BaldeCash v0.5
// Colores oficiales verificados de cada institución

import {
  ConvenioData,
  ConvenioTestimonial,
  ConvenioFaqItem,
  ConvenioBenefit,
  ProductoConvenio,
} from '../types/convenio';

// ============================================
// Convenios Data - COLORES OFICIALES CORREGIDOS
// ============================================

export const convenios: ConvenioData[] = [
  {
    slug: 'certus',
    nombre: 'CERTUS',
    nombreCorto: 'CERTUS',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77a99272a25a2e81ae6a_certus%202.png',
    // Colores oficiales verificados (Brandfetch)
    colorPrimario: '#0c2661', // Madison (Azul oscuro)
    colorSecundario: '#fecc1f', // Lightning Yellow
    descuentoCuota: 10,
    descuentoInicial: 5,
    mensajeExclusivo: 'Descuento exclusivo para estudiantes CERTUS',
    dominioEmail: 'certus.edu.pe',
    activo: true,
    tipo: 'instituto',
  },
  {
    slug: 'upn',
    nombre: 'Universidad Privada del Norte',
    nombreCorto: 'UPN',
    logo: 'https://logosenvector.com/logo/img/universidad-privada-del-norte-upn-37731.png',
    // Colores oficiales verificados (Brandfetch)
    colorPrimario: '#fdba30', // Sunglow (Amarillo-naranja)
    colorSecundario: '#987531', // Luxor Gold
    descuentoCuota: 8,
    mensajeExclusivo: 'Beneficio especial para alumnos UPN',
    dominioEmail: 'upn.edu.pe',
    activo: true,
    tipo: 'universidad',
  },
  {
    slug: 'upc',
    nombre: 'Universidad Peruana de Ciencias Aplicadas',
    nombreCorto: 'UPC',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97232b703bfd964ee870_universidad-peruana-de-ciencias-aplicadas-upc-logo-B98C3A365C-seeklogo%201.png',
    // Color corregido por el usuario
    colorPrimario: '#d50000', // Rojo UPC
    colorSecundario: '#4B4B4B', // Charcoal Grey
    descuentoCuota: 12,
    descuentoInicial: 10,
    mensajeExclusivo: 'Precio especial convenio UPC',
    dominioEmail: 'upc.edu.pe',
    activo: true,
    tipo: 'universidad',
  },
  {
    slug: 'tecsup',
    nombre: 'TECSUP',
    nombreCorto: 'TECSUP',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97247f31ad0cf1646031_8%20TECSUP%202.png',
    // Colores oficiales verificados (Brandfetch)
    colorPrimario: '#005290', // Congress Blue
    colorSecundario: '#01acf1', // Cerulean (Celeste)
    descuentoCuota: 10,
    mensajeExclusivo: 'Descuento especial para alumnos TECSUP',
    dominioEmail: 'tecsup.edu.pe',
    activo: true,
    tipo: 'instituto',
  },
  {
    slug: 'senati',
    nombre: 'SENATI',
    nombreCorto: 'SENATI',
    logo: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97241f715c1e9ac6dfcb_4%20Senati%201.png',
    // Colores oficiales verificados (WhatTheLogo)
    colorPrimario: '#004892', // Azul oscuro
    colorSecundario: '#FDB913', // Amarillo (mantenido)
    descuentoCuota: 8,
    mensajeExclusivo: 'Beneficio exclusivo para estudiantes SENATI',
    dominioEmail: 'senati.edu.pe',
    activo: true,
    tipo: 'instituto',
  },
  {
    slug: 'usil',
    nombre: 'Universidad San Ignacio de Loyola',
    nombreCorto: 'USIL',
    logo: 'https://images.seeklogo.com/logo-png/39/1/usil-logo-png_seeklogo-399448.png',
    // Colores oficiales verificados (WhatTheLogo)
    colorPrimario: '#004A85', // Dark blue
    colorSecundario: '#797A7D', // Medium grey
    descuentoCuota: 10,
    mensajeExclusivo: 'Precio preferencial para alumnos USIL',
    dominioEmail: 'usil.edu.pe',
    activo: true,
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
  },
  {
    id: 'test-certus-3',
    nombre: 'Ana Flores',
    carrera: 'Marketing Digital',
    universidad: 'certus',
    testimonio: 'Excelente servicio, me entregaron la laptop directamente en el campus. El descuento del convenio hizo que mis cuotas fueran mucho más bajas de lo esperado.',
    foto: 'https://randomuser.me/api/portraits/women/3.jpg',
    rating: 5,
    equipoComprado: 'Acer Aspire 5',
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
  },
];

// Helper to get testimonials by convenio
export const getTestimoniosByConvenio = (slug: string): ConvenioTestimonial[] => {
  return testimonios.filter((t) => t.universidad === slug);
};

// ============================================
// Benefits Data
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
// FAQ Data
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
];

// ============================================
// Products Data
// ============================================

export const productosDestacados: ProductoConvenio[] = [
  {
    id: 'prod-1',
    slug: 'lenovo-ideapad-3',
    nombre: 'Lenovo IdeaPad 3 15.6"',
    imagen: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=400&hei=400&fmt=jpeg&qlt=95&.v=1653084303665',
    cuotaMensual: 89,
    precioTotal: 2499,
    marca: 'Lenovo',
    destacado: true,
  },
  {
    id: 'prod-2',
    slug: 'hp-pavilion-15',
    nombre: 'HP Pavilion 15.6" Touch',
    imagen: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-m4-pro-max-silver-select-202411?wid=400&hei=400&fmt=jpeg&qlt=95&.v=1729284686832',
    cuotaMensual: 109,
    precioTotal: 2999,
    marca: 'HP',
    destacado: true,
  },
  {
    id: 'prod-3',
    slug: 'asus-vivobook-15',
    nombre: 'ASUS VivoBook 15 OLED',
    imagen: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-m4-midnight-select-202503?wid=400&hei=400&fmt=jpeg&qlt=95&.v=1738012642498',
    cuotaMensual: 129,
    precioTotal: 3499,
    marca: 'ASUS',
    destacado: true,
  },
];

// Helper to calculate discounted price
export const calcularCuotaConDescuento = (cuotaOriginal: number, descuento: number): number => {
  return Math.round(cuotaOriginal * (1 - descuento / 100));
};
