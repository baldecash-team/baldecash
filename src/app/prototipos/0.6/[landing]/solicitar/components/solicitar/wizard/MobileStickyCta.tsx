'use client';

/**
 * MobileStickyCta - Accion principal fija en movil para las pantallas del final
 * del flujo (resumen y complementos).
 *
 * El problema que resuelve (reportado por Marco, 26-ago): en el resumen el
 * usuario ve sus datos agrupados, cada bloque con "Editar", y abajo la barra
 * fija del producto. Todo eso se lee como un comprobante ya emitido, y el boton
 * que continua queda a dos o tres scrolls. Promotores y clientes abandonan
 * creyendo que ya enviaron.
 *
 * Se apila SOBRE `SelectedProductBar` (que es `fixed bottom-0 z-40` y mide
 * 72px), asi que usa `bottom` para dejarla libre y un z-index por encima.
 *
 * Se OCULTA cuando el drawer del producto esta expandido: ese drawer monta un
 * overlay `fixed inset-0` con backdrop-blur y crece hasta `60vh`, asi que
 * competir con el deja el CTA borroso detras del velo. El estado vive en
 * ProductContext (`isProductBarExpanded`), no hace falta levantarlo.
 *
 * Solo movil: en desktop la barra del producto no es fija (`hidden lg:block`)
 * y la navegacion en flujo se ve sin scrollear.
 */

import React from 'react';
import { ArrowLeft, Send, ArrowRight, Loader2 } from 'lucide-react';
import { useProduct } from '../../../context/ProductContext';
import { useTecladoVirtualAbierto } from '../../../hooks/useTecladoVirtualAbierto';

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
}

export const MobileStickyCta: React.FC<MobileStickyCtaProps> = ({
  onBack,
  onPrimary,
  isLastStep = false,
  isSubmitting = false,
  canProceed = true,
  submitMessage,
  oculto = false,
}) => {
  const { isProductBarExpanded, getAllProducts } = useProduct();
  const tecladoAbierto = useTecladoVirtualAbierto();

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
    <div
      className="lg:hidden fixed left-0 right-0 z-[45] bg-white border-t border-neutral-200
                 px-4 py-3 shadow-[0_-8px_24px_rgba(16,24,40,0.10)]"
      style={{
        bottom: hayBarraProducto
          ? 'calc(72px + env(safe-area-inset-bottom))'
          : 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
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
          disabled={isSubmitting || !canProceed}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                     bg-[var(--color-primary)] text-white font-semibold
                     shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)]
                     hover:brightness-90 transition-[filter] cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
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
 * debajo. Va JUNTO a `SelectedProductSpacer`, que ya reserva los 72px de la
 * barra del producto -- este suma solo lo del CTA.
 */
export const MobileStickyCtaSpacer: React.FC = () => (
  <div className="lg:hidden" style={{ height: '68px' }} />
);

export default MobileStickyCta;
