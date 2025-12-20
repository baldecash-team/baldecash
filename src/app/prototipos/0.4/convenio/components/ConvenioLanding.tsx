'use client';

/**
 * ConvenioLanding - Main wrapper component for Convenio Landing Page
 * Renders all sections based on version configuration
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, Eye, EyeOff } from 'lucide-react';
import {
  ConvenioConfig,
  ConvenioData,
  defaultConvenioConfig,
} from '../types/convenio';
import { convenios as conveniosList } from '../data/mockConvenioData';

// Navbar versions
import {
  ConvenioNavbarV1,
  ConvenioNavbarV2,
  ConvenioNavbarV3,
  ConvenioNavbarV4,
  ConvenioNavbarV5,
  ConvenioNavbarV6,
} from './navbar';

// Hero versions
import {
  ConvenioHeroV1,
  ConvenioHeroV2,
  ConvenioHeroV3,
  ConvenioHeroV4,
  ConvenioHeroV5,
  ConvenioHeroV6,
} from './hero';

// Benefits versions
import {
  ConvenioBenefitsV1,
  ConvenioBenefitsV2,
  ConvenioBenefitsV3,
  ConvenioBenefitsV4,
  ConvenioBenefitsV5,
  ConvenioBenefitsV6,
} from './benefits';

// Testimonials versions
import {
  ConvenioTestimonialsV1,
  ConvenioTestimonialsV2,
  ConvenioTestimonialsV3,
  ConvenioTestimonialsV4,
  ConvenioTestimonialsV5,
  ConvenioTestimonialsV6,
} from './testimonials';

// FAQ versions
import {
  ConvenioFaqV1,
  ConvenioFaqV2,
  ConvenioFaqV3,
  ConvenioFaqV4,
  ConvenioFaqV5,
  ConvenioFaqV6,
} from './faq';

// CTA versions
import {
  ConvenioCtaV1,
  ConvenioCtaV2,
  ConvenioCtaV3,
  ConvenioCtaV4,
  ConvenioCtaV5,
  ConvenioCtaV6,
} from './cta';

// Settings Modal
import { ConvenioSettingsModal } from './ConvenioSettingsModal';

interface ConvenioLandingProps {
  initialConfig?: ConvenioConfig;
  initialConvenio?: ConvenioData;
  showOverlaysDefault?: boolean;
}

export const ConvenioLanding: React.FC<ConvenioLandingProps> = ({
  initialConfig = defaultConvenioConfig,
  initialConvenio,
  showOverlaysDefault = true,
}) => {
  const [config, setConfig] = useState<ConvenioConfig>(initialConfig);
  const [convenio, setConvenio] = useState<ConvenioData>(
    initialConvenio || conveniosList[0]
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(showOverlaysDefault);

  // Handle "Ver Equipos" CTA
  const handleVerEquipos = () => {
    window.location.href = `/prototipos/0.4/catalogo?convenio=${convenio.slug}`;
  };

  // Handle "Aplicar Ahora" CTA
  const handleAplicarAhora = () => {
    window.location.href = `/prototipos/0.4/solicitud?convenio=${convenio.slug}`;
  };

  // Render Navbar based on version
  const renderNavbar = () => {
    const navbarProps = {
      convenio,
      onApplyNow: handleAplicarAhora,
      onViewProducts: handleVerEquipos,
    };

    switch (config.navbarVersion) {
      case 1:
        return <ConvenioNavbarV1 {...navbarProps} />;
      case 2:
        return <ConvenioNavbarV2 {...navbarProps} />;
      case 3:
        return <ConvenioNavbarV3 {...navbarProps} />;
      case 4:
        return <ConvenioNavbarV4 {...navbarProps} />;
      case 5:
        return <ConvenioNavbarV5 {...navbarProps} />;
      case 6:
        return <ConvenioNavbarV6 {...navbarProps} />;
      default:
        return <ConvenioNavbarV1 {...navbarProps} />;
    }
  };

  // Render Hero based on version
  const renderHero = () => {
    const heroProps = {
      convenio,
      cuotaDesde: 49,
      onVerEquipos: handleVerEquipos,
      onAplicarAhora: handleAplicarAhora,
    };

    switch (config.heroVersion) {
      case 1:
        return <ConvenioHeroV1 {...heroProps} />;
      case 2:
        return <ConvenioHeroV2 {...heroProps} />;
      case 3:
        return <ConvenioHeroV3 {...heroProps} />;
      case 4:
        return <ConvenioHeroV4 {...heroProps} />;
      case 5:
        return <ConvenioHeroV5 {...heroProps} />;
      case 6:
        return <ConvenioHeroV6 {...heroProps} />;
      default:
        return <ConvenioHeroV1 {...heroProps} />;
    }
  };

  // Render Benefits based on version
  const renderBenefits = () => {
    const benefitsProps = {
      convenio,
    };

    switch (config.benefitsVersion) {
      case 1:
        return <ConvenioBenefitsV1 {...benefitsProps} />;
      case 2:
        return <ConvenioBenefitsV2 {...benefitsProps} />;
      case 3:
        return <ConvenioBenefitsV3 {...benefitsProps} />;
      case 4:
        return <ConvenioBenefitsV4 {...benefitsProps} />;
      case 5:
        return <ConvenioBenefitsV5 {...benefitsProps} />;
      case 6:
        return <ConvenioBenefitsV6 {...benefitsProps} />;
      default:
        return <ConvenioBenefitsV1 {...benefitsProps} />;
    }
  };

  // Render Testimonials based on version
  const renderTestimonials = () => {
    const testimonialProps = {
      convenio,
    };

    switch (config.testimonialsVersion) {
      case 1:
        return <ConvenioTestimonialsV1 {...testimonialProps} />;
      case 2:
        return <ConvenioTestimonialsV2 {...testimonialProps} />;
      case 3:
        return <ConvenioTestimonialsV3 {...testimonialProps} />;
      case 4:
        return <ConvenioTestimonialsV4 {...testimonialProps} />;
      case 5:
        return <ConvenioTestimonialsV5 {...testimonialProps} />;
      case 6:
        return <ConvenioTestimonialsV6 {...testimonialProps} />;
      default:
        return <ConvenioTestimonialsV1 {...testimonialProps} />;
    }
  };

  // Render FAQ based on version
  const renderFaq = () => {
    const faqProps = {
      convenio,
    };

    switch (config.faqVersion) {
      case 1:
        return <ConvenioFaqV1 {...faqProps} />;
      case 2:
        return <ConvenioFaqV2 {...faqProps} />;
      case 3:
        return <ConvenioFaqV3 {...faqProps} />;
      case 4:
        return <ConvenioFaqV4 {...faqProps} />;
      case 5:
        return <ConvenioFaqV5 {...faqProps} />;
      case 6:
        return <ConvenioFaqV6 {...faqProps} />;
      default:
        return <ConvenioFaqV1 {...faqProps} />;
    }
  };

  // Render CTA based on version
  const renderCta = () => {
    const ctaProps = {
      convenio,
      cuotaDesde: 49,
      onVerEquipos: handleVerEquipos,
      onAplicarAhora: handleAplicarAhora,
    };

    switch (config.ctaVersion) {
      case 1:
        return <ConvenioCtaV1 {...ctaProps} />;
      case 2:
        return <ConvenioCtaV2 {...ctaProps} />;
      case 3:
        return <ConvenioCtaV3 {...ctaProps} />;
      case 4:
        return <ConvenioCtaV4 {...ctaProps} />;
      case 5:
        return <ConvenioCtaV5 {...ctaProps} />;
      case 6:
        return <ConvenioCtaV6 {...ctaProps} />;
      default:
        return <ConvenioCtaV1 {...ctaProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      {renderNavbar()}

      {/* Main content with padding for fixed navbar */}
      <main className="pt-16">
        {/* Hero Section */}
        {renderHero()}

        {/* Benefits Section */}
        <div id="beneficios">
          {renderBenefits()}
        </div>

        {/* Testimonials Section */}
        {renderTestimonials()}

        {/* FAQ Section */}
        {renderFaq()}

        {/* CTA Section */}
        {renderCta()}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo */}
            <div>
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 mb-4"
              />
              <p className="text-neutral-400 text-sm">
                Financiamiento para estudiantes
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Cómo funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Catálogo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Convenios</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Términos y condiciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Libro de reclamaciones</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
            <p>© 2024 Balde K S.A.C. Todos los derechos reservados.</p>
            <p className="mt-2">
              Convenio exclusivo para estudiantes de {convenio.nombre}
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      {showOverlays && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          <Button
            isIconOnly
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => setShowOverlays(false)}
          >
            <EyeOff className="w-5 h-5 text-neutral-600" />
          </Button>
          <Button
            isIconOnly
            className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
            onPress={() => setIsSettingsOpen(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Show overlays button when hidden */}
      {!showOverlays && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            isIconOnly
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => setShowOverlays(true)}
          >
            <Eye className="w-5 h-5 text-neutral-600" />
          </Button>
        </div>
      )}

      {/* Version badges */}
      {showOverlays && (
        <div className="fixed top-20 left-4 z-40 flex flex-col gap-1">
          <span className="px-2 py-1 bg-[#4654CD] text-white text-xs rounded font-medium">
            Nav: V{config.navbarVersion}
          </span>
          <span className="px-2 py-1 bg-[#4654CD] text-white text-xs rounded font-medium">
            Hero: V{config.heroVersion}
          </span>
          <span className="px-2 py-1 bg-[#4654CD] text-white text-xs rounded font-medium">
            Benefits: V{config.benefitsVersion}
          </span>
          <span className="px-2 py-1 bg-[#4654CD] text-white text-xs rounded font-medium">
            Testimonials: V{config.testimonialsVersion}
          </span>
          <span className="px-2 py-1 bg-[#4654CD] text-white text-xs rounded font-medium">
            FAQ: V{config.faqVersion}
          </span>
          <span className="px-2 py-1 bg-[#4654CD] text-white text-xs rounded font-medium">
            CTA: V{config.ctaVersion}
          </span>
        </div>
      )}

      {/* Settings Modal */}
      <ConvenioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
        convenio={convenio}
        onConvenioChange={setConvenio}
        conveniosList={conveniosList}
      />
    </div>
  );
};

export default ConvenioLanding;
