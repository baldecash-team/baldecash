'use client';

/**
 * Modal de captura de leads con cupón — rediseño BAL-3125 (Tareas 4 y 6).
 *
 * Portado desde el diseño aprobado `cupon15.html`. Diferencias respecto al
 * mock que valen la pena anotar:
 *
 * - Sin apellidos: un solo campo "Nombre" → `first_name`.
 * - Checkbox de términos obligatorio: el backend rechaza `terms_accepted:
 *   false` con 422, así que el front también lo exige antes de llamar.
 * - Sin botón "Aplicar": al enviar, el cupón se muestra Y se guarda en el
 *   mismo paso (`saveLeadModalSubmission`). "Ver equipos" solo cierra.
 * - "No deseo canjear cupón" cierra sin tocar la red ni el storage.
 * - Los textos del cupón (amount/caption/benefit) SIEMPRE vienen del
 *   backend — nunca quemados, aunque el diseño trae "15%" escrito a mano.
 * - El troquelado (`.perf`/`.notch`, `left: 330px` fijo en el CSS original)
 *   sigue a `panel_position`: con el panel a la derecha, 330px fijo cruzaría
 *   el formulario.
 * - Sin `bg-brand-500` (clase de admin2 que no existe acá): el color sale de
 *   `var(--color-primary, #4654CD)`, como `DniModal.tsx`.
 */

import React, { useEffect, useRef, useState } from 'react';
import { saveLeadModalSubmission, type ModalCoupon } from '../../utils/leadModalStorage';
import { routes } from '../../utils/routes';

export type PanelPosition = 'left' | 'right';
export type PanelContent = 'coupon' | 'image' | 'none';

export interface LeadModalConfig {
  enabled?: boolean;
  title?: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  countdown_enabled?: boolean;
  /** Fecha+hora ISO en la que termina la oferta. Igual para todos los
   *  visitantes — a diferencia de un contador en minutos, no se reinicia
   *  cada vez que se abre el modal. */
  countdown_ends_at?: string;
  panel_position?: PanelPosition;
  panel_content?: PanelContent;
  /** Textos del cupon, que el config publico arma por tipo. El panel los
   *  necesita ANTES de enviar; el codigo del cupon no viaja aca. */
  amount?: string | null;
  caption?: string | null;
  benefit?: string | null;
  gift_name?: string | null;
}

