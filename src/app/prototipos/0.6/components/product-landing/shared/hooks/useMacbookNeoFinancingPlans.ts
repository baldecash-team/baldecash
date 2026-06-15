'use client';

import { useEffect, useState } from 'react';
import { getCatalogProducts } from '@/app/prototipos/0.6/services/catalogApi';
import { financingPlans as staticPlans } from '../../data/v5Data';
import type { V5FinancingPlan, V5PlanColorOption } from '../../types/v5Types';
import type { ApiColorSibling, ApiCatalogProduct } from '@/app/prototipos/0.6/services/catalogApi';

// Mapeo copy de marketing por plan (lo que el API no sabe)
const PLAN_COPY: Record<string, Pick<V5FinancingPlan, 'id' | 'nombre' | 'subtitulo' | 'descripcion' | 'icono' | 'imagen' | 'ahorroText' | 'colorAccent' | 'destacado' | 'items'>> = {
  esencial: {
    id: 'esencial',
    nombre: 'Esencial',
    subtitulo: 'Pack entrada',
    descripcion: 'MacBook Neo 256GB',
    icono: 'Zap',
    imagen: 'https://baldecash.s3.amazonaws.com/images/macbook-neo/plan-esencial.jpeg',
    items: [
      'Procesador A18 Pro · 6-core CPU',
      '256GB SSD',
      'Pantalla Liquid Retina 13" · 500 nits',
      'Apple Intelligence',
      'Envío gratis a todo el Perú',
    ],
    ahorroText: '',
    colorAccent: '#B8B8B8',
  },
  premium: {
    id: 'premium',
    nombre: 'Combo Apple',
    subtitulo: 'Pack premium',
    descripcion: 'MacBook Neo 256GB + AirPods',
    icono: 'Crown',
    imagen: 'https://baldecash.s3.amazonaws.com/images/macbook-neo/plan-premium.jpeg',
    items: [
      'Procesador A18 Pro · Máximo rendimiento',
      '256GB SSD',
      'AirPods 4ta generación incluidos',
      'Apple Intelligence',
      'Envío gratis a todo el Perú',
    ],
    ahorroText: '',
    colorAccent: '#D4AF37',
    destacado: true,
  },
};

// Identifica qué plan es cada item del catálogo
function resolvePlanId(item: ApiCatalogProduct): string | null {
  const storage = item.specs?.storage ? Number(item.specs.storage) : null;
  const isCombo = item.combo != null;

  if (isCombo) return 'premium';
  if (storage === 256) return 'esencial';
  // 'avanzado' (512GB) se omite intencionalmente del financing
  return null;
}

// Imágenes hardcodeadas por color (fuente de verdad para la sección financing)
const COLOR_IMAGES: Record<string, string> = {
  silver: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-silver-sola.jpg',
  indigo: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-indigo-sola.jpg',
  blush:  'https://baldecash.s3.amazonaws.com/productos/macbook-neo-blush-sola.jpg',
  citrus: 'https://baldecash.s3.amazonaws.com/productos/macbook-neo-citrus-sola.jpg',
};

// Convierte un color_sibling en V5PlanColorOption
function siblingToColorOption(sib: ApiColorSibling): V5PlanColorOption {
  const colorKey = sib.color.toLowerCase();
  return {
    id: colorKey,
    label: sib.color,
    hex: sib.color_hex,
    productUrl: `/macbook-neo/producto/${sib.slug}/`,
    image: COLOR_IMAGES[colorKey] ?? sib.image_url ?? undefined,
    monthlyPrice: sib.pricing.hook?.monthly_price,
  };
}

interface FinancingPlansResult {
  plans: V5FinancingPlan[];
  minPrice: number | null; // mínimo entre todos los colores disponibles
}

export function useMacbookNeoFinancingPlans(): FinancingPlansResult {
  const [plans, setPlans] = useState<V5FinancingPlan[]>(
    // Arrancamos con los planes estáticos (sin 'avanzado') como fallback inmediato
    staticPlans.filter((p) => p.id !== 'avanzado'),
  );
  const [minPrice, setMinPrice] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await getCatalogProducts('macbook-neo', { limit: 50 });
      if (cancelled || !response) return;

      // Acumula datos por plan
      const planMap: Record<string, { siblings: V5PlanColorOption[]; minQuota: number }> = {};

      for (const item of response.items) {
        const planId = resolvePlanId(item);
        if (!planId) continue;

        const siblings = (item.color_siblings ?? []).map(siblingToColorOption);
        if (siblings.length === 0) continue; // sin colores disponibles → no mostrar card

        const minQuota = item.pricing.hook.monthly_price;

        if (!planMap[planId]) {
          planMap[planId] = { siblings, minQuota };
        }
      }

      // Construye los planes dinámicos en orden fijo (esencial primero, premium segundo)
      const ordered: V5FinancingPlan[] = [];
      for (const planId of ['esencial', 'premium'] as const) {
        const copy = PLAN_COPY[planId];
        const dynamic = planMap[planId];

        if (!dynamic) continue; // no hay colores disponibles → omitir card

        ordered.push({
          ...copy,
          cuotaMensual: dynamic.minQuota,
          plazoMeses: 24,
          cuotaInicial: 0,
          colorOptions: dynamic.siblings,
        });
      }

      if (!cancelled && ordered.length > 0) {
        setPlans(ordered);
        // Mínimo entre todos los monthlyPrice de todos los colorOptions de todos los planes
        const allPrices = ordered.flatMap(p =>
          (p.colorOptions ?? []).map(c => c.monthlyPrice).filter((v): v is number => v != null)
        );
        if (allPrices.length > 0) setMinPrice(Math.min(...allPrices));
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { plans, minPrice };
}
