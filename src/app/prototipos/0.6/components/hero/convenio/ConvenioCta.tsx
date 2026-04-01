'use client';

/**
 * ConvenioCta - CTA 2 columnas con WhatsApp + Quick Links + Precio
 * Adaptado de v0.5 al sistema API-driven de v0.6
 * - Fondo con color primario del landing
 * - WhatsApp directo
 * - Panel de quick-links a la derecha
 * - Recap de precio con descuento
 */

import React from 'react';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CtaData, AgreementData, HeroContent } from '../../../types/hero';
import { formatMoney } from '@/app/prototipos/0.5/utils/formatMoney';
import { routes } from '@/app/prototipos/0.6/utils/routes';

interface ConvenioCtaProps {
  ctaData: CtaData | null;
  agreementData: AgreementData;
  heroContent: HeroContent | null;
  landing: string;
}

export const ConvenioCta: React.FC<ConvenioCtaProps> = ({
  ctaData,
  agreementData,
  heroContent,
  landing,
}) => {
  const router = useRouter();
  const normalizedLanding = landing.replace(/\/+$/, '');
  const heroUrl = routes.landingHome(normalizedLanding);

  const transformLink = (href: string): string => {
    if (!href) return '#';
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) return href;
    if (href.startsWith('#')) return `${heroUrl}${href}`;
    if (href.startsWith('/prototipos/')) return href;
    return `${heroUrl}/${href}`;
  };

  const institutionShortName = agreementData.institution_short_name || agreementData.institution_name || '';
  const discountPct = agreementData.discount_percentage ? parseFloat(agreementData.discount_percentage) : 0;
  const whatsappUrl = ctaData?.buttons.whatsapp.url || '';
  const catalogUrl = transformLink(ctaData?.buttons.catalog.url || 'catalogo');

  const handleWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      className="py-16"
      style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Text + WhatsApp */}
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']">
              {ctaData?.sectionTitle || '¿Tienes dudas? Hablemos'}
            </h2>
            <p className="text-lg text-white/80 mb-6">
              {ctaData?.sectionSubtitle || `Nuestro equipo de asesores está listo para ayudarte a elegir el mejor equipo y explicarte todos los beneficios de tu convenio ${institutionShortName}.`}
            </p>

            {/* Advisors */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-xs font-medium">A{i}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm text-white/90">Asesores en línea</p>
                <p className="text-xs text-white/60">
                  {ctaData?.responseTime || 'Respuesta promedio: 5 min'}
                </p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl cursor-pointer hover:bg-[#20BD5A] transition-colors text-base"
            >
              <MessageCircle className="w-5 h-5" />
              {ctaData?.buttons.whatsapp.text || 'Escribir por WhatsApp'}
            </button>

            <p className="text-white/60 text-sm mt-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              También puedes llamarnos
            </p>
          </div>

          {/* Right: Quick links + Price */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8">
            <h3 className="text-white font-semibold mb-4">También puedes:</h3>

            <div className="space-y-3">
              <a
                href={catalogUrl}
                onClick={(e) => {
                  if (!catalogUrl.startsWith('http')) {
                    e.preventDefault();
                    router.push(catalogUrl);
                  }
                }}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <span className="text-white">Ver equipos disponibles</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </a>

              <button
                onClick={() => handleScrollTo('faq')}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <span className="text-white">Ver preguntas frecuentes</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={() => handleScrollTo('beneficios')}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <span className="text-white">Conocer beneficios del convenio</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Price recap */}
            {heroContent && heroContent.minQuota > 0 && (
              <div className="mt-6 pt-6 border-t border-white/20 text-center">
                <p className="text-white/60 text-sm mb-1">Cuotas desde</p>
                <p className="text-3xl font-bold text-white font-['Baloo_2']">
                  S/{formatMoney(heroContent.minQuota)}/mes
                </p>
                {discountPct > 0 && (
                  <p className="text-white/60 text-xs mt-1">
                    Con {discountPct}% de descuento
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConvenioCta;
