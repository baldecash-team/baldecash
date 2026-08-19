'use client';

/**
 * Selección de institución.
 *
 * Primera pantalla del producto de matrícula: reemplaza al catálogo. Guarda la
 * institución elegida y pasa a la calculadora.
 */

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Info, ChevronRight } from 'lucide-react';
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
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          ¿En qué universidad estudias?
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Elige tu institución para continuar con tu financiamiento.
        </p>
      </div>

      {proximos.length > 0 && (
        <p className="mb-6 flex gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm leading-relaxed text-indigo-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <span>
            Por ahora, el financiamiento de matrícula está disponible solo para alumnos de{' '}
            <strong className="font-semibold">{enumerar(disponibles)}</strong>. Estamos trabajando
            para sumar a {enumerar(proximos)} próximamente.
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
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
                institucion.disponible
                  ? 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40'
                  : 'cursor-not-allowed border-slate-100 bg-slate-50'
              }`}
            >
              <span
                className={
                  institucion.disponible
                    ? 'text-base font-semibold text-slate-900'
                    : 'text-base font-medium text-slate-400'
                }
              >
                {institucion.nombre}
              </span>

              <span className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    institucion.disponible
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {institucion.disponible ? 'Disponible' : 'Próximamente'}
                </span>
                {institucion.disponible && (
                  <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => router.push(routes.landingHome(landing))}
        className="mt-6 w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
      >
        ← Volver al inicio
      </button>
    </main>
  );
}

export default UniversidadClient;
