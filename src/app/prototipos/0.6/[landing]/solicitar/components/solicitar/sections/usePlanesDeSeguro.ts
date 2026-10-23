'use client';

/**
 * Los planes de seguro de la landing y la selección de la persona.
 *
 * Es la lógica que vivía dentro de `InsuranceSection` (`/complementos`),
 * sacada a un hook para que el Paso 4 de Diseño 2 (BAL-4966) use la MISMA:
 * mismo endpoint (`/public/landing/{slug}/insurances`), misma regla de
 * seminuevos, misma Multiasistencia disponible, mismo estado en
 * `ProductContext` y la misma analítica al agregar o quitar. Solo cambia
 * cómo se dibuja.
 */

import { useCallback, useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useParams } from 'next/navigation';
import { useProduct } from '../../../context/ProductContext';
import { isRefurbishedCondition } from '@/app/prototipos/0.6/components/RefurbishedWarningModal';
import { obtenerPlanesDeSeguro } from '@/app/prototipos/0.6/services/landingApi';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useSessionOptional } from '../../../context/SessionContext';
import type { InsurancePlan } from '../../../types/upsell';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';

export interface PlanesDeSeguro {
  planes: InsurancePlan[];
  cargando: boolean;
  /**
   * El pedido de planes para el equipo de ahora TERMINÓ BIEN (con planes o
   * sin planes). Es lo único que autoriza a decir "no hay planes": en el
   * primer render con `activo`, `planes` está vacío porque todavía no se pidió
   * nada, no porque no haya. Un error NO cuenta como cargado (ver `error`).
   */
  cargado: boolean;
  /**
   * El pedido de planes para el equipo de ahora FALLÓ (tras un reintento
   * automático). No dice nada de si hay planes: la selección se conserva
   * (`ProductContext` persiste, y soltarla por un corte de red pasajero la
   * borraría para siempre).
   */
  error: boolean;
  /** Vuelve a pedir los planes (el botón "Reintentar"). */
  reintentar: () => void;
  /** Ids de los planes elegidos (los de `ProductContext`). */
  elegidos: string[];
  /** Agrega o quita un plan, con su evento de analítica. */
  alternar: (planId: string) => void;
  /** Tipo de equipo del producto activo ("Laptop", "Celular"…). */
  tipoDeEquipo: string;
}

/** Espera antes del reintento automático, cuando el primer pedido falla. */
export const ESPERA_REINTENTO_PLANES_MS = 500;

/**
 * @param activo Sin esto no se pide nada (la landing no ofrece seguros en esta
 *   pantalla). `InsuranceSection` siempre lo pasa en `true`.
 */
