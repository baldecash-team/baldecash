/**
 * Perfiles de la calculadora, uno por landing.
 *
 * La ruta es `/[landing]/calculadora` y el componente es UNO SOLO para todas
 * las landings que corren este riel. Sin este archivo, cambiarle un texto a
 * titulación se lo cambia también a matrícula, que está activa en producción.
 *
 * Acá vive SOLO lo que cambia entre landings y no es configuración de negocio:
 * la copia visible, cuántos importes se piden, y si la institución la elige la
 * persona o la fija la landing.
 *
 * Lo que NO vive acá, y no debe mudarse: producto, variante, rango del monto,
 * plazos, tasa y comisión. Eso lo resuelve `landing.config.calculadora` contra
 * las celdas del backend, y tenerlo en dos lados garantiza que algún día la
 * pantalla y lo que se registra digan cosas distintas.
 *
 * El perfil se elige por el segmento `[landing]` de la URL. Es lo único que
 * ata copia a landing, y es deliberado: la alternativa era llevar los textos a
 * la configuración, lo que obliga a tocar el backend y a escribir en la base
 * para cada ajuste de wording.
 */

import React from 'react';
import type { TipoInstitucion } from '../universidad/types/instituciones';
import { routes } from '../../utils/routes';

/** Una de las dos claves de `MontosMatricula`, que es lo que el campo escribe. */
export type ClaveMonto = 'matricula' | 'primeraCuota';

export interface CampoMontoPerfil {
  clave: ClaveMonto;
  /** Etiqueta del campo en el formulario. */
  etiqueta: string;
  /**
   * Etiqueta de la misma cifra en la tabla del modal de detalle.
   *
   * Va aparte porque la del formulario puede ser una instrucción ("Ingresa
   * el monto…") y en una tabla de importes eso no se lee como un concepto.
   */
  etiquetaResumen: string;
  placeholder: string;
}

/**
 * Institución que la landing da por elegida.
 *
 * Cuando está, la pantalla de selección no forma parte del recorrido: se entra
 * directo a la calculadora y no hay a qué rebotar. Los tres datos son los que
 * viajan al paso académico del formulario, que con ellos setea y bloquea el
 * campo de institución.
 */
export interface InstitucionFija {
  /** Identificador en la tabla de centros de estudio de webservice2. */
  id: number;
  nombre: string;
  tipo: TipoInstitucion;
}

export interface PerfilCalculadora {
  /** Nombre del producto que viaja a /solicitar. No se muestra en esta pantalla. */
  productoNombre: string;
  /** Slug del producto en el catálogo de webservice2. */
  productoSlug: string;
  /** Línea con el ícono, arriba del título. */
  encabezado: string;
  /** El título depende de la institución cuando la elige la persona. */
  titulo: (institucionNombre: string | null) => string;
  subtitulo: string;
  /** Encabezado de la tarjeta de importes. */
  preguntaMontos: string;
  /** Los importes que se piden. Uno o dos; el que no se pide viaja en cero. */
  campos: CampoMontoPerfil[];
  /** Texto al pie de los importes. Es nodo y no cadena: lleva resaltados. */
  ayudaMontos: React.ReactNode;
  /** `null` cuando la elige la persona en la pantalla de selección. */
  institucionFija: InstitucionFija | null;
  /** A dónde vuelve el enlace del pie. */
  rutaVolver: (landing: string) => string;
  /**
   * Nota al pie del modal de detalle, sobre cuándo se fija el cronograma.
   *
   * Nombra a quién se le paga, así que cambia con el producto.
   */
  notaCronograma: string;
  /** Título de la pestaña cuando la landing no define uno propio. */
  metaTitulo: string;
  metaDescripcion: string;
}

/**
 * Financiamiento de matrícula. Es el perfil por omisión: cualquier landing que
 * corra la calculadora sin perfil propio se comporta como hasta ahora.
 */
