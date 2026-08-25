'use client';

/**
 * EleccionEquipoClient — ruta `/eleccion-equipo/[token]`.
 *
 * El cliente ya tiene su crédito aprobado. Acá ve las unidades FÍSICAS
 * disponibles de su modelo —cada una con las fotos y el video que le grabó la
 * estación de inspección— y elige la que se va a llevar. El valor no es elegir
 * un número: es ver el equipo concreto antes de aceptarlo.
 *
 * Tres pantallas: lista de unidades → galería de una unidad → confirmación.
 *
 * Caminos que no son la lista:
 * - `units: []` → "Estamos preparando tu equipo". NO es un error: el link sigue
 *   vivo y sirve cuando entren unidades.
 * - `selected_unit_id` ya seteado → confirmación directa (reabrir el link
 *   tiene que mostrar SU unidad, no un enlace inválido).
 * - enlace vencido/revocado/consumido → "Este enlace venció".
 * - `invalid_status` → la solicitud dejó de estar aprobada.
 * - enlace inválido / de otro flujo / `not_found` → el MISMO copy para todos:
 *   distinguirlos delataría si la solicitud existe.
 * - red → pantalla de reintento.
 *
 * El 409 `unit_unavailable` NO es ninguna de esas: alguien se llevó la unidad
 * primero. Se refresca la lista y se dice sin dramatizar.
 *
 * REGLA: el cliente nunca ve el serial. Ve "Unidad 01" (`display_number`). El
 * backend ni siquiera lo manda.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  elegirUnidad,
  getEleccion,
  isEleccionApiError,
  type EleccionDatos,
  type EleccionUnidad,
} from '../../services/eleccionEquipoApi';
import { Chrome, Mensaje } from './Chrome';
import { Confirmacion } from './Confirmacion';
import { GaleriaUnidad } from './GaleriaUnidad';
import { UnidadCard } from './UnidadCard';
import { eleccionEvents } from './eleccionEvents';
import { etiquetaGrado, formatearCuota } from './formato';

/** Enlace muerto pero conocido: existió, ya no sirve. */
const EXPIRED_REASONS = new Set(['expired', 'revoked', 'consumed', 'inactive']);
/** Rechazos que matan la pantalla entera, no solo el intento de reservar. */
const INVALID_REASONS = new Set(['invalid', 'purpose_mismatch', 'not_found']);

type ViewState =
  | { status: 'loading' }
  | { status: 'lista'; datos: EleccionDatos }
  | { status: 'elegida'; datos: EleccionDatos; unidad: EleccionUnidad }
  | { status: 'vacio'; datos: EleccionDatos }
  | { status: 'expired' }
  | { status: 'invalid' }
  | { status: 'invalid_status' }
  | { status: 'network' };

export interface EleccionEquipoClientProps {
  token: string;
}

