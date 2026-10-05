import { PhoneFrame } from './PhoneFrame';
import { SuccessScreen } from './SuccessScreen';

/** Card de carga mientras se valida el enlace. */
export function LinkLoading() {
  return (
    <PhoneFrame>
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#e5e7eb] border-t-[#4654CD] animate-spin" />
        <p className="text-[#1f2937] font-semibold">Validando enlace…</p>
        <p className="text-[#6b7280] text-sm">Un momento, estamos comprobando tu enlace.</p>
      </div>
    </PhoneFrame>
  );
}

interface LinkStatusProps {
  reason?: string;
  /** Mensaje de éxito cuando el flujo YA finalizó (reason="consumed"); depende del flujo. */
  consumedTitle?: string;
  consumedMessage?: string;
  consumedWhatsapp?: boolean;
}

/**
 * Pantalla de resultado de la validación de un enlace (valid:false).
 * `consumed` es ÉXITO (el usuario ya completó la acción); el resto son avisos/errores.
 */
export function LinkStatus({ reason, consumedTitle, consumedMessage, consumedWhatsapp }: LinkStatusProps) {
  if (reason === 'consumed') {
    return (
      <PhoneFrame>
        <SuccessScreen
          title={consumedTitle ?? '¡Listo!'}
          message={consumedMessage ?? 'Ya completaste esta acción, no necesitas hacer nada más.'}
          whatsapp={consumedWhatsapp}
        />
      </PhoneFrame>
    );
  }

  const variants: Record<string, { title: string; help: string; tone: 'amber' | 'red'; icon: 'clock' | 'alert' }> = {
    expired: {
      title: 'El enlace venció.',
      help: 'Solicita uno nuevo para continuar con tu validación.',
      tone: 'amber',
      icon: 'clock',
    },
    revoked: {
      title: 'Este enlace fue reemplazado.',
      help: 'Usa el enlace más reciente que te enviamos.',
      tone: 'amber',
      icon: 'alert',
    },
    purpose_mismatch: {
      title: 'Enlace no válido para esta acción.',
      help: 'Revisa que estés usando el enlace correcto.',
      tone: 'red',
      icon: 'alert',
    },
    inactive: {
      title: 'Enlace no válido para esta acción.',
      help: 'Revisa que estés usando el enlace correcto.',
      tone: 'red',
      icon: 'alert',
    },
    invalid: {
      title: 'Enlace inválido.',
      help: 'Si crees que es un error, contacta a soporte o solicita un nuevo enlace.',
      tone: 'red',
      icon: 'alert',
    },
  };
  const v = variants[reason ?? 'invalid'] ?? variants.invalid;
  const isAmber = v.tone === 'amber';

  return (
    <PhoneFrame>
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <span
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            isAmber ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#ef4444]/10 text-[#ef4444]'
          }`}
        >
          {v.icon === 'clock' ? (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          ) : (
            <span className="text-2xl font-bold leading-none">!</span>
          )}
        </span>
        <p className="text-[#1f2937] font-semibold text-lg">{v.title}</p>
        <p className="text-[#6b7280] text-sm">{v.help}</p>
      </div>
    </PhoneFrame>
  );
}
