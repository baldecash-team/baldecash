'use client';

/**
 * EncuestaClient — ruta `/encuesta/[token]` (encuesta de experiencia post-entrega).
 *
 * Es la URL del botón de la plantilla de WhatsApp que ws2 manda el día
 * siguiente a la entrega. El token es la única prueba de titularidad: nunca
 * viaja un `application_code` (secuencial, adivinable).
 *
 * Canjea el token contra `getEncuesta` y ramifica:
 * - válido y no respondida → formulario (NPS, motivo, CES, satisfacción por
 *   interacción). El bloque "Ser evaluado por tu analista" sólo existe si
 *   vino `analyst_name` (aprobación automática = sin analista) y en ese caso
 *   `sat_analyst` NO viaja en el POST.
 * - `answered:true` → pantalla de gracias directa (sin formulario).
 * - 404/invalid → "Este enlace no es válido" (mismo copy para cualquier
 *   reason no reconocido: no revela si la solicitud existe).
 * - `network` → pantalla de reintento.
 *
 * Segmento ESTÁTICO hermano de `[landing]`: no hereda su chrome ni sus
 * providers, y no los necesita.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { BALDECASH_LOGO_SVG_URL } from '@/app/prototipos/0.6/admision/_components/BaldeCashLogo';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import {
  getEncuesta,
  responderEncuesta,
  isEncuestaApiError,
  type EncuestaInfo,
  type EncuestaRespuesta,
} from '@/app/prototipos/0.6/services/encuestaApi';
import { formatearFechaSolicitud } from './fecha';
import { useEncuestaFx } from './useEncuestaFx';
import styles from './encuesta.module.css';

type Grupo = 'nps' | 'ces' | 'm_solicitud' | 'm_evaluacion' | 'm_envio';

type ViewState =
  | { status: 'loading' }
  | { status: 'form'; info: EncuestaInfo }
  | { status: 'thanks' }
  | { status: 'invalid' }
  | { status: 'network' };

export interface EncuestaClientProps {
  token: string;
}

/** Grupos obligatorios: la evaluación de la analista sólo cuando hubo una. */
function gruposRequeridos(conAnalista: boolean): Grupo[] {
  return conAnalista
    ? ['nps', 'ces', 'm_solicitud', 'm_evaluacion', 'm_envio']
    : ['nps', 'ces', 'm_solicitud', 'm_envio'];
}