interface Props {
  landingSlug: string;
  config: LeadModalConfig;
  onClose: () => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/** Logo estándar de la marca, el mismo que usa `constants.ts` (BC.logo) sobre fondo claro. */
const LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

/** Ancho de la franja azul en desktop — el troquelado se calcula sobre este valor. */
const STUB_WIDTH_PX = 330;

type TipoDocumento = 'DNI' | 'CE' | 'PAS';

interface ReglaDocumento {
  len: number;
  numerico: boolean;
  placeholder: string;
  mensaje: string;
}

/**
 * Reglas por tipo de documento. Aplicar la del DNI (8 dígitos numéricos) a
 * todos rechazaría pasaportes válidos: CE y pasaporte son alfanuméricos y de
 * largo mínimo 6, no exactamente 8.
 */
const REGLAS: Record<TipoDocumento, ReglaDocumento> = {
  DNI: { len: 8, numerico: true, placeholder: '12345678', mensaje: 'El DNI tiene 8 dígitos.' },
  CE: { len: 12, numerico: false, placeholder: '001234567', mensaje: 'Ingresa tu carné de extranjería.' },
  PAS: { len: 12, numerico: false, placeholder: 'A1234567', mensaje: 'Ingresa tu número de pasaporte.' },
};

function documentoValido(tipo: TipoDocumento | '', numero: string): boolean {
  if (!tipo) return false;
  const regla = REGLAS[tipo];
  if (regla.numerico) return new RegExp(`^\\d{${regla.len}}$`).test(numero);
  return numero.length >= 6;
}

const PHONE_RE = /^9\d{8}$/;

interface CuponRespuesta {
  code: string;
  discount: number;
  label: string;
  coupon_type?: 'fixed' | 'percent_quotas' | 'free_accessory' | null;
  quotas_affected?: number | null;
  amount?: string | null;
  caption?: string | null;
  benefit?: string | null;
  gift_name?: string | null;
}

function aAppliedCoupon(c: CuponRespuesta): ModalCoupon {
  return {
    code: c.code,
    discount: c.discount,
    label: c.label,
    ...(c.coupon_type ? { couponType: c.coupon_type } : {}),
    ...(c.quotas_affected != null ? { quotasAffected: c.quotas_affected } : {}),
  };
}

const MS_POR_SEGUNDO = 1000;
const MS_POR_MINUTO = 60 * MS_POR_SEGUNDO;
const MS_POR_HORA = 60 * MS_POR_MINUTO;
const MS_POR_DIA = 24 * MS_POR_HORA;

interface Bloque {
  valor: string;
  etiqueta: string;
}

/** Cuánto falta hasta `endsAt`, sin negativos. */
function msRestantes(endsAt: string): number {
  const fin = new Date(endsAt).getTime();
  if (Number.isNaN(fin)) return 0;
  return Math.max(0, fin - Date.now());
}

/**
 * Cuenta regresiva DECORATIVA (Tarea 6) hacia una fecha tope fija
 * (`countdown_ends_at`) — igual para todos los visitantes, a diferencia de un
 * contador en minutos que se reiniciaba cada vez que se abría el modal.
 *
 * Unidades adaptativas: dias+horas+minutos (sin segundos) cuando falta mas de
 * una hora, MM:SS (con segundos, en rojo) en la ultima hora. Sin segundos
 * cuando faltan dias/horas, el numero no compite por atencion con el
 * formulario; en la ultima hora los segundos SON la urgencia.
 *
 * Al llegar a cero la seccion entera desaparece (return null) — nunca
 * "00:00": el cupón no vence, el formulario se sigue enviando igual, no se
 * bloquea nada. Es puramente visual.
 */
function Countdown({ endsAt }: { endsAt: string }) {
  const [restanteMs, setRestanteMs] = useState(() => msRestantes(endsAt));

  useEffect(() => {
    if (restanteMs <= 0) return;
    const t = setTimeout(() => setRestanteMs(msRestantes(endsAt)), MS_POR_SEGUNDO);
    return () => clearTimeout(t);
  }, [restanteMs, endsAt]);

  if (restanteMs <= 0) return null;

  const enUltimaHora = restanteMs < MS_POR_HORA;

  let bloques: Bloque[];
  if (enUltimaHora) {
    const totalSeg = Math.floor(restanteMs / MS_POR_SEGUNDO);
    const mm = String(Math.floor(totalSeg / 60)).padStart(2, '0');
    const ss = String(totalSeg % 60).padStart(2, '0');
    bloques = [{ valor: `${mm}:${ss}`, etiqueta: 'min' }];
  } else {
    const dias = Math.floor(restanteMs / MS_POR_DIA);
    const horas = Math.floor((restanteMs % MS_POR_DIA) / MS_POR_HORA);
    const minutos = Math.floor((restanteMs % MS_POR_HORA) / MS_POR_MINUTO);
    // Dos digitos siempre: con "3 9 34" los bloques quedaban de anchos
    // distintos y el numero saltaba de lugar al bajar de 10.
    const dd = (n: number) => String(n).padStart(2, '0');
    const segundos = Math.floor((restanteMs % MS_POR_MINUTO) / MS_POR_SEGUNDO);
    // Los segundos van SIEMPRE: sin ellos el contador parece congelado y deja
    // de leerse como una cuenta regresiva.
    bloques = dias >= 1
      ? [
          { valor: dd(dias), etiqueta: 'días' },
          { valor: dd(horas), etiqueta: 'hrs' },
          { valor: dd(minutos), etiqueta: 'min' },
          { valor: dd(segundos), etiqueta: 'seg' },
        ]
      : [
          { valor: dd(horas), etiqueta: 'hrs' },
          { valor: dd(minutos), etiqueta: 'min' },
          { valor: dd(segundos), etiqueta: 'seg' },
        ];
  }

  return (
    <div
      role="timer"
      aria-label="Tiempo restante de la oferta"
      className={`mb-5 rounded-[13px] px-4 py-3 ${
        enUltimaHora ? 'bg-[#FFF1F2]' : 'bg-[var(--mist,#F4F5FB)]'
      }`}
    >
      {/* "Termina en" ARRIBA, no al lado: con tres bloques la linea quedaba
          apretada y el rotulo competia con los numeros. */}
      <p
        className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]"
        style={{ color: enUltimaHora ? '#D64550' : 'var(--color-primary, #4654CD)' }}
      >
        Termina en
      </p>
      <div className="flex items-center gap-2.5">
        {bloques.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && !enUltimaHora && (
              <span aria-hidden="true" className="text-lg font-bold text-[#C9CEE8]">:</span>
            )}
            <div className="text-center leading-none">
              {/* Numeros en el azul de marca; el aqua queda para la etiqueta,
                  que es lo que el diseño usa como acento. */}
              <div
                className="font-['Baloo_2'] text-[26px] font-extrabold"
                style={{ color: enUltimaHora ? '#D64550' : 'var(--color-primary, #4654CD)' }}
              >
                {b.valor}
              </div>
              <div
                className="mt-1 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: enUltimaHora ? '#D64550' : 'var(--navy, #151744)' }}
              >
                {b.etiqueta}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function LeadCouponModal({ landingSlug, config, onClose }: Props) {
  const [documentType, setDocumentType] = useState<TipoDocumento | ''>('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<{ doc?: string; name?: string; phone?: string; terms?: string; general?: string }>({});
  const [cuponObtenido, setCuponObtenido] = useState<CuponRespuesta | null>(null);
  const [sinCupon, setSinCupon] = useState(false);

  const panelPosition: PanelPosition = config.panel_position === 'right' ? 'right' : 'left';
  const panelContent: PanelContent = config.panel_content ?? 'coupon';

  // Con el panel a la derecha el troquelado tiene que estar a la derecha
  // tambien, o cruzaria el formulario (el CSS original trae `left: 330px`
  // fijo, pensado solo para panel a la izquierda).
  const stubStyle: React.CSSProperties =
    panelPosition === 'left' ? { left: 0 } : { right: 0 };
  const perfStyle: React.CSSProperties =
    panelPosition === 'left' ? { left: `${STUB_WIDTH_PX}px` } : { right: `${STUB_WIDTH_PX}px`, left: 'auto' };
  const notchStyle: React.CSSProperties = perfStyle;

  const docNumRef = useRef<HTMLInputElement>(null);
  const docTypeRef = useRef<HTMLSelectElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  function validar(): boolean {
    const nuevosErrores: typeof errores = {};
    let primerCampo: HTMLElement | null = null;

    if (!documentoValido(documentType, documentNumber)) {
      nuevosErrores.doc = documentType
        ? REGLAS[documentType].mensaje
        : 'Elige tu tipo de documento.';
      primerCampo = primerCampo || (documentType ? docNumRef.current : docTypeRef.current);
    }
    if (firstName.trim().length < 2) {
      nuevosErrores.name = 'Escribe tu nombre.';
      primerCampo = primerCampo || nameRef.current;
    }
    if (!PHONE_RE.test(phone)) {
      nuevosErrores.phone = 'Ingresa los 9 dígitos de tu celular, empezando con 9.';
      primerCampo = primerCampo || phoneRef.current;
    }
    if (!termsAccepted) {
      nuevosErrores.terms = 'Necesitamos tu aceptación para enviarte el cupón.';
      primerCampo = primerCampo || termsRef.current;
    }

    setErrores(nuevosErrores);
    if (primerCampo) primerCampo.focus();
    return Object.keys(nuevosErrores).length === 0;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    setErrores({});
    try {
      const r = await fetch(`${API_BASE_URL}/newsletter/lead-modal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landing_slug: landingSlug,
          document_type: documentType,
          document_number: documentNumber.trim(),
          first_name: firstName.trim(),
          phone: phone.trim(),
          terms_accepted: true,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data: { success: boolean; coupon: CuponRespuesta | null } = await r.json();

      // Guardar y mostrar pasan en el MISMO paso: no hay botón "Aplicar"
      // separado. Documento y celular se guardan siempre, tenga o no cupón
      // esta landing.
      saveLeadModalSubmission(landingSlug, {
        documentNumber: documentNumber.trim(),
        phone: phone.trim(),
        coupon: data.coupon ? aAppliedCoupon(data.coupon) : null,
      });

      if (data.coupon) {
        setCuponObtenido(data.coupon);
      } else {
        setSinCupon(true);
      }
    } catch {
      setErrores({ general: 'No pudimos guardar tus datos. Intenta de nuevo.' });
    } finally {
      setEnviando(false);
    }
  }

  /** Cierra sin llamar al backend ni guardar nada — el usuario declinó. */
  function descartar() {
    onClose();
  }

  function handleDocTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const tipo = e.target.value as TipoDocumento | '';
    setDocumentType(tipo);
    setDocumentNumber('');
    setErrores((prev) => ({ ...prev, doc: undefined }));
  }

  function handleDocNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const regla = documentType ? REGLAS[documentType] : null;
    let v = e.target.value;
    v = regla?.numerico ? v.replace(/\D/g, '') : v.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (regla) v = v.slice(0, regla.len);
    setDocumentNumber(v);
    setErrores((prev) => ({ ...prev, doc: undefined }));
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 9));
    setErrores((prev) => ({ ...prev, phone: undefined }));
  }

  const mostrandoExito = cuponObtenido !== null || sinCupon;

  return (
    <div
      className="lead-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(21,23,68,0.55)] p-4 backdrop-blur-sm"
      role="presentation"
    >
      {/* Animaciones del diseño aprobado (`cupon15.html`): el overlay entra
          con fadeIn y el modal sube con `rise`. Van en <style> y no en clases
          de Tailwind porque son keyframes propios del componente.
          `prefers-reduced-motion` las apaga: el modal aparece igual, sin
          movimiento. */}
      <style>{`
        @keyframes leadModalFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes leadModalRise {
          from { opacity: 0; transform: translateY(26px) scale(.97) }
          to { opacity: 1; transform: none }
        }
        .lead-modal-overlay { animation: leadModalFadeIn .35s ease both }
        .lead-modal-dialog { animation: leadModalRise .5s cubic-bezier(.2,.9,.3,1) both }
        @media (prefers-reduced-motion: reduce) {
          .lead-modal-overlay, .lead-modal-dialog { animation: none }
        }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-coupon-modal-headline"
        className={`lead-modal-dialog relative m-auto grid w-full max-w-[880px] overflow-hidden rounded-[26px] bg-white shadow-2xl ${
          panelContent === 'none'
            ? 'grid-cols-1'
            : panelPosition === 'left'
              ? 'md:grid-cols-[minmax(0,330px)_minmax(0,1fr)]'
              : 'md:grid-cols-[minmax(0,1fr)_minmax(0,330px)]'
        }`}
      >
        <button
          type="button"
          onClick={descartar}
          aria-label="Cerrar"
          className="absolute right-3.5 top-3.5 z-[6] grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full bg-white/90 text-[#151744] transition duration-200 hover:rotate-90 hover:bg-white hover:text-[#4654CD] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#03DBD0]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {panelContent !== 'none' && (
          <aside
            data-testid="modal-stub"
            style={{
              ...stubStyle,
              background: 'linear-gradient(158deg, #151744 0%, #232a6d 50%, #4654CD 100%)',
              order: panelPosition === 'left' ? 0 : 1,
            }}
            // En mobile, 'coupon' se muestra compacto arriba (franja delgada,
            // como el diseño); 'image' se omite del todo y queda solo el
            // formulario — mostrar una foto angosta sin espacio no aporta.
            className={`relative flex-col justify-center overflow-hidden p-6 text-white md:flex md:p-8 ${
              panelContent === 'coupon' ? 'flex' : 'hidden'
            }`}
          >
            {/* Halo aqua difuso del diseño (`.stub::after`): un circulo de
                330px desbordando abajo a la derecha. Sin el, el panel queda
                como un degradado plano. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-[150px] -right-[140px] h-[330px] w-[330px] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(3,219,208,.4), transparent 68%)',
              }}
            />
            <div className="relative z-[2]">
              {panelContent === 'coupon' && (
                <>
                  <p className="mb-4 text-[11.5px] font-bold uppercase tracking-[0.17em] text-[#03DBD0]">
                    Beneficio exclusivo
                  </p>
                  {/* El monto sale de la CONFIG: el panel promete el
                      descuento antes de que la persona deje sus datos, y el
                      `amount` de la respuesta llega recien despues de enviar.
                      Sin esto el panel pintaba un guion justo cuando tiene
                      que convencer. */}
                  <p className="mb-3 font-['Baloo_2'] text-[76px] font-extrabold leading-[0.85] tracking-tight">
                    {cuponObtenido?.amount ?? config.amount ?? ''}
                  </p>
                  <p className="max-w-[20ch] text-base text-white/85">
                    {cuponObtenido?.caption ?? config.caption ?? ''}
                  </p>
                </>
              )}
              {panelContent === 'image' && config.image_url && (
                <img
                  src={config.image_url}
                  alt=""
                  data-testid="modal-panel-image"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </aside>
        )}

        {/* Troquelado: solo tiene sentido en el layout de dos columnas de
            desktop. En mobile el panel va apilado arriba (o no se muestra),
            así que se oculta — igual que el CSS original (`.perf,.notch{
            display:none}` bajo max-width:768px). */}
        {panelContent !== 'none' && (
          <>
            <div data-testid="modal-perf" style={perfStyle} className="absolute bottom-0 top-0 z-[4] hidden border-l-2 border-dashed border-[#E4E6F2] md:block" />
            <div data-testid="modal-notch" style={{ ...notchStyle, top: 0, transform: 'translate(-50%,-50%)' }} className="absolute z-[5] hidden h-[22px] w-[22px] rounded-full bg-white md:block" />
            <div data-testid="modal-notch" style={{ ...notchStyle, top: '100%', transform: 'translate(-50%,-50%)' }} className="absolute z-[5] hidden h-[22px] w-[22px] rounded-full bg-white md:block" />
          </>
        )}

        <div className="p-8" style={{ order: panelPosition === 'left' ? 1 : 0 }}>
          {!mostrandoExito ? (
            <form onSubmit={enviar} noValidate>
              <img src={LOGO_URL} alt="BaldeCash" className="mb-5 block h-[34px] w-auto" />

              <h2 id="lead-coupon-modal-headline" className="mb-2 font-['Baloo_2'] text-[28px] font-bold leading-tight tracking-tight">
                {config.title || '¡Suscríbete y accede a tu cupón!'}
              </h2>
              {/* Texto del diseño aprobado, con el descuento REAL del cupon:
                  "Dejanos tus datos y activamos tu 15%". El `benefit` lo arma
                  el backend por tipo — con un periferico dice "tu regalo", no
                  un porcentaje inventado. Si el admin escribe su propia
                  descripcion, manda la suya. */}
              {(config.description || config.benefit) && (
                <p className="mb-5 text-[15px] leading-relaxed text-[#6B7099]">
                  {config.description
                    || `Déjanos tus datos y activamos ${config.benefit}. Se aplica solo al elegir tu equipo.`}
                </p>
              )}

              {config.countdown_enabled && config.countdown_ends_at && (
                <Countdown endsAt={config.countdown_ends_at} />
              )}

              <div className="mb-3.5">
                {/* En movil cada campo en su fila: lado a lado, el select de tipo y
                    el numero de documento quedaban demasiado angostos para
                    leerse y escribirse comodo. */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1.15fr]">
                  <div>
                    <label htmlFor="lead-modal-doc-type" className="mb-1.5 block text-[12.5px] font-semibold text-[#151744]">
                      Tipo de documento
                    </label>
                    <select
                      id="lead-modal-doc-type"
                      ref={docTypeRef}
                      value={documentType}
                      onChange={handleDocTypeChange}
                      className={`w-full rounded-[13px] border-[1.5px] bg-[#F4F5FB] px-[15px] py-[13px] text-[15px] ${errores.doc ? 'border-[#D64550]' : 'border-[#E4E6F2]'}`}
                    >
                      <option value="" disabled>Elige</option>
                      <option value="DNI">DNI</option>
                      <option value="PAS">Pasaporte</option>
                      <option value="CE">Carné de extranjería</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="lead-modal-doc-number" className="mb-1.5 block text-[12.5px] font-semibold text-[#151744]">
                      Número de documento
                    </label>
                    <input
                      id="lead-modal-doc-number"
                      ref={docNumRef}
                      type="text"
                      inputMode={documentType && REGLAS[documentType].numerico ? 'numeric' : 'text'}
                      value={documentNumber}
                      onChange={handleDocNumberChange}
                      placeholder={documentType ? REGLAS[documentType].placeholder : '12345678'}
                      autoComplete="off"
                      className={`w-full rounded-[13px] border-[1.5px] bg-[#F4F5FB] px-[15px] py-[13px] text-[15px] ${errores.doc ? 'border-[#D64550]' : 'border-[#E4E6F2]'}`}
                    />
                  </div>
                </div>
                {errores.doc && <p className="mt-1.5 text-[12.5px] font-medium text-[#D64550]">{errores.doc}</p>}
              </div>

              <div className="mb-3.5">
                <label htmlFor="lead-modal-name" className="mb-1.5 block text-[12.5px] font-semibold text-[#151744]">
                  Nombre
                </label>
                <input
                  id="lead-modal-name"
                  ref={nameRef}
                  type="text"
                  aria-label="Nombre"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setErrores((prev) => ({ ...prev, name: undefined })); }}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  className={`w-full rounded-[13px] border-[1.5px] bg-[#F4F5FB] px-[15px] py-[13px] text-[15px] ${errores.name ? 'border-[#D64550]' : 'border-[#E4E6F2]'}`}
                />
                {errores.name && <p className="mt-1.5 text-[12.5px] font-medium text-[#D64550]">{errores.name}</p>}
              </div>

              <div className="mb-3.5">
                <label htmlFor="lead-modal-phone" className="mb-1.5 block text-[12.5px] font-semibold text-[#151744]">
                  Celular
                </label>
                <input
                  id="lead-modal-phone"
                  ref={phoneRef}
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="987654321"
                  autoComplete="tel"
                  className={`w-full rounded-[13px] border-[1.5px] bg-[#F4F5FB] px-[15px] py-[13px] text-[15px] ${errores.phone ? 'border-[#D64550]' : 'border-[#E4E6F2]'}`}
                />
                {errores.phone && <p className="mt-1.5 text-[12.5px] font-medium text-[#D64550]">{errores.phone}</p>}
              </div>

              <label className="mb-4 mt-4 flex cursor-pointer items-start gap-2.5">
                <input
                  ref={termsRef}
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => { setTermsAccepted(e.target.checked); setErrores((prev) => ({ ...prev, terms: undefined })); }}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-md border-[1.5px] transition ${
                    termsAccepted ? 'border-[#03DBD0] bg-[#03DBD0]' : errores.terms ? 'border-[#D64550] bg-[#FFF6F6]' : 'border-[#E4E6F2] bg-white'
                  }`}
                >
                  {termsAccepted && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B1230" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="text-[13px] leading-relaxed text-[#6B7099]">
                  {/* Las paginas legales son POR LANDING: `routes.legal` es
                      la misma helper que usa el formulario de solicitud
                      (solicitarClient) y el pie de pagina. El diseño traia
                      `href="#"` y la politica de privacidad ni era un link:
                      es consentimiento legal, tiene que poder leerse. */}
                  Acepto los{' '}
                  <a
                    href={routes.legal(landingSlug, 'terminos-y-condiciones')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#4654CD] underline underline-offset-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a
                    href={routes.legal(landingSlug, 'politica-de-privacidad')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#4654CD] underline underline-offset-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    política de privacidad
                  </a>.
                </span>
              </label>
              {errores.terms && <p className="-mt-3 mb-3.5 text-[12.5px] font-medium text-[#D64550]">{errores.terms}</p>}

              {errores.general && <p className="mb-3 text-xs font-medium text-[#D64550]">{errores.general}</p>}

              <button
                type="submit"
                disabled={enviando}
                style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
                className="w-full cursor-pointer rounded-[14px] px-4 py-[15px] font-['Baloo_2'] text-lg font-bold text-white transition duration-200 hover:brightness-110 hover:shadow-lg active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
              >
                {enviando ? 'Enviando...' : config.button_text || 'Obtener descuento'}
              </button>
              <button
                type="button"
                onClick={descartar}
                className="mx-auto mt-4 block cursor-pointer border-0 bg-none text-[13px] text-[#6B7099] underline underline-offset-2 transition-colors hover:text-[#151744]"
              >
                No deseo canjear cupón
              </button>
            </form>
          ) : (
            <div className="py-4 text-center">
              <div
                style={{ background: 'linear-gradient(140deg, #03DBD0, #3FE2D4)' }}
                className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0B1230" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              {/* `benefit` y no `amount`: con un periferico, `amount` es
                  "GRATIS" y el titulo diria "¡Tu GRATIS ya esta activo!".
                  `benefit` trae "tu regalo" / "tu 15%" ya redactado. */}
              <h3 className="mb-2 font-['Baloo_2'] text-[26px] font-bold">
                {cuponObtenido?.benefit
                  ? `¡${cuponObtenido.benefit.charAt(0).toUpperCase()}${cuponObtenido.benefit.slice(1)} ya está activo!`
                  : 'Listo, ¡ya te registramos!'}
              </h3>
              <p className="mx-auto mb-6 max-w-[38ch] text-[15px] leading-relaxed text-[#6B7099]">
                {/* "El descuento se aplica" es falso con un periferico: ahi
                    no hay descuento, hay un regalo. */}
                {cuponObtenido
                  ? cuponObtenido.gift_name
                    ? 'Tu regalo se suma solo cuando elijas tu equipo. No tienes que hacer nada más.'
                    : 'El descuento se aplica solo cuando elijas tu equipo. No tienes que hacer nada más.'
                  : 'Ya tenemos tus datos. Explora los equipos disponibles.'}
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
                className="mx-auto block w-full max-w-[260px] cursor-pointer rounded-[14px] px-4 py-[15px] font-['Baloo_2'] text-lg font-bold text-white transition duration-200 hover:brightness-110 hover:shadow-lg active:scale-[.99]"
              >
                Ver equipos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
