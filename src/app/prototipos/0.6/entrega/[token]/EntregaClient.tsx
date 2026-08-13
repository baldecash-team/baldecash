'use client';

/**
 * EntregaClient — ruta `/entrega/[token]`.
 *
 * Muestra el equipo y la fecha en que BaldeCash lo envía, y le pide a la
 * persona lo único que el despacho no puede saber solo: dónde exactamente, y
 * quién va a recibirlo.
 *
 * Cinco caminos, los mismos que `ResumeClient` del KYC:
 * - datos válidos → formulario
 * - enviado → confirmación
 * - enlace vencido/revocado/consumido → "Este enlace venció"
 * - enlace inválido / de otro flujo → "Este enlace no es válido", con el MISMO
 *   copy para ambos: distinguirlos delataría si la solicitud existe
 * - red → pantalla de reintento
 *
 * La fecha se formatea partiendo el string y NO con `new Date`: el constructor
 * interpreta "2026-08-20" como UTC y en Lima (-5) lo corre al 19.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  getEntrega,
  isEntregaApiError,
  registrarEntrega,
  type EntregaDatos,
  type EntregaPayload,
} from '@/app/prototipos/0.6/services/entregaApi';

/** Enlace muerto pero conocido: existió, ya no sirve. */
const EXPIRED_REASONS = new Set(['expired', 'revoked', 'consumed', 'inactive']);

type ViewState =
  | { status: 'loading' }
  | { status: 'ready'; datos: EntregaDatos }
  | { status: 'done' }
  | { status: 'expired' }
  | { status: 'invalid' }
  | { status: 'network' };

export const formatearFecha = (iso: string | null): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

const vacio = (v: string | null | undefined) => (v ?? '').trim();

export interface EntregaClientProps {
  token: string;
}

export function EntregaClient({ token }: EntregaClientProps) {
  const [view, setView] = useState<ViewState>({ status: 'loading' });
  const [form, setForm] = useState<EntregaPayload>({
    direccion: '', calle: '', referencia: '',
    departamento: '', provincia: '', distrito: '',
    es_titular: true, nombres: '', nrodocumento: '', telefono: '', parentesco: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setView({ status: 'loading' });
    const res = await getEntrega(token);
    if (isEntregaApiError(res)) {
      if (res.reason === 'network') return setView({ status: 'network' });
      if (EXPIRED_REASONS.has(res.reason)) return setView({ status: 'expired' });
      return setView({ status: 'invalid' });
    }
    setForm((f) => ({
      ...f,
      direccion: vacio(res.direccion.direccion),
      calle: vacio(res.direccion.calle),
      referencia: vacio(res.direccion.referencia),
      departamento: vacio(res.direccion.departamento),
      provincia: vacio(res.direccion.provincia),
      distrito: vacio(res.direccion.distrito),
    }));
    setView({ status: 'ready', datos: res });
  }, [token]);

  useEffect(() => { void cargar(); }, [cargar]);

  const set = <K extends keyof EntregaPayload>(k: K, v: EntregaPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Se valida acá además del backend para no gastarle un viaje a alguien con
    // mala señal; el backend igual la exige, es la causa de reintento de
    // entrega más común.
    if (!form.referencia.trim()) {
      return setError('Necesitamos una referencia para encontrar tu dirección.');
    }
    if (!form.es_titular) {
      const faltan = [form.nombres, form.nrodocumento, form.telefono, form.parentesco]
        .some((v) => !v.trim());
      if (faltan) {
        return setError('Completa los datos de quien va a recibir el equipo.');
      }
    }

    setEnviando(true);
    const res = await registrarEntrega(token, form);
    setEnviando(false);

    if (isEntregaApiError(res)) return setError(res.error);
    setView({ status: 'done' });
  };

  if (view.status === 'loading') {
    return <Mensaje titulo="Cargando..." />;
  }
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
        detalle="Escríbenos por WhatsApp y te enviamos uno nuevo."
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
  if (view.status === 'done') {
    return (
      <Mensaje
        titulo="¡Listo!"
        detalle="Registramos dónde y quién recibe tu equipo. Te avisaremos cuando salga."
      />
    );
  }

  const { datos } = view;

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900">Coordina tu entrega</h1>

      <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">Tu equipo</p>
        <p className="text-base font-medium text-gray-900">{datos.equipo.nombre ?? '—'}</p>
        {datos.fecha_entrega && (
          <p className="mt-2 text-sm text-gray-700">
            Lo enviamos a tu domicilio el{' '}
            <strong>{formatearFecha(datos.fecha_entrega)}</strong>.
          </p>
        )}
      </section>

      <form onSubmit={enviar} className="mt-5 space-y-5">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-900">¿Dónde lo dejamos?</legend>

          <Campo label="Dirección" value={form.direccion}
                 onChange={(v) => set('direccion', v)} />
          <Campo label="N°, Dpto, Mz, Lote y/o Km" value={form.calle}
                 onChange={(v) => set('calle', v)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Campo label="Departamento" value={form.departamento}
                   onChange={(v) => set('departamento', v)} />
            <Campo label="Provincia" value={form.provincia}
                   onChange={(v) => set('provincia', v)} />
            <Campo label="Distrito" value={form.distrito}
                   onChange={(v) => set('distrito', v)} />
          </div>
          <Campo
            label="Referencia"
            required
            value={form.referencia}
            onChange={(v) => set('referencia', v)}
            ayuda="Ej: frente al parque, casa de rejas negras."
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-900">¿Quién lo recibe?</legend>

          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="radio" name="recibe" checked={form.es_titular}
              onChange={() => set('es_titular', true)}
            />
            Yo mismo{datos.titular.nombre ? ` (${datos.titular.nombre})` : ''}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="radio" name="recibe" checked={!form.es_titular}
              onChange={() => set('es_titular', false)}
            />
            Otra persona
          </label>

          {!form.es_titular && (
            <div className="space-y-3 rounded-lg bg-gray-50 p-3">
              <Campo label="Nombres y apellidos" value={form.nombres}
                     onChange={(v) => set('nombres', v)} />
              <Campo label="DNI" value={form.nrodocumento}
                     onChange={(v) => set('nrodocumento', v)} />
              <Campo label="Teléfono" value={form.telefono}
                     onChange={(v) => set('telefono', v)} />
              <Campo label="Parentesco" value={form.parentesco}
                     onChange={(v) => set('parentesco', v)} />
            </div>
          )}
        </fieldset>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-lg bg-[#4654CD] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {enviando ? 'Enviando...' : 'Confirmar entrega'}
        </button>
      </form>
    </main>
  );
}

function Campo({
  label, value, onChange, required, ayuda,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  ayuda?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-600"> *</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      {ayuda && <span className="mt-1 block text-[11px] text-gray-500">{ayuda}</span>}
    </label>
  );
}

function Mensaje({
  titulo, detalle, accion,
}: {
  titulo: string;
  detalle?: string;
  accion?: { texto: string; onClick: () => void };
}) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-gray-900">{titulo}</h1>
      {detalle && <p className="mt-2 text-sm text-gray-600">{detalle}</p>}
      {accion && (
        <button
          type="button"
          onClick={accion.onClick}
          className="mt-4 rounded-lg bg-[#4654CD] px-4 py-2 text-sm font-medium text-white"
        >
          {accion.texto}
        </button>
      )}
    </main>
  );
}

export default EntregaClient;
