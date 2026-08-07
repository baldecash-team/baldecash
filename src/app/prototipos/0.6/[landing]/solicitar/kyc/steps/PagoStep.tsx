'use client';

/**
 * Sub-paso KYC: pago de la cuota inicial.
 *
 * No cobra acá: manda al magic link de Zona Estudiantes (`/zona/payDues`), que
 * es donde ya se cobra la cuota 0. Montar una segunda pasarela sería duplicar
 * el punto de fallo y la conciliación.
 *
 * Solo se renderiza cuando el veredicto de aprobación trajo `link_pago`, así
 * que acá el link siempre existe.
 */
interface PagoStepProps {
  linkPago: string;
  onDone: () => void;
}

export function PagoStep({ linkPago, onDone }: PagoStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#1f2937]">Paga tu cuota inicial</h2>
      <p className="text-sm text-neutral-500">
        Tu solicitud fue aprobada. Completa el pago de tu cuota inicial para
        continuar con la entrega de tu equipo.
      </p>

      <a
        href={linkPago}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl bg-[#4654CD] py-3 text-center font-semibold text-white transition-opacity hover:opacity-90"
      >
        Ir a pagar
      </a>

      {/*
        Salida siempre disponible: la inicial también se paga por otros canales
        (BBVA QR, Kash.io, agente), y bloquear acá dejaría al solicitante sin
        forma de llegar a su resumen.
      */}
      <button
        type="button"
        onClick={onDone}
        className="w-full cursor-pointer py-2 text-sm text-neutral-500 underline"
      >
        Pagar después
      </button>
    </div>
  );
}

export default PagoStep;
