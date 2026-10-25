'use client';

/**
 * `/solicitar` en Diseño 2 (BAL-4969, casuísticas).
 *
 * La intro de Diseño 1 no existe en Diseño 2: quien llega a `/solicitar` por
 * una puerta lateral (comparador, "Retomar", calculadora, copia-home, quiz,
 * una landing sin catálogo o un link directo) ve el MISMO modal "Lo quiero"
 * que abre la card del catálogo, con lo que el modal exige (términos,
 * accesorios, cupón), y de ahí pasa al Paso 1. Así no se arma un flujo
 * híbrido (intro de Diseño 1 + pasos de Diseño 2).
 *
 * Cerrar el modal devuelve a la puerta por la que se entró
 * (`irALaSolicitud` la guarda) o, sin ella, al catálogo. Sin equipo elegido
 * no hay nada que ofrecer: va directo al catálogo, igual que la intro.
 */

import React, { useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { LoQuieroModal } from '@/app/prototipos/0.6/components/lo-quiero/LoQuieroModal';
import { leerEntradaALaSolicitud } from '@/app/prototipos/0.6/components/diseno-2/origenDiseno2';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useProduct } from './context/ProductContext';

/** A dónde sale la persona si cierra el modal (o si no hay equipo). */
export function salidaDeLaEntrada(landing: string): string {
  return leerEntradaALaSolicitud(landing) || routes.catalogo(landing);
}

export function EntradaSolicitudV2() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const { navbarProps, isLoading, hasError } = useLayout();
  const { selectedProduct, cartProducts, isHydrated } = useProduct();
  const hayEquipo = !!selectedProduct || cartProducts.length > 0;

  // Sin equipo no hay solicitud que empezar: al catálogo (como la intro).
  useEffect(() => {
    if (isHydrated && !hayEquipo) router.replace(salidaDeLaEntrada(landing));
  }, [isHydrated, hayEquipo, router, landing]);

  const salir = useCallback(() => router.replace(salidaDeLaEntrada(landing)), [router, landing]);

  if (isLoading || !isHydrated || !hayEquipo) {
    return (
      <div className="min-h-screen bg-[var(--d2-fondo)] flex items-center justify-center">
        <CubeGridSpinner />
      </div>
    );
  }
  if (hasError || !navbarProps) return <NotFoundContent homeUrl={routes.home()} />;

  return (
    <div className="min-h-screen bg-[var(--d2-fondo)]" data-entrada-solicitud-v2>
      <Navbar {...navbarProps} landing={landing} />
      <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />
      <LoQuieroModal isOpen onClose={salir} origen="entrada" />
    </div>
  );
}

export default EntradaSolicitudV2;
