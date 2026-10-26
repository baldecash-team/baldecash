'use client';

/**
 * ContinuarClient — rutas `/continuar/si/[token]` y `/continuar/no/[token]`.
 *
 * El botón «Sí» del WhatsApp manda el POST apenas carga la página (`acepta`
 * prop en `true`): un «Sí» nunca cierra nada, así que repetirlo —recarga,
 * doble montaje de StrictMode— es inocuo y el backend es idempotente.
 *
 * El botón «No» (`acepta` prop en `false`) NO manda nada solo con cargar:
 * primero pregunta "¿Seguro que...?" con dos botones (`vista === 'confirm'`).
 * Esto evita que una pestaña vieja que un navegador de celular recarga sola
 * pise un «Sí» posterior con un «No» que el cliente ya no quiere mandar —
 * recargar vuelve a mostrar la pregunta, nunca reenvía solo. Desde ahí el
 * cliente puede terminar mandando `acepta:false` o, si se equivocó,
 * `acepta:true` — el mismo POST que usa la página "Sí".
 *
 * El guard `useRef` (`enviado`) sólo evita el doble POST del doble montaje de
 * StrictMode en dev, y sólo aplica al auto-envío del flujo "Sí". Una recarga
 * de página SÍ manda un POST nuevo —el guard no sobrevive a eso, vive en
 * memoria del componente—; lo que hace que recargar el flujo "Sí" sea seguro
 * es la idempotencia del backend, no el guard. El flujo "No" no depende de
 * ninguno de los dos: por diseño, nunca envía solo.
 *
 * Sin diseño propio: usa el estilo base de la encuesta (`encuesta.module.css`),
 * igual que `/retomar` (ver `RetomarClient`).
 */

import { useEffect, useRef, useState } from 'react';
import { BALDECASH_LOGO_SVG_URL } from '@/app/prototipos/0.6/admision/_components/BaldeCashLogo';
import {
  datosContinuar,
  decidirContinuar,
  isContinuarError,
  type ContinuarDatos,
} from '@/app/prototipos/0.6/services/continuarApi';
import { safeKeynuaFirmaUrl } from '@/app/prototipos/0.6/utils/safeExternalUrl';
import styles from '@/app/prototipos/0.6/encuesta/[token]/encuesta.module.css';

type Vista =
  | 'loading'
  | 'confirm'
  | 'si-evaluacion'
  | 'si-firma'
  | 'si-neutral'
  | 'no'
  | 'closed'
  | 'invalid'
  | 'error';

/**
 * Heurística sobre el `estado` que trae el GET: hasta que el contrato del
 * backend quede cerrado, se trata como "cerrada" cualquier variante de
 * rechazada/cancelada/cerrada, en español o inglés.
 *
 * Hace falta porque el POST ya NO es la única señal de cierre: ahora contesta
 * `status: "closed"` solo cuando la solicitud está de verdad rechazada o
 * cancelada, pero contesta `received` para cualquier otra fila -incluidas
 * las que nadie va a tocar-. Si el GET, aparte, trae un estado que es
 * claramente de cierre, no hay que seguir mostrando el texto de "si"/"no"
 * como si la solicitud siguiera viva.
 */
function esEstadoCerrado(estado?: string): boolean {
  if (!estado) return false;
  const e = estado.toLowerCase();
  return (
    e.includes('cerrad') ||
    e.includes('rechazad') ||
    e.includes('cancelad') ||
    e.includes('closed') ||
    e.includes('rejected') ||
    e.includes('cancelled') ||
    e.includes('canceled')
  );
}

