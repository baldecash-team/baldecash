// Landing Types - BaldeCash v0.5
// Configuración fija - Sin variaciones para A/B testing

export interface CampaignData {
  id: string;
  slug: string;
  nombre: string;
  titulo: string;
  subtitulo: string;
  colorPrimario: string;
  colorSecundario: string;
  bannerTexto: string;
  activo: boolean;
}

export interface LandingBenefit {
  id: string;
  icon: string;
  texto: string;
}

export interface LandingProduct {
  id: string;
  nombre: string;
  imagen: string;
  cuotaMensual: number;
  precioTotal: number;
  destacado?: boolean;
}

export interface Region {
  id: string;
  nombre: string;
  provincias: Provincia[];
}

export interface Provincia {
  id: string;
  nombre: string;
}

export interface InstitucionEducativa {
  id: string;
  nombre: string;
  tipo: 'universidad' | 'instituto' | 'colegio' | 'otro';
}

export interface LeadFormData {
  correo: string;
  whatsapp: string;
  dni: string;
  regionId: string;
  provinciaId: string;
  institucionId: string;
  aceptaTerminos: boolean;
  aceptaPromociones: boolean;
}
