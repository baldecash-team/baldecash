'use client';

/**
 * Confirmación de elección — REUTILIZA el ReceivedScreen del flujo regular de
 * solicitud (misma pantalla de "¡Hemos recibido tu solicitud!"). Construimos un
 * ReceivedData a partir del equipo elegido en la oferta.
 *
 * El ReceivedScreen es un componente puro (recibe data por props); su único
 * acoplamiento (ContactInfo → useParams().landing) cae a 'home' de forma segura.
 */
import { ReceivedScreen } from '../../../[landing]/solicitar/confirmacion/components/received';
import type { ReceivedData } from '../../../[landing]/solicitar/confirmacion/types/received';

export interface ChosenSummary {
  name: string;
  brand?: string;
  imageUrl?: string;
  monthly?: number;
  /** Precio final del equipo (lista). Opcional; si falta, se deriva de la cuota. */
  finalPrice?: number;
  /** Número real de cuotas (p. ej. 24/36). */
  term?: number;
  /** Plazo en meses calendario. */
  termMonths?: number;
  /** 'mensual' | 'quincenal' | 'semanal'. */
  paymentFrequency?: string;
  /** Nombre del estudiante, si lo tenemos. */
  userName?: string;
  /** Código de la oferta/solicitud para mostrar como referencia. */
  offerCode?: string;
}

export function SeleccionConfirmada({
  chosen,
  backHref,
}: {
  chosen: ChosenSummary;
  backHref: string;
}) {
  const monthly = chosen.monthly ?? 0;
  const termMonths = chosen.termMonths ?? 36;
  // Si no nos pasan el precio de lista, lo estimamos desde la cuota × plazo
  // (solo para que el resumen muestre un total coherente; no es vinculante).
  const finalPrice = chosen.finalPrice ?? Math.round(monthly * termMonths);

  const data: ReceivedData = {
    applicationId: chosen.offerCode || 'Tu oferta',
    // Sin nombre del estudiante en la oferta → saludo genérico (evita "..., !").
    userName: chosen.userName || 'estudiante',
    submittedAt: new Date(),
    estimatedResponseHours: 24,
    products: [
      {
        name: chosen.name,
        brand: chosen.brand,
        image: chosen.imageUrl || '',
        quantity: 1,
        unitPrice: finalPrice,
        finalPrice,
        monthlyQuota: monthly,
      },
    ],
    term: chosen.term,
    termMonths,
    paymentFrequency: chosen.paymentFrequency,
    totalMonthlyQuota: monthly,
    notificationChannels: ['whatsapp', 'email'],
  };

  return <ReceivedScreen data={data} onGoToHome={() => (window.location.href = backHref)} />;
}
