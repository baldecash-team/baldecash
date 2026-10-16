'use client';

/**
 * RetomarClient — rutas `/retomar/si/[token]` y `/retomar/no/[token]`.
 *
 * Son los dos botones del WhatsApp de la campaña decil 9. Al cargar se manda
 * la decisión (`acepta` true o false) y se muestra la confirmación. Sin diseño
 * propio: usa el estilo base de la encuesta (`encuesta.module.css`).
 *
 * El backend es idempotente: recargar o tocar el botón dos veces no revierte
 * dos veces y devuelve la misma respuesta.
 */

import { useEffect, useRef, useState } from 'react';
import { BALDECASH_LOGO_SVG_URL } from '@/app/prototipos/0.6/admision/_components/BaldeCashLogo';
import { decidirRetomar, isRetomarError } from '@/app/prototipos/0.6/services/retomarApi';
import styles from '@/app/prototipos/0.6/encuesta/[token]/encuesta.module.css';

type Vista = 'loading' | 'si' | 'no' | 'invalid' | 'error';

const TEXTOS: Record<Exclude<Vista, 'loading'>, { titulo: string; texto: string }> = {
  si: {
    titulo: '¡Listo! Una asesora de BaldeCash te escribirá pronto 💙',
    texto: 'Retomamos tu solicitud. Mantente atento a tu WhatsApp.',
  },
  no: {
    titulo: 'Gracias por avisarnos',
    texto: 'Registramos tu respuesta. Si cambias de opinión, aquí estaremos.',
  },
  invalid: {
    titulo: 'Este enlace ya no está disponible',
    texto: 'Puede que ya haya sido usado o que no sea válido. Si necesitas ayuda, escríbenos por WhatsApp.',
  },
  error: {
    titulo: 'No pudimos registrar tu respuesta',
    texto: 'Hubo un problema de conexión. Recarga la página para intentarlo de nuevo.',
  },
};

export function RetomarClient({ token, acepta }: { token: string; acepta: boolean }) {
  const [vista, setVista] = useState<Vista>('loading');
  // StrictMode monta dos veces en dev: el backend es idempotente, pero no hace
  // falta mandar dos POST.
  const enviado = useRef(false);

  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    void (async () => {
      const r = await decidirRetomar(token, acepta);
      if (isRetomarError(r)) {
        setVista(r.reason === 'invalid' ? 'invalid' : 'error');
        return;
      }
      // Manda lo que quedó registrado (un «Sí» ya aplicado no se deshace con un «No»).
      setVista(r.status === 'declined' ? 'no' : 'si');
    })();
  }, [token, acepta]);

  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        {vista === 'loading' ? (
          <div className={styles.loading} role="status">
            Registrando tu respuesta…
          </div>
        ) : (
          <div className={styles.thanks} data-testid={`retomar-${vista}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BALDECASH_LOGO_SVG_URL} alt="BaldeCash" className={styles.thanksLogo} />
            {(vista === 'si' || vista === 'no') && (
              <div className={styles.thanksMark}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="4 12 10 18 20 6" />
                </svg>
              </div>
            )}
            <h2>{TEXTOS[vista].titulo}</h2>
            <p>{TEXTOS[vista].texto}</p>
          </div>
        )}
      </div>
    </div>
  );
}
