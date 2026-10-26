'use client';

/**
 * ContinuarClient — rutas `/continuar/si/[token]` y `/continuar/no/[token]`.
 *
 * Son los dos botones del WhatsApp "¿seguimos con tu solicitud?". Al cargar se
 * manda la decisión (`acepta` true o false) una sola vez y, si quedó
 * registrada, se pide el detalle (nombre, equipo, variante, link de firma)
 * para personalizar el mensaje. Sin diseño propio: usa el estilo base de la
 * encuesta (`encuesta.module.css`), igual que `/retomar` (ver `RetomarClient`).
 *
 * El backend es idempotente: recargar o tocar el botón dos veces no manda dos
 * POST (el guard de abajo) ni revierte dos veces la decisión.
 */

import { useEffect, useRef, useState } from 'react';
import { BALDECASH_LOGO_SVG_URL } from '@/app/prototipos/0.6/admision/_components/BaldeCashLogo';
import {
  datosContinuar,
  decidirContinuar,
  isContinuarError,
  type ContinuarDatos,
} from '@/app/prototipos/0.6/services/continuarApi';
import styles from '@/app/prototipos/0.6/encuesta/[token]/encuesta.module.css';

type Vista = 'loading' | 'si-evaluacion' | 'si-firma' | 'no' | 'closed' | 'invalid' | 'error';

export function ContinuarClient({ token, acepta }: { token: string; acepta: boolean }) {
  const [vista, setVista] = useState<Vista>('loading');
  const [datos, setDatos] = useState<ContinuarDatos>({});
  // StrictMode monta dos veces en dev: el backend es idempotente, pero no hace
  // falta mandar dos POST.
  const enviado = useRef(false);

  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    void (async () => {
      const r = await decidirContinuar(token, acepta);
      if (isContinuarError(r)) {
        setVista(r.reason === 'invalid' ? 'invalid' : 'error');
        return;
      }
      if (r.status === 'closed') {
        setVista('closed');
        return;
      }
      const respuesta = r.respuesta === 'no' ? 'no' : 'si';
      // El nombre, el equipo y si corresponde botón de firma vienen del GET.
      // Si falla, cae al texto genérico sin nombre y variante "evaluación" por
      // defecto: no prometemos un botón de firma cuyo link no sabemos si existe.
      const d = await datosContinuar(token);
      const datosOk = !isContinuarError(d);
      if (datosOk) setDatos(d);
      if (respuesta === 'no') {
        setVista('no');
        return;
      }
      setVista(datosOk && d.variante === 'firma' ? 'si-firma' : 'si-evaluacion');
    })();
  }, [token, acepta]);

  const sufijoNombre = datos.nombre ? `, ${datos.nombre}` : '';
  const equipo = datos.equipo || 'equipo';

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
            {(vista === 'si-evaluacion' || vista === 'si-firma' || vista === 'no') && (
              <div className={styles.thanksMark}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="4 12 10 18 20 6" />
                </svg>
              </div>
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
                {datos.link_firma && (
                  <a
                    href={datos.link_firma}
                    className={styles.submit}
                    style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}
                  >
                    Firmar mi contrato
                  </a>
                )}
              </>
            )}
            {vista === 'no' && (
              <>
                <h2>Entendido{sufijoNombre}.</h2>
                <p>Liberaremos el equipo para otros clientes. Gracias por tu interés en BaldeCash.</p>
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
