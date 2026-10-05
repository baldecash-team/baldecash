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

/**
 * Ayuda que se abre desde el propio campo.
 *
 * Los pasos van en una lista y no en un texto con saltos de línea: en un
 * párrafo corrido se leen como una sola instrucción larga, que es justo lo
 * que hay que evitar cuando la persona tiene que seguirlos en otra pantalla.
 */
export interface AyudaCampo {
  titulo: string;
  /** Un paso por elemento. Se dibujan numerados. */
  pasos: string[];
  /** Cierre destacado, debajo de los pasos. Opcional. */
  recomendacion?: string;
}

export interface CampoMontoPerfil {
  clave: ClaveMonto;
  /**
   * Código del campo del banco donde este importe viaja al formulario.
   *
   * Es lo único que liga la calculadora con el asistente: el importe se siembra
   * en el estado del formulario bajo esta clave, y el paso del asistente lo
   * recoge desde ahí. Tiene que coincidir EXACTO con el código del banco de
   * campos, y cada landing usa el suyo: matrícula financia matrícula y primera
   * cuota, titulación financia el trámite del título.
   */
  codigoFormulario: string;
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
  /** Sin esto el campo no muestra el botón de ayuda. */
  ayuda?: AyudaCampo;
}

/**
 * Ayuda del campo de texto.
 *
 * Es un párrafo con un enlace y no una lista de pasos como `AyudaCampo`: acá no
 * se guía por una pantalla ajena, se dice de dónde sale el dato y se ofrece el
 * documento que lo muestra. Forzar las dos formas en una sola estructura daría
 * un campo `pasos` con un solo elemento, que se dibuja numerado sin que haya
 * nada que numerar.
 */
export interface AyudaTexto {
  titulo: string;
  /** Nodo y no cadena: lleva resaltados. */
  cuerpo: React.ReactNode;
  /** Documento que se abre en otra pestaña. */
  enlace?: { texto: string; url: string };
}

/**
 * Dato de texto que la landing pide junto al importe.
 *
 * No entra en la simulación —no cambia la cuota ni el cronograma—, pero sin él
 * no se puede continuar: viaja al formulario y es lo que después liga la
 * solicitud con el trámite en la institución.
 */
export interface CampoTextoPerfil {
  /**
   * Código del campo del banco donde este dato viaja al formulario.
   *
   * Mismo contrato que en `CampoMontoPerfil`: tiene que coincidir EXACTO con el
   * código del banco de campos. Si el paso del asistente sigue mostrando ese
   * mismo campo, la persona lo va a encontrar completo.
   */
  codigoFormulario: string;
  etiqueta: string;
  placeholder: string;
  /**
   * Tope de caracteres.
   *
   * Es un límite de forma del código que emite la institución, no una regla de
   * negocio nuestra: cuando la institución lo cambia, cambia acá y en la
   * validación del campo en el banco.
   */
  maxLongitud: number;
  /** Aclaración bajo el campo, al lado del contador. */
  nota: string;
  ayuda?: AyudaTexto;
}

/**
 * Copia de la tarjeta de importe cuando la configuración lo deja fijo.
 *
 * Solo la copia. Que el monto sea fijo NO se declara acá: se deduce de que la
 * configuración de la landing traiga el mismo mínimo y el mismo máximo. Un
 * interruptor propio en el perfil sería un segundo lugar donde decir lo mismo,
 * y el día que discrepen la pantalla pediría un importe que el backend rechaza,
 * o mostraría fijo un número que en realidad admite un rango.
 */