const NUMS_1_5 = [1, 2, 3, 4, 5];
const NUMS_0_10 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function EncuestaClient({ token }: EncuestaClientProps) {
  const [view, setView] = useState<ViewState>({ status: 'loading' });
  const [answers, setAnswers] = useState<Partial<Record<Grupo, number>>>({});
  const [npsReason, setNpsReason] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const bgRef = useRef<HTMLCanvasElement | null>(null);
  const topRef = useRef<HTMLCanvasElement | null>(null);
  const fx = useEncuestaFx(bgRef, topRef);
  const wasComplete = useRef(false);

  // Sin ref-guard síncrono delante del fetch (StrictMode monta→desmonta→monta
  // en dev): el único guard es `cancelled` en el cleanup. `getEncuesta` es
  // una lectura, un segundo canje idéntico no tiene efecto adverso.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getEncuesta(token);
      if (cancelled) return;
      if (isEncuestaApiError(result)) {
        setView(result.reason === 'network' ? { status: 'network' } : { status: 'invalid' });
        return;
      }
      if (result.answered) {
        setView({ status: 'thanks' });
        return;
      }
      setView({ status: 'form', info: result });
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const conAnalista = view.status === 'form' && !!view.info.analyst_name;
  const requeridos = gruposRequeridos(conAnalista);
  const respondidos = requeridos.filter((g) => answers[g] !== undefined).length;
  const pct = Math.round((respondidos / requeridos.length) * 100);
  const completo = respondidos >= requeridos.length;

  // Festejo al completar los obligatorios (una sola vez por "completado").
  useEffect(() => {
    if (completo && !wasComplete.current) {
      wasComplete.current = true;
      fx.spawnComplete();
    }
    if (!completo) wasComplete.current = false;
  }, [completo, fx]);

  const elegir = useCallback(
    (grupo: Grupo, valor: number, el: HTMLButtonElement) => {
      setAnswers((prev) => ({ ...prev, [grupo]: valor }));
      const r = el.getBoundingClientRect();
      fx.pop(r.left + r.width / 2, r.top + r.height / 2);
    },
    [fx],
  );

  const enviar = useCallback(async () => {
    if (view.status !== 'form' || !completo || sending) return;
    setSending(true);
    setSendError(null);
    const body: EncuestaRespuesta = {
      nps: answers.nps as number,
      ces: answers.ces as number,
      sat_web: answers.m_solicitud as number,
      sat_delivery: answers.m_envio as number,
    };
    if (conAnalista) body.sat_analyst = answers.m_evaluacion as number;
    if (npsReason.trim()) body.nps_reason = npsReason.trim();
    if (comment.trim()) body.comment = comment.trim();

    const result = await responderEncuesta(token, body);
    setSending(false);
    if (isEncuestaApiError(result) && result.reason !== 'answered') {
      setSendError(result.error);
      return;
    }
    setView({ status: 'thanks' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fx.celebrate();
    setTimeout(() => fx.celebrate(), 550);
  }, [view.status, completo, sending, answers, conAnalista, npsReason, comment, token, fx]);

  if (view.status === 'invalid') {
    return (
      <NotFoundContent
        homeUrl={routes.home()}
        homeLabel="Ir al inicio"
        title="Este enlace no es válido"
        description="Revisa el mensaje que te enviamos por WhatsApp o escríbenos si necesitas ayuda."
      />
    );
  }

  if (view.status === 'network') {
    return (
      <NotFoundContent
        homeUrl={routes.home()}
        homeLabel="Ir al inicio"
        title="No pudimos conectar"
        description="Hubo un problema de conexión al abrir tu encuesta. Toca «Recargar página» para intentarlo de nuevo."
      />
    );
  }

  const fecha = view.status === 'form' ? formatearFechaSolicitud(view.info.application_date) : null;

  return (
    <div className={styles.root}>
      <canvas ref={bgRef} className={styles.bgfx} aria-hidden="true" />
      <canvas ref={topRef} className={styles.fxtop} aria-hidden="true" />
      <div className={styles.shell}>
        {view.status === 'loading' && (
          <div className={styles.loading} role="status">
            Cargando tu encuesta…
          </div>
        )}

        {view.status === 'thanks' && (
          <div className={styles.thanks} data-testid="thanks">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BALDECASH_LOGO_SVG_URL} alt="BaldeCash" className={styles.thanksLogo} />
            <div className={styles.thanksMark}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="4 12 10 18 20 6" />
              </svg>
            </div>
            <h2>¡Gracias por tu tiempo!</h2>
            <p>
              Recibimos tu respuesta. Tu opinión nos ayuda a seguir mejorando para toda la
              comunidad estudiantil.
            </p>
          </div>
        )}

        {view.status === 'form' && (
          <>
            <div className={styles.progressWrap}>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${pct}%` }} />
              </div>
              <div className={styles.progressLabel}>
                <b data-testid="pct">{pct}%</b> · te toma menos de 2 minutos
              </div>
            </div>

            <header className={styles.header}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BALDECASH_LOGO_SVG_URL} alt="BaldeCash" className={styles.logo} />
              <h1 className={styles.title}>¡Gracias por confiar en BaldeCash!</h1>
              <p className={styles.sub}>
                {fecha && (
                  <>
                    Financiaste un equipo con nosotros el <span className={styles.var}>{fecha}</span>.{' '}
                  </>
                )}
                Por favor cuéntanos cómo fue tu experiencia para poder seguir mejorando.
              </p>
            </header>

            <main className={styles.main}>
              {/* 1. NPS */}
              <div className={styles.q}>
                <div className={styles.qHead}>
                  <div className={styles.qNum}>1</div>
                  <div className={styles.qText}>
                    En una escala del <strong>0 al 10</strong>, ¿qué tan probable es que{' '}
                    <strong>recomiendes BaldeCash</strong> a un amigo para que{' '}
                    <strong>financie un equipo</strong>?
                  </div>
                </div>
                <Escala
                  grupo="nps"
                  valores={NUMS_0_10}
                  className={styles.nps}
                  label="Del 0 al 10"
                  seleccion={answers.nps}
                  onElegir={elegir}
                />
                <Anclas negativo="Nada probable" positivo="Muy probable" />
              </div>

              {/* 2. Motivo (opcional) */}
              <div className={styles.q}>
                <div className={styles.qHead}>
                  <div className={styles.qNum}>2</div>
                  <div className={styles.qText}>
                    Cuéntanos el <strong>motivo de tu calificación</strong>
                    <span className={styles.qOpt}>Opcional</span>
                  </div>
                </div>
                <textarea
                  className={styles.textarea}
                  placeholder="¿Qué influyó en tu puntaje? Nos ayuda mucho saberlo…"
                  value={npsReason}
                  onChange={(e) => setNpsReason(e.target.value)}
                  aria-label="Motivo de tu calificación"
                />
              </div>

              {/* 3. CES */}
              <div className={styles.q}>
                <div className={styles.qHead}>
                  <div className={styles.qNum}>3</div>
                  <div className={styles.qText}>
                    ¿Qué tan <strong>fácil</strong> fue{' '}
                    <strong>solicitar y obtener tu financiamiento</strong>?
                  </div>
                </div>
                <Escala
                  grupo="ces"
                  valores={NUMS_1_5}
                  className={styles.scale}
                  label="Del 1 al 5"
                  seleccion={answers.ces}
                  onElegir={elegir}
                />
                <Anclas negativo="Muy difícil" positivo="Muy fácil" />
              </div>

              {/* 4. Satisfacción por interacción */}
              <div className={styles.q}>
                <div className={styles.qHead}>
                  <div className={styles.qNum}>4</div>
                  <div className={styles.qText}>
                    En una escala del <strong>1 al 5</strong>, ¿qué tan <strong>satisfecho</strong>{' '}
                    estás con cada una de estas <strong>interacciones</strong>?
                  </div>
                </div>

                <div className={styles.subBlock}>
                  <div className={styles.subLabel}>Solicitar tu equipo en nuestra web</div>
                  <Escala
                    grupo="m_solicitud"
                    valores={NUMS_1_5}
                    className={styles.scale}
                    label="Solicitar tu equipo en nuestra web"
                    seleccion={answers.m_solicitud}
                    onElegir={elegir}
                  />
                  <Anclas negativo="Muy insatisfecho" positivo="Muy satisfecho" />
                </div>

                {conAnalista && (
                  <div className={styles.subBlock} data-testid="bloque-analista">
                    <div className={styles.subLabel}>
                      Ser evaluado por tu analista{' '}
                      <span className={styles.var}>{view.info.analyst_name}</span>
                    </div>
                    <Escala
                      grupo="m_evaluacion"
                      valores={NUMS_1_5}
                      className={styles.scale}
                      label="Ser evaluado por tu analista"
                      seleccion={answers.m_evaluacion}
                      onElegir={elegir}
                    />
                    <Anclas negativo="Muy insatisfecho" positivo="Muy satisfecho" />
                  </div>
                )}

                <div className={styles.subBlock}>
                  <div className={styles.subLabel}>Programar envío de mi equipo</div>
                  <Escala
                    grupo="m_envio"
                    valores={NUMS_1_5}
                    className={styles.scale}
                    label="Programar envío de mi equipo"
                    seleccion={answers.m_envio}
                    onElegir={elegir}
                  />
                  <Anclas negativo="Muy insatisfecho" positivo="Muy satisfecho" />
                </div>

                <div className={styles.fieldLabel}>
                  ¿Quieres contarnos algo más sobre estas interacciones?<span>Opcional</span>
                </div>
                <textarea
                  className={styles.textarea}
                  placeholder="Escríbenos aquí…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  aria-label="Algo más sobre estas interacciones"
                />
              </div>
            </main>

            <div className={styles.footer}>
              <div className={styles.footerInner}>
                {sendError && (
                  <p className={styles.error} role="alert">
                    {sendError}
                  </p>
                )}
                <button
                  type="button"
                  className={styles.submit}
                  disabled={!completo || sending}
                  onClick={() => void enviar()}
                >
                  {sending ? 'Enviando…' : 'Enviar respuesta'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface EscalaProps {
  grupo: Grupo;
  valores: number[];
  className: string;
  label: string;
  seleccion: number | undefined;
  onElegir: (grupo: Grupo, valor: number, el: HTMLButtonElement) => void;
}

function Escala({ grupo, valores, className, label, seleccion, onElegir }: EscalaProps) {
  const max = valores[valores.length - 1];
  return (
    <div className={className} role="radiogroup" aria-label={label} data-group={grupo}>
      {valores.map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={seleccion === v}
          aria-label={`${v} de ${max}`}
          className={seleccion === v ? styles.on : undefined}
          onClick={(e) => onElegir(grupo, v, e.currentTarget)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function Anclas({ negativo, positivo }: { negativo: string; positivo: string }) {
  return (
    <div className={styles.anchors}>
      <span>
        <ThumbsDown className={styles.thumb} aria-hidden="true" /> {negativo}
      </span>
      <span>
        {positivo} <ThumbsUp className={styles.thumb} aria-hidden="true" />
      </span>
    </div>
  );
}

export default EncuestaClient;
