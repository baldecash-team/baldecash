'use client';

import React from 'react';
import { LeadLeadForm } from './LeadLeadForm';
import type { LeadFormConfig, StudyCenter } from '../../types/hero';

interface LeadLandingSplitProps {
  landingId: number;
  landing: string;
  config: LeadFormConfig;
  studyCenters: StudyCenter[];
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  submittingRef?: React.MutableRefObject<boolean>;
}

/**
 * Versión simplificada "split" de una landing lead (config.split_version=true):
 * panel lateral de marca (primaryColor) + formulario enfocado. Reemplaza toda la
 * landing (sin hero-carrusel/productos/cómo-funciona). Ver spec split-version.
 */
export const LeadLandingSplit: React.FC<LeadLandingSplitProps> = ({
  landingId,
  landing,
  config,
  studyCenters,
  logoUrl,
  primaryColor = '#4654CD',
  secondaryColor = '#03DBD0',
  submittingRef,
}) => {
  const split = config.split ?? {};
  const steps = split.steps ?? [];

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[400px_1fr] bg-white">
      {/* Panel lateral */}
      <aside
        className="flex flex-col px-8 py-10 lg:px-10 lg:py-12 lg:sticky lg:top-0 lg:h-screen text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {logoUrl ? (
          // brightness-0 invert -> silueta blanca, visible sobre el panel de color
          <img src={logoUrl} alt={landing} className="h-8 w-auto object-contain object-left brightness-0 invert" />
        ) : (
          <div className="font-['Asap',sans-serif] font-bold text-[22px] tracking-tight text-white">
            Balde<span style={{ color: secondaryColor }}>Cash</span>
          </div>
        )}

        {split.headline && (
          <h2 className="font-['Space_Grotesk','Baloo_2',sans-serif] text-[26px] lg:text-[30px] leading-tight mt-8 lg:mt-10 mb-3 tracking-tight">
            {split.headline}
          </h2>
        )}
        {split.description && (
          <p className="text-[14.5px] leading-relaxed text-white/70 max-w-sm">{split.description}</p>
        )}

        {steps.length > 0 && (
          <ol className="mt-10 lg:mt-12 flex flex-col">
            {steps.map((step, i) => (
              <li key={i} className="relative flex gap-3.5 items-start pb-8 last:pb-0">
                {i < steps.length - 1 && (
                  <span className="absolute left-[13px] top-[30px] bottom-1 w-0.5 bg-white/15" aria-hidden />
                )}
                <span
                  className="w-7 h-7 min-w-[28px] rounded-full grid place-items-center text-[13px] font-semibold font-['Space_Grotesk','Baloo_2',sans-serif]"
                  style={{ backgroundColor: secondaryColor, color: primaryColor }}
                >
                  {i + 1}
                </span>
                <span className="pt-0.5">
                  <strong className="block text-[14.5px] font-semibold">{step.title}</strong>
                  {step.subtitle && <span className="text-[13px] text-white/60">{step.subtitle}</span>}
                </span>
              </li>
            ))}
          </ol>
        )}

        {split.foot_text && (
          <div className="mt-auto pt-8 text-[12.5px] text-white/40">{split.foot_text}</div>
        )}
      </aside>

      {/* Formulario */}
      <main className="px-6 py-10 lg:px-16 lg:py-14">
        <div id="lead-form" className="max-w-[760px]">
          <LeadLeadForm
            config={config}
            landingId={landingId}
            landing={landing}
            studyCenters={studyCenters}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            variant="split"
            submittingRef={submittingRef}
          />
        </div>
      </main>
    </div>
  );
};

export default LeadLandingSplit;