export interface MontoFijoPerfil {
  /** Encabezado de la tarjeta, en lugar de `preguntaMontos`. */
  titulo: string;
  /** Rótulo sobre la cifra. */
  etiqueta: string;
  /** Aclaración bajo la cifra: de dónde sale ese número. */
  nota: string;
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
  /**
   * Copia de la tarjeta para cuando la configuración fije el importe.
   *
   * Sin esto, una landing con monto fijo cae en los textos genéricos. Con esto y
   * sin monto fijo en la configuración, no se usa: manda la configuración.
   */
  montoFijo?: MontoFijoPerfil;
  /** Dato de texto que se pide junto al importe. Sin él, no se dibuja ninguno. */
  campoTexto?: CampoTextoPerfil;
  /** Texto al pie de los importes. Es nodo y no cadena: lleva resaltados. */
  ayudaMontos: React.ReactNode;
  /**
   * El detalle del financiamiento se reduce al cronograma.
   *
   * Producto lo pidió para titulación: en esa pantalla quieren que se vea
   * cuándo y cuánto se paga, y nada más. Es por perfil y no por componente
   * porque matrícula corre el mismo modal y está en producción con el desglose
   * completo.
   */
  soloCronograma?: boolean;
  /**
   * El resumen no repite el importe financiado.
   *
   * En titulación el monto es fijo y ya se muestra en grande junto al
   * formulario, así que la fila del resumen lo dice dos veces en la misma
   * pantalla. Es por perfil y no por componente por la misma razón que
   * `soloCronograma`: matrícula corre el mismo resumen, está en producción y
   * nadie pidió cambiarlo.
   */
  ocultarMontoFinanciado?: boolean;
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
      codigoFormulario: 'enrollment_amount',
      etiqueta: 'Monto de matrícula',
      etiquetaResumen: 'Monto de matrícula',
      placeholder: 'Ej. 350.50',
    },
    {
      clave: 'primeraCuota',
      codigoFormulario: 'first_fee_amount',
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
  // Sirve con el importe fijo y con el importe a mano: no promete ninguna de
  // las dos cosas. El campo, cuando se pide, ya dice qué se pide.
  subtitulo:
    'Elige en cuántos meses quieres pagar tu titulación. Evaluaremos tu solicitud antes de ' +
    'confirmarla.',
  preguntaMontos: '¿Cuánto necesitas financiar para tu titulación?',
  montoFijo: {
    titulo: 'Monto de tu titulación',
    etiqueta: 'Monto a financiar',
    nota: 'Monto fijo del derecho de titulación en SENATI',
  },
  campos: [
    {
      clave: 'matricula',
      codigoFormulario: 'degree_amount',
      etiqueta: 'Ingresa el monto de titulación',
      etiquetaResumen: 'Monto del título',
      placeholder: 'Ej. 350.50',
      // Esta ayuda solo se ve si la configuración deja de traer el monto fijo,
      // que es el camino de respaldo. Explica dónde está el importe y nada más:
      // el número de ticket ahora se pide en esta misma pantalla, con su propia
      // ayuda, así que mandar a anotarlo desde acá sobra.
      ayuda: {
        titulo: '¿Dónde encuentro el monto?',
        pasos: [
          'Entra a la página de alumnos de Senati.',
          'En Inicio, ve a la opción Páginas administrativas.',
          'Desde ahí entra a SINFO.',
          'Inicia el proceso de titulación: si eres apto, el sistema te muestra el monto a pagar.',
        ],
      },
    },
  ],
  /**
   * El identificador del banco es `degree_receipt_number` (id 92), que ahí se
   * llama "Número de recibo". En pantalla se lee "ticket" porque es como lo
   * nombra SENATI en su propio trámite, y es lo que la persona tiene delante.
   */
  campoTexto: {
    codigoFormulario: 'degree_receipt_number',
    etiqueta: 'Número de Ticket de Título',
    placeholder: 'Ej. TKT00123456',
    maxLongitud: 16,
    nota: 'Hasta 16 caracteres alfanuméricos. Es el número que SENATI genera para tu trámite de titulación.',
    ayuda: {
      titulo: '¿Dónde consigo el número de ticket del título?',
      cuerpo: (
        <>
          Lo genera SENATI al iniciar el trámite del Título a Nombre de la Nación. Revisa la guía
          oficial de SENATI: en el <strong className="font-semibold text-neutral-800">paso 4</strong>{' '}
          se visualiza el ticket.
        </>
      ),
      enlace: {
        texto: 'Abrir la guía de SENATI (PDF)',
        url: '/docs/guia-titulacion-senati.pdf',
      },
    },
  },
  soloCronograma: true,
  ocultarMontoFinanciado: true,
  ayudaMontos: (
    <>
      Ingresa EL MONTO exacto correspondiente a tu proceso de titulación en SENATI, incluyendo los
      céntimos si los hubiera.
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
