/**
 * Casos en los que el courier volvió sin entregar (reporte de logística del
 * 24 y 25 de setiembre de 2026), para ver en la muestra qué hace el formulario
 * con cada uno.
 *
 * Anonimizados: sin nombres, teléfonos ni números de solicitud, y con los
 * números de lote y de puerta cambiados. Se conserva la forma de la dirección
 * y de la referencia, que es lo que hizo fallar la entrega.
 */

import type { EntregaDireccionInicial } from '../components/FormularioEntrega';

export type MotivoCourier =
  | 'Zonificación errada'
  | 'Dirección no ubicada / faltan referencias'
  | 'Dirección equivocada'
  | 'Dirección incompleta'
  | 'Código de Google';

export interface CasoCourier {
  id: string;
  motivo: MotivoCourier;
  /** Para el botón: dónde era la entrega. */
  zona: string;
  /** Qué tenía el courier y por qué no alcanzó. */
  problema: string;
  /** Qué le pide ahora el formulario a la persona. */
  ahora: string;
  direccion: EntregaDireccionInicial;
}

export const CASOS_COURIER: CasoCourier[] = [
  {
    id: 'piura-mz',
    motivo: 'Zonificación errada',
    zona: 'Piura',
    problema: 'Solo Mz y Lote de una urbanización por etapas; la referencia no decía qué etapa ni qué calle.',
    ahora: 'Pide confirmar la referencia a la vista y el distrito con el selector, no a mano.',
    direccion: {
      direccion: 'Mz B2 Lote 18, Urb. Sol de Piura 1ra etapa',
      referencia: 'Frente al parque',
      ubicacion: 'Piura, Piura, Piura',
      distrito: 'Piura',
      distritoId: '1755',
    },
  },
  {
    id: 'ventanilla-cedros',
    motivo: 'Zonificación errada',
    zona: 'Ventanilla',
    problema: 'La dirección vivía en la referencia: "poner en Google Maps Av. Indoamérica y Nicaragua…". En la guía no había calle.',
    ahora: 'La referencia se edita en su campo y la dirección tiene que ser una calle o Mz y Lote.',
    direccion: {
      direccion: 'Mz Y Lt 11 Los Cedros 2da Etapa',
      referencia: 'Poner en Google Maps Av. Indoamérica y Nicaragua. En la esquina hay un paradero de motos; casa azul',
      ubicacion: 'Ventanilla, Callao, Callao',
      distrito: 'Ventanilla',
      distritoId: '2051',
    },
  },
  {
    id: 'trujillo-aahh',
    motivo: 'Zonificación errada',
    zona: 'Trujillo',
    problema: 'Asentamiento humano con barrio y lote, sin referencia: el courier no encontró el barrio.',
    ahora: 'Sin referencia no deja finalizar.',
    direccion: {
      direccion: 'Mz K Lote 14 AA.HH. Armando Villanueva del Campo, Barrio 5 D',
      referencia: '',
      ubicacion: 'Trujillo, Trujillo, La Libertad',
      distrito: 'Trujillo',
      distritoId: '1347',
    },
  },
  {
    id: 'ate-asociacion',
    motivo: 'Dirección no ubicada / faltan referencias',
    zona: 'Ate',
    problema: 'Nombre de asociación con Mz y Lote, sin avenida cercana ni referencia.',
    ahora: 'Sin referencia no deja finalizar.',
    direccion: {
      direccion: 'Asociación Felix Raucana Mz N Lt 27',
      referencia: '',
      ubicacion: 'Ate, Lima, Lima',
      distrito: 'Ate',
      distritoId: '1471',
    },
  },
  {
    id: 'carabayllo-ah',
    motivo: 'Dirección no ubicada / faltan referencias',
    zona: 'Carabayllo',
    problema: 'Nombre largo de asociación de vivienda con un código de lote interno ("Z-24") que no está en ningún mapa.',
    ahora: 'Sin referencia no deja finalizar.',
    direccion: {
      direccion: 'CA Arquitectos, Los Z-20, A.H. Asoc. Vivienda Autog. San Benito 2da Etapa',
      referencia: '',
      ubicacion: 'Carabayllo, Lima, Lima',
      distrito: 'Carabayllo',
      distritoId: '1473',
    },
  },
  {
    id: 'rimac-4ta-cruz',
    motivo: 'Dirección no ubicada / faltan referencias',
    zona: 'Rímac',
    problema: 'Avenida con número, pero la referencia era solo "4ta cruz".',
    ahora: 'Una referencia de menos de 10 letras no pasa: pide más detalle.',
    direccion: {
      direccion: 'Av. San Cristóbal 418',
      referencia: '4ta cruz',
      ubicacion: 'Rímac, Lima, Lima',
      distrito: 'Rimac',
      distritoId: '1490',
    },
  },
  {
    id: 'chorrillos-mz',
    motivo: 'Dirección no ubicada / faltan referencias',
    zona: 'Chorrillos',
    problema: 'Avenida sin número mezclada con Mz, Lote y un código de caseta, sin referencia.',
    ahora: 'Sin referencia no deja finalizar.',
    direccion: {
      direccion: 'Avenida San Juan Mz H1 Lt 17 C41, Túpac Amaru',
      referencia: '',
      ubicacion: 'Chorrillos, Lima, Lima',
      distrito: 'Chorrillos',
      distritoId: '1476',
    },
  },
  {
    id: 'sjl-paradero',
    motivo: 'Dirección no ubicada / faltan referencias',
    zona: 'San Juan de Lurigancho',
    problema: 'La "dirección" era un paradero: la persona vive en un cerro y la esperaban ahí. No hay calle.',
    ahora: 'La dirección tiene que ser una calle o Mz y Lote; el punto de encuentro va en la referencia.',
    direccion: {
      direccion: 'Paradero Corporación Roma',
      referencia: 'Vive en un cerro, se encuentran en este paradero',
      ubicacion: 'San Juan de Lurigancho, Lima, Lima',
      distrito: 'San Juan de Lurigancho',
      distritoId: '1505',
    },
  },
  {
    id: 'lurigancho-guion',
    motivo: 'Dirección equivocada',
    zona: 'Lurigancho-Chosica',
    problema: 'Calle con número, pero la referencia heredada era un "-".',
    ahora: 'Un "-" o "ninguna" cuentan como vacío: pide una referencia real.',
    direccion: {
      direccion: 'Las Casuarinas 127',
      referencia: '-',
      ubicacion: 'Lurigancho-Chosica, Lima, Lima',
      distrito: 'Lurigancho-Chosica',
      distritoId: '1480',
    },
  },
  {
    id: 'larco-incompleta',
    motivo: 'Dirección incompleta',
    zona: 'Víctor Larco Herrera',
    problema: 'Calle y urbanización, sin interior ni referencia.',
    ahora: 'Sin referencia no deja finalizar.',
    direccion: {
      direccion: 'Garcilazo de la Vega 152 - Vista Alegre',
      referencia: '',
      ubicacion: 'Victor Larco Herrera, Trujillo, La Libertad',
      distrito: 'Victor Larco Herrera',
      distritoId: '1353',
    },
  },
  {
    id: 'ves-plus-code',
    motivo: 'Código de Google',
    zona: 'Villa El Salvador',
    problema: 'Google no encontró calle y devolvió un plus code con coordenadas. El repartidor no puede leerlo.',
    ahora: 'Al finalizar vuelve a la dirección y pide la calle o Mz y Lote.',
    direccion: {
      direccion: 'R22G+RRF 12.1978510, -76.9729758',
      referencia: '',
      ubicacion: 'Villa El Salvador, Lima, Lima',
      distrito: 'Villa El Salvador',
      distritoId: '1509',
    },
  },
];