export function EleccionEquipoClient({ token }: EleccionEquipoClientProps) {
  const [view, setView] = useState<ViewState>({ status: 'loading' });
  /** Unidad abierta en la galería (`null` = galería cerrada). */
  const [abierta, setAbierta] = useState<EleccionUnidad | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorGaleria, setErrorGaleria] = useState<string | null>(null);
  /** Aviso arriba de la lista, p. ej. cuando otro se llevó la unidad. */
  const [aviso, setAviso] = useState<string | null>(null);

  // Estable entre renders (no entre remounts) — mismo criterio que
  // `ResumeClient`: no depende de las garantías de `useMemo`.
  const eventsRef = useRef<ReturnType<typeof eleccionEvents> | null>(null);
  if (eventsRef.current == null) { eventsRef.current = eleccionEvents(token); }
  const events = eventsRef.current;

  // `link_open` es la APERTURA del link, no cada lectura del endpoint: la lista
  // se recarga sola tras un 409 y sin este guard esa recarga contaría como una
  // visita nueva.
  const aperturaContada = useRef(false);

  const cargar = useCallback(async () => {
    setView({ status: 'loading' });
    const res = await getEleccion(token);

    if (isEleccionApiError(res)) {
      if (res.reason === 'network') return setView({ status: 'network' });
      if (EXPIRED_REASONS.has(res.reason)) {
        events.track('equipment_selection_link_expired', { reason: res.reason });
        return setView({ status: 'expired' });
      }
      if (res.reason === 'invalid_status') return setView({ status: 'invalid_status' });
      return setView({ status: 'invalid' });
    }

    if (!aperturaContada.current) {
      aperturaContada.current = true;
      events.track('equipment_selection_link_open', { units_count: res.units.length });
    }

    const elegida = res.selected_unit_id != null
      ? res.units.find((u) => u.unit_id === res.selected_unit_id) ?? res.units[0]
      : undefined;

    if (elegida) {
      events.track('equipment_selection_already_chosen', {
        unit_id: elegida.unit_id,
        display_number: elegida.display_number,
      });
      return setView({ status: 'elegida', datos: res, unidad: elegida });
    }

    if (res.units.length === 0) {
      events.track('equipment_selection_empty', {});
      return setView({ status: 'vacio', datos: res });
    }

    setView({ status: 'lista', datos: res });
  }, [token, events]);

  useEffect(() => { void cargar(); }, [cargar]);

  const abrirGaleria = (unidad: EleccionUnidad) => {
    setErrorGaleria(null);
    setAbierta(unidad);
    events.track('equipment_selection_gallery_open', {
      unit_id: unidad.unit_id,
      display_number: unidad.display_number,
      photos_count: unidad.photos.length,
      has_video: Boolean(unidad.video_url),
    });
  };

  const confirmar = async (unidad: EleccionUnidad) => {
    setErrorGaleria(null);
    setEnviando(true);
    events.track('equipment_selection_click', {
      unit_id: unidad.unit_id,
      display_number: unidad.display_number,
    });

    const res = await elegirUnidad(token, unidad.unit_id);
    setEnviando(false);

    if (!isEleccionApiError(res)) {
      events.track('equipment_selection_confirmed', {
        unit_id: res.unit.unit_id,
        display_number: res.unit.display_number,
      });
      setAbierta(null);
      // El backend devuelve la unidad realmente reservada, que puede no ser la
      // que se mandó (si otra request con el mismo token ganó la carrera). Se
      // muestra ESA, no la que el cliente tocó.
      setView((prev) =>
        prev.status === 'lista' || prev.status === 'elegida' || prev.status === 'vacio'
          ? { status: 'elegida', datos: prev.datos, unidad: res.unit }
          : prev,
      );
      return;
    }

    events.track('equipment_selection_error', {
      unit_id: unidad.unit_id,
      reason: res.reason,
    });

    if (res.reason === 'unit_unavailable') {
      // Desenlace esperado, no falla: alguien la eligió primero. Se cierra la
      // galería y se refresca para que la lista deje de mentir.
      setAbierta(null);
      setAviso('Alguien eligió esa unidad antes que tú. Estas son las que siguen disponibles.');
      void cargar();
      return;
    }
    if (EXPIRED_REASONS.has(res.reason)) {
      events.track('equipment_selection_link_expired', { reason: res.reason });
      setAbierta(null);
      return setView({ status: 'expired' });
    }
    if (res.reason === 'invalid_status') {
      setAbierta(null);
      return setView({ status: 'invalid_status' });
    }
    if (INVALID_REASONS.has(res.reason)) {
      setAbierta(null);
      return setView({ status: 'invalid' });
    }
    // Red o rechazo inesperado: la galería sigue abierta para reintentar sin
    // volver a buscar la unidad.
    setErrorGaleria(res.error);
  };

  if (view.status === 'loading') return <Mensaje titulo="Cargando..." />;

  if (view.status === 'network') {
    return (
      <Mensaje
        titulo="No pudimos conectarnos"
        detalle="Revisa tu conexión e intenta nuevamente."
        accion={{ texto: 'Reintentar', onClick: () => void cargar() }}
      />
    );
  }
  if (view.status === 'expired') {
    return (
      <Mensaje
        titulo="Este enlace venció"
        detalle="Escríbenos por WhatsApp y te enviamos uno nuevo para elegir tu equipo."
        whatsapp
      />
    );
  }
  if (view.status === 'invalid') {
    return (
      <Mensaje
        titulo="Este enlace no es válido"
        detalle="Revisa que hayas abierto el enlace completo que te enviamos."
      />
    );
  }
  if (view.status === 'invalid_status') {
    return (
      <Mensaje
        titulo="Tu solicitud cambió de estado"
        detalle="Por ahora no puedes elegir tu equipo desde aquí. Escríbenos y te contamos cómo sigue."
        whatsapp
      />
    );
  }

  const expiraEn = view.datos.application.link_expires_at;

  if (view.status === 'elegida') {
    return (
      <Chrome expiraEn={expiraEn}>
        <Confirmacion
          unidad={view.unidad}
          producto={view.datos.product}
          cuota={view.datos.application.monthly_payment}
        />
      </Chrome>
    );
  }

  if (view.status === 'vacio') {
    return (
      <Chrome expiraEn={expiraEn}>
        <div className="mx-auto max-w-[440px] py-10 text-center">
          <h1 className="text-2xl font-extrabold">Estamos preparando tu equipo</h1>
          <p className="mt-2.5 text-[15px] leading-[1.55] text-[#5b5c6b]">
            Todavía no hay unidades listas para mostrarte. Guarda este enlace: en
            cuanto tengamos las fotos y el video de tu {view.datos.product.name ?? 'equipo'},
            vas a poder verlas aquí y elegir la tuya.
          </p>
          <button
            type="button"
            onClick={() => void cargar()}
            className="mt-5 rounded-2xl bg-[#4654CD] px-5 py-3 text-sm font-bold text-white"
          >
            Volver a revisar
          </button>
        </div>
      </Chrome>
    );
  }

  const { datos } = view;
  const unidades = datos.units;
  const cuota = formatearCuota(datos.application.monthly_payment);
  // El grado solo encabeza la página cuando TODAS las unidades comparten el
  // mismo: el copy del diseño ("todas son del mismo grado") sería falso si no.
  const gradoComun = unidades.every(
    (u) => u.grado === unidades[0].grado && u.grado_label === unidades[0].grado_label,
  )
    ? etiquetaGrado(unidades[0].grado, unidades[0].grado_label)
    : '';

  return (
    <Chrome expiraEn={expiraEn}>
      <div className="mb-[22px] text-center">
        <div className="mb-3.5 inline-flex items-center gap-[7px] rounded-[20px] bg-[#e7faf3] px-[15px] py-2 text-[13px] font-bold text-[#0a8a5a]">
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          ¡Tu solicitud fue aprobada!
        </div>
        <h1 className="text-3xl font-extrabold leading-[1.1]">
          Elige tu {datos.product.name ?? 'equipo'}
        </h1>
        {gradoComun && (
          <div className="mt-1.5 text-[15px] font-bold text-[#4654CD]">{gradoComun}</div>
        )}
        <p className="mx-auto mt-3 max-w-[400px] text-[13.5px] leading-[1.55] text-[#5b5c6b]">
          Estas son las unidades disponibles para tu modelo. Mira el <b>video</b> y
          las <b>fotos</b> de cada una y elige la que más te guste.
          {gradoComun && ' Todas son del mismo grado y tienen la '}
          {gradoComun && <b>misma cuota</b>}
          {gradoComun && '.'}
        </p>
        {cuota && (
          <div className="mt-3.5 inline-block rounded-2xl bg-[#EEF0FC] px-4 py-2.5 text-[13.5px] font-semibold text-[#151744]">
            Tu cuota: <b className="font-extrabold text-[#4654CD]">{cuota}</b>
          </div>
        )}
      </div>

      {aviso && (
        <p
          role="status"
          className="mb-4 rounded-2xl border border-[#ffe0b2] bg-[#fff4e5] px-4 py-3 text-center text-[13.5px] text-[#b5651d]"
        >
          {aviso}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {unidades.map((u) => (
          <UnidadCard key={u.unit_id} unidad={u} onAbrir={() => abrirGaleria(u)} />
        ))}
      </div>

      <p className="mt-2.5 text-center text-xs leading-[1.5] text-[#9a9aa8]">
        🔒 Este enlace es temporal y personal.
        <br />
        Tómate tu tiempo para elegir con calma.
      </p>

      {abierta && (
        <GaleriaUnidad
          unidad={abierta}
          enviando={enviando}
          error={errorGaleria}
          onCerrar={() => { setAbierta(null); setErrorGaleria(null); }}
          onElegir={() => void confirmar(abierta)}
          onCambiarFoto={(indice) =>
            events.track('equipment_selection_photo_change', {
              unit_id: abierta.unit_id,
              photo_index: indice,
            })
          }
          onReproducirVideo={() =>
            events.track('equipment_selection_video_play', { unit_id: abierta.unit_id })
          }
        />
      )}
    </Chrome>
  );
}

export default EleccionEquipoClient;
