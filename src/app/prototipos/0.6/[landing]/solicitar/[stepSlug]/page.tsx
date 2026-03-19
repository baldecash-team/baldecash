/**
 * Dynamic Step Page - Server Component
 * Renders any wizard step based on URL slug
 */

import StepClient from './StepClient';

export default function StepPage() {
  return <StepClient />;
}

// Con output: export, solo funcionan rutas pre-generadas en generateStaticParams
export const dynamicParams = false;

export async function generateStaticParams() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

  // Fallbacks para cuando la API no responde
  const fallbackLandings = ['home'];
  const fallbackSteps = ['datos-personales'];

  let landings: string[] = fallbackLandings;
  const stepSlugsMap: Map<string, string[]> = new Map();

  try {
    // Obtener lista de landings
    const landingsRes = await fetch(`${apiUrl}/public/landing/list/slugs`, { cache: 'no-store' });

    if (landingsRes.ok) {
      const data = await landingsRes.json();
      if (data.slugs?.length) landings = data.slugs;
    }

    // Para cada landing, obtener sus steps del wizard
    await Promise.all(
      landings.map(async (landingSlug) => {
        try {
          const wizardRes = await fetch(`${apiUrl}/public/landing/${landingSlug}/wizard`, {
            cache: 'no-store',
          });

          if (wizardRes.ok) {
            const wizardData = await wizardRes.json();
            if (wizardData.steps?.length) {
              const slugs = wizardData.steps.map((step: { url_slug?: string; code: string }) =>
                step.url_slug || step.code
              );
              stepSlugsMap.set(landingSlug, slugs);
            }
          }
        } catch {
          // Si falla para un landing, usar fallback
          stepSlugsMap.set(landingSlug, fallbackSteps);
        }
      })
    );
  } catch {
    // API unavailable, using fallbacks
    landings.forEach((l) => stepSlugsMap.set(l, fallbackSteps));
  }

  // Generar todas las combinaciones landing × stepSlug
  const params: { landing: string; stepSlug: string }[] = [];

  for (const landing of landings) {
    const stepSlugs = stepSlugsMap.get(landing) || fallbackSteps;
    for (const stepSlug of stepSlugs) {
      params.push({ landing, stepSlug });
    }
  }

  return params;
}
