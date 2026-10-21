/**
 * SaludoDowngrade — saludo de la oferta de downgrade (Caso 4 · BAL-4641).
 *
 * Dice lo mismo que el WhatsApp que trae al cliente hasta aquí
 * (`solicitud_aprobada_oferta_downgrade_v3`): «¡Tu financiamiento fue
 * aprobado, {nombre}!» y la cuota aprobada. El upsell y la oferta estándar
 * conservan su saludo de siempre («¡Felicitaciones…!»).
 *
 * La tipografía es la del saludo que reemplaza en cada pantalla: `portada`
 * (Mi Oferta) y `complementos` (mini-checkout). El tope llega del backend
 * (`max_monthly_quota`); aquí solo se le da formato.
 *
 * Puramente presentacional. No hace fetch.
 */
import { OFERTA_COLORS } from './ofertaTheme';

/** El saludo nuevo va solo en downgrade y con un tope que mostrar. Con un
 *  backend que aún no manda `case`, la oferta llega sin caso y no aplica. */
export function esSaludoDowngrade(
  offerCase: string | null | undefined,
  tope: number | null | undefined,
): boolean {
  return offerCase === 'downgrade' && typeof tope === 'number' && Number.isFinite(tope) && tope > 0;
}

/** El tope como va en el WhatsApp: «250», o «250.50» si no es entero. */
export function textoDelTope(tope: number): string {
  const centimos = Math.round(tope * 100);
  return centimos % 100 === 0 ? String(centimos / 100) : (centimos / 100).toFixed(2);
}

interface SaludoDowngradeProps {
  /** Nombre del cliente. Sin nombre, el saludo sale sin la coma. */
  nombre?: string | null;
  /** Cuota mensual aprobada de la oferta, en soles. */
  tope: number;
  /** Pantalla donde se pinta: define tipografía y la frase de cierre. */
  variante: 'portada' | 'complementos';
  /** Tope de efectivo (BAL-4910): solo el equipo cuenta contra la cuota; los
   *  accesorios y seguros van aparte. Cambia la frase de cierre de complementos. */
  soloEquipo?: boolean;
}

export function SaludoDowngrade({ nombre, tope, variante, soloEquipo = false }: SaludoDowngradeProps) {
  const limpio = nombre?.trim();
  const titulo = (
    <>
      ¡Tu financiamiento fue{' '}
      <span className={variante === 'portada' ? 'font-extrabold' : undefined} style={{ color: OFERTA_COLORS.greenDark }}>
        aprobado
      </span>
      {limpio ? `, ${limpio}` : ''}!
    </>
  );
  const detalle = (
    <>
      Tienes una cuota aprobada de hasta{' '}
      <span className="font-bold" style={{ color: OFERTA_COLORS.textStrong }}>S/ {textoDelTope(tope)}</span> al mes.{' '}
      {variante === 'portada'
        ? 'Elige el equipo que prefieras de tu catálogo.'
        : soloEquipo
          ? 'Tu equipo entra en tu cuota. Los accesorios y seguros van aparte.'
          : 'Solo mostramos lo que entra en tu cuota.'}
    </>
  );

  if (variante === 'complementos') {
    return (
      <div>
        <h1 className="font-['Baloo_2',_sans-serif] text-[20px] font-bold leading-[1.25]" style={{ color: OFERTA_COLORS.textStrong }}>
          {titulo}
        </h1>
        <p className="mt-1.5 text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>
          {detalle}
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="text-[18px] font-semibold leading-[1.25]">{titulo}</div>
      <p className="mt-1 text-[13px] leading-snug" style={{ color: OFERTA_COLORS.textMid }}>
        {detalle}
      </p>
    </div>
  );
}