const PERFIL_MATRICULA: PerfilCalculadora = {
  productoNombre: 'Financiamiento de Matrícula',
  productoSlug: 'prestamo-matricula-1186',
  encabezado: 'Pagamos directo a tu universidad',
  titulo: (institucionNombre) =>
    institucionNombre
      ? `Financiamiento de Matrícula — ${institucionNombre}`
      : 'Financiamiento de Matrícula',
  subtitulo:
    'Ingresa los montos exactos de tu matrícula y tu primera cuota, y elige cómo prefieres ' +
    'pagarlo. Evaluamos tu solicitud antes de confirmarla.',
  preguntaMontos: '¿Cuánto necesitas para inscribirte?',
  campos: [
    {
      clave: 'matricula',
      etiqueta: 'Monto de matrícula',
      etiquetaResumen: 'Monto de matrícula',
      placeholder: 'Ej. 350.50',
    },
    {
      clave: 'primeraCuota',
      etiqueta: 'Monto primera cuota',
      etiquetaResumen: 'Monto primera cuota',
      placeholder: 'Ej. 450.80',
    },
  ],
  ayudaMontos: (
    <>
      Escribe el monto exacto que te aparece al consultar tu código de alumno en el banco,
      <strong className="font-semibold text-neutral-600"> incluyendo los céntimos </strong>
      si los tuviera (por ejemplo, 350.50). Si ya pagaste uno de los dos por tu cuenta, déjalo en
      cero.
    </>
  ),
  institucionFija: null,
  rutaVolver: (landing) => routes.universidad(landing),
  notaCronograma:
    'Las fechas son referenciales y se calculan desde hoy. El cronograma definitivo se genera con ' +
    'la fecha real en que BaldeCash pague tu matrícula a la universidad.',
  metaTitulo: 'Calculadora de matrícula - BaldeCash',
  metaDescripcion:
    'Calcula la cuota mensual del financiamiento de tu matrícula. Pagamos directo a tu universidad.',
};

/**
 * Financiamiento de titulación en SENATI.
 *
 * Tres diferencias con matrícula, y las tres salen del mismo lugar: un solo
 * importe en vez de dos, copia propia, y la institución fija.
 *
 * El identificador 551 es SENATI en la tabla de centros de estudio, de tipo
 * `institute`. Es el mismo que ya figura en la lista curada de la pantalla de
 * selección, y el que el paso académico compara para bloquear el campo.
 */
const PERFIL_TITULACION_SENATI: PerfilCalculadora = {
  productoNombre: 'Financiamiento de Titulación',
  productoSlug: 'título-senati-1233',
  encabezado: 'Pagamos directo a Senati',
  titulo: () => 'Financiamiento de Titulación — SENATI',
  subtitulo:
    'Ingresa el monto correspondiente a tu proceso de titulación y elige cómo prefieres pagarlo. ' +
    'Evaluaremos tu solicitud antes de confirmarla.',
  preguntaMontos: '¿Cuánto necesitas financiar para tu titulación?',
  campos: [
    {
      clave: 'matricula',
      etiqueta: 'Ingresa el monto de titulación',
      etiquetaResumen: 'Monto del título',
      placeholder: 'Ej. 350.50',
    },
  ],
  ayudaMontos: (
    <>
      Ingresa los montos exactos correspondientes a tu proceso de titulación en SENATI, incluyendo
      los céntimos si los hubiera. Si algún concepto no aplica, déjalo en cero.
    </>
  ),
  institucionFija: { id: 551, nombre: 'Senati', tipo: 'institute' },
  rutaVolver: (landing) => routes.landingHome(landing),
  notaCronograma:
    'Las fechas son referenciales y se calculan desde hoy. El cronograma definitivo se genera con ' +
    'la fecha real en que BaldeCash pague tu trámite a Senati.',
  metaTitulo: 'Calculadora de titulación - BaldeCash',
  metaDescripcion:
    'Calcula la cuota mensual del financiamiento de tu titulación. Pagamos directo a Senati.',
};

const PERFILES_POR_LANDING: Record<string, PerfilCalculadora> = {
  'titulo-senati': PERFIL_TITULACION_SENATI,
};

/**
 * El perfil de una landing, o el de matrícula si no tiene uno propio.
 *
 * Cae al de matrícula en vez de fallar: una landing nueva con la calculadora
 * encendida y sin perfil muestra la pantalla de siempre, que es un texto
 * genérico pero funcional. Quedarse en blanco sería peor.
 */
export function perfilDe(landing: string): PerfilCalculadora {
  return PERFILES_POR_LANDING[landing] ?? PERFIL_MATRICULA;
}
