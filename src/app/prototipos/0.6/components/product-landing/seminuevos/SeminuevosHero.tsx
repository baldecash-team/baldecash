'use client';

import { hero } from './data/seminuevosData';

/**
 * El bloque de copy sobre el banner --eyebrow, título, subtítulo y CTA-- queda
 * OCULTO por pedido de producto: el banner de Haru ya trae su propio texto
 * incrustado y encima se leían dos mensajes superpuestos. Se oculta en desktop
 * y en móvil (BAL-3317).
 *
 * Es temporal, por eso el bloque no se borra: se apaga con esta bandera y
 * vuelve poniéndola en true.
 *
 * Al ocultarlo la landing se queda sin <h1> y sin el CTA "Ver catálogo" del
 * hero -- el del navbar sigue estando. Si el banner se quedara sin texto, esto
 * hay que reactivarlo o el hero no dice nada.
 */
/**
 * El copy del hero (eyebrow, h1, subtítulo y CTA) se dibuja o no según la pieza
 * que haya detrás.
 *
 * En DESKTOP la imagen ya trae el texto compuesto, así que repetirlo lo
 * duplicaría en pantalla: ahí sigue oculto.
 *
 * En MÓVIL la pieza nueva es solo fondo —las laptops sobre el degradé azul, sin
 * una palabra—, y sin este bloque la landing abre sin título, sin promesa y sin
 * botón al catálogo. Se muestra hasta 767px y se esconde de 768px en adelante,
 * el mismo corte que usa el <picture> para cambiar de archivo.
 */
const COPY_HERO_SOLO_MOVIL = 'md:hidden';

/** Las 4 laptops decorativas del prototipo: color, posición y rotación. */
const LAPTOPS = [
  { fill: '#d9dbe2', className: 'w-[150px] top-[8%] left-1/2 -translate-x-1/2 rotate-[-3deg]' },
  { fill: '#e6c3cc', className: 'w-[120px] top-[26%] right-[4%] rotate-[8deg]' },
  { fill: '#d9d987', className: 'w-[120px] bottom-[24%] left-[3%] rotate-[-8deg]' },
  { fill: '#6b6fce', className: 'w-[130px] bottom-[6%] left-1/2 -translate-x-1/2 rotate-[4deg]' },
];

function LaptopShape({ fill, className }: { fill: string; className: string }) {
  return (
    <svg
      data-testid="hero-laptop"
      viewBox="0 0 120 84"
      aria-hidden="true"
      className={`absolute pointer-events-none ${className}`}
      style={{ filter: 'drop-shadow(0 16px 22px rgba(20,25,60,.18))' }}
    >
      <rect x="14" y="6" width="92" height="58" rx="6" fill={fill} />
      <circle cx="60" cy="35" r="8" fill="#ffffff" opacity=".35" />
      <rect x="4" y="66" width="112" height="9" rx="4.5" fill={fill} opacity=".85" />
    </svg>
  );
}

export function SeminuevosHero({ catalogUrl }: { catalogUrl: string }) {
  return (
    <section
      // En móvil el texto se ancla ARRIBA: la pieza tiene el tercio superior de
      // fondo liso y las laptops repartidas de la mitad hacia abajo, así que
      // centrarlo lo dejaba justo encima de los equipos. De 768px en adelante
      // vuelve al centro, que es donde lo espera la pieza apaisada.
      className="relative overflow-hidden flex flex-col justify-start md:justify-center px-[22px] py-[18px] text-center"
      style={{
        background: 'linear-gradient(180deg,#fdfdff,#e9ebf3)',
        // El prototipo restaba 65px (su header). Acá se resta la altura real que
        // publica el Navbar, que varía si hay banner promocional.
        minHeight: 'calc(100svh - var(--header-total-height, 6.5rem))',
      }}
    >
      {hero.bannerUrl ? (
        // <picture> y no MediaSlot: son dos archivos con proporciones muy
        // distintas (vertical en móvil, apaisado en desktop) y el navegador
        // descarga SOLO el que corresponde al viewport. Con dos MediaSlot
        // ocultos por CSS se bajarían los dos, que en móvil es justo lo que
        // no queremos.
        <picture className="absolute inset-0">
          <source media="(min-width: 768px)" srcSet={hero.bannerUrl} />
          <img
            src={hero.bannerUrlMobile ?? hero.bannerUrl}
            alt="Equipos seminuevos BaldeCash"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : (
        LAPTOPS.map((l, i) => <LaptopShape key={i} {...l} />)
      )}

      <div
        data-testid="hero-copy"
        // Radio solo arriba: abajo el velo ya se desvanece contra la imagen y
        // redondear ahí no se vería. Es un remate suave, no una tarjeta.
        className={`${COPY_HERO_SOLO_MOVIL} relative z-[2] w-full max-w-[600px] mx-auto pt-6 pb-8 rounded-t-[20px]`}
        style={{
          // Velo vertical, no radial: el radial al 85% blanqueaba el centro de
          // la pieza y se comía las laptops que quedan detrás. Este baja desde
          // arriba --donde la imagen ya es fondo liso-- y se desvanece antes de
          // llegar a los equipos, así el texto se lee sin apagar la foto.
          background:
            'linear-gradient(180deg,rgba(233,238,252,.92) 0%,rgba(233,238,252,.78) 55%,rgba(233,238,252,0) 100%)',
        }}
      >
        <p
          className="text-[13px] font-semibold uppercase tracking-[2px] mb-2"
          // Aqua oscurecido solo para este texto: --aqua (#03DBD0) da 1.7:1 sobre
          // el fondo claro del hero, muy por debajo del mínimo de 4.5:1. Este tono
          // supera 5:1 incluso contra el borde más oscuro del degradé. El token
          // --aqua no se toca: en el resto de la landing se usa como fondo, no
          // como texto, y ahí sí tiene contraste de sobra.
          style={{ color: '#046F69' }}
        >
          {hero.eyebrow}
        </p>

        <h1
          className="font-extrabold leading-[1.06] tracking-[-1px] text-balance"
          // El mínimo baja de 30 a 27px: en móvil el titular ocupaba tres líneas
          // y empujaba el bloque sobre las laptops. El techo de desktop no se
          // toca.
          style={{ fontSize: 'clamp(27px,7.2vw,50px)', color: '#151744' }}
        >
          {hero.title}
        </h1>

        <p
          className="mt-2.5 font-medium text-balance"
          // Gris azulado en vez del gris neutro: sobre el fondo azul de la pieza
          // el #5b5c6b se veía sucio.
          style={{ fontSize: 'clamp(15px,4.1vw,20px)', color: '#4a4d63' }}
        >
          {hero.subtitle}
        </p>

        <a
          href={catalogUrl}
          className="inline-flex items-center gap-2 min-h-11 mt-5 md:mt-7 rounded-[30px] px-6 py-3 text-white font-semibold text-[15px] cursor-pointer transition-[filter,box-shadow] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2"
          style={{
            background: 'linear-gradient(135deg,#5a63e0,#03DBD0)',
            boxShadow: '0 10px 24px rgba(90,99,224,.35)',
          }}
        >
          {hero.ctaLabel}
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
