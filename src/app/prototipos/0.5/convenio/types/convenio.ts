// Convenio Types - BaldeCash v0.5
// Configuración fija - Sin variaciones para A/B testing

export interface ConvenioData {
  slug: string;
  nombre: string;
  nombreCorto: string;
  logo: string;
  colorPrimario: string;
  colorSecundario: string;
  descuentoCuota: number;
  descuentoInicial?: number;
  mensajeExclusivo: string;
  dominioEmail: string;
  activo: boolean;
  tipo: 'instituto' | 'universidad';
}

export interface ConvenioTestimonial {
  id: string;
  nombre: string;
  carrera: string;
  universidad: string;
  testimonio: string;
  foto?: string;
  rating?: number;
  equipoComprado?: string;
}

export interface ConvenioFaqItem {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria?: 'descuento' | 'verificacion' | 'proceso' | 'entrega' | 'general';
}

export interface ConvenioBenefit {
  id: string;
  icon: string;
  titulo: string;
  descripcion: string;
}

export interface ProductoConvenio {
  id: string;
  slug: string;
  nombre: string;
  imagen: string;
  cuotaMensual: number;
  precioTotal: number;
  marca: string;
  destacado?: boolean;
}