export function ContinuarClient({ token, acepta }: { token: string; acepta: boolean }) {
  const [vista, setVista] = useState<Vista>(acepta ? 'loading' : 'confirm');
  const [datos, setDatos] = useState<ContinuarDatos>({});
  const enviado = useRef(false);

  async function enviarDecision(aceptaValue: boolean) {
    setVista('loading');
    const r = await decidirContinuar(token, aceptaValue);
    if (isContinuarError(r)) {
      setVista(r.reason === 'invalid' ? 'invalid' : 'error');
      return;
    }
    if (r.status === 'closed') {
      setVista('closed');
      return;
    }
    const respuesta = r.respuesta === 'no' ? 'no' : 'si';
    // El nombre, el equipo, la variante y si corresponde link de firma vienen
    // del GET. Si falla, no se adivina variante: se cae al texto neutro.
    const d = await datosContinuar(token);
    const datosOk = !isContinuarError(d);
    if (datosOk) setDatos(d);
    if (datosOk && esEstadoCerrado(d.estado)) {
      setVista('closed');
      return;
    }
    if (respuesta === 'no') {
      setVista('no');
      return;
    }
    if (!datosOk) {
      setVista('si-neutral');
      return;
    }
    setVista(d.variante === 'firma' ? 'si-firma' : 'si-evaluacion');
  }

  useEffect(() => {
    // Flujo "No": espera el click de un botón, nunca envía solo (ni al
    // montar ni al recargar).
    if (!acepta) return;
    // StrictMode monta dos veces en dev.
    if (enviado.current) return;
    enviado.current = true;
    void enviarDecision(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, acepta]);

  const sufijoNombre = datos.nombre ? `, ${datos.nombre}` : '';
  const equipo = datos.equipo || 'equipo';
  // Nunca se confía ciegamente en lo que manda el backend: sólo se pinta el
  // botón si el link es https y el host es keynua.com (o un subdominio).
  const linkFirma = safeKeynuaFirmaUrl(datos.link_firma);

  const conIcono: Vista[] = ['si-evaluacion', 'si-firma', 'si-neutral', 'no'];

  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        {vista === 'loading' ? (
          <div className={styles.loading} role="status">
            Registrando tu respuesta…
          </div>
        ) : (
          <div className={styles.thanks} data-testid={`continuar-${vista}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BALDECASH_LOGO_SVG_URL} alt="BaldeCash" className={styles.thanksLogo} />
            {conIcono.includes(vista) && (
              <div className={styles.thanksMark}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="4 12 10 18 20 6" />
                </svg>
              </div>
            )}
            {vista === 'confirm' && (
              <>
                <h2>¿Seguro que ya no quieres continuar con tu solicitud?</h2>
                <p>Liberaremos el equipo para otros clientes.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
                  <button type="button" className={styles.submit} onClick={() => void enviarDecision(false)}>
                    Sí, ya no quiero seguir
                  </button>
                  <button
                    type="button"
                    onClick={() => void enviarDecision(true)}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font)',
                      fontWeight: 700,
                      fontSize: 15,
                      color: 'var(--navy-2)',
                      background: '#fff',
                      border: '1.5px solid var(--line)',
                      borderRadius: 14,
                      padding: 15,
                      cursor: 'pointer',
                    }}
                  >
                    Me equivoqué, quiero seguir
                  </button>
                </div>
              </>
            )}
            {vista === 'si-evaluacion' && (
              <>
                <h2>¡Listo{sufijoNombre}!</h2>
                <p>Seguimos con tu solicitud. Un asesor te contactará para completar tu evaluación.</p>
              </>
            )}
            {vista === 'si-firma' && (
              <>
                <h2>¡Listo{sufijoNombre}!</h2>
                <p>Firma tu contrato para separar tu {equipo}.</p>
                {linkFirma ? (
                  <a
                    href={linkFirma}
                    // Otra pestaña, como en `eleccion-equipo/[token]/Confirmacion.tsx`:
                    // la firma de Keynua es un proceso largo (selfie, documento,
                    // validaciones) y navegar en la misma pestaña perdería esta
                    // pantalla de confirmación.
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.submit}
                    style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}
                  >
                    Firmar mi contrato
                  </a>
                ) : (
                  <p>Te enviaremos el link para firmar por este medio.</p>
                )}
              </>
            )}
            {vista === 'si-neutral' && (
              <>
                <h2>¡Listo!</h2>
                <p>Registramos tu respuesta.</p>
              </>
            )}
            {vista === 'no' && (
              <>
                {datos.nombre ? (
                  <>
                    <h2>Entendido{sufijoNombre}.</h2>
                    <p>Liberaremos el equipo para otros clientes. Gracias por tu interés en BaldeCash.</p>
                  </>
                ) : (
                  <>
                    <h2>Entendido.</h2>
                    <p>Registramos tu respuesta.</p>
                  </>
                )}
              </>
            )}
            {vista === 'closed' && (
              <>
                <h2>Esta solicitud ya fue cerrada</h2>
                <p>Si deseas, puedes hacer una nueva solicitud.</p>
              </>
            )}
            {vista === 'invalid' && (
              <>
                <h2>Este enlace ya no está disponible</h2>
                <p>
                  Puede que ya haya sido usado o que no sea válido. Si necesitas ayuda, escríbenos
                  por WhatsApp.
                </p>
              </>
            )}
            {vista === 'error' && (
              <>
                <h2>No pudimos registrar tu respuesta</h2>
                <p>Hubo un problema de conexión. Recarga la página para intentarlo de nuevo.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
