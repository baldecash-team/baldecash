'use client';

/**
 * La espera del contrato del paso KYC.
 *
 * Antes era una tarjeta gris con dos líneas de texto: no se distinguía de un
 * error silencioso ni de un bloque que ya terminó de cargar, y la única señal
 * de que algo estaba pasando era la frase. Acá la espera se ve: un spinner que
 * dice que hay trabajo en curso y el esqueleto de una hoja —encabezado,
 * párrafos, cronograma, línea de firma— que dice QUÉ se está preparando. Quien
 * mira la pantalla entiende que viene un documento, no un cartel.
 *
 * El esqueleto es decorativo (`aria-hidden`): lo que se anuncia es el texto,
 * dentro de un `role="status"` para que un lector de pantalla lo lea cuando
 * aparece sin robarle el foco a nadie. Y con `prefers-reduced-motion` no se
 * mueve nada: el mismo bloque, quieto.
 */

/** Los anchos del esqueleto, en el orden en que se pintan. Van por `style` y
 *  no por clase: Tailwind compila las clases que encuentra escritas en el
 *  código, y una armada con un template literal no existe en la hoja final. */
const LINEAS_PARRAFO = ['100%', '92%', '97%', '78%'];

function Linea({ ancho, delay }: { ancho: string; delay: number }) {
  return (
    <div
      className="h-2.5 rounded-full bg-[#EEF0FB] animate-pulse motion-reduce:animate-none"
      style={{ width: ancho, animationDelay: `${delay}ms` }}
    />
  );
}

export interface ContratoEsperandoProps {
  /** `outdated` = el contrato se reemplazó y viene una versión nueva. */
  outdated?: boolean;
}

export function ContratoEsperando({ outdated = false }: ContratoEsperandoProps) {
  return (
    <div
      data-testid="contrato-esperando"
      role="status"
      aria-live="polite"
      className="w-full overflow-hidden rounded-xl border border-[#DDDFF7] bg-white"
    >
      {/* Qué está pasando. Va arriba y con el spinner al lado del título: es lo
          primero que se lee, y el movimiento a su izquierda es lo que lo
          separa de un aviso estático. */}
      <div className="flex items-start gap-3 border-b border-[#EEF0FB] bg-[#F7F8FE] px-4 py-4 sm:px-5">
        <span
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 border-[#DDDFF7] border-t-[#4654CD] animate-spin motion-reduce:animate-none"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1f2937]">
            {outdated ? 'Tu contrato se actualizó' : 'Tu contrato se está generando'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
            {outdated
              ? 'Preparamos una versión nueva. Revísala y acéptala de nuevo.'
              : 'Tarda unos segundos. Te lo mostramos apenas esté listo para que lo revises y lo firmes.'}
          </p>
        </div>
      </div>

      {/* El esqueleto de la hoja. No es relleno: tiene la forma del contrato
          que va a ocupar ese mismo lugar —encabezado, texto, cronograma,
          firma—, así que cuando llega el documento la pantalla no salta. */}
      <div aria-hidden="true" className="px-4 py-5 sm:px-5">
        <div className="mx-auto w-full max-w-[420px] space-y-4 rounded-lg border border-[#EEF0FB] bg-white p-4 shadow-sm">
          {/* Encabezado: el bloque de la marca y el título del documento. */}
          <div className="space-y-2">
            <div className="h-3 w-24 rounded-full bg-[#DDDFF7] animate-pulse motion-reduce:animate-none" />
            <div className="h-3.5 w-3/5 rounded-full bg-[#EEF0FB] animate-pulse motion-reduce:animate-none" style={{ animationDelay: '80ms' }} />
          </div>

          {/* Cuerpo. */}
          <div className="space-y-2">
            {LINEAS_PARRAFO.map((ancho, i) => (
              <Linea key={ancho} ancho={ancho} delay={160 + i * 80} />
            ))}
          </div>

          {/* Cronograma: dos columnas, que es como se lee en el contrato. */}
          <div className="space-y-2 rounded-md bg-[#FAFBFF] p-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div
                  className="h-2.5 w-2/5 rounded-full bg-[#EEF0FB] animate-pulse motion-reduce:animate-none"
                  style={{ animationDelay: `${480 + i * 80}ms` }}
                />
                <div
                  className="h-2.5 w-1/5 rounded-full bg-[#EEF0FB] animate-pulse motion-reduce:animate-none"
                  style={{ animationDelay: `${520 + i * 80}ms` }}
                />
              </div>
            ))}
          </div>

          {/* La línea de firma, al pie. */}
          <div className="flex items-end justify-end pt-1">
            <div className="h-6 w-28 rounded-md bg-[#EEF0FB] animate-pulse motion-reduce:animate-none" style={{ animationDelay: '760ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
