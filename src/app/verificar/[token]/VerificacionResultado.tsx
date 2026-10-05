/**
 * Lo que ve quien escanea el QR de una constancia de aceptación electrónica.
 *
 * Tres respuestas y nada más, porque son las tres preguntas que ese papel puede
 * hacer: la aceptación existe y sigue vigente, existe pero quedó superada por un
 * contrato posterior, o no la encontramos.
 *
 * Muestra lo mínimo (§9 de la propuesta): el nombre ya viene enmascarado del
 * backend, y el DNI, la IP y el dispositivo no viajan hasta acá. La huella se
 * muestra entera porque es lo único que la persona puede recalcular sobre su
 * archivo para comprobar que es el mismo documento.
 */
import type { Verificacion } from './page';

const AZUL = '#4246D2';

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F7F7FB] px-4 py-10 flex justify-center">
      <div className="w-full max-w-xl">{children}</div>
    </main>
  );
}

function Tarjeta({
  tono,
  titulo,
  bajada,
  children,
}: {
  tono: 'ok' | 'aviso';
  titulo: string;
  bajada: string;
  children?: React.ReactNode;
}) {
  const borde = tono === 'ok' ? AZUL : '#C2410C';

  return (
    <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-5 border-t-4" style={{ borderTopColor: borde }}>
        <h1 className="text-xl font-bold text-[#1F2937]">{titulo}</h1>
        <p className="mt-1 text-sm text-[#6B7280]">{bajada}</p>
      </div>
      {children}
    </div>
  );
}

function Fila({ etiqueta, valor, monoLargo }: {
  etiqueta: string;
  valor: string;
  monoLargo?: boolean;
}) {
  return (
    <div className="px-6 py-3 border-t border-[#EEEEF3] sm:flex sm:gap-4">
      <div className="text-sm font-semibold text-[#374151] sm:w-44 sm:shrink-0">{etiqueta}</div>
      <div
        className={
          'text-sm text-[#4B5563] ' +
          (monoLargo ? 'break-all leading-relaxed' : '')
        }
      >
        {valor}
      </div>
    </div>
  );
}

/** `2026-09-07T15:04:09-05:00` -> `07/09/2026 15:04:09 (hora de Perú)` */
function fecha(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const f = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: 'America/Lima',
  }).format(d);

  // `es-PE` mete una coma entre fecha y hora; la constancia impresa no la
  // tiene, y las dos se leen una al lado de la otra.
  return `${f.replace(',', '')} (hora de Perú)`;
}

export function VerificacionResultado({
  datos,
  noExiste,
  documentoUrl,
}: {
  datos: Verificacion | null;
  noExiste: boolean;
  /** El contrato aceptado, servido por ws2 con este mismo token. */
  documentoUrl?: string;
}) {
  if (noExiste || !datos) {
    return (
      <Marco>
        <Tarjeta
          tono="aviso"
          titulo="No encontramos esta constancia"
          bajada="Revisa que el enlace esté completo. Si lo escaneaste de un documento impreso, vuelve a intentarlo o escríbenos."
        />
      </Marco>
    );
  }

  if (!datos.valido) {
    const reemplazado = datos.motivo === 'reemplazado';

    return (
      <Marco>
        <Tarjeta
          tono="aviso"
          titulo={reemplazado ? 'Esta constancia quedó superada' : 'Esta constancia todavía no está aceptada'}
          bajada={
            reemplazado
              ? 'El contrato al que corresponde fue reemplazado por uno posterior. El documento vigente es el más reciente que aceptaste.'
              : 'La operación existe, pero no registramos una aceptación para este documento.'
          }
        />
      </Marco>
    );
  }

  return (
    <Marco>
      <Tarjeta
        tono="ok"
        titulo="Aceptación verificada"
        bajada="Esta aceptación electrónica existe en nuestros registros y sigue vigente."
      >
        <Fila etiqueta="Aceptado por" valor={datos.nombre || '—'} />
        <Fila etiqueta="Operación" valor={datos.operacion || '—'} />
        <Fila etiqueta="Fecha y hora" valor={fecha(datos.aceptado_at)} />
        {datos.declaracion && (
          <Fila
            etiqueta={
              datos.declaracion_version
                ? `Texto aceptado (v${datos.declaracion_version})`
                : 'Texto aceptado'
            }
            valor={datos.declaracion}
          />
        )}
        <Fila
          etiqueta={`Huella ${datos.algoritmo || 'SHA-256'}`}
          valor={datos.hash || '—'}
          monoLargo
        />
      </Tarjeta>

      {/* El documento, no solo sus datos. Quien llega acá —por el QR del papel
          o por el enlace del correo— viene a ver el contrato aceptado, y la
          huella de arriba no sirve de nada sin el archivo al que corresponde.
          Lo sirve ws2 con este mismo token y firma el S3 en cada visita. */}
      {documentoUrl && (
        <a
          href={documentoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#4654CD] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ver el contrato aceptado
        </a>
      )}

      <p className="mt-4 px-2 text-xs leading-relaxed text-[#6B7280]">
        La huella identifica al documento exacto que se aceptó. Para comprobar que el archivo que
        tienes no fue alterado, calcula su huella {datos.algoritmo || 'SHA-256'} y compárala con la
        de arriba: si coinciden, es el mismo documento.
      </p>
      <p className="mt-2 px-2 text-xs leading-relaxed text-[#9CA3AF]">
        Por privacidad mostramos solo estos datos. El resto de la evidencia queda reservado al
        titular y a las autoridades competentes.
      </p>
    </Marco>
  );
}
