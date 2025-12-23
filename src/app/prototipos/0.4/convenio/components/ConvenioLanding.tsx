'use client';

/**
 * ConvenioLanding - Main wrapper component for Convenio Landing Page
 * Renders all sections based on version configuration
 */

import React, { useState, useEffect } from 'react';
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

// Footer versions
import {
  ConvenioFooterV1,
  ConvenioFooterV2,
  ConvenioFooterV3,
  ConvenioFooterV4,
  ConvenioFooterV5,
  ConvenioFooterV6,
} from './footer';

// Settings Modal
import { ConvenioSettingsModal } from './ConvenioSettingsModal';

interface ConvenioLandingProps {
  initialConfig?: ConvenioConfig;
  initialConvenio?: ConvenioData;
  showOverlaysDefault?: boolean;
  /** Si es true, usa el config del prop directamente (modo controlado) */
  controlled?: boolean;
}

export const ConvenioLanding: React.FC<ConvenioLandingProps> = ({
  initialConfig = defaultConvenioConfig,
  initialConvenio,
  showOverlaysDefault = true,
  controlled = false,
}) => {
  // Estado interno del config
  const [internalConfig, setInternalConfig] = useState<ConvenioConfig>(initialConfig);

  // En modo controlado, sincronizamos con props cuando cambian
  useEffect(() => {
    if (controlled) {
      setInternalConfig(initialConfig);
    }
  }, [controlled, initialConfig]);

  // Siempre usamos internalConfig para que React detecte los cambios
  const config = internalConfig;
  const setConfig = controlled ? () => {} : setInternalConfig;

  const [convenio, setConvenio] = useState<ConvenioData>(
    initialConvenio || conveniosList[0]
  );

  // En modo controlado, sincronizamos convenio con props cuando cambian
  useEffect(() => {
    if (controlled && initialConvenio) {
      setConvenio(initialConvenio);
    }
  }, [controlled, initialConvenio]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(showOverlaysDefault);

  // Handle "Ver Equipos" CTA
  const handleVerEquipos = () => {
    window.location.href = `/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1&mode=clean`;
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

  // Render Footer based on version
  const renderFooter = () => {
    const footerProps = {
      convenio,
    };

    switch (config.footerVersion) {
      case 1:
        return <ConvenioFooterV1 {...footerProps} />;
      case 2:
        return <ConvenioFooterV2 {...footerProps} />;
      case 3:
        return <ConvenioFooterV3 {...footerProps} />;
      case 4:
        return <ConvenioFooterV4 {...footerProps} />;
      case 5:
        return <ConvenioFooterV5 {...footerProps} />;
      case 6:
        return <ConvenioFooterV6 {...footerProps} />;
      default:
        return <ConvenioFooterV1 {...footerProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      {renderNavbar()}

      {/* Main content */}
      <main>
        {/* Hero Section */}
        <div id="convenio-hero">
          {renderHero()}
        </div>

        {/* Benefits Section */}
        <div id="convenio-benefits">
          {renderBenefits()}
        </div>

        {/* Testimonials Section */}
        <div id="convenio-testimonials">
          {renderTestimonials()}
        </div>

        {/* FAQ Section */}
        <div id="convenio-faq">
          {renderFaq()}
        </div>

        {/* CTA Section */}
        <div id="convenio-cta">
          {renderCta()}
        </div>
      </main>

      {/* Footer */}
      <div id="convenio-footer">
        {renderFooter()}
      </div>

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
