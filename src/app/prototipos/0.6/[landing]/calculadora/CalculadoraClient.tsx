'use client';

/**
 * Calculadora de efectivo — monto/plazo/inicial en vivo, con cuota calculada
 * SIEMPRE por ws2 (`simulateCalculadora`). El FE nunca calcula la cuota, solo
 * la muestra. Al continuar, siembra el contexto de producto seleccionado del
 * flujo de solicitud (mismo mecanismo que `ProductDetail.tsx`: localStorage
 * bajo la key `getStorageKey(landing)`, luego `router.push(routes.solicitar)`)
 * y el usuario completa la solicitud normalmente — no se llama a submit aquí.
 */

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Wallet } from 'lucide-react';
import type { CalculadoraConfig } from '../../types/landingConfig';
import { simulateCalculadora, type CalculadoraSimulation } from '../../services/calculadoraApi';
import { routes } from '../../utils/routes';
import { formatMoneyNoDecimals } from '../solicitar/utils/formatMoney';
import type { SelectedProduct } from '../solicitar/context/ProductContext';
import LayoutContext from '../context/LayoutContext';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { NvidiaNavbar } from '@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { isNvidiaLanding } from '@/app/prototipos/0.6/utils/theme';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';

// Misma key que usa ProductContext / ProductDetail para el producto
// seleccionado del flujo de solicitud (duplicada intencionalmente aquí, como
// en ambos archivos — no hay un módulo compartido para esto en el codebase).
const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;
const getCartProductsKey = (landing: string) => `baldecash-${landing}-solicitar-cart-products`;

const DEBOUNCE_MS = 350;

interface CalculadoraClientProps {
  landing: string;
  config: CalculadoraConfig;
}

/**
 * Chrome compartido con el resto del sitio (navbar + footer + fondo neutro),
 * igual que `KycChrome` en `kycClient.tsx`. A diferencia de `useLayout()` (que
 * lanza si no hay `LayoutProvider` ancestro), acá se lee el contexto
 * directamente: en la app real siempre corre bajo `[landing]/layout.tsx`
 * (que sí provee `LayoutProvider`), pero esto permite que `CalculadoraClient`
 * se renderice de forma aislada en tests unitarios sin tener que mockear todo
 * el layout — solo se pierde el chrome, no el contenido.
 */
function CalculadoraChrome({ landing, children }: { landing: string; children: React.ReactNode }) {
  const layout = useContext(LayoutContext);

  if (!layout) {
    return <>{children}</>;
  }

  const { navbarProps, footerData, agreementData, isLoading, hasError } = layout;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <CubeGridSpinner />
      </div>
    );
  }

  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-50 relative">
        {isNvidiaLanding(landing)
          ? <NvidiaNavbar landing={landing} />
          : <Navbar {...navbarProps} landing={landing} />}
        {/* Spacer — alto dinámico del navbar fijo. */}
        <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />

        <main className="flex items-start justify-center px-4 pb-16 pt-6 min-h-[60vh]">
          {children}
        </main>
      </div>
      <Footer data={footerData} landing={landing} agreementData={agreementData} />
    </>
  );
}

