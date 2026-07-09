/**
 * TuEquipoCard — card compacta con el equipo ya elegido (BAL-2185).
 *
 * Copiado 1:1 de la card "TU EQUIPO" del mock
 * (docs/superpowers/design-refs/mock-accesorios.html, frame 1): fondo
 * `grayBg`, borde `border`, radius 16px. Foto placeholder + label teal +
 * nombre + cuota a la derecha.
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica.
 */
import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';

export interface TuEquipoCardProps {
  nombre: string;
  cuota: number;
  /** URL de la imagen del equipo. Si no viene, se muestra un placeholder. */
  imageUrl?: string | null;
}

export function TuEquipoCard({ nombre, cuota, imageUrl }: TuEquipoCardProps) {
  const cuotaFormateada = Math.round(cuota).toLocaleString('es-PE');

  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
      style={{ backgroundColor: OFERTA_COLORS.grayBg, borderColor: OFERTA_COLORS.border }}
    >
      <div
        className="flex h-[50px] w-[60px] flex-none items-center justify-center overflow-hidden rounded-xl border"
        style={{
          borderColor: OFERTA_COLORS.border,
          background: imageUrl
            ? '#fff'
            : 'repeating-linear-gradient(135deg, #F1F2F7 0 7px, #E9EBF2 7px 14px)',
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={nombre} className="h-full w-full object-contain" />
        ) : (
          <span className="font-mono text-[8px]" style={{ color: OFERTA_COLORS.textSoft }}>
            equipo
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="text-[9.5px] font-bold tracking-[.1em]"
          style={{ color: OFERTA_COLORS.tealBrand }}
        >
          TU EQUIPO
        </div>
        <div className="mt-0.5 truncate font-['Baloo_2',_sans-serif] text-[14.5px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
          {nombre}
        </div>
      </div>
      <div
        className="flex-none font-['Baloo_2',_sans-serif] text-[15px] font-bold"
        style={{ color: OFERTA_COLORS.textStrong }}
      >
        S/{cuotaFormateada}/mes
      </div>
    </div>
  );
}
