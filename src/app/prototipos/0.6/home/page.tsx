'use client';

/**
 * Home Page v0.6 - Integración con Backend
 *
 * IMPORTANTE: Carga inmediatamente con estilos y contenido default del hero-preview 0.5
 * Solo el texto (título, subtítulo, CTA) se actualiza cuando el backend responde.
 * GET /api/v1/landings/slug/{slug}/hero
 */

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import {
  Menu, X, User, Laptop, ChevronDown, Smartphone, Tablet, ArrowRight,
  Shield, Users, Building, Zap
} from 'lucide-react';

// Reusar componentes de 0.5/hero (las mismas secciones del home 0.5)
import { SocialProof, HowItWorks, HeroCta, FaqSection, Footer } from '../../0.5/hero/components/hero';
import { mockSocialProof, mockHowItWorksData, mockFaqData } from '../../0.5/hero/data/mockHeroData';
import { UnderlinedText } from '../../0.5/hero/components/hero/common/UnderlinedText';
import { HelpQuiz } from '../../0.5/quiz/components/quiz';
import { useIsMobile } from '../../_shared';

// Hook de configuración del backend
import { useHomeConfig } from './hooks/useHomeConfig';
import { HeroConfig } from './types/home';

// ============================================
// VALORES DEFAULT DEL HERO-PREVIEW 0.5
// ============================================
const DEFAULT_HERO = {
  // Contenido de texto
  headline: 'Empieza tu carrera con la herramienta correcta',
  subheadline: 'Sin historial crediticio. Sin aval ni garante. Aprobación en 24 horas.',
  badge: '+10,000 estudiantes confían en nosotros',
  ctaText: 'Ver laptops disponibles',
  minQuota: 49,
  // Imagen de fondo (hero-preview 0.5)
  backgroundUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80',
  // Colores
  primaryColor: '#4654CD',
  ctaColor: '#03DBD0',
};

// Valores default de la barra de promoción (exactos del Navbar 0.5)
const DEFAULT_PROMO = {
  text: '0% interés en tu primera cuota',
  strongText: 'Oferta especial:',
  linkText: 'Ver más',
  linkUrl: '/prototipos/0.5/catalogo/catalog-preview?tag=oferta',
};

// Estilo de subrayado fijo para v0.6 (igual que 0.5)
const UNDERLINE_STYLE = 4;

// ============================================
// NAVBAR v0.6 - Estilo EXACTO del Navbar 0.5
// ============================================
interface HomeNavbarProps {
  heroConfig?: HeroConfig | null;
}

