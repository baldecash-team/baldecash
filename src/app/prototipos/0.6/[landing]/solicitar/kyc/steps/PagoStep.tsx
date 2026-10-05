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
}

export function PagoStep({ linkPago }: PagoStepProps) {
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
        La salida de este paso es "Continuar en otro momento", que vive en el
        contenedor del KYC y esta en todos los pasos. Un "Pagar despues" propio
        duplicaba esa accion con otro nombre y otro comportamiento —cerraba el
        KYC sin dejarle a la persona el enlace para volver.
      */}
    </div>
  );
}

export default PagoStep;
