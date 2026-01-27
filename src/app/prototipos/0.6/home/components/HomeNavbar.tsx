'use client';

/**
 * HomeNavbar v0.6 - Navbar con oferta dinámica desde backend
 * Estilo visual basado en v0.5 ConvenioNavbar
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import { Menu, X, Percent, User, Laptop, ChevronDown, Smartphone, Tablet, ArrowRight } from 'lucide-react';
import { NavbarOfferConfig, HeroBranding } from '../types/home';

interface HomeNavbarProps {
  offer?: NavbarOfferConfig | null;
  branding?: HeroBranding | null;
  isLoading?: boolean;
  onDismissOffer?: () => void;
}

// Skeleton para la barra de oferta
const OfferBarSkeleton = () => (
  <div className="fixed top-0 left-0 right-0 z-[60] bg-neutral-200 animate-pulse">
    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 py-2.5 px-4">
      <div className="h-4 w-4 bg-neutral-300 rounded" />
      <div className="h-4 w-48 bg-neutral-300 rounded" />
    </div>
  </div>
);

export const HomeNavbar: React.FC<HomeNavbarProps> = ({
  offer,
  branding,
  isLoading = false,
  onDismissOffer,
}) => {
  const primaryColor = branding?.primary_color || '#4654CD';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  const hasOffer = offer?.enabled && showPromo;

  const handleDismissPromo = () => {
    setShowPromo(false);
    onDismissOffer?.();
  };

  const catalogUrl = '/prototipos/0.5/catalogo/catalog-preview';

  const megaMenuItems = [
    { label: 'Laptops', href: `${catalogUrl}?device=laptop`, icon: Laptop, description: 'Portátiles para trabajo y estudio' },
    { label: 'Tablets', href: `${catalogUrl}?device=tablet`, icon: Tablet, description: 'Tablets para toda ocasión' },
    { label: 'Celulares', href: `${catalogUrl}?device=celular`, icon: Smartphone, description: 'Smartphones de todas las marcas' },
    { label: 'Ver más', href: catalogUrl, icon: ArrowRight, description: 'Explora todo el catálogo' },
  ];

  const navItems = [
    { label: 'Equipos', href: catalogUrl, hasMegaMenu: true },
    { label: 'Beneficios', href: '#beneficios' },
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
      {/* Promo Banner - estilo 0.5 */}
      {isLoading ? (
        <OfferBarSkeleton />
      ) : (
        <AnimatePresence>
          {hasOffer && offer && (
            <motion.div
              className="fixed top-0 left-0 right-0 z-[60] text-white text-center py-2.5 px-4 text-sm"
              style={{ backgroundColor: offer.backgroundColor || primaryColor }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 relative">
                {offer.badge ? (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: offer.badge_bg_color || 'rgba(255,255,255,0.2)',
                      color: offer.badge_color || '#FFFFFF',
                    }}
                  >
                    {offer.badge}
                  </span>
                ) : (
                  <Percent className="w-4 h-4" />
                )}
                <span style={{ color: offer.text_color || '#FFFFFF' }}>
                  {offer.text}
                </span>
                {offer.linkText && offer.linkUrl && (
                  <a
                    href={offer.linkUrl}
                    className="underline underline-offset-2 hover:opacity-80 font-semibold flex items-center gap-1"
                  >
                    {offer.linkText}
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                <button
                  className="absolute right-0 p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                  onClick={handleDismissPromo}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Navbar principal - estilo 0.5 */}
      <nav
        className="fixed left-0 right-0 z-50 bg-white shadow-sm transition-all duration-200"
        style={{ top: hasOffer || isLoading ? '40px' : 0 }}
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
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.hasMegaMenu && setShowMegaMenu(true)}
                  onMouseLeave={() => item.hasMegaMenu && setShowMegaMenu(false)}
                >
                  <a
                    href={item.href}
                    onClick={(e) => handleAnchorClick(e, item.href)}
                    className="flex items-center gap-1 text-neutral-600 hover:text-[#4654CD] text-sm font-medium transition-colors"
                  >
                    {item.label}
                    {item.hasMegaMenu && (
                      <ChevronDown className={`w-3 h-3 transition-transform ${showMegaMenu ? 'rotate-180' : ''}`} />
                    )}
                  </a>

                  {item.hasMegaMenu && showMegaMenu && (
                    <motion.div
                      className="absolute top-full left-0 pt-2 w-80"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="bg-white rounded-xl shadow-xl border border-neutral-100 p-4 grid gap-2">
                        {megaMenuItems.map((menuItem) => (
                          <a
                            key={menuItem.label}
                            href={menuItem.href}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${primaryColor}15` }}
                            >
                              <menuItem.icon className="w-5 h-5" style={{ color: primaryColor }} />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-800">{menuItem.label}</p>
                              <p className="text-xs text-neutral-500">{menuItem.description}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </motion.div>
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
              {isMenuOpen ? (
                <X className="w-6 h-6 text-neutral-600" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-600" />
              )}
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
              <div className="px-4 py-4 space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block py-2 text-neutral-600 hover:text-[#4654CD] font-medium"
                    onClick={(e) => {
                      if (item.href.startsWith('#')) {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        setTimeout(() => {
                          const element = document.querySelector(item.href);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 300);
                      }
                    }}
                  >
                    {item.label}
                  </a>
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

export default HomeNavbar;
