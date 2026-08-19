'use client';

/**
 * Selección de institución.
 *
 * Primera pantalla del producto de matrícula: reemplaza al catálogo. Guarda la
 * institución elegida y pasa a la calculadora.
 *
 * Monta el mismo cromo que el resto del sitio —barra superior y pie— porque el
 * layout de `[landing]` no los pone: es una capa de control de acceso, y cada
 * pantalla arma su propio marco. Sin eso la página queda flotando sobre el fondo
 * del documento.
 */

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Info, ChevronRight, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { routes } from '../../utils/routes';
import { guardarInstitucion } from '../calculadora/utils/entrega';
import {
  INSTITUCIONES,
  nombresDisponibles,
  nombresProximos,
  type InstitucionOfrecida,
} from './types/instituciones';

/** Une nombres con comas y una "y" final, para el aviso. */
function enumerar(nombres: string[]): string {
  if (nombres.length <= 1) return nombres[0] ?? '';
  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
}

export function UniversidadClient() {
  const router = useRouter();
  const parametros = useParams();
  const landing = (parametros?.landing as string) || 'home';
  const { navbarProps, footerData, agreementData } = useLayout();

  const alElegir = useCallback(
    (institucion: InstitucionOfrecida) => {
      if (!institucion.disponible) return;
      guardarInstitucion(landing, institucion.id, institucion.nombre);
      router.push(routes.calculadora(landing));
    },
    [landing, router]
  );

  const disponibles = nombresDisponibles();
  const proximos = nombresProximos();

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <Navbar
        landing={landing}
        promoBannerData={navbarProps?.promoBannerData}
        logoUrl={navbarProps?.logoUrl}
        logoClassName={navbarProps?.logoClassName}
        customerPortalUrl={navbarProps?.customerPortalUrl}
        portalButtonText={navbarProps?.portalButtonText}
        navbarItems={navbarProps?.navbarItems}
        megamenuItems={navbarProps?.megamenuItems}
        activeSections={navbarProps?.activeSections || []}
        institutionLogo={navbarProps?.institutionLogo}
        institutionName={navbarProps?.institutionName}
      />

      {/* Espaciador dinámico: sigue a --header-total-height, que expone el Navbar. */}
      <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-14 pb-24 lg:pb-12">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-2 sm:mb-3 font-['Baloo_2',_sans-serif] leading-tight">
            ¿En qué universidad estudias?
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-xl mx-auto px-2">
            Elige tu institución para continuar con tu financiamiento.
          </p>
        </div>

        {proximos.length > 0 && (
          <p className="mb-6 flex gap-2 rounded-xl bg-[rgba(var(--color-primary-rgb),0.08)] px-4 py-3 text-sm leading-relaxed text-neutral-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
            <span>
              Por ahora, el financiamiento de matrícula está disponible solo para alumnos de{' '}
              <strong className="font-semibold text-neutral-800">{enumerar(disponibles)}</strong>.
              Estamos trabajando para sumar a {enumerar(proximos)} próximamente.
            </span>
          </p>
        )}

        <ul className="space-y-3">
          {INSTITUCIONES.map((institucion) => (
            <li key={institucion.id}>
              <button
                type="button"
                onClick={() => alElegir(institucion)}
                disabled={!institucion.disponible}
                aria-label={
                  institucion.disponible
                    ? `Elegir ${institucion.nombre}`
                    : `${institucion.nombre}, próximamente`
                }
                className={`flex w-full items-center justify-between gap-4 rounded-xl border bg-white px-5 py-4 text-left transition-colors ${
                  institucion.disponible
                    ? 'border-neutral-200 hover:border-[var(--color-primary)] cursor-pointer'
                    : 'cursor-not-allowed border-neutral-100 bg-neutral-50'
                }`}
              >
                <span
                  className={
                    institucion.disponible
                      ? 'text-base font-semibold text-neutral-800'
                      : 'text-base font-medium text-neutral-400'
                  }
                >
                  {institucion.nombre}
                </span>

                <span className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      institucion.disponible
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {institucion.disponible ? 'Disponible' : 'Próximamente'}
                  </span>
                  {institucion.disponible && (
                    <ChevronRight className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => router.push(routes.landingHome(landing))}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3 text-neutral-500 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al inicio</span>
        </button>
      </div>

      <Footer data={footerData} landing={landing} agreementData={agreementData} />
    </div>
  );
}

export default UniversidadClient;
