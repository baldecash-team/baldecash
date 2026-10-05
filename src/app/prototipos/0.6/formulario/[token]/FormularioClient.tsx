'use client';

/**
 * FormularioClient — ruta `/formulario/[token]`.
 *
 * La pantalla que recibe el estudiante después de dejar su solicitud: resumen
 * del producto, un módulo numerado por documento que el backend decidió pedir
 * (`modulos`, tal como vienen), cuándo y por dónde quiere que lo contacte su
 * asesor, dudas y un único botón Enviar.
 *
 * Seis caminos, los mismos que `EntregaClient`:
 * - datos válidos → formulario
 * - ya enviado (`status = submitted`) o envío ok → confirmación
 * - enlace vencido/revocado/consumido → "Este enlace venció"
 * - enlace inválido / de otro flujo → "Este enlace no es válido"
 * - red → pantalla de reintento
 *
 * Reglas de UI (casuísticas §7): los módulos se colapsan a "Listo" al
 * completarse (el de nota de voz queda abierto para escucharla); la pantalla
 * de carga dice solo "Cargando…"; los mensajes de éxito son una línea y los de
 * error explican qué corregir; con "hoy" no se ofrecen bloques terminados ni
 * horas pasadas y después de las 8pm "hoy" se deshabilita; la dirección sin
 * número se marca en rojo y bloquea el envío hasta corregirla.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  cerrarTelemetria, cronometrar, evento, iniciarTelemetria, medir, verSeccion,
  type Seccion as SeccionMedida,
} from '../../services/telemetria';
import {
  borrarArchivo,
  cumplirConTexto,
  enviarFormulario,
  getFormulario,
  guardarParcial,
  isFormularioApiError,
  renovarEnlace,
  subirArchivo,
  type ContactChannel,
  type ContactSlot,
  type EnviarPayload,
  type GuardarParcialPayload,
  type Modulo,
  type ModuloCode,
  type Pantalla,
} from '@/app/prototipos/0.6/services/formularioApi';
import { Ic } from './icons';

/** Logo de la marca sobre fondo claro, el mismo que usan el modal del cupón y
 * los datos estructurados del sitio. */
const LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

/** Ejemplos de cada documento. Son capturas sinteticas (sin datos de nadie),
 * las mismas que usa el validador de OCR, servidas desde S3 --- carpeta
 * publica, WebP de ~100 KB --- para no atarlas al deploy de este front. */
const EJEMPLOS: Partial<Record<ModuloCode, { url: string; alt: string; pie: string }>> = {
  utility_bill: {
    url: 'https://baldecash.s3.amazonaws.com/illustrations/formulario-posterior/recibo.webp',
    alt: 'Recibo de luz de ejemplo', pie: 'Que se lean la direccion y el mes.',
  },
  payslip: {
    url: 'https://baldecash.s3.amazonaws.com/illustrations/formulario-posterior/boleta.webp',
    alt: 'Boleta de pago de ejemplo', pie: 'Que se vean tu nombre y el periodo.',
  },
  tax_report: {
    url: 'https://baldecash.s3.amazonaws.com/illustrations/formulario-posterior/rt.webp',
    alt: 'Reporte tributario de SUNAT de ejemplo', pie: 'El reporte completo, no una sola pagina.',
  },
  fee_receipt_1: {
    url: 'https://baldecash.s3.amazonaws.com/illustrations/formulario-posterior/rxh.webp',
    alt: 'Recibo por honorarios de ejemplo', pie: 'Uno por cada uno de tus 3 ultimos meses.',
  },
  income_movements: {
    url: 'https://baldecash.s3.amazonaws.com/illustrations/formulario-posterior/yape.webp',
    alt: 'Captura de un pago recibido por Yape', pie: 'Que se vean el monto y la fecha.',
  },
};

/** Enlace muerto pero conocido: existió, ya no sirve. */
/** Enlace muerto pero conocido: existió, ya no sirve. `superseded` es el caso
 * en que se emitió uno más nuevo (no es error del estudiante); `submitted` es
 * que el formulario ya se envió con este enlace. */
export type EnlaceCaidoReason = 'expired' | 'revoked' | 'consumed' | 'inactive' | 'superseded';
const EXPIRED_REASONS = new Set<string>(['expired', 'revoked', 'consumed', 'inactive', 'superseded']);

const MIN_VOZ = 10; // segundos mínimos de una nota de voz
const MIN_TEXTO = 10;

type Confirmacion = { dia: string; horario: string; canal: string; telefono: string };
type ViewState =
  | { status: 'loading' }
  | { status: 'ready'; datos: Pantalla }
  | { status: 'done'; datos: Pantalla | null; contacto: Confirmacion }
  | { status: 'expired'; reason: EnlaceCaidoReason }
  | { status: 'submitted' }
  | { status: 'invalid' }
  | { status: 'network' };

/** Traduce un error del API a la pantalla terminal que corresponde. Vale para
 * la carga y para cualquier acción posterior (el enlace puede morir a mitad). */
function vistaDeError(reason: string): ViewState {
  if (reason === 'network') return { status: 'network' };
  if (reason === 'submitted') return { status: 'submitted' };
  if (EXPIRED_REASONS.has(reason)) return { status: 'expired', reason: reason as EnlaceCaidoReason };
  return { status: 'invalid' };
}

type DiaKey = 'hoy' | 'manana' | 'pasado';
type TurnoKey = 'manana' | 'mediodia' | 'tarde' | 'noche' | 'otro';

const TURNO: Record<Exclude<TurnoKey, 'otro'>, [string, string, ContactSlot]> = {
  manana: ['Mañana', '9am a 12pm', '09_12'],
  mediodia: ['Mediodía', '12 a 2pm', '12_14'],
  tarde: ['Tarde', '3 a 6pm', '15_18'],
  noche: ['Noche', '6 a 8pm', '18_20'],
};
const FIN_TURNO: Record<Exclude<TurnoKey, 'otro'>, number> = {
  manana: 12 * 60, mediodia: 14 * 60, tarde: 18 * 60, noche: 20 * 60,
};
const DN = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DNL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const fecha = (k: DiaKey) => {
  const d = new Date();
  d.setDate(d.getDate() + (k === 'hoy' ? 0 : k === 'manana' ? 1 : 2));
  return d;
};
/** YYYY-MM-DD en hora LOCAL (no `toISOString`, que corre el día en Lima). */
export const fechaIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const aMin = (h: string, m: string, ap: string) =>
  ((parseInt(h, 10) % 12) + (ap === 'pm' ? 12 : 0)) * 60 + parseInt(m, 10);
const deMin = (t: number) => {
  const h24 = Math.floor(t / 60) % 24;
  return { hh: String(h24 % 12 || 12), mm: String(t % 60).padStart(2, '0'), ap: h24 >= 12 ? 'pm' : 'am' };
};
const diaTxt = (k: DiaKey) => {
  const d = fecha(k);
  return k === 'hoy' ? 'hoy' : k === 'manana' ? 'mañana' : `el ${DNL[d.getDay()].toLowerCase()} ${d.getDate()}`;
};
const horaTxt = (h: string, m: string, ap: string) => `${h}${m === '00' ? '' : ':' + m} ${ap}`;
const fmtTel = (t: string) => t.replace(/\s+/g, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
const fmtSeg = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Un archivo rechazado que sigue adjunto. En un módulo de varios —las capturas
 * de movimientos— el estado del módulo lo deja el ÚLTIMO que subió, así que una
 * captura rechazada quedaba escondida detrás de una buena y el estudiante creía
 * que podía enviar. */
const tieneRechazado = (m: Modulo) => m.documents.some((d) => d.status === 'rejected');

/** Un módulo cuenta como cumplido para el envío. */
export const moduloListo = (m: Modulo) =>
  // Al tope de intentos ya no puede subir otro: queda para revisión manual y no
  // debe trabarlo para siempre.
  (m.status === 'rejected' && m.attempt_count >= m.max_attempts) ||
  ((m.status === 'uploaded' || m.status === 'verified' || m.status === 'skipped') &&
    !(tieneRechazado(m) && m.attempt_count < m.max_attempts));

const puedeReintentar = (m: Modulo) => m.status !== 'rejected' || m.attempt_count < m.max_attempts;

const acceptDe = (m: Modulo) =>
  (m.document_type?.accepted_formats ?? ['jpg', 'jpeg', 'png', 'pdf']).map((f) => '.' + f).join(',');

/** Los tres RxH se dibujan juntos, en una sola sección. */
type Seccion = { key: string; modulos: Modulo[] };
export function agrupar(modulos: Modulo[]): Seccion[] {
  const out: Seccion[] = [];
  for (const m of modulos) {
    if (m.code.startsWith('fee_receipt_')) {
      const s = out.find((x) => x.key === 'fee_receipts');
      if (s) { s.modulos.push(m); continue; }
      out.push({ key: 'fee_receipts', modulos: [m] });
    } else {
      out.push({ key: m.code, modulos: [m] });
    }
  }
  return out;
}

const OK_MSG: Partial<Record<ModuloCode, string>> = {
  utility_bill: 'Recibo recibido', payslip: 'Boleta recibida', tax_report: 'Reporte recibido',
  fee_receipt_1: 'Recibo recibido', fee_receipt_2: 'Recibo recibido', fee_receipt_3: 'Recibo recibido',
  income_movements: 'Captura recibida', income_detail: 'Nota de voz recibida',
};
const okMsg = (m: Modulo) => (m.status === 'verified'
  ? (OK_MSG[m.code] ?? 'Recibido').replace(/recibid[oa]/, (w) => (w.endsWith('a') ? 'verificada' : 'verificado'))
  : OK_MSG[m.code] ?? 'Recibido');

export interface FormularioClientProps {
  token: string;
}

/** Archivo que el estudiante acaba de elegir y todavía viaja al servidor. Se
 * dibuja igual que uno subido para que el módulo reaccione al instante. */
interface PreviaLocal {
  id: number;
  url: string;
  nombre: string;
  esImagen: boolean;
  /** 0..100. Arranca en 0 y el servidor confirma con 100. */
  progreso: number;
}

/** `URL.createObjectURL` no existe en jsdom ni en navegadores antiguos. La
 * subida es lo que importa; la miniatura es un lujo, así que si no se puede
 * generar se devuelve vacío y la previa cae al ícono genérico. */
const objectUrl = (file: File): string => {
  try {
    return URL.createObjectURL(file);
  } catch {
    return '';
  }
};

const revocarUrl = (url: string): void => {
  if (!url) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    /* nada que revocar */
  }
};

