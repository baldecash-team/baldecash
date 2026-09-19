'use client';

/**
 * MobileStickyCta - Accion principal fija en movil, en todo el flujo de
 * solicitar: los pasos del wizard, el resumen y complementos.
 *
 * El problema que resuelve (reportado por Marco, 26-ago): en el resumen el
 * usuario ve sus datos agrupados, cada bloque con "Editar", y abajo la barra
 * fija del producto. Todo eso se lee como un comprobante ya emitido, y el boton
 * que continua queda a dos o tres scrolls. Promotores y clientes abandonan
 * creyendo que ya enviaron.
 *
 * Se apila SOBRE `SelectedProductBar` (que es `fixed bottom-0 z-40`), asi que
 * usa `bottom` para dejarla libre y un z-index por encima. El alto que deja
 * libre sale de `--product-bar-height`, que publica la propia barra: el viejo
 * literal `72px` era una suposicion que solo valia con la imagen del producto
 * puesta, y queda solo como fallback.
 *
 * Con `debajoDeLaBarra` el orden se invierte y el CTA queda pegado al borde,
 * con la barra ENCIMA. Se usa en la intro embebida de segundo financiamiento.
 *
 * SE DESMONTA cuando otra cosa ocupa la parte de abajo:
 *
 * 1. El drawer del producto expandido monta un overlay `fixed inset-0` con
 *    backdrop-blur y crece hasta `60vh`; competir con el deja el CTA borroso
 *    detras del velo. El estado vive en ProductContext
 *    (`isProductBarExpanded`), no hace falta levantarlo.
 * 2. El teclado virtual (ver `useTecladoVirtualAbierto`). Mientras esta abierto
 *    `WizardLayout` devuelve la navegacion en flujo, asi que el paso nunca
 *    queda sin accion.
 * 3. La celebracion entre pasos, via la prop `oculto`.
 *
 * Solo movil: en desktop la barra del producto no es fija (`hidden lg:block`)
 * y la navegacion en flujo se ve sin scrollear.
 */

import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Send, ArrowRight, Loader2 } from 'lucide-react';
import { useProduct } from '../../../context/ProductContext';
import { useTecladoVirtualAbierto } from '../../../hooks/useTecladoVirtualAbierto';

/**
 * Donde se pega el CTA, segun este debajo o encima de la barra de producto.
 *
 * Se extrae del componente y se exporta para poder probar los valores exactos:
 * jsdom descarta `env(...)` y `calc(var(...) + env(...))` al parsear el estilo
 * --tanto de `.style.bottom` como del atributo `style`, que queda en `null`--,
 * asi que desde el DOM no hay forma de leer lo que el componente escribio.
 * Mismo motivo que `TOP_DE_LA_FRANJA` en `ReferralBanner` y `topDeLaBarra` en
 * `CatalogSecondaryNavbar`.
 */
