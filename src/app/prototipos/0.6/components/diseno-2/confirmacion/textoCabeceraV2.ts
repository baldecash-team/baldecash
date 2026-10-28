/**
 * Textos de la cabecera de `ConfirmacionV2` (F8, BAL-4967): reglas puras, sin
 * JSX, para poder probarlas sin montar nada.
 *
 * Los cuatro primeros casos (firmada / completado / aprobado / CADE) son el
 * MISMO contenido que `ReceivedMessage` (Diseño 1) — ese texto ya está
 * aprobado y no lo trae el brief de F8 (que solo cubre el caso por defecto:
 * "recibimos tu solicitud"), así que no se inventa uno nuevo. Lo único que
 * cambia es la presentación (F8), no la redacción de esos casos heredados.
 *
 * El caso por defecto SÍ es el texto nuevo de Brenda: "¡Recibimos tu
 * solicitud, {Nombre}!" + el plazo de WhatsApp.
 */

export interface DatosCabeceraV2 {
  userName: string;
  /** Mismo plazo que usa Diseño 1 (`data.estimatedResponseHours`, hoy 24). Nunca se inventa uno nuevo. */
  estimatedResponseHours: number;
  /**
   * Celular del titular enmascarado (`applicant_phone_masked` de `/status`,
   * BAL-4969). Sin él, la frase omite "al +51 …".
   */
  telefono?: string | null;
  modoCierreKyc?: 'completado' | 'aprobado' | null;
  cierre?: {
    firmada: boolean;
    pendiente: { pago_inicial: boolean; formulario: boolean };
  } | null;
  overlayVariant?: string | null;
}

export interface TextoCabeceraV2 {
  titulo: string;
  subtitulo: string;
  /**
   * La línea de tiempo "¿Qué pasa ahora?" solo tiene sentido en el caso por
   * defecto: a quien ya firmó, fue aprobado o fue "completado" por KYC,
   * decirle "estamos revisando" sería falso (mismo criterio que el comentario
   * de `ReceivedScreen` sobre por qué Diseño 1 no pinta `ApplicationStatus`
   * ahí).
   */
  mostrarLineaDeTiempo: boolean;
}

/** El centinela que deja `buildReceivedData` cuando no hay nombre real. */
const SIN_NOMBRE = 'Usuario';

/** `data.userName` tal como lo deja `buildReceivedData`, o `null` si es el centinela de "sin nombre". */
export function nombreOVacio(userName: string | null | undefined): string | null {
  const limpio = (userName || '').trim();
  return limpio && limpio !== SIN_NOMBRE ? limpio : null;
}

function fraseWhatsApp(telefono: string | null | undefined, horas: number): string {
  const limpio = (telefono || '').trim();
  // El número va con espacios que no se cortan: así «+51» nunca queda al
  // final de una línea y el resto en la siguiente (Emilio, 28-oct).
  const numero = `+51 ${limpio}`.replace(/ /g, ' ');
  const destino = limpio ? ` al ${numero}` : '';
  return `Ya la estamos revisando. Te avisamos el resultado por WhatsApp${destino} en máximo ${horas} horas.`;
}

export function textoCabeceraV2(datos: DatosCabeceraV2): TextoCabeceraV2 {
  const nombre = nombreOVacio(datos.userName);
  const sufijoNombre = nombre ? `, ${nombre}` : '';
  const firmada = datos.cierre?.firmada === true;
  const isCade = datos.overlayVariant === 'cade';

  if (firmada) {
    const pendiente = datos.cierre?.pendiente;
    return {
      titulo: `¡Solicitud firmada${sufijoNombre}!`,
      subtitulo: pendiente?.pago_inicial
        ? 'Tu contrato quedó firmado. Para coordinar la entrega de tu equipo, solo falta que pagues tu cuota inicial desde Zona Clientes.'
        : pendiente?.formulario
          ? 'Tu contrato quedó firmado. Solo falta que completes el formulario que te enviamos por WhatsApp y correo.'
          : 'Tu contrato quedó firmado. Te enviamos por WhatsApp y correo tu copia y los siguientes pasos.',
      mostrarLineaDeTiempo: false,
    };
  }
  if (datos.modoCierreKyc === 'completado') {
    return {
      titulo: `¡Felicitaciones por finalizar todo el proceso${sufijoNombre}!`,
      subtitulo: 'Tu contrato quedó firmado. Te enviamos por WhatsApp y correo los siguientes pasos.',
      mostrarLineaDeTiempo: false,
    };
  }
  if (datos.modoCierreKyc === 'aprobado') {
    return {
      titulo: `¡Solicitud aprobada${sufijoNombre}!`,
      subtitulo: 'Tu solicitud quedó aprobada. Nos pondremos en contacto contigo para los siguientes pasos.',
      mostrarLineaDeTiempo: false,
    };
  }
  if (isCade) {
    return {
      titulo: `¡Gracias por ser parte del CADE${sufijoNombre}!`,
      subtitulo: fraseWhatsApp(datos.telefono, datos.estimatedResponseHours),
      mostrarLineaDeTiempo: true,
    };
  }
  return {
    titulo: nombre ? `¡Recibimos tu solicitud, ${nombre}!` : '¡Recibimos tu solicitud!',
    subtitulo: fraseWhatsApp(datos.telefono, datos.estimatedResponseHours),
    mostrarLineaDeTiempo: true,
  };
}