export function FormularioClient({ token }: FormularioClientProps) {
  const [view, setView] = useState<ViewState>({ status: 'loading' });
  // Subidas en curso POR MÓDULO. Antes había un solo `subiendo` global que
  // tapaba la pantalla entera con un "Cargando…": el estudiante quedaba
  // bloqueado mirando un spinner por cada archivo. Ahora el archivo se ve al
  // instante (`previas`) y el envío ocurre detrás.
  const [subiendoEn, setSubiendoEn] = useState<Record<string, number>>({});
  const [previas, setPrevias] = useState<Record<string, PreviaLocal[]>>({});
  const previaId = useRef(0);
  // Guardado por sección: cada una persiste lo suyo sin esperar al Enviar.
  const [guardando, setGuardando] = useState<Record<string, boolean>>({});
  // Lo último que se guardó de cada sección, serializado. Comparar contra lo
  // que hay en pantalla es lo que hace que el botón vuelva a decir "Guardar"
  // en cuanto el estudiante cambia algo, sin tener que apagar una bandera
  // desde cada onChange.
  const [guardadoSnap, setGuardadoSnap] = useState<Record<string, string>>({});
  const [errorSeccion, setErrorSeccion] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [errorModulo, setErrorModulo] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [abierto, setAbierto] = useState<Record<string, boolean>>({});
  const [ejemplo, setEjemplo] = useState<ModuloCode | null>(null);
  const [detOpen, setDetOpen] = useState(false);

  // respuesta del estudiante
  const [boletaModo, setBoletaModo] = useState<'subir' | 'sin'>('subir');
  const [detalle, setDetalle] = useState('');
  const [detalleGuardado, setDetalleGuardado] = useState('');
  const [comentario, setComentario] = useState('');
  // Lo elegido "crudo": abajo se deriva lo efectivo (un "hoy" agotado o un
  // bloque ya terminado cuentan como no elegidos) sin sincronizar estado en
  // efectos, que es lo que React desaconseja.
  const [diaRaw, setDia] = useState<DiaKey | ''>('');
  const [turnoRaw, setTurno] = useState<TurnoKey | ''>('');
  const [canal, setCanal] = useState<ContactChannel | ''>('');
  const [hhRaw, setHh] = useState('4'); const [mmRaw, setMm] = useState('00'); const [apRaw, setAp] = useState('pm');
  const [editTel, setEditTel] = useState(false); const [tel, setTel] = useState(''); const [telTmp, setTelTmp] = useState('');
  const [editDir, setEditDir] = useState(false); const [dirNueva, setDirNueva] = useState('');

  // nota de voz
  const [grabando, setGrabando] = useState(false);
  const [segs, setSegs] = useState(0);
  const [voz, setVoz] = useState<{ blob: Blob; seg: number; url: string } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const segsRef = useRef(0);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  // hora actual del celular (minutos del día); se fija tras montar para no
  // chocar con el render del servidor
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    const f = () => { const n = new Date(); setAhora(n.getHours() * 60 + n.getMinutes()); };
    const t0 = setTimeout(f, 0);
    const t = setInterval(f, 30000);
    return () => { clearTimeout(t0); clearInterval(t); };
  }, []);

  // No pone `loading` acá: el estado inicial ya lo es, y el reintento lo pone
  // desde el click. Así el efecto de montaje no hace setState síncrono.
  const cargar = useCallback(async () => {
    const res = await getFormulario(token);
    if (isFormularioApiError(res)) return setView(vistaDeError(res.reason));
    if (res.respuesta.income_description) {
      setDetalle(res.respuesta.income_description);
      setDetalleGuardado(res.respuesta.income_description);
    }
    // La sesion la da el backend (derivada del token, no el token).
    iniciarTelemetria(res.telemetria_session, res.numero_solicitud, res.situation);
    if (res.status === 'submitted') {
      return setView({ status: 'done', datos: res, contacto: confirmacionDe(res) });
    }
    setView({ status: 'ready', datos: res });
  }, [token]);

  // Hasta que seccion llego y cuanto scrolleo. Un observer sobre los
  // `data-seccion` en vez de un handler por tarjeta: el DOM ya dice cuales hay.
  useEffect(() => {
    if (view.status !== 'ready') return;
    const nodos = Array.from(document.querySelectorAll<HTMLElement>('[data-seccion]'));
    if (!('IntersectionObserver' in window) || nodos.length === 0) return;
    const obs = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        const nombre = e.target.getAttribute('data-seccion');
        if (e.isIntersecting && nombre) verSeccion(nombre as SeccionMedida);
      }
    }, { threshold: 0.35 });
    nodos.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [view.status]);

  useEffect(() => {
    if (view.status !== 'ready') return;
    // Un evento por tramo, no uno por pixel: 25/50/75/100 alcanza para saber
    // si la pantalla se leyo entera o se abandono arriba.
    const hitos = [25, 50, 75, 100];
    let maximo = 0;
    const onScroll = () => {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      const pct = alto <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / alto) * 100));
      for (const h of hitos) {
        if (pct >= h && maximo < h) {
          maximo = h;
          evento('followup_form_scroll', { profundidad: h });
        }
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [view.status]);

  // El cierre es lo unico que puede cerrar el tiempo de una visita que
  // abandona. `visibilitychange` cubre el celular (cambiar de app), donde
  // `beforeunload` no dispara.
  useEffect(() => {
    const alOcultar = () => { if (document.visibilityState === 'hidden') cerrarTelemetria('oculto'); };
    const alSalir = () => cerrarTelemetria('cierre');
    document.addEventListener('visibilitychange', alOcultar);
    window.addEventListener('pagehide', alSalir);
    return () => {
      document.removeEventListener('visibilitychange', alOcultar);
      window.removeEventListener('pagehide', alSalir);
    };
  }, []);

  useEffect(() => {
    // Diferido un tick: `cargar` termina en setState y el linter de React lo
    // trata como setState síncrono dentro del efecto.
    const t = setTimeout(() => { void cargar(); }, 0);
    return () => clearTimeout(t);
  }, [cargar]);

  useEffect(() => {
    if (grabando) {
      // `segsRef` es lo que lee `onstop` del MediaRecorder: un closure viejo
      // vería el `segs` de cuando se armó.
      timer.current = setInterval(() => { segsRef.current += 1; setSegs(segsRef.current); }, 1000);
      return () => { if (timer.current) clearInterval(timer.current); };
    }
  }, [grabando]);

  const hoyAgotado = ahora !== null && ahora >= FIN_TURNO.noche;
  const dia: DiaKey | '' = diaRaw === 'hoy' && hoyAgotado ? '' : diaRaw;
  const esHoy = dia === 'hoy' && ahora !== null;
  const turnoPasado = (k: Exclude<TurnoKey, 'otro'>) => esHoy && (ahora as number) >= FIN_TURNO[k];
  const turno: TurnoKey | '' = turnoRaw && turnoRaw !== 'otro' && turnoPasado(turnoRaw) ? '' : turnoRaw;
  // La hora exacta elegida ya pasó: se muestra (y se manda) el siguiente
  // cuarto de hora.
  const horaPasada = esHoy && turno === 'otro' && aMin(hhRaw, mmRaw, apRaw) <= (ahora as number);
  const { hh, mm, ap } = horaPasada
    ? deMin(Math.min(Math.ceil(((ahora as number) + 1) / 15) * 15, 23 * 60 + 45))
    : { hh: hhRaw, mm: mmRaw, ap: apRaw };

  // ---------- acciones contra el API ----------
  const reemplazar = (m: Modulo) =>
    setView((v) => (v.status === 'ready'
      ? { ...v, datos: { ...v.datos, modulos: v.datos.modulos.map((x) => (x.code === m.code ? m : x)) } }
      : v));

  /** Sube en segundo plano: el archivo aparece en el módulo apenas se elige y
   * el request viaja detrás. Sin pantalla de carga: si falla, se retira la
   * vista previa y el módulo muestra el error. */
  const subir = async (code: ModuloCode, file: File, fulfilledBy: 'document' | 'voice_note' = 'document') => {
    const previa: PreviaLocal = {
      id: (previaId.current += 1),
      // Sin `createObjectURL` (jsdom, navegadores viejos) la previa sale con
      // el ícono genérico. La subida no puede depender de poder dibujarla.
      url: objectUrl(file),
      nombre: file.name,
      esImagen: file.type.startsWith('image/'),
      progreso: 0,
    };
    setErrorModulo((e) => ({ ...e, [code]: '' }));
    setPrevias((p) => ({ ...p, [code]: [...(p[code] ?? []), previa] }));
    setSubiendoEn((s) => ({ ...s, [code]: (s[code] ?? 0) + 1 }));
    // El cronometro arranca ACA: el servidor solo ve el request ya completo,
    // asi que la espera real del estudiante --- su subida --- solo se puede
    // medir del lado del navegador.
    cronometrar(`subida:${code}`);
    const kb = Math.round(file.size / 1024);
    evento('followup_form_upload_start', { modulo: code, kb, mime: file.type });

    const res = await subirArchivo(token, code, file, fulfilledBy, (porcentaje) =>
      setPrevias((p) => ({
        ...p,
        [code]: (p[code] ?? []).map((x) => (x.id === previa.id ? { ...x, progreso: porcentaje } : x)),
      })),
    );

    setSubiendoEn((s) => ({ ...s, [code]: Math.max(0, (s[code] ?? 1) - 1) }));
    setPrevias((p) => ({ ...p, [code]: (p[code] ?? []).filter((x) => x.id !== previa.id) }));
    revocarUrl(previa.url);
    if (isFormularioApiError(res)) {
      evento('followup_form_upload_error', {
        modulo: code, motivo: res.reason, duracion_ms: medir(`subida:${code}`), kb,
      });
      setErrorModulo((e) => ({ ...e, [code]: res.error }));
      return false;
    }
    evento('followup_form_upload_done', {
      modulo: code, duracion_ms: medir(`subida:${code}`), kb, tamano_kb: kb,
      estado: res.status,
    });
    reemplazar(res);
    return true;
  };


  const elegirArchivo = (code: ModuloCode) => inputs.current[code]?.click();
  const onArchivo = (code: ModuloCode) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (const f of files) {
      const ok = await subir(code, f);
      if (!ok) break;
    }
  };

  const quitar = async (code: ModuloCode, documentId: number) => {
    setSubiendoEn((s) => ({ ...s, [code]: (s[code] ?? 0) + 1 }));
    const res = await borrarArchivo(token, code, documentId);
    setSubiendoEn((s) => ({ ...s, [code]: Math.max(0, (s[code] ?? 1) - 1) }));
    if (isFormularioApiError(res)) return setErrorModulo((e) => ({ ...e, [code]: res.error }));
    evento('followup_form_file_removed', { modulo: code });
    reemplazar(res);
  };

  const guardarTexto = async (code: ModuloCode) => {
    const texto = detalle.trim();
    if (texto.length < MIN_TEXTO) return;
    setSubiendoEn((s) => ({ ...s, [code]: (s[code] ?? 0) + 1 }));
    const res = await cumplirConTexto(token, code, texto);
    setSubiendoEn((s) => ({ ...s, [code]: Math.max(0, (s[code] ?? 1) - 1) }));
    if (isFormularioApiError(res)) return setErrorModulo((e) => ({ ...e, [code]: res.error }));
    evento('followup_form_text_saved', { modulo: code, largo: texto.length });
    setDetalleGuardado(texto);
    reemplazar(res);
  };

  /** Hay un request en curso de ese módulo (quitar o guardar texto). Evita
   * que un doble toque dispare dos veces la misma acción. */
  const ocupado = (code: string) => (subiendoEn[code] ?? 0) > 0;

  /** Guardar de una sección: persiste lo suyo sin cerrar el formulario. */
  const guardarSeccion = async (seccion: string, payload: GuardarParcialPayload) => {
    setGuardando((g) => ({ ...g, [seccion]: true }));
    setErrorSeccion((e) => ({ ...e, [seccion]: '' }));
    const res = await guardarParcial(token, payload);
    setGuardando((g) => ({ ...g, [seccion]: false }));
    if (isFormularioApiError(res)) {
      evento('followup_form_section_saved', { seccion, ok: false, motivo: res.reason });
      setErrorSeccion((e) => ({ ...e, [seccion]: res.error }));
      return false;
    }
    evento('followup_form_section_saved', { seccion, ok: true });
    setView((v) => (v.status === 'ready' ? { ...v, datos: res } : v));
    setGuardadoSnap((g) => ({ ...g, [seccion]: JSON.stringify(payload) }));
    return true;
  };

  const yaGuardada = (seccion: string, payload: GuardarParcialPayload | null) =>
    payload !== null && guardadoSnap[seccion] === JSON.stringify(payload);

  // ---------- nota de voz ----------
  const empezarGrabacion = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      return setErrorModulo((e) => ({ ...e, income_detail: 'Tu navegador no permite grabar audio. Escríbenos el texto.' }));
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (ev) => { if (ev.data.size) chunks.current.push(ev.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' });
        setVoz({ blob, seg: segsRef.current, url: URL.createObjectURL(blob) });
      };
      recorder.current = rec;
      setSegs(0); segsRef.current = 0;
      rec.start();
      setGrabando(true);
    } catch {
      setErrorModulo((e) => ({ ...e, income_detail: 'No pudimos acceder al micrófono. Escríbenos el texto.' }));
    }
  };
  const detenerGrabacion = () => { recorder.current?.stop(); setGrabando(false); };
  const confirmarVoz = async () => {
    if (!voz) return;
    const ext = voz.blob.type.includes('ogg') ? 'ogg' : voz.blob.type.includes('mp4') ? 'm4a' : 'webm';
    const file = new File([voz.blob], `nota-de-voz.${ext}`, { type: voz.blob.type || 'audio/webm' });
    evento('followup_form_voice_recorded', { segundos: voz.seg });
    await subir('income_detail', file, 'voice_note');
  };

  // ---------- envío ----------
  const enviar = async (datos: Pantalla, payloadBase: Omit<EnviarPayload, 'questions' | 'corrected_address'>) => {
    setError(null);
    setEnviando(true);
    evento('followup_form_submit_click', { canal: payloadBase.contact_channel });
    const payload: EnviarPayload = { ...payloadBase };
    if (comentario.trim()) payload.questions = comentario.trim();
    if (dirNueva.trim()) payload.corrected_address = dirNueva.trim();
    const res = await enviarFormulario(token, payload);
    setEnviando(false);
    if (isFormularioApiError(res)) {
      if (res.reason !== 'network' && !res.modulos) {
        const v = vistaDeError(res.reason);
        if (v.status !== 'invalid') return setView(v);
      }
      evento('followup_form_submit_error', { motivo: res.reason });
      return setError(res.error);
    }
    verSeccion('enviar');
    cerrarTelemetria('enviado');
    setView({ status: 'done', datos, contacto: res.contacto });
  };

  // ---------- pantallas terminales ----------
  if (view.status === 'loading') return <Mensaje titulo="Cargando…" />;
  if (view.status === 'network') {
    return (
      <Mensaje titulo="No pudimos conectarnos" detalle="Revisa tu conexión e intenta nuevamente."
               accion={{ texto: 'Reintentar', onClick: () => { setView({ status: 'loading' }); void cargar(); } }} />
    );
  }
  if (view.status === 'expired') {
    return <EnlaceCaido reason={view.reason} token={token} onSubmitted={() => setView({ status: 'submitted' })} />;
  }
  if (view.status === 'submitted') {
    return (
      <Mensaje icono="ok" titulo="Ya recibimos tu formulario"
               detalle="Gracias por completarlo. Tu asesor se comunicará contigo en el horario que elegiste, desde nuestra cuenta oficial de BaldeCash." />
    );
  }
  if (view.status === 'invalid') {
    return <Mensaje titulo="Este enlace no es válido" detalle="Revisa que hayas abierto el enlace completo que te enviamos." />;
  }
  if (view.status === 'done') {
    const c = view.contacto;
    return (
      <div className="flex min-h-dvh flex-col bg-white text-gray-900">
        <Header />
        <main className="formulario-posterior mx-auto w-full max-w-[560px] px-4 py-6 text-center">
          <div className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-teal-50 text-teal-600"><Ic.Check className="h-9 w-9" /></div>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-[#2F3A9E]">
            Gracias{view.datos?.nombre ? `, ${view.datos.nombre}` : ''}. Ya recibimos tu información.
          </h1>
          <p className="mt-1.5 text-gray-500">
            Tu asesor te {c.canal === 'whatsapp' || /whatsapp/i.test(c.canal) ? 'escribirá por WhatsApp' : 'llamará'} {c.dia} {c.horario} al{' '}
            <b className="tabular-nums text-gray-900">{c.telefono}</b>, desde nuestra cuenta oficial de BaldeCash.
          </p>
          {view.datos && <Producto datos={view.datos} open={detOpen} onToggle={() => setDetOpen((o) => !o)} />}
          <Footer />
        </main>
      </div>
    );
  }

  // ---------- formulario ----------
  const { datos } = view;
  const secciones = agrupar(datos.modulos);
  const telefono = tel.trim() ? fmtTel(tel.trim()) : fmtTel(datos.telefono ?? '');
  const telOk = !editTel && /^\d{9}$/.test((tel.trim() || datos.telefono || '').replace(/\s+/g, ''));
  const dirActual = editDir ? dirNueva : (dirNueva.trim() || datos.direccion || '');
  const dirTieneNumero = /\d/.test(dirActual);
  const dirNuevaOk = dirNueva.trim().length > 8 && /\d/.test(dirNueva);
  const pideRecibo = datos.modulos.some((m) => m.code === 'utility_bill');
  const dirOk = !editDir && (!pideRecibo || dirTieneNumero);

  const listo = (s: Seccion) => {
    if (s.key === 'utility_bill') return moduloListo(s.modulos[0]) && dirOk;
    return s.modulos.every(moduloListo);
  };
  const contactoOk = Boolean(dia && turno && canal && telOk);
  const completo = secciones.every(listo) && contactoOk && dirOk;

  const payloadContacto = (): Omit<EnviarPayload, 'questions' | 'corrected_address'> | null => {
    if (!dia || !turno || !canal) return null;
    const base = {
      contact_date: fechaIso(fecha(dia)),
      contact_channel: canal,
      contact_phone: (tel.trim() || datos.telefono || '').replace(/\s+/g, ''),
    };
    if (turno === 'otro') {
      const t = aMin(hh, mm, ap);
      return { ...base, contact_slot: 'exact', contact_time: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` };
    }
    return { ...base, contact_slot: TURNO[turno][2] };
  };

  /** Lo que guarda la sección de contacto: el horario elegido más la
   * dirección corregida, que se edita ahí mismo. */
  const payloadSeccionContacto = (): GuardarParcialPayload | null => {
    const p = payloadContacto();
    if (!p) return null;
    const dir = dirNueva.trim();
    return dir ? { ...p, corrected_address: dir } : p;
  };

  const orden = [...secciones.map((s) => s.key), 'contacto', 'ayuda'];
  const hecho: Record<string, boolean> = Object.fromEntries(secciones.map((s) => [s.key, listo(s)]));
  // Con guardado por sección, "Listo" pasa a significar GUARDADO y no solo
  // completado: si la sección se colapsara apenas el estudiante elige su
  // horario, el botón Guardar desaparecería justo cuando recién se habilita.
  hecho.contacto = contactoOk && yaGuardada('contacto', payloadSeccionContacto());
  hecho.ayuda = comentario.trim().length > 0 && yaGuardada('ayuda', { questions: comentario.trim() });
  const listas = orden.filter((k) => hecho[k]).length;
  const vozAbierta = (k: string) => k === 'income_detail' && datos.modulos.find((m) => m.code === 'income_detail')?.fulfilled_by === 'voice_note';
  const sp = (k: string) => ({
    n: orden.indexOf(k) + 1, done: hecho[k],
    seccion: (k === 'contacto' ? 'contacto' : k === 'ayuda' ? 'dudas' : 'documentos') as SeccionMedida,
    collapsed: hecho[k] && !abierto[k] && !vozAbierta(k),
    onToggle: hecho[k] ? () => setAbierto((a) => ({ ...a, [k]: !a[k] })) : undefined,
  });
  const turnoTxt = () => (turno === 'otro'
    ? `a las ${horaTxt(hh, mm, ap)}`
    : turno ? `en la ${TURNO[turno][0].toLowerCase()} (${TURNO[turno][1]})` : '');

  const nDocs = datos.modulos.length;
  const d3 = fecha('pasado');

  /** "Ver ejemplo": el estudiante no sabe si su papel sirve hasta que ve uno.
   * Tambien se mide (`followup_form_help_open`): si mucha gente lo abre justo
   * antes de un rechazo, el problema es el texto del modulo, no el papel. */
  const verEjemplo = (code: ModuloCode) => {
    if (!EJEMPLOS[code]) return null;
    return (
      <button type="button"
              onClick={() => { setEjemplo(code); evento('followup_form_help_open', { modulo: code }); }}
              className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-[#C9CEF2] bg-white px-3 py-2 text-[13px] font-bold text-[#4654CD]">
        <Ic.Eye className="h-4 w-4" />Ver ejemplo
      </button>
    );
  };

  const inputArchivo = (m: Modulo, multiple = false) => (
    <input
      ref={(el) => { inputs.current[m.code] = el; }}
      type="file" accept={acceptDe(m)} multiple={multiple} className="hidden"
      data-testid={`input-${m.code}`}
      onChange={onArchivo(m.code)}
    />
  );

  const cardDoc = ({ m, icon, titulo, sub }: { m: Modulo; icon: React.ReactNode; titulo: string; sub: string }) => {
    const doc = m.documents[m.documents.length - 1];
    const err = errorModulo[m.code];
    const enVuelo = previas[m.code] ?? [];
    // Lo que el estudiante acaba de elegir se ve YA, mientras viaja. Va antes
    // que el estado del servidor porque es lo último que hizo.
    if (enVuelo.length > 0) {
      const p = enVuelo[enVuelo.length - 1];
      return (
        <div className="mt-2.5 rounded-[13px] border-[1.5px] border-[#C9CEF2] bg-white p-3.5">
          <div className="flex items-center gap-3">
            <PreviaMini previa={p} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-bold text-[#2F3A9E]">Guardando tu archivo…</span>
                <span className="text-[13px] font-bold tabular-nums text-[#4654CD]">{p.progreso}%</span>
              </div>
              <div className="mt-0.5 truncate text-[12.5px] text-gray-500">{p.nombre}</div>
              <BarraProgreso valor={p.progreso} />
            </div>
          </div>
          <p className="mt-2 text-[12.5px] text-gray-500">Puedes seguir con las demás secciones.</p>
          {inputArchivo(m)}
        </div>
      );
    }
    if (moduloListo(m) && m.status !== 'rejected') {
      return (
        <div className="mt-2.5 rounded-[13px] border-[1.5px] border-emerald-200 bg-emerald-50 p-3.5">
          <div className="flex items-center gap-3">
            <Miniatura doc={doc} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[14px] font-bold text-emerald-700"><Ic.Check className="h-4 w-4" />{okMsg(m)}</div>
              {doc?.file_name && <div className="mt-0.5 truncate text-[12.5px] text-emerald-700/80">{doc.file_name}</div>}
            </div>
          </div>
          {/* Botones de verdad y no dos textos chicos alineados a la derecha:
              se tocan en un celular (44 px de alto) y se ven como acciones. */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {doc?.view_url && (
              <a href={doc.view_url} target="_blank" rel="noopener"
                 className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-[13.5px] font-bold text-emerald-700">
                <Ic.Eye className="h-4.5 w-4.5" />Ver
              </a>
            )}
            {puedeReintentar(m) && (
              <button type="button" onClick={() => elegirArchivo(m.code)}
                      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-[13.5px] font-bold text-gray-600 ${doc?.view_url ? '' : 'col-span-2'}`}>
                <Ic.Redo className="h-4.5 w-4.5" />Subir otro
              </button>
            )}
          </div>
          {inputArchivo(m)}
        </div>
      );
    }
    const rechazado = m.status === 'rejected';
    const tope = rechazado && !puedeReintentar(m);
    const restantes = Math.max(0, m.max_attempts - m.attempt_count);
    return (
      <div className={`mt-2.5 rounded-[13px] border-[1.5px] p-3.5 ${rechazado ? 'border-red-500 bg-red-50' : 'border-dashed border-[#C9CEF2] bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl ${rechazado ? 'bg-white text-red-600' : 'bg-[#EEF0FB] text-[#4654CD]'}`}>{rechazado ? <Ic.Alert className="h-6 w-6" /> : icon}</div>
          <div><b className="block text-[14px]">{titulo}</b><span className="text-[12.5px] text-gray-500">{sub}</span></div>
        </div>
        {rechazado && (
          <div className="mt-2.5 rounded-xl border border-red-200 bg-white p-3 text-[13.5px]" role="alert">
            <div className="flex gap-2 text-red-600">
              <Ic.Alert className="mt-0.5 h-5 w-5 flex-none" />
              <b className="leading-snug">{m.rejection_message || 'No pudimos validar este documento'}</b>
            </div>
            {/* Los intentos como puntos y no como «Intento 1 de 3»: lo que el
                estudiante necesita saber es cuántos le QUEDAN, y el «sube otro
                archivo» ya lo dice el botón de abajo — repetirlo era ruido. */}
            {tope ? (
              <p className="mt-2 text-gray-500">Ya no puedes subir otro. Un asesor lo revisará contigo.</p>
            ) : (
              <div className="mt-2.5 flex items-center gap-2">
                <span className="flex gap-1" aria-hidden="true">
                  {Array.from({ length: m.max_attempts }).map((_, i) => (
                    <i key={i} className={`h-1.5 w-5 rounded-full ${i < m.attempt_count ? 'bg-red-400' : 'bg-gray-200'}`} />
                  ))}
                </span>
                <span className="text-gray-500">
                  {restantes === 1 ? 'Te queda 1 intento' : `Te quedan ${restantes} intentos`}
                </span>
              </div>
            )}
          </div>
        )}
        {err && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{err}</p>}
        {!tope && (
          <Btn className="mt-2.5 py-2.5 text-[13.5px]" onClick={() => elegirArchivo(m.code)}>
            <Ic.Upload className="h-4.5 w-4.5" />{rechazado ? 'Subir otro' : 'Subir'}
          </Btn>
        )}
        {verEjemplo(m.code)}
        {inputArchivo(m)}
      </div>
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white text-gray-900">
      <Header />
      <main className="formulario-posterior mx-auto w-full max-w-[560px] px-4 pb-16 pt-5 lg:max-w-[1000px]">
        {/* En movil, una sola columna: saludo, equipo, secciones y Enviar al
            final. En escritorio, dos: a la izquierda el equipo y el Enviar,
            fijos al hacer scroll; a la derecha las secciones.

            El `flex` con `order` en movil y `grid` en escritorio es lo que
            permite que Enviar quede ULTIMO en el celular y ARRIBA a la
            izquierda en el monitor, sin duplicarlo en el DOM (dos botones
            "Enviar", aunque uno este oculto, rompen las busquedas por rol y
            confunden a un lector de pantalla). */}
        <div className="flex flex-col lg:grid lg:grid-cols-[340px_minmax(0,600px)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-8">
          {/* `contents` en movil disuelve este contenedor para que el `order`
              de sus hijos valga en el flex de arriba; en escritorio vuelve a
              ser una caja.

              SIN `sticky`: pegada, la columna se quedaba quieta mientras el
              bloque de Enviar --- que vive en la fila de abajo --- le pasaba
              por encima al scrollear, y el boton terminaba tapando la tarjeta
              del producto. Enviar tiene que estar SIEMPRE debajo, nunca
              encima. */}
          <div className="contents lg:block">
            <div className="order-1 lg:order-none">
              <h1 className="text-balance text-[26px] font-bold leading-[1.15] text-[#2F3A9E]">
                Hola, {datos.nombre}: <span className="text-teal-600">ya falta poco</span> para evaluar tu solicitud
              </h1>
              <p className="mt-1.5 text-gray-500">
                {nDocs === 0
                  ? 'Solo necesitamos saber cuándo puede conversar contigo tu asesor.'
                  : `Necesitamos ${nDocs === 1 ? 'un documento' : 'unos documentos'} y saber cuándo puede conversar contigo tu asesor. Toma 2 minutos.`}
              </p>
              <Producto datos={datos} open={detOpen} onToggle={() => setDetOpen((o) => !o)} />
              <Avance listas={listas} total={orden.length} />
            </div>
          </div>

          <div className="order-2 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">

        {secciones.map((s) => {
          const m = s.modulos[0];
          if (s.key === 'utility_bill') return (
            <Sec key={s.key} {...sp(s.key)} icon={<Ic.Receipt className="h-5.5 w-5.5" />} titulo="Recibo de servicios"
                 why={<>Necesitamos un recibo de servicios <b className="text-gray-900">de los últimos 2 meses</b> para validar tu dirección. Si pusiste mal tu domicilio, puedes editarlo aquí.</>}>
              <div className={`rounded-xl px-3.5 py-3 text-[14px] ${dirTieneNumero ? 'bg-[#EEF0FB]' : 'border border-red-300 bg-red-50'}`}>
                <div className="flex items-start gap-2.5">
                  <Ic.Pin className={`mt-0.5 h-5 w-5 flex-none ${dirTieneNumero ? 'text-[#4654CD]' : 'text-red-600'}`} />
                  <div className="min-w-0 flex-1">
                    <b className={`block text-[11px] uppercase tracking-wider ${dirTieneNumero ? 'text-gray-400' : 'text-red-600'}`}>Dirección de entrega (tu domicilio)</b>
                    {!editDir ? (
                      <div className={`break-words ${dirTieneNumero ? '' : 'font-semibold text-red-600'}`}>
                        {dirActual || '—'}
                        {dirNueva.trim() && <small className="block text-[12px] font-normal text-gray-400">Antes: {datos.direccion}</small>}
                      </div>
                    ) : (
                      <div>
                        <div className="break-words text-[13px] text-gray-400 line-through">{datos.direccion}</div>
                        <input type="text" value={dirNueva} onChange={(e) => setDirNueva(e.target.value)} aria-label="Nueva dirección"
                               placeholder="Ej. Jr. Las Palmeras 512, Dpto. 302, Los Olivos"
                               className={`mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] ${dirNueva && !dirTieneNumero ? 'border-red-500 text-red-600' : 'border-[#C9CEF2]'}`} />
                      </div>
                    )}
                  </div>
                </div>
                {!dirTieneNumero && (
                  <div className="mt-2.5 flex gap-2 rounded-xl bg-white p-3 text-[13.5px] text-red-600" role="alert">
                    <Ic.Alert className="mt-0.5 h-5 w-5 flex-none" />
                    <div><b className="block">Coloca más detalle en tu dirección</b><span className="text-gray-900">Completa tu dirección <b>con número</b> e interior para que podamos entregar tu equipo correctamente.</span></div>
                  </div>
                )}
                {!editDir ? (
                  <button type="button" onClick={() => { setDirNueva(dirNueva.trim() || (dirTieneNumero ? (datos.direccion ?? '') : '')); setEditDir(true); }}
                          className={`mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-bold ${dirTieneNumero ? 'bg-white text-[#2F3A9E]' : 'bg-red-600 text-white'}`}>
                    <Ic.Edit className="h-4 w-4" />{dirTieneNumero ? 'Editar dirección' : 'Completar mi dirección'}
                  </button>
                ) : (
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => { setEditDir(false); setDirNueva(''); }} className="rounded-xl bg-white py-2.5 text-[13px] font-semibold text-gray-500">Cancelar</button>
                    <button type="button" disabled={!dirNuevaOk} onClick={() => setEditDir(false)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#4654CD] py-2.5 text-[13px] font-bold text-white disabled:opacity-45"><Ic.Check className="h-4 w-4" />Confirmar dirección</button>
                  </div>
                )}
              </div>
              {cardDoc({ m, icon: <Ic.Receipt className="h-6 w-6" />, titulo: 'Foto del recibo', sub: 'Que se lean la dirección y el mes' })}
            </Sec>
          );

          if (s.key === 'payslip') return (
            <Sec key={s.key} {...sp(s.key)} icon={<Ic.Doc className="h-5.5 w-5.5" />} titulo="Tu boleta de pago"
                 why={<>Necesitamos tu boleta de pago del trabajo como sustento de tus ingresos. Debe ser <b className="text-gray-900">de los últimos 2 meses</b>.</>}>
              <div className="flex gap-2">
                {(['subir', 'sin'] as const).map((k) => (
                  <button key={k} type="button" onClick={() => setBoletaModo(k)}
                          className={`flex-1 rounded-xl border-[1.5px] py-2.5 text-[14px] font-semibold ${boletaModo === k ? 'border-[#4654CD] bg-[#EEF0FB] text-[#2F3A9E]' : 'border-[#C9CEF2] bg-white'}`}>
                    {k === 'subir' ? 'Tengo mi boleta' : 'No tengo boleta'}
                  </button>
                ))}
              </div>
              {boletaModo === 'subir'
                ? cardDoc({ m, icon: <Ic.Doc className="h-6 w-6" />, titulo: 'Foto de tu última boleta', sub: 'Que se vean tu nombre y el mes' })
                : (
                  <div className="mt-2.5 rounded-[13px] border-[1.5px] border-[#C9CEF2] p-3.5">
                    <div className="flex items-center gap-3"><div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#EEF0FB] text-[#4654CD]"><Ic.Chat className="h-6 w-6" /></div><div><b className="block text-[14px]">Cuéntanos cómo percibes tus ingresos</b><span className="text-[12.5px] text-gray-500">Dónde trabajas, cómo te pagan y cuánto ganas al mes.</span></div></div>
                    <textarea value={detalle} onChange={(e) => setDetalle(e.target.value)} aria-label="Cómo percibes tus ingresos"
                              placeholder="Ejemplo: trabajo en una bodega en Comas, me pagan en efectivo cada semana, unos S/ 1,200 al mes…"
                              className="mt-2.5 min-h-[84px] w-full rounded-xl border border-[#C9CEF2] px-3 py-2.5 text-[15px]" />
                    {errorModulo[m.code] && <p role="alert" className="mt-2 text-[13px] text-red-700">{errorModulo[m.code]}</p>}
                    <Btn kind="sec" className="mt-2 py-2.5 text-[13.5px]" disabled={detalle.trim().length < MIN_TEXTO || detalle.trim() === detalleGuardado || ocupado(m.code)} onClick={() => void guardarTexto(m.code)}>
                      <Ic.Check className="h-4.5 w-4.5" />{m.status === 'skipped' && detalle.trim() === detalleGuardado ? 'Guardado' : 'Guardar'}
                    </Btn>
                  </div>
                )}
            </Sec>
          );

          if (s.key === 'tax_report') return (
            <Sec key={s.key} {...sp(s.key)} icon={<Ic.Pdf className="h-5.5 w-5.5" />} titulo="Tu reporte tributario"
                 why={<>Es el resumen de lo que has facturado. Sale de SUNAT en 2 minutos con tu clave SOL. Debe tener <b>30 días de antigüedad o menos</b>.</>}>
              <Guia pasos={TUT_RT} />
              {cardDoc({ m, icon: <Ic.Pdf className="h-6 w-6" />, titulo: 'PDF del reporte tributario', sub: '“Reporte tributario para terceros”, completo' })}
            </Sec>
          );

          if (s.key === 'fee_receipts') return (
            <Sec key={s.key} {...sp(s.key)} icon={<Ic.Doc className="h-5.5 w-5.5" />} titulo="Tus 3 últimos recibos por honorarios"
                 why="Los tres más recientes que hayas emitido, uno por uno. Deben estar a tu nombre, con tu RUC (10 + tu DNI).">
              <Guia pasos={TUT_RXH} />
              {verEjemplo('fee_receipt_1')}
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {s.modulos.map((rm, i) => {
                  const ok = moduloListo(rm) && rm.status !== 'rejected';
                  const rechazado = rm.status === 'rejected';
                  const doc = rm.documents[rm.documents.length - 1];
                  return (
                    <div key={rm.code} className={`rounded-xl border-[1.5px] p-2 text-center text-[12.5px] ${ok ? 'border-emerald-200 bg-emerald-50' : rechazado ? 'border-red-500 bg-red-50 text-red-600' : 'border-dashed border-[#C9CEF2] bg-white text-gray-500'}`}>
                      {ok ? <Miniatura doc={doc} className="mx-auto h-16 w-full" /> : rechazado ? <Ic.Alert className="mx-auto mb-1 h-6 w-6" /> : <Ic.Upload className="mx-auto mb-1 h-6 w-6 text-[#4654CD]" />}
                      <b className={`block text-[13px] ${ok ? 'text-emerald-700' : 'text-gray-900'}`}>Recibo {i + 1}</b>
                      {rechazado && <span className="block leading-tight">{rm.rejection_message || 'No pudimos validarlo'}</span>}
                      {puedeReintentar(rm)
                        ? <button type="button" onClick={() => elegirArchivo(rm.code)}
                                  className={`mt-1.5 inline-flex min-h-9 w-full items-center justify-center rounded-lg border px-1 text-[11.5px] font-bold ${ok ? 'border-emerald-200 bg-white text-gray-600' : 'border-[#C9CEF2] bg-white text-[#4654CD]'}`}>
                            {ok || rechazado ? 'Subir otro' : 'Subir'}
                          </button>
                        : <span className="mt-0.5 block text-[11px]">Lo revisa un asesor</span>}
                      {errorModulo[rm.code] && <span role="alert" className="mt-1 block text-[11px] text-red-700">{errorModulo[rm.code]}</span>}
                      {inputArchivo(rm)}
                    </div>
                  );
                })}
              </div>
            </Sec>
          );

          if (s.key === 'income_movements') {
            const maxFiles = m.document_type?.max_files ?? 10;
            return (
              <Sec key={s.key} {...sp(s.key)} icon={<Ic.Phone className="h-5.5 w-5.5" />} titulo="Tus movimientos del último mes"
                   why={<>Sube <b>capturas de pantalla de todos tus movimientos del último mes</b> de Yape, Plin o tu cuenta bancaria, todas las que necesites, con las fechas visibles.</>}>
                <div className="grid grid-cols-4 gap-2">
                  {m.documents.map((doc) => (
                    // La rechazada se marca en rojo: en una grilla de capturas,
                    // "hay una que no sirve" sin decir cuál deja al estudiante
                    // adivinando cuál sacar.
                    <div key={doc.id} className={`relative aspect-[3/4] overflow-hidden rounded-xl border bg-[#EEF0FB] ${doc.status === 'rejected' ? 'border-red-500' : 'border-[#C9CEF2]'}`}>
                      <Miniatura doc={doc} className="h-full w-full" />
                      {doc.status === 'rejected' && (
                        <span className="absolute inset-x-0 bottom-0 bg-red-600/90 py-0.5 text-center text-[10px] font-bold text-white">
                          No sirve, quítala
                        </span>
                      )}
                      <button type="button" disabled={ocupado(m.code)} onClick={() => void quitar(m.code, doc.id)} aria-label="Quitar" className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-900 disabled:opacity-40"><Ic.X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  {/* Las que todavía viajan se ven igual que las guardadas,
                      apenas atenuadas. Sin esto la pantalla no reaccionaba
                      hasta que respondía el servidor. */}
                  {(previas[m.code] ?? []).map((p) => (
                    <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[#C9CEF2] bg-[#EEF0FB] opacity-60">
                      <PreviaMini previa={p} className="h-full w-full" />
                      <span className="absolute inset-x-0 bottom-0 bg-white/90 py-0.5 text-center text-[10px] font-bold tabular-nums text-[#2F3A9E]">
                        {p.progreso}%
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-[3px] bg-[#4654CD] transition-[width] duration-200"
                        style={{ width: `${p.progreso}%` }}
                      />
                    </div>
                  ))}
                  {m.documents.length + (previas[m.code]?.length ?? 0) < maxFiles && puedeReintentar(m) && (
                    <button type="button" onClick={() => elegirArchivo(m.code)} className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-[#C9CEF2] bg-white text-[12px] font-semibold text-[#4654CD]">
                      <Ic.Plus className="h-5 w-5" />{m.documents.length ? 'Agregar otra' : 'Agregar captura'}
                    </button>
                  )}
                </div>
                {verEjemplo(m.code)}
                {inputArchivo(m, true)}
                {m.status === 'rejected' && (
                  <div className="mt-2.5 flex gap-2 rounded-xl bg-red-50 p-2.5 text-[13.5px] text-red-600" role="alert"><Ic.Alert className="h-5 w-5 flex-none" /><div><b className="block">{m.rejection_message || 'No pudimos validar las capturas'}</b>{puedeReintentar(m) ? <span className="text-gray-900">Intento {m.attempt_count} de {m.max_attempts}. Agrega otras capturas.</span> : <span className="text-gray-900">Un asesor lo revisará contigo.</span>}</div></div>
                )}
                {m.documents.length > 0 && m.status !== 'rejected' && (
                  <div className="mt-2.5 flex gap-2 rounded-xl bg-emerald-50 p-2.5 text-[13.5px] text-emerald-700"><Ic.Check className="h-5 w-5 flex-none" /><div><b className="block">{m.documents.length} captura{m.documents.length > 1 ? 's' : ''} recibida{m.documents.length > 1 ? 's' : ''}</b><span className="text-emerald-700/90">Puedes agregar más o quitar alguna.</span></div></div>
                )}
                {errorModulo[m.code] && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{errorModulo[m.code]}</p>}
              </Sec>
            );
          }

          if (s.key === 'income_detail') return (
            <Sec key={s.key} {...sp(s.key)} icon={<Ic.Chat className="h-5.5 w-5.5" />} titulo="Cuéntanos cómo percibes tus ingresos"
                 why={datos.situation === 'movements_no_proof'
                   ? 'Nos dijiste que tienes un sueldo pero no un sustento a mano. Cuéntanos en qué trabajas, cómo te pagan y cuánto ganas al mes. Escríbelo o grábanos una nota de voz.'
                   : 'En qué trabajas, cómo te pagan y cuánto ganas al mes. Escríbelo o grábanos una nota de voz.'}>
              <textarea value={detalle} onChange={(e) => setDetalle(e.target.value)} aria-label="Cómo percibes tus ingresos"
                        placeholder="Ejemplo: vendo postres por Instagram, entrego en la universidad de lunes a viernes, gano unos S/ 900 al mes…"
                        className="min-h-[84px] w-full rounded-xl border border-[#C9CEF2] px-3 py-2.5 text-[15px]" />
              <Btn kind="sec" className="mt-2 py-2.5 text-[13.5px]" disabled={detalle.trim().length < MIN_TEXTO || detalle.trim() === detalleGuardado || ocupado(m.code)} onClick={() => void guardarTexto(m.code)}>
                <Ic.Check className="h-4.5 w-4.5" />{detalleGuardado && detalle.trim() === detalleGuardado ? 'Guardado' : 'Guardar'}
              </Btn>
              <NotaVoz m={m} grabando={grabando} segs={segs} voz={voz}
                       onGrabar={() => void empezarGrabacion()} onDetener={detenerGrabacion}
                       onQuitar={() => { setVoz(null); }} onConfirmar={() => void confirmarVoz()} />
              {errorModulo[m.code] && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{errorModulo[m.code]}</p>}
            </Sec>
          );

          return null;
        })}

        {datos.situation === 'family_support' && (
          <div className="mt-3.5 rounded-xl bg-[#EEF0FB] px-3.5 py-2.5 text-[13.5px]">Registraste a un familiar como apoyo. Por ahora no le pediremos nada; lo conversamos contigo cuando hablemos.</div>
        )}
        {datos.situation === 'express' && !pideRecibo && (
          <div className="mt-3.5 rounded-xl bg-teal-50 px-3.5 py-2.5 text-[13.5px]">Con lo que ya nos dejaste es suficiente. Solo falta coordinar la conversación con tu asesor.</div>
        )}

        <Sec {...sp('contacto')} icon={<Ic.Cal className="h-5.5 w-5.5" />} titulo="¿Cuándo puede conversar contigo tu asesor?"
             why="Es una conversación corta para terminar de evaluar tu solicitud. Elige el momento que te acomode.">
          <label className="mb-1 mt-1 block text-[12.5px] font-bold text-gray-500">Día</label>
          <div className="grid grid-cols-3 gap-2">
            <Chip on={dia === 'hoy'} onClick={() => setDia('hoy')} disabled={hoyAgotado} b="Hoy" s={`${DN[fecha('hoy').getDay()]} ${fecha('hoy').getDate()}`} />
            <Chip on={dia === 'manana'} onClick={() => setDia('manana')} b="Mañana" s={`${DN[fecha('manana').getDay()]} ${fecha('manana').getDate()}`} />
            <Chip on={dia === 'pasado'} onClick={() => setDia('pasado')} b={DNL[d3.getDay()]} s={`${DN[d3.getDay()]} ${d3.getDate()}`} />
          </div>
          <label className="mb-1 mt-3 block text-[12.5px] font-bold text-gray-500">Horario</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TURNO) as Array<Exclude<TurnoKey, 'otro'>>).map((k) => (
              <Chip key={k} on={turno === k} onClick={() => setTurno(k)} disabled={turnoPasado(k)} b={TURNO[k][0]} s={TURNO[k][1]} />
            ))}
          </div>
          <div className="mt-2"><Chip on={turno === 'otro'} onClick={() => setTurno('otro')} b="Otra hora" s="elige una hora exacta" /></div>
          {turno === 'otro' && (
            <div className="mt-2 rounded-xl bg-[#EEF0FB] p-3">
              <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                <select value={hh} onChange={(e) => setHh(e.target.value)} aria-label="Hora" className="rounded-xl border border-[#C9CEF2] bg-white px-3 py-2.5 text-center text-[16px] font-semibold">
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => <option key={h} disabled={esHoy && aMin(h, '45', ap) <= (ahora as number)}>{h}</option>)}
                </select>
                <select value={mm} onChange={(e) => setMm(e.target.value)} aria-label="Minutos" className="rounded-xl border border-[#C9CEF2] bg-white px-3 py-2.5 text-center text-[16px] font-semibold">
                  {['00', '15', '30', '45'].map((x) => <option key={x} disabled={esHoy && aMin(hh, x, ap) <= (ahora as number)}>{x}</option>)}
                </select>
                <div className="flex overflow-hidden rounded-xl border border-[#C9CEF2] bg-white">
                  {['am', 'pm'].map((a) => (
                    <button key={a} type="button" onClick={() => setAp(a)} disabled={esHoy && a === 'am' && (ahora as number) >= 11 * 60 + 45}
                            className={`px-3.5 py-2.5 text-[14px] font-bold disabled:opacity-40 ${ap === a ? 'bg-[#4654CD] text-white' : 'text-gray-500'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-center text-[13px] text-[#2F3A9E]">Te contactamos a las <b>{horaTxt(hh, mm, ap)}</b></div>
            </div>
          )}
          <label className="mb-1 mt-3 block text-[12.5px] font-bold text-gray-500">¿Prefieres WhatsApp o llamada?</label>
          <div className="grid grid-cols-2 gap-2">
            <Chip on={canal === 'whatsapp'} onClick={() => setCanal('whatsapp')} b="WhatsApp" />
            <Chip on={canal === 'call'} onClick={() => setCanal('call')} b="Llamada" />
          </div>
          <div className="mt-2.5 rounded-xl bg-[#EEF0FB] px-3.5 py-3 text-[14px]">
            {!editTel ? (
              <div className="flex items-center gap-3">
                <Ic.Tel className="h-5 w-5 flex-none text-[#4654CD]" />
                <div className="flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Teléfono de contacto</div>
                  <b className="text-[15px] tabular-nums">{telefono || '—'}</b>
                  {tel.trim() && <small className="block text-[12px] text-gray-400">Antes: {fmtTel(datos.telefono ?? '')}</small>}
                </div>
                <button type="button" onClick={() => { setTelTmp(tel.trim() || ''); setEditTel(true); }} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-[#2F3A9E]"><Ic.Edit className="h-4 w-4" />Cambiar</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Ic.Tel className="h-5 w-5 flex-none text-[#4654CD]" />
                  <div className="flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Ingresa tu número</div>
                    <input type="tel" inputMode="numeric" value={telTmp} onChange={(e) => setTelTmp(e.target.value)} aria-label="Nuevo teléfono" placeholder="Ej. 987 654 321"
                           className="mt-1 w-full rounded-xl border border-[#C9CEF2] bg-white px-3 py-2.5 text-[15px]" />
                  </div>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setEditTel(false); setTelTmp(''); }} className="rounded-xl bg-white py-2.5 text-[13px] font-semibold text-gray-500">Cancelar</button>
                  <button type="button" disabled={!/^\d{3}\s?\d{3}\s?\d{3}$/.test(telTmp.trim())} onClick={() => { setTel(telTmp); setEditTel(false); }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#4654CD] py-2.5 text-[13px] font-bold text-white disabled:opacity-45"><Ic.Check className="h-4 w-4" />Confirmar</button>
                </div>
              </>
            )}
          </div>
          <GuardarSeccion
            seccion="contacto"
            listo={Boolean(dia && turno && canal && !editTel)}
            guardando={guardando.contacto}
            guardado={yaGuardada('contacto', payloadSeccionContacto())}
            error={errorSeccion.contacto}
            faltante="Elige el día, el horario y por dónde prefieres que te contacten."
            onGuardar={() => {
              const p = payloadSeccionContacto();
              if (p) void guardarSeccion('contacto', p);
            }}
          />
        </Sec>

        <Sec {...sp('ayuda')} icon={<Ic.Help className="h-5.5 w-5.5" />} titulo="¿Tienes alguna duda o necesitas ayuda?" why="Cuéntanos en qué podemos ayudarte. Es opcional.">
          <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} aria-label="Dudas"
                    placeholder="Ejemplo: no estoy seguro de qué recibo subir, o quiero cambiar el color del equipo…"
                    className="min-h-[84px] w-full rounded-xl border border-[#C9CEF2] px-3 py-2.5 text-[15px]" />
          <GuardarSeccion
            seccion="ayuda"
            listo={comentario.trim().length > 0}
            guardando={guardando.ayuda}
            guardado={yaGuardada('ayuda', { questions: comentario.trim() })}
            error={errorSeccion.ayuda}
            faltante="Escribe tu duda para poder guardarla."
            onGuardar={() => void guardarSeccion('ayuda', { questions: comentario.trim() })}
          />
        </Sec>

        {/* Enviar cierra el formulario entero, así que vive FUERA de las
            tarjetas, debajo de todas. Adentro de la última quedaba escondido
            en cuanto esa sección se guardaba y se colapsaba. */}
          </div>

          {ejemplo && EJEMPLOS[ejemplo] && (
            <div role="dialog" aria-modal="true" aria-label="Ejemplo del documento"
                 className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
                 onClick={() => setEjemplo(null)}>
              <div className="max-h-[92vh] w-full max-w-[520px] overflow-auto rounded-t-2xl border border-gray-200 bg-white p-4 sm:rounded-2xl"
                   onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <b className="block text-[16px] text-gray-900">Asi se ve</b>
                    <span className="text-[13px] text-gray-500">{EJEMPLOS[ejemplo]!.pie}</span>
                  </div>
                  <button type="button" onClick={() => setEjemplo(null)} aria-label="Cerrar"
                          className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#EEF0FB] text-[#2F3A9E]">
                    <Ic.X className="h-4 w-4" />
                  </button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {/* Alto acotado: los ejemplos son documentos verticales (900x1200) y
                    a ancho completo el modal quedaba con scroll propio. `contain`
                    para que no se recorte lo que hay que mirar. */}
                <img src={EJEMPLOS[ejemplo]!.url} alt={EJEMPLOS[ejemplo]!.alt}
                     className="mt-3 max-h-[58vh] w-full rounded-xl border border-gray-200 object-contain"
                     loading="lazy" />
                <p className="mt-3 text-[12.5px] text-gray-400">
                  Es un ejemplo: los datos que ves no son de nadie.
                </p>
              </div>
            </div>
          )}

          <div data-seccion="enviar" className="order-3 mt-5 lg:order-none lg:col-start-1 lg:row-start-2 lg:mt-4">
            {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Btn disabled={!completo || enviando} onClick={() => { const p = payloadContacto(); if (p) void enviar(datos, p); }}>
              <Ic.Send className="h-4.5 w-4.5" />{enviando ? 'Enviando…' : 'Enviar'}
            </Btn>
            {!completo && <div className="mt-2 text-center text-[12.5px] text-gray-400">El botón se activa cuando completes lo de arriba.</div>}
            {completo && turno && <div className="mt-2 text-center text-[12.5px] text-gray-400">Te contactamos {dia && diaTxt(dia)} {turnoTxt()}.</div>}
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}

/** Textos de la confirmación cuando el formulario ya estaba enviado al abrirlo. */
function confirmacionDe(p: Pantalla): Confirmacion {
  const c = p.contacto;
  let dia = '';
  if (c.contact_date) {
    const [y, m, d] = c.contact_date.split('-').map(Number);
    const f = new Date(y, m - 1, d);
    dia = `el ${DNL[f.getDay()].toLowerCase()} ${f.getDate()}`;
  }
  const slot = (Object.values(TURNO) as Array<[string, string, ContactSlot]>).find((t) => t[2] === c.contact_slot);
  let horario = slot ? `en la ${slot[0].toLowerCase()} (${slot[1]})` : '';
  if (c.contact_slot === 'exact' && c.contact_time) {
    const [h, mi] = c.contact_time.split(':');
    const x = deMin(parseInt(h, 10) * 60 + parseInt(mi, 10));
    horario = `a las ${horaTxt(x.hh, x.mm, x.ap)}`;
  }
  return { dia, horario, canal: c.contact_channel ?? 'whatsapp', telefono: fmtTel(c.contact_phone ?? p.telefono ?? '') };
}

// ---------- piezas ----------

function Producto({ datos, open, onToggle }: { datos: Pantalla; open: boolean; onToggle: () => void }) {
  const r = datos.resumen;
  const main = r.items.find((i) => i.es_principal) ?? r.items[0];
  const esExtra = (n: string) => /seguro|garant/i.test(n);
  const accs = r.items.filter((i) => !i.es_principal && !esExtra(i.nombre));
  const pills: string[] = [];
  if (accs.length) pills.push(`+ ${accs.length} accesorio${accs.length > 1 ? 's' : ''}`);
  if (r.seguro) pills.push('Incluye seguro');
  if (r.garantia) pills.push('Incluye garantía extendida');
  return (
    <div data-seccion="resumen" className="relative mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white text-left">
      <span className="absolute right-3 top-2 text-[10.5px] tabular-nums text-gray-400">Solicitud {datos.numero_solicitud}</span>
      <div className="grid grid-cols-[76px_1fr_auto] items-center gap-3.5 p-3.5 pt-5">
        <div className="flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-xl bg-[#EEF0FB]">
          {main?.imagen
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={main.imagen} alt={main.nombre} width={72} height={72} className="object-contain" />
            : <Ic.Phone className="h-9 w-9 text-[#4654CD]" />}
        </div>
        <div className="min-w-0">
          <div className="text-[15.5px] font-bold leading-tight">{main?.nombre ?? '—'}</div>
          <div className="mt-0.5 text-[12.5px] text-gray-500">{main?.spec && main.spec !== main.nombre ? main.spec : ''}</div>
          {pills.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1.5">{pills.map((p) => <span key={p} className="rounded-full bg-[#EEF0FB] px-2.5 py-0.5 text-[11px] font-bold text-[#2F3A9E]">{p}</span>)}</div>}
        </div>
        <div className="text-right"><b className="block text-[26px] leading-none text-[#2F3A9E]">S/ {r.cuota}</b><small className="mt-1 block text-[11.5px] text-gray-500">al mes · {r.plazo} cuotas</small></div>
      </div>
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center justify-between border-t border-gray-200 bg-[#EEF0FB] px-3.5 py-2.5 text-[13px] font-semibold text-[#2F3A9E]">
        <span>Ver el detalle de tu cuota</span><Ic.Chev className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="bg-[#EEF0FB] px-3.5 pb-3 pt-1">
          {r.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5 border-b border-white/70 py-2 text-[13.5px] last:border-b-0">
              <div className="flex h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-lg bg-white">
                {it.imagen
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={it.imagen} alt={it.nombre} width={34} height={34} className="object-contain" />
                  : <Ic.Doc className="h-5 w-5 text-[#8A94E0]" />}
              </div>
              <div>{it.nombre}<small className="block text-[12px] text-gray-500">{it.spec && it.spec !== it.nombre ? it.spec : it.es_principal ? 'Equipo principal' : esExtra(it.nombre) ? 'Protección' : 'Accesorio'}</small></div>
              <div className="font-bold tabular-nums">{it.cuota > 0 ? <>S/ {it.cuota} <small className="font-normal text-gray-500">al mes</small></> : <span className="text-[12.5px] text-teal-700">Incluido</span>}</div>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t-[1.5px] border-[#C9CEF2] pt-2 font-bold"><span>Total al mes</span><span>S/ {r.cuota}</span></div>
          <div className="mt-1.5 text-[12px] text-gray-500">{r.plazo} cuotas fijas{r.primer_pago ? ` · primera cuota el ${r.primer_pago}` : ''}</div>
        </div>
      )}
    </div>
  );
}

function Miniatura({ doc, className = 'h-[68px] w-14' }: { doc?: { file_name: string; mime_type: string | null; view_url: string | null }; className?: string }) {
  const esImagen = doc?.mime_type?.startsWith('image/');
  return (
    <div className={`flex flex-none items-center justify-center overflow-hidden rounded-lg border border-white bg-white ${className}`}>
      {doc?.view_url && esImagen
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={doc.view_url} alt={doc.file_name} className="h-full w-full object-cover" />
        : <Ic.Doc className="h-6 w-6 text-[#8A94E0]" />}
    </div>
  );
}

/** Guardar de una sección. No cierra el formulario ni reemplaza al Enviar
 * final: deja a salvo lo que el estudiante lleva escrito, para que abandonar a
 * mitad de camino no borre su horario ni su duda. */
function GuardarSeccion({ seccion, listo, guardando, guardado, error, faltante, onGuardar }: {
  seccion: string; listo: boolean; guardando?: boolean; guardado?: boolean;
  error?: string; faltante: string; onGuardar: () => void;
}) {
  return (
    <div className="mt-3">
      <Btn kind="sec" className="py-2.5 text-[13.5px]" disabled={!listo || guardando}
           onClick={onGuardar} testId={`guardar-${seccion}`}>
        <Ic.Check className="h-4.5 w-4.5" />
        {guardando ? 'Guardando…' : guardado ? 'Guardado' : 'Guardar'}
      </Btn>
      {error
        ? <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
        : guardado
          ? <p className="mt-2 text-[12.5px] text-emerald-700" aria-live="polite">Listo, lo guardamos. Puedes cambiarlo antes de enviar.</p>
          : !listo && <p className="mt-2 text-[12.5px] text-gray-400">{faltante}</p>}
    </div>
  );
}

/** Cuántas secciones ya están guardadas. En escritorio queda fijo junto al
 * equipo: sin esto, la columna izquierda no dice nada sobre lo que falta. */
function Avance({ listas, total }: { listas: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((listas / total) * 100);
  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13.5px] font-bold text-[#2F3A9E]">
          {listas} de {total} {total === 1 ? 'sección lista' : 'secciones listas'}
        </span>
        <span className="text-[12.5px] tabular-nums text-gray-400">{pct}%</span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF0FB]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={listas}
        aria-label="Secciones completadas"
      >
        <div className="h-full rounded-full bg-teal-500 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Barra de avance de una subida. `aria-valuenow` para que un lector de
 * pantalla anuncie el porcentaje sin depender del texto de al lado. */
function BarraProgreso({ valor }: { valor: number }) {
  return (
    <div
      className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF0FB]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={valor}
      aria-label="Avance de la subida"
    >
      <div
        className="h-full rounded-full bg-[#4654CD] transition-[width] duration-200"
        style={{ width: `${valor}%` }}
      />
    </div>
  );
}

/** Gemela de `Miniatura` para el archivo que todavía no llegó al servidor:
 * pinta desde el blob local (`URL.createObjectURL`) en vez de `view_url`. */
function PreviaMini({ previa, className = 'h-[68px] w-14' }: { previa: PreviaLocal; className?: string }) {
  return (
    <div className={`flex flex-none items-center justify-center overflow-hidden rounded-lg border border-white bg-white ${className}`}>
      {previa.esImagen && previa.url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={previa.url} alt={previa.nombre} className="h-full w-full object-cover" />
        : <Ic.Doc className="h-6 w-6 text-[#8A94E0]" />}
    </div>
  );
}

function NotaVoz({ m, grabando, segs, voz, onGrabar, onDetener, onQuitar, onConfirmar }: {
  m: Modulo; grabando: boolean; segs: number; voz: { seg: number; url: string } | null;
  onGrabar: () => void; onDetener: () => void; onQuitar: () => void; onConfirmar: () => void;
}) {
  const bars = Array.from({ length: 28 }, (_, i) => 6 + ((i * 7) % 20));
  // El archivo del modulo ES la nota de voz; no se mira `fulfilled_by`, que
  // guarda solo lo ULTIMO que hizo. Si escribia el texto despues de grabar, la
  // nota desaparecia de la pantalla aunque siguiera guardada: los dos pueden
  // convivir y los dos suman.
  const subida = m.documents[m.documents.length - 1];
  if (grabando) return (
    <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border-[1.5px] border-[#C9CEF2] p-2.5">
      <button type="button" disabled={segs < MIN_VOZ} onClick={onDetener} aria-label="Detener" className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-red-50 text-red-600 disabled:opacity-40"><Ic.Stop className="h-5 w-5" /></button>
      <div className="flex h-8 flex-1 items-center gap-[2px]">{bars.map((h, i) => <i key={i} className="flex-1 rounded-sm bg-[#4654CD]" style={{ height: h }} />)}</div>
      <small className="flex items-center gap-1.5 whitespace-nowrap text-[12.5px] text-gray-500"><span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-red-600" />Grabando {fmtSeg(segs)}{segs < MIN_VOZ && <span className="text-gray-400"> · mínimo {fmtSeg(MIN_VOZ)}</span>}</small>
    </div>
  );
  if (voz) return (
    <div className="mt-2.5 rounded-xl border-[1.5px] border-[#C9CEF2] p-2.5">
      <audio controls src={voz.url} className="w-full" />
      <div className="mt-2 flex justify-end gap-4 text-[13px] font-semibold">
        <button type="button" onClick={onGrabar} className="inline-flex items-center gap-1 text-[#4654CD]"><Ic.Redo className="h-4 w-4" />Grabar de nuevo</button>
        <button type="button" onClick={onQuitar} className="inline-flex items-center gap-1 text-gray-500"><Ic.X className="h-4 w-4" />Quitar</button>
        <button type="button" onClick={onConfirmar} className="inline-flex items-center gap-1 text-emerald-700"><Ic.Check className="h-4 w-4" />Enviar nota ({fmtSeg(voz.seg)})</button>
      </div>
    </div>
  );
  if (subida) return (
    <div className="mt-2.5 rounded-xl border-[1.5px] border-emerald-200 bg-emerald-50 p-2.5">
      <div className="flex items-center gap-1.5 text-[14px] font-bold text-emerald-700"><Ic.Check className="h-4 w-4" />Nota de voz recibida</div>
      {subida.view_url && <audio controls src={subida.view_url} className="mt-2 w-full" />}
      <div className="mt-2 flex justify-end text-[13px] font-semibold">
        <button type="button" onClick={onGrabar} className="inline-flex items-center gap-1 text-[#4654CD]"><Ic.Redo className="h-4 w-4" />Grabar de nuevo</button>
      </div>
    </div>
  );
  return (
    <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border-[1.5px] border-[#C9CEF2] p-2.5">
      <button type="button" onClick={onGrabar} aria-label="Grabar" className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#EEF0FB] text-[#4654CD]"><Ic.Mic className="h-5 w-5" /></button>
      <small className="text-[12.5px] text-gray-500">O grábanos una nota de voz, como en WhatsApp. Toca el micrófono para empezar.</small>
    </div>
  );
}

type Paso = { t: string; p: string; link?: [string, string] };
const TUT_RT: Paso[] = [
  { t: 'Entra a SUNAT Operaciones en Línea', p: 'Ingresa con tu RUC, usuario y clave SOL. Si no tienes clave SOL, la generas en la misma página con tu DNI.', link: ['https://www.sunat.gob.pe/sol.html', 'Abrir SUNAT Operaciones en Línea'] },
  { t: 'Ve a Reportes', p: 'En el menú: Mis trámites y consultas › Otras declaraciones y solicitudes › Reportes, y elige Reporte Tributario para Terceros.' },
  { t: 'Genera y descarga el PDF', p: 'Toca Generar reporte y luego Descargar. Súbelo aquí completo (el PDF, no una captura).', link: ['https://www.gob.pe/6995-obtener-reporte-tributario-para-terceros', 'Ver la guía oficial en gob.pe'] },
];
const TUT_RXH: Paso[] = [
  { t: 'Entra a SUNAT Operaciones en Línea', p: 'Ingresa con tu RUC, usuario y clave SOL.', link: ['https://www.sunat.gob.pe/sol.html', 'Abrir SUNAT Operaciones en Línea'] },
  { t: 'Ve a tus recibos emitidos', p: 'En el menú: Empresas › Comprobantes de pago › Recibo por Honorarios Electrónico › Consultar recibos por honorarios.' },
  { t: 'Busca y descarga los 3 últimos', p: 'Filtra por fecha de emisión, abre cada recibo y toca Descargar PDF. Sube los tres más recientes, uno en cada casilla.' },
];

function Guia({ pasos }: { pasos: Paso[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2.5">
      <Btn kind="sec" className="py-2.5 text-[13.5px]" onClick={() => setOpen((o) => !o)}><Ic.Eye className="h-4.5 w-4.5" />{open ? 'Ocultar la guía' : 'Cómo sacarlo, paso a paso'}</Btn>
      {open && (
        <ol className="mt-2 space-y-2 rounded-xl bg-[#EEF0FB] p-3 text-[13.5px]">
          {pasos.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#4654CD] text-[12px] font-bold text-white">{i + 1}</span>
              <div><b className="block">{s.t}</b><span className="text-gray-500">{s.p}</span>{s.link && <a href={s.link[0]} target="_blank" rel="noopener" className="block font-bold text-[#4654CD] underline underline-offset-4">{s.link[1]}</a>}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const Sec = ({ n, icon, titulo, why, children, done, collapsed, onToggle, seccion }: {
  n?: number; icon: React.ReactNode; titulo: string; why: React.ReactNode; children: React.ReactNode;
  done?: boolean; collapsed?: boolean; onToggle?: () => void;
  /** Nombre canonico para la telemetria ("hasta donde llego"). */
  seccion?: SeccionMedida;
}) => (
  <section data-seccion={seccion} className={`mt-3.5 rounded-2xl border bg-white ${done ? 'border-emerald-200' : 'border-gray-200'} ${collapsed ? 'p-3' : 'p-4'}`}>
    <button type="button" onClick={onToggle} disabled={!onToggle} className={`flex w-full gap-2.5 text-left disabled:cursor-default ${collapsed ? 'items-center' : 'items-start'}`}>
      {n !== undefined && <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-[#EEF0FB] text-[#2F3A9E]'}`}>{done ? <Ic.Check className="h-4 w-4" /> : n}</span>}
      <h2 className={`flex min-w-0 flex-1 items-start gap-2 font-bold leading-tight ${collapsed ? 'text-[16px] text-gray-500' : 'text-[18px] text-gray-900'}`}>
        {!collapsed && <span className="text-[#4654CD]">{icon}</span>}<span className={collapsed ? 'truncate' : 'text-balance'}>{titulo}</span>
      </h2>
      {collapsed && <span className="flex-none text-[12.5px] font-semibold text-emerald-700">Listo</span>}
      {onToggle && <Ic.Chev className={`h-4 w-4 flex-none text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} />}
    </button>
    {!collapsed && <><p className="mb-2.5 mt-1.5 text-[13.5px] text-gray-500">{why}</p>{children}</>}
  </section>
);

const Btn = ({ children, onClick, kind = 'pri', disabled, className = '', testId }: {
  children: React.ReactNode; onClick?: () => void; kind?: 'pri' | 'sec' | 'ghost';
  disabled?: boolean; className?: string; testId?: string;
}) => {
  const k = {
    pri: 'bg-[#4654CD] text-white hover:bg-[#3a47b3]',
    sec: 'bg-[#EEF0FB] text-[#2F3A9E]',
    ghost: 'border-[1.5px] border-[#C9CEF2] text-[#4654CD] bg-transparent',
  }[kind];
  return (
    <button type="button" disabled={disabled} onClick={onClick} data-testid={testId}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14.5px] font-bold disabled:cursor-not-allowed disabled:opacity-45 ${k} ${className}`}>
      {children}
    </button>
  );
};

const Chip = ({ on, onClick, b, s, disabled }: { on: boolean; onClick: () => void; b: string; s?: string; disabled?: boolean }) => (
  <button type="button" onClick={onClick} disabled={disabled}
          className={`w-full min-w-0 rounded-xl border-[1.5px] px-1.5 py-2.5 text-center disabled:cursor-not-allowed disabled:opacity-40 ${on ? 'border-[#4654CD] bg-[#EEF0FB]' : 'border-[#C9CEF2] bg-white'}`}>
    <b className="block whitespace-nowrap text-[14px]">{b}</b>{s && <small className="block whitespace-nowrap text-[11.5px] text-gray-500">{s}</small>}
  </button>
);

const Header = () => (
  <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
    <div className="mx-auto flex max-w-[560px] items-center px-4 py-3">
      {/* Alto fijo y ancho automatico: el archivo es 1082x305, asi que fijar
          los dos lo deformaria. `next/image` no aporta acá --- es un logo
          chico de un dominio externo --- y el repo ya lo carga asi en el
          modal del cupon. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_URL} alt="BaldeCash" className="block h-7 w-auto" />
    </div>
  </header>
);
const Footer = () => (
  <div className="mt-3 flex items-start gap-2 text-[12.5px] text-gray-400">
    <Ic.Lock className="mt-0.5 h-4 w-4 flex-none" /><span>Tus documentos están seguros y solo se usan para la evaluación crediticia.</span>
  </div>
);

/** Pantallas terminales (cargando, vencido, inválido, sin red, ya enviado).
 *
 * Llevan la misma cabecera que el formulario y un fondo blanco que ocupa toda
 * la pantalla. Antes eran un `<main>` suelto sin cabecera ni fondo: con tan
 * poco contenido, lo que hubiera detrás del `<body>` (el tema oscuro de la
 * zona gamer si quedó en `localStorage`, o cualquier franja del layout)
 * asomaba debajo de la tarjeta. */
function Pagina({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center px-4 py-12 text-center">
        {children}
      </main>
    </div>
  );
}

const IconoEstado = ({ tipo }: { tipo: 'ok' | 'reloj' | 'info' | 'alerta' }) => {
  const estilos = {
    ok: 'bg-teal-50 text-teal-600',
    reloj: 'bg-[#EEF0FB] text-[#4654CD]',
    info: 'bg-[#EEF0FB] text-[#4654CD]',
    alerta: 'bg-amber-50 text-amber-600',
  }[tipo];
  const Icono = { ok: Ic.Check, reloj: Ic.Cal, info: Ic.Wa, alerta: Ic.Alert }[tipo];
  return (
    <div className={`inline-flex h-[64px] w-[64px] items-center justify-center rounded-full ${estilos}`} aria-hidden="true">
      <Icono className="h-8 w-8" />
    </div>
  );
};

function Mensaje({ titulo, detalle, accion, icono }: {
  titulo: string; detalle?: string; accion?: { texto: string; onClick: () => void };
  icono?: 'ok' | 'reloj' | 'info' | 'alerta';
}) {
  return (
    <Pagina>
      {icono && <IconoEstado tipo={icono} />}
      <h1 className={`${icono ? 'mt-4' : ''} text-[22px] font-bold leading-tight text-[#2F3A9E]`}>{titulo}</h1>
      {detalle && <p className="mt-2 text-[15px] text-gray-500">{detalle}</p>}
      {accion && (
        <button type="button" onClick={accion.onClick} className="mt-5 rounded-xl bg-[#4654CD] px-5 py-2.5 text-[15px] font-bold text-white">{accion.texto}</button>
      )}
    </Pagina>
  );
}

const COPY_CAIDO: Record<EnlaceCaidoReason, { titulo: string; detalle: string; icono: 'reloj' | 'info' }> = {
  expired: {
    titulo: 'Este enlace venció',
    detalle: 'Por seguridad, cada enlace vale 8 horas. Pide uno nuevo y te lo enviamos por WhatsApp al instante.',
    icono: 'reloj',
  },
  superseded: {
    titulo: 'Te enviamos un enlace más nuevo por WhatsApp',
    detalle: 'Este quedó reemplazado. Usa el último que recibiste; si no lo encuentras, pide otro aquí.',
    icono: 'info',
  },
  revoked: {
    titulo: 'Este enlace ya no está activo',
    detalle: 'Pide uno nuevo y te lo enviamos por WhatsApp al instante.',
    icono: 'reloj',
  },
  consumed: {
    titulo: 'Este enlace ya se usó',
    detalle: 'Pide uno nuevo y te lo enviamos por WhatsApp al instante.',
    icono: 'reloj',
  },
  inactive: {
    titulo: 'Este enlace ya no está activo',
    detalle: 'Pide uno nuevo y te lo enviamos por WhatsApp al instante.',
    icono: 'reloj',
  },
};

/** "vence hoy a las 11:55" / "vence el 04/09 a las 11:55", partiendo el ISO
 * (hora Lima sin zona) en vez de `new Date`, que lo tomaría como UTC. */
export function venceTexto(iso: string | undefined, hoy = new Date()): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  const esHoy = Number(y) === hoy.getFullYear() && Number(mo) === hoy.getMonth() + 1 && Number(d) === hoy.getDate();
  return esHoy ? `vence hoy a las ${hh}:${mm}` : `vence el ${d}/${mo} a las ${hh}:${mm}`;
}

type EstadoRenovar =
  | { k: 'idle' }
  | { k: 'enviando' }
  | { k: 'enviado'; telefono: string; expiresAt?: string }
  | { k: 'plazo_vencido' }
  | { k: 'no_aplica' }
  | { k: 'tope' }
  | { k: 'fallo_envio' }
  | { k: 'red' }
  | { k: 'error'; texto: string };

/** Enlace vencido / reemplazado / usado: explica el motivo y deja pedir uno
 * nuevo desde la misma pantalla. El API manda el enlace nuevo por WhatsApp al
 * celular registrado; nunca lo devuelve al navegador. */
function EnlaceCaido({ reason, token, onSubmitted }: { reason: EnlaceCaidoReason; token: string; onSubmitted: () => void }) {
  const [estado, setEstado] = useState<EstadoRenovar>({ k: 'idle' });
  const copy = COPY_CAIDO[reason];

  const pedir = async () => {
    setEstado({ k: 'enviando' });
    evento('followup_form_renew_requested', { motivo: reason });
    const res = await renovarEnlace(token);
    if (!isFormularioApiError(res)) return setEstado({ k: 'enviado', telefono: res.telefono, expiresAt: res.expires_at });
    if (res.reason === 'already_submitted') return onSubmitted();
    if (res.reason === 'sla_expired') return setEstado({ k: 'plazo_vencido' });
    if (res.reason === 'not_applicable') return setEstado({ k: 'no_aplica' });
    if (res.reason === 'rate_limited') return setEstado({ k: 'tope' });
    if (res.reason === 'send_failed') return setEstado({ k: 'fallo_envio' });
    if (res.reason === 'network') return setEstado({ k: 'red' });
    setEstado({ k: 'error', texto: res.error });
  };

  const fallback = (
    <p className="mt-4 text-[13.5px] text-gray-400">
      ¿No te llega? <b className="font-semibold text-gray-500">Escríbenos por WhatsApp</b> y te enviamos uno nuevo.
    </p>
  );

  if (estado.k === 'enviado') {
    return (
      <Pagina>
        <IconoEstado tipo="ok" />
        <h1 className="mt-4 text-[22px] font-bold leading-tight text-[#2F3A9E]">Listo, te enviamos un enlace nuevo</h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Lo mandamos por WhatsApp al <b className="tabular-nums text-gray-900">{estado.telefono}</b>. Ábrelo desde WhatsApp para continuar.
        </p>
        {venceTexto(estado.expiresAt) && (
          <p className="mt-2 text-[14px] font-semibold text-amber-700">Ábrelo pronto: {venceTexto(estado.expiresAt)}.</p>
        )}
        <button type="button" disabled className="mt-5 rounded-xl bg-[#4654CD] px-5 py-2.5 text-[15px] font-bold text-white opacity-50">Enlace enviado</button>
        {fallback}
      </Pagina>
    );
  }

  if (estado.k === 'plazo_vencido') {
    return (
      <Pagina>
        <IconoEstado tipo="reloj" />
        <h1 className="mt-4 text-[22px] font-bold leading-tight text-[#2F3A9E]">Se venció el plazo para completar el formulario</h1>
        <p className="mt-2 text-[15px] text-gray-500">Tu asesor se comunicará contigo desde nuestra cuenta oficial de BaldeCash.</p>
        {fallback}
      </Pagina>
    );
  }

  if (estado.k === 'no_aplica') {
    return (
      <Mensaje icono="info" titulo="Tu asesor se comunicará contigo"
               detalle="No necesitas completar este formulario. Te contactaremos desde nuestra cuenta oficial de BaldeCash." />
    );
  }

  const enviando = estado.k === 'enviando';
  return (
    <Pagina>
      <IconoEstado tipo={copy.icono} />
      <h1 className="mt-4 text-[22px] font-bold leading-tight text-[#2F3A9E]">{copy.titulo}</h1>
      <p className="mt-2 text-[15px] text-gray-500">{copy.detalle}</p>
      <button
        type="button"
        onClick={() => void pedir()}
        disabled={enviando}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#4654CD] px-5 py-2.5 text-[15px] font-bold text-white disabled:opacity-60"
      >
        <Ic.Send className="h-4 w-4" />
        {enviando ? 'Enviando…' : estado.k === 'red' ? 'Reintentar' : 'Enviarme un enlace nuevo por WhatsApp'}
      </button>
      {estado.k === 'tope' && (
        <p role="alert" className="mt-3 text-[14px] text-amber-700">Ya te enviamos varios enlaces hoy. Revisa tu WhatsApp o escríbenos.</p>
      )}
      {estado.k === 'fallo_envio' && (
        <p role="alert" className="mt-3 text-[14px] text-red-600">No pudimos enviarlo por WhatsApp. Intenta de nuevo en un momento.</p>
      )}
      {estado.k === 'red' && (
        <p role="alert" className="mt-3 text-[14px] text-red-600">No pudimos conectarnos. Revisa tu conexión e intenta nuevamente.</p>
      )}
      {estado.k === 'error' && (
        <p role="alert" className="mt-3 text-[14px] text-red-600">{estado.texto}</p>
      )}
      {fallback}
    </Pagina>
  );
}

export default FormularioClient;