export function CalculadoraClient({ landing, config }: CalculadoraClientProps) {
  const router = useRouter();

  const [monto, setMonto] = useState(config.monto.min);
  const [plazo, setPlazo] = useState<number | null>(config.plazos[0] ?? null);
  const [inicialPercent, setInicialPercent] = useState(config.inicial.percents[0] ?? 0);
  const [sim, setSim] = useState<CalculadoraSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cuota en vivo (debounced) — ws2 es la fuente de verdad, el FE nunca calcula.
  useEffect(() => {
    if (plazo == null) return;
    let cancelled = false;

    const runSimulation = () => {
      setError(null);
      setIsSimulating(true);
      Promise.resolve(simulateCalculadora(landing, { monto, plazo, inicialPercent }))
        .then((result) => {
          if (cancelled) return;
          setSim(result ?? null);
          setIsSimulating(false);
        })
        .catch(() => {
          if (cancelled) return;
          setSim(null);
          setIsSimulating(false);
          setError('No se pudo calcular la cuota. Intenta de nuevo.');
        });
    };

    const timer = setTimeout(runSimulation, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [landing, monto, plazo, inicialPercent]);

  const canContinue = !!sim && !error && plazo != null && config.efectivoProductId != null;

  const handleContinuar = () => {
    if (!canContinue || !sim || plazo == null) return;

    // "product_data" efectivo, en la misma forma que ProductDetail.tsx guarda
    // para el flujo de solicitud (SelectedProduct). Mapeo:
    //   monto           -> price (unit_price del "producto" efectivo)
    //   plazo            -> months / term (payment_frequency siempre mensual)
    //   inicialPercent   -> initialPercent
    //   sim.inicialAmount-> initialAmount (calculado por ws2, no por el FE)
    //   sim.cuota        -> monthlyPayment
    //   efectivoProductId-> id (el Product efectivo por-landing, ver A5 en ws2)
    // Sin slug/paymentPlans/specs/variant: no aplican a un préstamo en efectivo.
    const selectedProduct: SelectedProduct = {
      id: String(config.efectivoProductId),
      name: 'Préstamo en efectivo',
      shortName: 'Efectivo',
      brand: 'BaldeCash',
      price: Math.floor(monto),
      monthlyPayment: Math.floor(sim.cuota),
      months: plazo,
      term: plazo,
      initialPercent: inicialPercent,
      initialAmount: Math.floor(sim.inicialAmount),
      image: '',
      type: 'efectivo',
      paymentFrequency: 'mensual',
    };

    try {
      localStorage.setItem(getStorageKey(landing), JSON.stringify(selectedProduct));
      // Igual que ProductDetail.tsx: una selección de producto único limpia el carrito.
      localStorage.removeItem(getCartProductsKey(landing));
    } catch {
      // localStorage no disponible (SSR / sandbox) — continuar de todas formas.
    }

    router.push(routes.solicitar(landing));
  };

  return (
    <CalculadoraChrome landing={landing}>
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white border border-neutral-200 shadow-sm px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#4654CD]" />
          <h1 className="text-lg font-semibold text-neutral-900">Calcula tu préstamo en efectivo</h1>
        </div>

        <div className="space-y-2">
          <label htmlFor="calculadora-monto" className="flex items-center justify-between text-sm font-medium text-neutral-700">
            <span>Monto</span>
            <span className="text-[#4654CD] font-semibold">S/ {formatMoneyNoDecimals(monto)}</span>
          </label>
          <input
            id="calculadora-monto"
            type="range"
            min={config.monto.min}
            max={config.monto.max}
            step={config.monto.step}
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
            className="w-full accent-[#4654CD]"
          />
          <div className="flex justify-between text-xs text-neutral-500">
            <span>S/ {formatMoneyNoDecimals(config.monto.min)}</span>
            <span>S/ {formatMoneyNoDecimals(config.monto.max)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">Plazo</p>
          <div className="flex flex-wrap gap-2">
            {config.plazos.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlazo(p)}
                aria-pressed={plazo === p}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  plazo === p
                    ? 'border-[#4654CD] bg-[#4654CD]/10 text-[#4654CD] font-semibold'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                {p} meses
              </button>
            ))}
          </div>
        </div>

        {config.inicial.percents.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">Inicial</p>
            <div className="flex flex-wrap gap-2">
              {config.inicial.percents.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setInicialPercent(pct)}
                  aria-pressed={inicialPercent === pct}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    inicialPercent === pct
                      ? 'border-[#4654CD] bg-[#4654CD]/10 text-[#4654CD] font-semibold'
                      : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {pct === 0 ? 'Sin inicial' : `Inicial ${pct}%`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 min-h-[4.5rem] flex flex-col justify-center">
          {error ? (
            <p className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          ) : sim ? (
            <>
              <p className="text-sm text-neutral-600">Tu cuota mensual</p>
              <p className="text-2xl font-bold text-neutral-900">
                S/ {formatMoneyNoDecimals(sim.cuota)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                TEA {sim.tea.toFixed(1)}% · TCEA {sim.tcea.toFixed(1)}%
              </p>
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
              {isSimulating ? 'Calculando tu cuota…' : 'Elige un plazo para calcular tu cuota'}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleContinuar}
          disabled={!canContinue}
          className="w-full px-4 py-3 rounded-xl bg-[#4654CD] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          Continuar
        </button>
      </div>
    </CalculadoraChrome>
  );
}
