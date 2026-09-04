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
  borrarArchivo,
  cumplirConTexto,
  enviarFormulario,
  getFormulario,
  isFormularioApiError,
  renovarEnlace,
  subirArchivo,
  type ContactChannel,
  type ContactSlot,
  type EnviarPayload,
  type Modulo,
  type ModuloCode,
  type Pantalla,
} from '@/app/prototipos/0.6/services/formularioApi';
import { Ic } from './icons';

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

/** Un módulo cuenta como cumplido para el envío. */
export const moduloListo = (m: Modulo) =>
  m.status === 'uploaded' || m.status === 'verified' || m.status === 'skipped' ||
  // Al tope de intentos ya no puede subir otro: queda para revisión manual y no
  // debe trabarlo para siempre.
  (m.status === 'rejected' && m.attempt_count >= m.max_attempts);

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

export function FormularioClient({ token }: FormularioClientProps) {
  const [view, setView] = useState<ViewState>({ status: 'loading' });
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorModulo, setErrorModulo] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [abierto, setAbierto] = useState<Record<string, boolean>>({});
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
    if (res.status === 'submitted') {
      return setView({ status: 'done', datos: res, contacto: confirmacionDe(res) });
    }
    setView({ status: 'ready', datos: res });
  }, [token]);

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

  const subir = async (code: ModuloCode, file: File, fulfilledBy: 'document' | 'voice_note' = 'document') => {
    setErrorModulo((e) => ({ ...e, [code]: '' }));
    setSubiendo(true);
    const res = await subirArchivo(token, code, file, fulfilledBy);
    setSubiendo(false);
    if (isFormularioApiError(res)) {
      setErrorModulo((e) => ({ ...e, [code]: res.error }));
      return false;
    }
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
    setSubiendo(true);
    const res = await borrarArchivo(token, code, documentId);
    setSubiendo(false);
    if (isFormularioApiError(res)) return setErrorModulo((e) => ({ ...e, [code]: res.error }));
    reemplazar(res);
  };

  const guardarTexto = async (code: ModuloCode) => {
    const texto = detalle.trim();
    if (texto.length < MIN_TEXTO) return;
    setSubiendo(true);
    const res = await cumplirConTexto(token, code, texto);
    setSubiendo(false);
    if (isFormularioApiError(res)) return setErrorModulo((e) => ({ ...e, [code]: res.error }));
    setDetalleGuardado(texto);
    reemplazar(res);
  };

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
    await subir('income_detail', file, 'voice_note');
  };

  // ---------- envío ----------
  const enviar = async (datos: Pantalla, payloadBase: Omit<EnviarPayload, 'questions' | 'corrected_address'>) => {
    setError(null);
    setEnviando(true);
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
      return setError(res.error);
    }
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
      <>
        <Header />
        <main className="mx-auto max-w-[560px] px-4 py-6 text-center">
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
      </>
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

  const orden = [...secciones.map((s) => s.key), 'contacto', 'ayuda'];
  const hecho: Record<string, boolean> = Object.fromEntries(secciones.map((s) => [s.key, listo(s)]));
  hecho.contacto = contactoOk; hecho.ayuda = false;
  const vozAbierta = (k: string) => k === 'income_detail' && datos.modulos.find((m) => m.code === 'income_detail')?.fulfilled_by === 'voice_note';
  const sp = (k: string) => ({
    n: orden.indexOf(k) + 1, done: hecho[k],
    collapsed: hecho[k] && !abierto[k] && !vozAbierta(k),
    onToggle: hecho[k] ? () => setAbierto((a) => ({ ...a, [k]: !a[k] })) : undefined,
  });
  const turnoTxt = () => (turno === 'otro'
    ? `a las ${horaTxt(hh, mm, ap)}`
    : turno ? `en la ${TURNO[turno][0].toLowerCase()} (${TURNO[turno][1]})` : '');

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

  const nDocs = datos.modulos.length;
  const d3 = fecha('pasado');

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
          <div className="mt-2 flex justify-end gap-4 text-[13px] font-semibold">
            {doc?.view_url && <a href={doc.view_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-emerald-700"><Ic.Eye className="h-4 w-4" />Ver</a>}
            {puedeReintentar(m) && <button type="button" onClick={() => elegirArchivo(m.code)} className="inline-flex items-center gap-1 text-gray-500"><Ic.Redo className="h-4 w-4" />Subir otro</button>}
          </div>
          {inputArchivo(m)}
        </div>
      );
    }
    const rechazado = m.status === 'rejected';
    const tope = rechazado && !puedeReintentar(m);
    return (
      <div className={`mt-2.5 rounded-[13px] border-[1.5px] p-3.5 ${rechazado ? 'border-red-500 bg-red-50' : 'border-dashed border-[#C9CEF2] bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl ${rechazado ? 'bg-white text-red-600' : 'bg-[#EEF0FB] text-[#4654CD]'}`}>{rechazado ? <Ic.Alert className="h-6 w-6" /> : icon}</div>
          <div><b className="block text-[14px]">{titulo}</b><span className="text-[12.5px] text-gray-500">{sub}</span></div>
        </div>
        {rechazado && (
          <div className="mt-2.5 flex gap-2 rounded-xl bg-white p-2.5 text-[13.5px] text-red-600" role="alert">
            <Ic.Alert className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <b className="block">{m.rejection_message || 'No pudimos validar este documento'}</b>
              {tope
                ? <span className="text-gray-900">Ya no puedes subir otro: un asesor lo revisará contigo.</span>
                : <span className="text-gray-900">Intento {m.attempt_count} de {m.max_attempts}. Sube otro archivo.</span>}
            </div>
          </div>
        )}
        {err && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{err}</p>}
        {!tope && (
          <Btn className="mt-2.5 py-2.5 text-[13.5px]" onClick={() => elegirArchivo(m.code)}>
            <Ic.Upload className="h-4.5 w-4.5" />{rechazado ? 'Subir otro' : 'Subir'}
          </Btn>
        )}
        {inputArchivo(m)}
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[560px] px-4 pb-16 pt-5">
        <h1 className="text-balance text-[26px] font-bold leading-[1.15] text-[#2F3A9E]">
          Hola, {datos.nombre}: <span className="text-teal-600">ya falta poco</span> para evaluar tu solicitud
        </h1>
        <p className="mt-1.5 text-gray-500">
          {nDocs === 0
            ? 'Solo necesitamos saber cuándo puede conversar contigo tu asesor.'
            : `Necesitamos ${nDocs === 1 ? 'un documento' : 'unos documentos'} y saber cuándo puede conversar contigo tu asesor. Toma 2 minutos.`}
        </p>
        <Producto datos={datos} open={detOpen} onToggle={() => setDetOpen((o) => !o)} />

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
                    <div className="flex items-center gap-3"><div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#EEF0FB] text-[#4654CD]"><Ic.Chat className="h-6 w-6" /></div><div><b className="block text-[14px]">Cuéntanos cómo percibes tus ingresos</b><span className="text-[12.5px] text-gray-500">Dónde trabajas, cómo te pagan y más o menos cuánto al mes.</span></div></div>
                    <textarea value={detalle} onChange={(e) => setDetalle(e.target.value)} aria-label="Cómo percibes tus ingresos"
                              placeholder="Ejemplo: trabajo en una bodega en Comas, me pagan en efectivo cada semana, unos S/ 1,200 al mes…"
                              className="mt-2.5 min-h-[84px] w-full rounded-xl border border-[#C9CEF2] px-3 py-2.5 text-[15px]" />
                    {errorModulo[m.code] && <p role="alert" className="mt-2 text-[13px] text-red-700">{errorModulo[m.code]}</p>}
                    <Btn kind="sec" className="mt-2 py-2.5 text-[13.5px]" disabled={detalle.trim().length < MIN_TEXTO || detalle.trim() === detalleGuardado} onClick={() => void guardarTexto(m.code)}>
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
                        ? <button type="button" onClick={() => elegirArchivo(rm.code)} className="mt-0.5 text-[11.5px] font-semibold text-[#4654CD]">{ok || rechazado ? 'Subir otro' : 'Toca para subir'}</button>
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
                    <div key={doc.id} className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[#C9CEF2] bg-[#EEF0FB]">
                      <Miniatura doc={doc} className="h-full w-full" />
                      <button type="button" onClick={() => void quitar(m.code, doc.id)} aria-label="Quitar" className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-900"><Ic.X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  {m.documents.length < maxFiles && puedeReintentar(m) && (
                    <button type="button" onClick={() => elegirArchivo(m.code)} className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-[#C9CEF2] bg-white text-[12px] font-semibold text-[#4654CD]">
                      <Ic.Plus className="h-5 w-5" />{m.documents.length ? 'Agregar otra' : 'Agregar captura'}
                    </button>
                  )}
                </div>
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
                   ? 'Nos dijiste que tienes un sueldo pero no un sustento a mano. Cuéntanos en qué trabajas, cómo te pagan y más o menos cuánto al mes. Escríbelo o grábanos una nota de voz.'
                   : 'En qué trabajas, cómo te pagan y más o menos cuánto al mes. Escríbelo o grábanos una nota de voz.'}>
              <textarea value={detalle} onChange={(e) => setDetalle(e.target.value)} aria-label="Cómo percibes tus ingresos"
                        placeholder="Ejemplo: vendo postres por Instagram, entrego en la universidad de lunes a viernes, gano unos S/ 900 al mes…"
                        className="min-h-[84px] w-full rounded-xl border border-[#C9CEF2] px-3 py-2.5 text-[15px]" />
              <Btn kind="sec" className="mt-2 py-2.5 text-[13.5px]" disabled={detalle.trim().length < MIN_TEXTO || detalle.trim() === detalleGuardado} onClick={() => void guardarTexto(m.code)}>
                <Ic.Check className="h-4.5 w-4.5" />{m.fulfilled_by === 'text' && detalle.trim() === detalleGuardado ? 'Guardado' : 'Guardar texto'}
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
        </Sec>

        <Sec {...sp('ayuda')} icon={<Ic.Help className="h-5.5 w-5.5" />} titulo="¿Tienes alguna duda o necesitas ayuda?" why="Cuéntanos en qué podemos ayudarte. Es opcional.">
          <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} aria-label="Dudas"
                    placeholder="Ejemplo: no estoy seguro de qué recibo subir, o quiero cambiar el color del equipo…"
                    className="min-h-[84px] w-full rounded-xl border border-[#C9CEF2] px-3 py-2.5 text-[15px]" />
          {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Btn className="mt-3" disabled={!completo || enviando} onClick={() => { const p = payloadContacto(); if (p) void enviar(datos, p); }}>
            <Ic.Send className="h-4.5 w-4.5" />{enviando ? 'Enviando…' : 'Enviar'}
          </Btn>
          {!completo && <div className="mt-2 text-[12.5px] text-gray-400">El botón se activa cuando completes lo de arriba.</div>}
          {completo && turno && <div className="mt-2 text-[12.5px] text-gray-400">Te contactamos {dia && diaTxt(dia)} {turnoTxt()}.</div>}
          <Footer />
        </Sec>
      </main>

      {subiendo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#f6f7fd]/95 p-6 text-center" aria-live="polite">
          <div>
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-[5px] border-[#C9CEF2] border-t-[#4654CD]" />
            <h3 className="text-xl font-bold text-[#2F3A9E]">Cargando…</h3>
            <p className="mt-1 text-gray-500">Un momento, por favor.</p>
          </div>
        </div>
      )}
    </>
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
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white text-left">
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

function NotaVoz({ m, grabando, segs, voz, onGrabar, onDetener, onQuitar, onConfirmar }: {
  m: Modulo; grabando: boolean; segs: number; voz: { seg: number; url: string } | null;
  onGrabar: () => void; onDetener: () => void; onQuitar: () => void; onConfirmar: () => void;
}) {
  const bars = Array.from({ length: 28 }, (_, i) => 6 + ((i * 7) % 20));
  const subida = m.fulfilled_by === 'voice_note' && m.documents[m.documents.length - 1];
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
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#4654CD] text-[12px] font-extrabold text-white">{i + 1}</span>
              <div><b className="block">{s.t}</b><span className="text-gray-500">{s.p}</span>{s.link && <a href={s.link[0]} target="_blank" rel="noopener" className="block font-bold text-[#4654CD] underline underline-offset-4">{s.link[1]}</a>}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const Sec = ({ n, icon, titulo, why, children, done, collapsed, onToggle }: {
  n?: number; icon: React.ReactNode; titulo: string; why: React.ReactNode; children: React.ReactNode;
  done?: boolean; collapsed?: boolean; onToggle?: () => void;
}) => (
  <section className={`mt-3.5 rounded-2xl border bg-white ${done ? 'border-emerald-200' : 'border-gray-200'} ${collapsed ? 'p-3' : 'p-4'}`}>
    <button type="button" onClick={onToggle} disabled={!onToggle} className={`flex w-full gap-2.5 text-left disabled:cursor-default ${collapsed ? 'items-center' : 'items-start'}`}>
      {n !== undefined && <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-extrabold ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-[#EEF0FB] text-[#2F3A9E]'}`}>{done ? <Ic.Check className="h-4 w-4" /> : n}</span>}
      <h2 className={`flex min-w-0 flex-1 items-start gap-2 font-bold leading-tight ${collapsed ? 'text-[16px] text-gray-500' : 'text-[18px] text-gray-900'}`}>
        {!collapsed && <span className="text-[#4654CD]">{icon}</span>}<span className={collapsed ? 'truncate' : 'text-balance'}>{titulo}</span>
      </h2>
      {collapsed && <span className="flex-none text-[12.5px] font-semibold text-emerald-700">Listo</span>}
      {onToggle && <Ic.Chev className={`h-4 w-4 flex-none text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} />}
    </button>
    {!collapsed && <><p className="mb-2.5 mt-1.5 text-[13.5px] text-gray-500">{why}</p>{children}</>}
  </section>
);

const Btn = ({ children, onClick, kind = 'pri', disabled, className = '' }: {
  children: React.ReactNode; onClick?: () => void; kind?: 'pri' | 'sec' | 'ghost'; disabled?: boolean; className?: string;
}) => {
  const k = {
    pri: 'bg-[#4654CD] text-white hover:bg-[#3a47b3]',
    sec: 'bg-[#EEF0FB] text-[#2F3A9E]',
    ghost: 'border-[1.5px] border-[#C9CEF2] text-[#4654CD] bg-transparent',
  }[kind];
  return (
    <button type="button" disabled={disabled} onClick={onClick}
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
    <div className="mx-auto max-w-[560px] px-4 py-3 text-[18px] font-extrabold text-[#2F3A9E]">BaldeCash</div>
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

type EstadoRenovar =
  | { k: 'idle' }
  | { k: 'enviando' }
  | { k: 'enviado'; telefono: string }
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
    const res = await renovarEnlace(token);
    if (!isFormularioApiError(res)) return setEstado({ k: 'enviado', telefono: res.telefono });
    if (res.reason === 'already_submitted') return onSubmitted();
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
        <button type="button" disabled className="mt-5 rounded-xl bg-[#4654CD] px-5 py-2.5 text-[15px] font-bold text-white opacity-50">Enlace enviado</button>
        {fallback}
      </Pagina>
    );
  }

  if (estado.k === 'no_aplica') {
    return (
      <Mensaje icono="info" titulo="Tu asesor se va a comunicar contigo"
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
