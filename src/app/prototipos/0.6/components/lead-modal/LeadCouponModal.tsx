'use client';

import React, { useEffect, useState } from 'react';
import { saveCouponFromModal, saveDocumentFromModal } from '../../utils/leadModalStorage';

interface Props {
  landingSlug: string;
  config: {
    title?: string;
    description?: string;
    image_url?: string;
    button_text?: string;
    countdown_enabled?: boolean;
    countdown_minutes?: number;
  };
  onClose: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

const TIPOS_DOCUMENTO = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carné de extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
];

/**
 * Cuenta regresiva DECORATIVA. Al llegar a cero se queda en 00:00 y no
 * dispara nada: el cupon no vence, el formulario no se cierra y no se
 * bloquea ninguna accion. Existe solo para generar urgencia.
 *
 * Se congela en cero a proposito — dejarla en negativo o reiniciarla haria
 * evidente que es de mentira.
 */
function CuentaRegresiva({ minutos }: { minutos: number }) {
  const [restante, setRestante] = useState(Math.max(0, Math.round(minutos * 60)));

  useEffect(() => {
    if (restante <= 0) return;
    const t = setTimeout(() => setRestante((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [restante]);

  const mm = String(Math.floor(restante / 60)).padStart(2, '0');
  const ss = String(restante % 60).padStart(2, '0');

  return (
    <p className="text-sm font-semibold text-red-600" role="timer" aria-label="Tiempo restante de la oferta">
      Oferta por tiempo limitado: {mm}:{ss}
    </p>
  );
}

export default function LeadCouponModal({ landingSlug, config, onClose }: Props) {
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cupon, setCupon] = useState<{ code: string; label: string } | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const r = await fetch(`${API}/newsletter/lead-modal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landing_slug: landingSlug,
          document_type: documentType,
          document_number: documentNumber.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();

      // El documento se guarda siempre: sirve para autocompletar la solicitud
      // aunque la landing no tenga cupon configurado.
      // Dos argumentos: la clave baldecash-dni-{slug} guarda el numero PELADO
      // (ver Interfaces). El documentType viaja en el POST, no al storage.
      saveDocumentFromModal(landingSlug, documentNumber.trim());

      if (data.coupon) {
        setCupon({ code: data.coupon.code, label: data.coupon.label });
      } else {
        onClose();
      }
    } catch {
      setError('No pudimos guardar tus datos. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  function aplicar() {
    if (!cupon) return;
    // Recien acá el cupón entra al formulario. Separar "obtener" de "aplicar"
    // deja al usuario ver su código antes de que se use.
    saveCouponFromModal(landingSlug, {
      code: cupon.code,
      discount: 0,
      label: cupon.label,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex-1 p-6">
          {cupon ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Tu cupón está listo</h3>
              <p className="rounded-lg bg-gray-100 px-4 py-3 text-center text-xl font-bold tracking-wider">
                {cupon.code}
              </p>
              <button
                type="button"
                onClick={aplicar}
                style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
                className="w-full rounded-lg px-4 py-3 font-semibold text-white"
              >
                Aplicar a mi solicitud
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} className="space-y-3">
              <h3 className="text-lg font-bold">{config.title || 'Deja tus datos'}</h3>
              {config.description && (
                <p className="text-sm text-gray-500">{config.description}</p>
              )}

              {/* Countdown DECORATIVO: al llegar a cero no pasa nada — el cupon
                  no vence, el formulario no se cierra y nada se bloquea. Es
                  solo para generar urgencia. Por eso se congela en 00:00 en vez
                  de disparar ningun efecto. */}
              {config.countdown_enabled && <CuentaRegresiva minutos={config.countdown_minutes ?? 15} />}

              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label="Tipo de documento"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
                >
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  aria-label="Número de documento"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Número de documento"
                  required
                  className="col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>

              <input
                aria-label="Nombres"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombres"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                aria-label="Apellidos"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellidos"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                aria-label="Celular"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Celular"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />

              {error && <p className="text-xs text-red-600">{error}</p>}

              {/* El color sale de la variable de la landing, como DniModal.
                  `bg-brand-500` es de admin2 y aca no existe: el boton quedaba
                  con fondo transparente y texto blanco, invisible. */}
              <button
                type="submit"
                disabled={enviando}
                style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
                className="w-full rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-60"
              >
                {enviando ? 'Enviando...' : config.button_text || 'Obtener mi cupón'}
              </button>
            </form>
          )}
        </div>

        {config.image_url && (
          <div className="hidden w-2/5 md:block">
            <img src={config.image_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