const HomeNavbar: React.FC<HomeNavbarProps> = ({ heroConfig }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Color primario fijo (mismo que 0.5)
  const primaryColor = DEFAULT_HERO.primaryColor;

  // La barra de promoción SIEMPRE se muestra (como en 0.5)
  // Si el backend devuelve promo_bar, se usa esa. Sino, se usan los defaults.
  const promo = heroConfig?.promo_bar;
  const promoText = promo?.text || DEFAULT_PROMO.text;
  const promoStrongText = promo?.strong_text || DEFAULT_PROMO.strongText;
  const promoLinkUrl = promo?.link_url || DEFAULT_PROMO.linkUrl;
  const promoLinkText = promo?.link_text || DEFAULT_PROMO.linkText;
  const promoGradientFrom = promo?.background_gradient_from || '#4654CD';
  const promoGradientTo = promo?.background_gradient_to || '#5B68D8';

  const catalogUrl = '/prototipos/0.5/catalogo/catalog-preview';
  const homeUrl = '/prototipos/0.6/home';

  const megaMenuItems = [
    { label: 'Laptops', href: `${catalogUrl}?device=laptop`, icon: Laptop, description: 'Portátiles para trabajo y estudio' },
    { label: 'Tablets', href: `${catalogUrl}?device=tablet`, icon: Tablet, description: 'Tablets para toda ocasión' },
    { label: 'Celulares', href: `${catalogUrl}?device=celular`, icon: Smartphone, description: 'Smartphones de todas las marcas' },
    { label: 'Ver más', href: catalogUrl, icon: ArrowRight, description: 'Explora todo el catálogo' },
  ];

  const navItems = [
    { label: 'Equipos', href: catalogUrl, megaMenuType: 'equipos' as const },
    { label: 'Convenios', href: `${homeUrl}#convenios` },
    { label: '¿Tienes dudas?', href: '#faq' },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Promo Banner - Estilo EXACTO del Navbar 0.5, colores desde backend */}
      <AnimatePresence>
        {showPromo && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[60] text-white text-center py-2.5 px-4 text-sm"
            style={{ background: `linear-gradient(to right, ${promoGradientFrom}, ${promoGradientTo})` }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 relative">
              <Zap className="w-4 h-4 text-[#03DBD0]" />
              <span>
                <strong>{promoStrongText}</strong> {promoText}
              </span>
              <a
                href={promoLinkUrl}
                className="underline font-semibold ml-2 hover:no-underline hidden sm:inline"
              >
                {promoLinkText}
              </a>
              <button
                className="absolute right-0 p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                onClick={() => setShowPromo(false)}
                aria-label="Cerrar promoción"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar principal - Estilo 0.5 */}
      <nav
        className="fixed left-0 right-0 z-50 bg-white shadow-sm transition-all duration-200"
        style={{ top: showPromo ? '40px' : 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/prototipos/0.6/home" className="flex-shrink-0">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain"
              />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.megaMenuType && setShowMegaMenu(true)}
                  onMouseLeave={() => item.megaMenuType && setShowMegaMenu(false)}
                >
                  <a
                    href={item.href}
                    onClick={(e) => handleAnchorClick(e, item.href)}
                    className="flex items-center gap-1 text-neutral-600 hover:text-[#4654CD] text-sm font-medium transition-colors"
                  >
                    {item.label}
                    {item.megaMenuType && (
                      <ChevronDown className={`w-3 h-3 transition-transform ${showMegaMenu ? 'rotate-180' : ''}`} />
                    )}
                    {index === 0 && (
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: 'absolute -top-4 -right-6 bg-[#03DBD0] px-1 py-0 h-4 min-w-0',
                          content: 'text-[10px] font-bold text-white px-1',
                        }}
                      >
                        NUEVO
                      </Chip>
                    )}
                  </a>

                  {/* MegaMenu - Equipos */}
                  {item.megaMenuType === 'equipos' && (
                    <AnimatePresence>
                      {showMegaMenu && (
                        <motion.div
                          className="absolute top-full left-0 pt-2 w-80"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="bg-white rounded-xl shadow-xl border border-neutral-100 p-4 grid gap-2">
                            {megaMenuItems.map((menuItem) => (
                              <a
                                key={menuItem.label}
                                href={menuItem.href}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
                              >
                                <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center shrink-0 group-hover:bg-[#4654CD]/20 transition-colors">
                                  <menuItem.icon className="w-5 h-5 text-[#4654CD]" />
                                </div>
                                <div>
                                  <p className="font-medium text-neutral-800 group-hover:text-[#4654CD] transition-colors">
                                    {menuItem.label}
                                  </p>
                                  <p className="text-xs text-neutral-500">{menuItem.description}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                as="a"
                href="https://zonaclientes.baldecash.com"
                target="_blank"
                variant="bordered"
                radius="lg"
                className="border-[#4654CD] text-[#4654CD] font-medium cursor-pointer hover:bg-[#4654CD] hover:text-white transition-colors"
                startContent={<User className="w-4 h-4" />}
              >
                Mi cuenta
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-neutral-600" /> : <Menu className="w-6 h-6 text-neutral-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-neutral-100"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item, index) => (
                  <div key={item.label}>
                    {item.megaMenuType ? (
                      <>
                        <button
                          className="flex items-center justify-between w-full py-3 text-neutral-600 hover:text-[#4654CD] font-medium cursor-pointer"
                          onClick={() => setMobileExpanded(mobileExpanded === item.megaMenuType ? null : item.megaMenuType!)}
                        >
                          <span className="flex items-center gap-2">
                            {item.label}
                            {index === 0 && (
                              <Chip
                                size="sm"
                                radius="sm"
                                classNames={{
                                  base: 'bg-[#03DBD0] px-1.5 py-0 h-5',
                                  content: 'text-[10px] font-bold text-white',
                                }}
                              >
                                NUEVO
                              </Chip>
                            )}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === item.megaMenuType ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === item.megaMenuType && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pb-2 space-y-1">
                                {item.megaMenuType === 'equipos' && megaMenuItems.map((subItem) => (
                                  <a
                                    key={subItem.label}
                                    href={subItem.href}
                                    className="block py-2 text-sm text-neutral-500 hover:text-[#4654CD]"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    {subItem.label}
                                  </a>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <a
                        href={item.href}
                        className="block py-3 text-neutral-600 hover:text-[#4654CD] font-medium"
                        onClick={(e) => {
                          const hashIndex = item.href.indexOf('#');
                          if (hashIndex !== -1) {
                            const anchor = item.href.substring(hashIndex);
                            const isOnTargetPage = item.href.startsWith('#') || window.location.pathname.includes('/home');

                            if (isOnTargetPage) {
                              e.preventDefault();
                              setIsMenuOpen(false);
                              setTimeout(() => {
                                const element = document.querySelector(anchor);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }, 300);
                            } else {
                              setIsMenuOpen(false);
                            }
                          }
                        }}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
                <div className="pt-4 border-t border-neutral-100">
                  <Button
                    as="a"
                    href="https://zonaclientes.baldecash.com"
                    target="_blank"
                    variant="bordered"
                    radius="lg"
                    className="w-full border-[#4654CD] text-[#4654CD] font-medium cursor-pointer"
                    startContent={<User className="w-4 h-4" />}
                  >
                    Mi cuenta
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

// ============================================
// HERO v0.6 - Estilo EXACTO del HeroBanner 0.5
// Carga inmediatamente con valores default, actualiza texto desde backend
// ============================================
interface HomeHeroProps {
  config?: HeroConfig | null;
  catalogUrl: string;
}

const HomeHero: React.FC<HomeHeroProps> = ({ config, catalogUrl }) => {
  const router = useRouter();

  // Usar valores del backend si existen, sino usar defaults del hero-preview 0.5
  const headline = config?.title || DEFAULT_HERO.headline;
  const subheadline = config?.subtitle || DEFAULT_HERO.subheadline;
  const badgeText = config?.badge_text || DEFAULT_HERO.badge;
  const minQuota = config?.min_quota || DEFAULT_HERO.minQuota;
  const ctaText = config?.cta?.text || DEFAULT_HERO.ctaText;
  const ctaUrl = config?.cta?.url || catalogUrl;

  // Para el background: si el backend provee uno, usarlo, sino usar el default 0.5
  const backgroundUrl = config?.background_url || DEFAULT_HERO.backgroundUrl;

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Image - Estilo EXACTO del HeroBanner 0.5 */}
      <img
        src={backgroundUrl}
        alt="Estudiantes trabajando"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = '0';
        }}
      />

      {/* Overlay - Estilo EXACTO del HeroBanner 0.5 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

      {/* Content - Estilo EXACTO del HeroBanner 0.5 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-2xl">
          {/* Badge - Estilo EXACTO del HeroBanner 0.5 */}
          <Chip
            size="sm"
            radius="sm"
            classNames={{
              base: 'bg-white/20 backdrop-blur-sm px-3 py-1 h-auto mb-6',
              content: 'text-white text-xs font-medium',
            }}
          >
            {badgeText}
          </Chip>

          {/* Headline - CONFIGURABLE desde backend */}
          <h1 className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {headline}
          </h1>

          {/* Subheadline - CONFIGURABLE desde backend */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
            {subheadline}
          </p>

          {/* Price Highlight - Estilo EXACTO del HeroBanner 0.5 */}
          <div className="inline-flex items-baseline gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 mb-8">
            <span className="text-white/70 text-lg">Desde</span>
            <span className="text-4xl md:text-5xl font-bold text-white">S/{minQuota}</span>
            <span className="text-white/70 text-lg">/mes</span>
          </div>

          {/* CTAs - Estilo EXACTO del HeroBanner 0.5 */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              size="lg"
              radius="lg"
              className="bg-[#03DBD0] text-neutral-900 font-semibold px-8 cursor-pointer hover:bg-[#02C3BA] transition-colors"
              endContent={<ArrowRight className="w-5 h-5" />}
              onPress={() => router.push(ctaUrl)}
            >
              {ctaText}
            </Button>
            <Button
              size="lg"
              radius="lg"
              variant="bordered"
              className="border-white/30 text-white font-medium cursor-pointer hover:bg-white/10 transition-colors"
              onPress={() => {
                document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Cómo funciona
            </Button>
          </div>

          {/* Trust Signals - Estilo EXACTO del HeroBanner 0.5 */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Shield className="w-5 h-5 text-[#03DBD0]" />
              <span>Registrados en SBS</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Users className="w-5 h-5 text-[#03DBD0]" />
              <span>+10,000 estudiantes</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Building className="w-5 h-5 text-[#03DBD0]" />
              <span>32 instituciones aliadas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// MAIN PAGE
// Carga inmediatamente con contenido default 0.5, actualiza texto desde backend
// ============================================
function HomePageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || 'default';
  const isMobile = useIsMobile();

  const { config, isLoading, error, refresh } = useHomeConfig({ slug });
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const catalogUrl = '/prototipos/0.5/catalogo/catalog-preview';

  // Quiz config (igual que en 0.5)
  const quizConfig = {
    layoutVersion: (isMobile ? 4 : 5) as 4 | 5,
    questionCount: 7 as const,
    questionStyle: 1 as const,
    resultsVersion: 1 as const,
    focusVersion: 1 as const,
  };

  // NO MOSTRAMOS ERROR BLOQUEANTE - la página carga con defaults 0.5
  // El error solo se muestra en el debug panel (desarrollo)

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - Estilo EXACTO del Navbar 0.5 con promo configurable */}
      <HomeNavbar heroConfig={config?.hero} />

      <main className="pt-16">
        {/* Hero - Estilo EXACTO del HeroBanner 0.5 */}
        {/* Carga inmediatamente con defaults, actualiza texto desde backend */}
        <HomeHero
          config={config?.hero}
          catalogUrl={catalogUrl}
        />

        {/* Social Proof - Mismo componente de 0.5 */}
        <section className="pt-12 bg-neutral-50">
          <SocialProof data={mockSocialProof} underlineStyle={UNDERLINE_STYLE} />
        </section>

        {/* How It Works - Mismo componente de 0.5 */}
        <section id="como-funciona" className="scroll-mt-24">
          <HowItWorks data={mockHowItWorksData} underlineStyle={UNDERLINE_STYLE} />
        </section>

        {/* CTA Section - Mismo estilo de 0.5 */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3 font-['Baloo_2']">
              ¿Listo para tu nuevo{' '}
              <UnderlinedText style={UNDERLINE_STYLE} color="primary">
                equipo
              </UnderlinedText>
              ?
            </h2>
            <p className="text-neutral-600 mb-8">
              Solicita tu laptop en minutos. 100% digital.
            </p>
            <div className="flex justify-center mb-6">
              <HeroCta onQuizOpen={() => setIsQuizOpen(true)} isCleanMode={false} />
            </div>
            <p className="text-xs text-neutral-400">
              Al continuar, aceptas nuestros{' '}
              <a href="#terminos" className="underline hover:text-neutral-600">términos</a>
              {' '}y{' '}
              <a href="#privacidad" className="underline hover:text-neutral-600">privacidad</a>
            </p>
          </div>
        </section>

        {/* FAQ Section - Mismo componente de 0.5 */}
        <section id="faq" className="scroll-mt-24">
          <FaqSection data={mockFaqData} underlineStyle={UNDERLINE_STYLE} />
        </section>
      </main>

      {/* Footer - Mismo componente de 0.5 */}
      <Footer isCleanMode={false} />

      {/* Help Quiz Modal - Igual que en 0.5 */}
      <HelpQuiz
        config={quizConfig}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        context="hero"
        isCleanMode={false}
      />

      {/* Debug panel - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-neutral-800 text-white p-4 rounded-lg text-xs max-w-xs shadow-xl z-50">
          <div className="font-bold mb-2 text-[#03DBD0]">v0.6 Debug</div>
          <div className="space-y-1 text-neutral-300">
            <div>Slug: {slug}</div>
            <div>Loading: {isLoading ? 'Sí' : 'No'}</div>
            <div>Title: {config?.hero?.title?.slice(0, 25) || 'Default'}...</div>
            <div>Backend: {config ? 'Conectado' : 'Usando defaults'}</div>
            {error && <div className="text-red-400">Error: {error}</div>}
          </div>
          <button
            onClick={refresh}
            className="w-full mt-3 py-1.5 bg-[#03DBD0] rounded text-neutral-900 text-xs font-semibold hover:bg-[#02C3BA] transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

// LoadingFallback - Loader sutil con fondo y fade
function LoadingFallback() {
  return (
    <div className="h-screen overflow-hidden relative">
      {/* Background Image con blur sutil */}
      <img
        src={DEFAULT_HERO.backgroundUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />

      {/* Logo centrado con pulso sutil */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <img
            src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
            alt="BaldeCash"
            className="h-12 object-contain brightness-0 invert animate-pulse"
          />
          {/* Indicador de carga minimalista */}
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