export function posicionDelCta({
  debajoDeLaBarra,
  hayBarraProducto,
}: {
  debajoDeLaBarra: boolean;
  hayBarraProducto: boolean;
}): React.CSSProperties {
  // Pegado al borde: el safe-area pasa a ser padding propio, porque abajo del
  // CTA ya no hay ninguna barra que lo absorba.
  //
  // El `0.75rem` es el `py-3` de la clase, repetido a proposito: el inline pisa
  // el `padding-bottom` de Tailwind, asi que poner solo el `env()` dejaria el
  // boton pegado al borde de la pantalla en todo aparato sin safe-area (o sea,
  // casi todo Android), que es donde `env(safe-area-inset-bottom)` vale 0. El
  // inset se SUMA al padding, no lo reemplaza.
  if (debajoDeLaBarra) {
    return { bottom: '0px', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' };
  }

  // El alto de la barra lo publica ella misma en `--product-bar-height`. El
  // `72px` es solo el fallback del primer pintado: era el valor hardcodeado de
  // antes y solo vale con la imagen del producto puesta.
  return {
    bottom: hayBarraProducto
      ? 'calc(var(--product-bar-height, 72px) + env(safe-area-inset-bottom))'
      : 'env(safe-area-inset-bottom)',
  };
}

interface MobileStickyCtaProps {
  /** Vuelve al paso anterior. Sin esto no se pinta el boton de atras. */
  onBack?: () => void;
  /** Accion principal: continuar al siguiente paso o enviar la solicitud. */
  onPrimary?: () => void;
  /**
   * `true` cuando esta pantalla es la que envia la solicitud.
   *
   * Ojo: en el resumen esto casi nunca es `true`. 69 de 72 landings activas
   * tienen seguros despues del wizard, asi que ahi el boton dice "Continuar" y
   * el envio ocurre en /complementos.
   */
  isLastStep?: boolean;
  /**
   * Hay una operacion en curso: deshabilita los botones para evitar el doble
   * click. NO implica que se este enviando la solicitud.
   *
   * En el resumen de una landing con complementos, `handleSummarySubmit` levanta
   * su flag local antes de navegar a /complementos (`StepClient.tsx:561`), y ahi
   * no se envia nada: solo se cambia de pagina.
   */
  isBusy?: boolean;
  /**
   * La solicitud se esta enviando de verdad. Solo entonces el boton cambia a
   * spinner + `submitMessage`.
   *
   * Se separa de `isBusy` porque mostrar "Enviando..." en un paso intermedio le
   * dice al usuario que ya termino cuando todavia le faltan pantallas -- que es
   * justo la confusion que este componente vino a resolver.
   */
  isSubmitting?: boolean;
  canProceed?: boolean;
  /** Mensaje de progreso durante el envio ("Creando solicitud...", etc). */
  submitMessage?: string;
  /**
   * Fuerza esconderlo. Se usa con la animacion de celebracion entre pasos
   * (`StepSuccessMessage`), que es `fixed inset-0 z-50` con fondo blanco: el CTA
   * queda debajo por z-index, pero desmontarlo evita que asome por el borde del
   * safe-area y que se pueda pulsar mientras corre la transicion.
   */
  oculto?: boolean;
  /**
   * El CTA va pegado al borde inferior y la barra de producto queda ENCIMA.
   *
   * Es el orden inverso al del resto del flujo, donde el CTA se apila sobre la
   * barra. Se usa en la intro embebida de segundo financiamiento. Levantar la
   * barra es responsabilidad de quien la monta, vía su prop `offsetInferior`.
   * @default false
   */
  debajoDeLaBarra?: boolean;
}

export const MobileStickyCta: React.FC<MobileStickyCtaProps> = ({
  onBack,
  onPrimary,
  isLastStep = false,
  isBusy = false,
  isSubmitting = false,
  canProceed = true,
  submitMessage,
  oculto = false,
  debajoDeLaBarra = false,
}) => {
  const { isProductBarExpanded, getAllProducts } = useProduct();
  const tecladoAbierto = useTecladoVirtualAbierto();

  // El spinner de envio solo tiene sentido en la pantalla que envia. Si no,
  // "Enviando..." aparece en un paso intermedio y miente sobre el progreso.
  const mostrandoEnvio = isSubmitting && isLastStep;
  const deshabilitado = isBusy || isSubmitting || !canProceed;

  /**
   * El alto real del CTA, publicado como variable CSS, por el mismo motivo que
   * la barra publica el suyo: con `debajoDeLaBarra` hay algo apilado encima y
   * un `68px` sería otra suposición — el alto cambia con el safe-area y con el
   * texto del botón.
   *
   * Va ANTES de los early returns: los hooks van siempre arriba, o se rompe el
   * orden de hooks cuando el componente retorna `null` por teclado o por drawer.
   */
  const ctaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const nodo = ctaRef.current;
    const raiz = document.documentElement;
    if (!nodo) {
      // Desmontado (teclado, drawer, celebración): lo que se apilaba encima
      // tiene que volver a su sitio, no quedarse flotando sobre un hueco.
      raiz.style.removeProperty('--sticky-cta-height');
      return;
    }
    const medir = () => raiz.style.setProperty('--sticky-cta-height', `${nodo.offsetHeight}px`);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(nodo);
    return () => {
      ro.disconnect();
      raiz.style.removeProperty('--sticky-cta-height');
    };
  }, [oculto, isProductBarExpanded, tecladoAbierto]);

  if (oculto) return null;

  // Con el drawer abierto el overlay lo taparia: mejor no pintarlo.
  if (isProductBarExpanded) return null;

  // Mientras se escribe, el teclado ocupa la mitad de abajo: el CTA quedaria
  // detras (iOS no encoge el layout viewport) y encima puede tapar el campo.
  // Al cerrarse el teclado vuelve solo. La navegacion en flujo sigue existiendo
  // al final del formulario, asi que nunca queda sin salida.
  if (tecladoAbierto) return null;

  // Sin productos la barra del producto no se monta, asi que el CTA se apoya
  // directo en el borde inferior.
  const hayBarraProducto = getAllProducts().length > 0;

  return (
    // Ojo: nada de la clase Tailwind `bottom-0` acá. El CSS de las landings
    // gamer selecciona `.fixed.bottom-0` con `!important` para pintar la barra
    // de producto (`StepClient.tsx:1232`, `:1250`,
    // `complementosClient.tsx:560-587`, `:638`); hoy no alcanza al CTA
    // justamente porque su `bottom` es inline. Con la clase, el CTA heredaría
    // el fondo oscuro de esas landings.
    <div
      ref={ctaRef}
      className="lg:hidden fixed left-0 right-0 z-[45] bg-white border-t border-neutral-200
                 px-4 py-3 shadow-[0_-8px_24px_rgba(16,24,40,0.10)]"
      style={posicionDelCta({ debajoDeLaBarra, hayBarraProducto })}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isBusy || isSubmitting}
            aria-label="Atrás"
            className="flex-shrink-0 flex items-center justify-center px-4 py-3 rounded-xl
                       border border-neutral-300 text-neutral-600
                       transition-colors cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onPrimary}
          disabled={deshabilitado}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                     bg-[var(--color-primary)] text-white font-semibold
                     shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)]
                     hover:brightness-90 transition-[filter] cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mostrandoEnvio ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{submitMessage || 'Enviando...'}</span>
            </>
          ) : isLastStep ? (
            <>
              <Send className="w-5 h-5" />
              <span>Enviar Solicitud</span>
            </>
          ) : (
            <>
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * Reserva el alto del CTA para que el ultimo bloque de contenido no quede
 * debajo. Va JUNTO a `SelectedProductSpacer`, que reserva lo de la barra del
 * producto -- este suma solo lo del CTA.
 *
 * El alto sale de `--sticky-cta-height`, que publica el propio CTA mientras
 * esta montado. El `68px` es solo el fallback para el primer pintado y para
 * cuando el CTA esta desmontado (teclado, drawer, celebracion).
 */
export const MobileStickyCtaSpacer: React.FC = () => (
  <div className="lg:hidden" style={{ height: 'var(--sticky-cta-height, 68px)' }} />
);

export default MobileStickyCta;