export function usePlanesDeSeguro(activo = true): PlanesDeSeguro {
  const params = useParams();
  const landing = (params?.landing as string) || 'home';

  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;
  const session = useSessionOptional();
  const sessionUuid = session?.sessionUuid ?? null;

  const { selectedInsurances, toggleInsurance, clearInsurance, selectedProduct, cartProducts, setAvailableMultiasistencia } = useProduct();
  const analytics = useAnalytics();

  const activeProduct = cartProducts?.[0] || selectedProduct;
  const deviceType = activeProduct?.type || 'Laptop';
  const productPrice = activeProduct?.price || 0;
  const termMonths = activeProduct?.months;

  // Regla de negocio (todas las landings): a los equipos SEMINUEVOS no se les
  // ofrece seguro. Detectamos por condición o por el nombre ("Semi Nuevo").
  const isRefurbished =
    isRefurbishedCondition(activeProduct?.condition) ||
    /semi\s*nuevo|seminuevo|reacondicion/i.test(`${activeProduct?.shortName ?? ''} ${activeProduct?.name ?? ''}`);

  // Si el producto activo es seminuevo, limpiamos cualquier seguro que hubiera
  // quedado seleccionado (ej. al cambiar de un equipo nuevo a uno seminuevo).
  useEffect(() => {
    if (activo && isRefurbished) clearInsurance();
  }, [activo, isRefurbished, clearInsurance]);

  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  // De qué pedido son los planes que hay: `cargado` y `cargando` se calculan
  // contra el pedido de AHORA en el mismo render, sin esperar a un efecto
  // (BAL-4966, revisión I-2: con un flag que se prende en el efecto, el primer
  // render veía "no cargando y sin planes" y soltaba una selección válida).
  const clave = JSON.stringify([landing, deviceType, productPrice, termMonths ?? null, previewKey, sessionUuid]);
  const [cargadoPara, setCargadoPara] = useState<string | null>(null);
  // Mismo truco para el error: es del pedido de AHORA. Si cambia el equipo o
  // el plazo, el error viejo deja de valer y se vuelve a pedir.
  const [errorPara, setErrorPara] = useState<string | null>(null);
  // "Reintentar" sube este número para relanzar el pedido con la misma clave.
  const [intento, setIntento] = useState(0);
  const seVaAPedir = activo && !isRefurbished && !!productPrice;
  const cargado = seVaAPedir && cargadoPara === clave;
  const error = seVaAPedir && !cargado && errorPara === clave;
  const isLoading = seVaAPedir && !cargado && !error;

  const reintentar = useCallback(() => {
    setErrorPara(null);
    setIntento((n) => n + 1);
  }, []);

  // Apagado o seminuevo: no se pide nada. Los planes que se muestran salen
  // de `seVaAPedir` (abajo), sin resetear estado dentro del efecto.
  useEffect(() => {
    if (!activo) return;

    // Seminuevos: no se ofrecen seguros en ninguna landing.
    if (isRefurbished) {
      setAvailableMultiasistencia(null);
      return;
    }

    if (!productPrice) return;

    let cancelado = false;
    // El temporizador del reintento: se limpia al desmontar o al cambiar la
    // clave (menor 11 de la revisión final, BAL-4969). La promesa que espera
    // queda sin resolver y se descarta; `cancelado` ya cortaba el resto.
    let temporizadorReintento: ReturnType<typeof setTimeout> | undefined;
    async function fetchInsurancePlans() {
      const formattedDeviceType = deviceType.charAt(0).toUpperCase() + deviceType.slice(1).toLowerCase();
      const pedir = () => obtenerPlanesDeSeguro(landing, formattedDeviceType, productPrice, termMonths, previewKey, sessionUuid);
      try {
        let plans: Awaited<ReturnType<typeof obtenerPlanesDeSeguro>>;
        try {
          plans = await pedir();
        } catch {
          // Un reintento automático antes de mostrar el error: la mayoría de
          // los cortes son de un instante.
          await new Promise((r) => {
            temporizadorReintento = setTimeout(r, ESPERA_REINTENTO_PLANES_MS);
          });
          if (cancelado) return;
          plans = await pedir();
        }
        if (cancelado) return;
        // El rollout de la Multiasistencia (A365) lo decide el BACKEND, por landing
        // (`MULTIASISTENCIA_LANDING_SLUGS` en insurance_listing_service.py y
        // public/landing.py). Acá había un `landing === 'copia-home'` hardcodeado que
        // la filtraba aunque el backend la devolviera: al habilitar `home-2` el
        // endpoint empezó a mandar MA-24 y la tarjeta seguía sin aparecer. Un gate
        // duplicado en el cliente sólo puede desincronizarse del servidor, así que se
        // confía en lo que llega.
        const mappedPlans: InsurancePlan[] = plans
          .map((plan) => ({
          id: plan.id,
          code: plan.code,
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          totalPrice: plan.totalPrice,
          paymentMonths: plan.paymentMonths,
          insuranceType: plan.insuranceType,
          tier: plan.tier,
          isRecommended: plan.isRecommended,
          coverage: plan.coverage,
          exclusions: plan.exclusions,
          durationMonths: plan.durationMonths,
          provider: plan.provider,
          // BAL-2338: imagen del tipo de seguro (insurance_category.image_url) para
          // el flujo regular. El backend ya la envía; antes se descartaba aquí.
          imageUrl: plan.imageUrl ?? null,
        }));
        setInsurancePlans(mappedPlans);
        setAvailableMultiasistencia(mappedPlans.find(p => p.insuranceType === 'multiasistencia') ?? null);
        setErrorPara(null);
        setCargadoPara(clave);
      } catch (error) {
        if (cancelado) return;
        console.error('Error fetching insurance plans:', error);
        Sentry.captureException(error, {
          tags: { modulo: 'seguros', accion: 'cargar_planes', landing },
          extra: { device_type: deviceType, product_price: productPrice, term_months: termMonths ?? null },
        });
        // NO se marca `cargado`: un error no prueba que no haya planes, y
        // marcarlo soltaría la selección (BAL-4966). Queda `error` para que
        // la pantalla avise y ofrezca "Reintentar".
        setInsurancePlans([]);
        setAvailableMultiasistencia(null);
        setErrorPara(clave);
      }
    }

    fetchInsurancePlans();
    return () => {
      cancelado = true;
      clearTimeout(temporizadorReintento);
    };
  }, [activo, isRefurbished, landing, deviceType, productPrice, termMonths, previewKey, sessionUuid, setAvailableMultiasistencia, clave, intento]);

  const alternar = useCallback(
    (planId: string) => {
      const plan = insurancePlans.find(p => p.id === planId);
      if (!plan) return;
      const wasSelected = selectedInsurances.some((i) => i.id === planId);
      analytics.trackInsuranceToggle({
        insurance_id: String(plan.id),
        insurance_name: plan.name,
        active: !wasSelected,
        monthly_price: plan.monthlyPrice ?? null,
      });
      toggleInsurance(plan);
    },
    [insurancePlans, selectedInsurances, analytics, toggleInsurance],
  );

  return {
    planes: seVaAPedir ? insurancePlans : [],
    cargando: isLoading,
    cargado,
    error,
    reintentar,
    elegidos: selectedInsurances.map(i => i.id),
    alternar,
    tipoDeEquipo: deviceType,
  };
}
