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
import { getLandingInsurances } from '@/app/prototipos/0.6/services/landingApi';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useSessionOptional } from '../../../context/SessionContext';
import type { InsurancePlan } from '../../../types/upsell';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';

export interface PlanesDeSeguro {
  planes: InsurancePlan[];
  cargando: boolean;
  /**
   * El pedido de planes para el equipo de ahora TERMINÓ (con planes, sin
   * planes o con error). Es lo único que autoriza a decir "no hay planes":
   * en el primer render con `activo`, `planes` está vacío porque todavía no se
   * pidió nada, no porque no haya.
   */
  cargado: boolean;
  /** Ids de los planes elegidos (los de `ProductContext`). */
  elegidos: string[];
  /** Agrega o quita un plan, con su evento de analítica. */
  alternar: (planId: string) => void;
  /** Tipo de equipo del producto activo ("Laptop", "Celular"…). */
  tipoDeEquipo: string;
}

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
  const seVaAPedir = activo && !isRefurbished && !!productPrice;
  const cargado = seVaAPedir && cargadoPara === clave;
  const isLoading = seVaAPedir && !cargado;

  useEffect(() => {
    if (!activo) {
      setInsurancePlans([]);
      setCargadoPara(null);
      return;
    }

    // Seminuevos: no se ofrecen seguros en ninguna landing.
    if (isRefurbished) {
      setInsurancePlans([]);
      setAvailableMultiasistencia(null);
      setCargadoPara(null);
      return;
    }

    if (!productPrice) return;

    let cancelado = false;
    async function fetchInsurancePlans() {
      try {
        const formattedDeviceType = deviceType.charAt(0).toUpperCase() + deviceType.slice(1).toLowerCase();
        const plans = await getLandingInsurances(landing, formattedDeviceType, productPrice, termMonths, previewKey, sessionUuid);
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
      } catch (error) {
        if (cancelado) return;
        console.error('Error fetching insurance plans:', error);
        Sentry.captureException(error, {
          tags: { modulo: 'seguros', accion: 'cargar_planes', landing },
          extra: { device_type: deviceType, product_price: productPrice, term_months: termMonths ?? null },
        });
        setInsurancePlans([]);
        setAvailableMultiasistencia(null);
      } finally {
        if (!cancelado) setCargadoPara(clave);
      }
    }

    fetchInsurancePlans();
    return () => {
      cancelado = true;
    };
  }, [activo, isRefurbished, landing, deviceType, productPrice, termMonths, previewKey, sessionUuid, setAvailableMultiasistencia, clave]);

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
    planes: insurancePlans,
    cargando: isLoading,
    cargado,
    elegidos: selectedInsurances.map(i => i.id),
    alternar,
    tipoDeEquipo: deviceType,
  };
}
