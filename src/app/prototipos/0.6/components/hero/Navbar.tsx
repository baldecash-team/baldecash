'use client';

/**
 * Navbar - Banner Promocional + MegaMenu (basado en V6 de 0.4)
 * Estilo: Banner colorido arriba del navbar, con botón para cerrar
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import { Menu, X, Zap, User, Laptop, ChevronDown, Smartphone, Tablet, ArrowRight } from 'lucide-react';
import type { PromoBannerData } from '../../types/hero';

// Helper function to build internal URLs with mode propagation and optional query params
const buildInternalUrl = (basePath: string, isCleanMode: boolean, params?: Record<string, string>) => {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  }

  if (isCleanMode) {
    searchParams.set('mode', 'clean');
  }

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  // Check if href contains an anchor
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) return; // No anchor, let it navigate normally

  const anchor = href.substring(hashIndex);
  const pathBeforeAnchor = href.substring(0, hashIndex);

  // Check if we're already on the target page (or it's just an anchor)
  const currentPath = window.location.pathname;
  // Hero y Landing tienen las mismas secciones (#convenios, #faq)
  const isOnTargetPage = href.startsWith('#') || currentPath.includes('/prototipos/0.6');

  if (isOnTargetPage) {
    e.preventDefault();
    const element = document.querySelector(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  // Otherwise, let the link navigate normally to the target page with anchor
};

interface NavbarProps {
  isCleanMode?: boolean;
  hidePromoBanner?: boolean;
  fullWidth?: boolean;
  minimal?: boolean;
  logoOnly?: boolean;
  rightContent?: React.ReactNode;
  mobileRightContent?: React.ReactNode;
  activeSections?: string[];
  promoBannerData?: PromoBannerData | null;
  logoUrl?: string;
  customerPortalUrl?: string;
}

const DEFAULT_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';
const DEFAULT_CUSTOMER_PORTAL = 'https://zonaclientes.baldecash.com';

export const Navbar: React.FC<NavbarProps> = ({ isCleanMode = false, hidePromoBanner = false, fullWidth = false, minimal = false, logoOnly = false, rightContent, mobileRightContent, activeSections = [], promoBannerData, logoUrl, customerPortalUrl }) => {
  const logo = logoUrl || DEFAULT_LOGO;
  const customerPortal = customerPortalUrl || DEFAULT_CUSTOMER_PORTAL;
  const catalogBasePath = '/prototipos/0.5/catalogo/catalog-preview';
  const catalogUrl = buildInternalUrl(catalogBasePath, isCleanMode);
  const heroUrl = buildInternalUrl('/prototipos/0.6', isCleanMode);

  const megaMenuItems = [
    { label: 'Laptops', href: buildInternalUrl(catalogBasePath, isCleanMode, { device: 'laptop' }), icon: Laptop, description: 'Portátiles para trabajo y estudio' },
    { label: 'Tablets', href: buildInternalUrl(catalogBasePath, isCleanMode, { device: 'tablet' }), icon: Tablet, description: 'Tablets para toda ocasión' },
    { label: 'Celulares', href: buildInternalUrl(catalogBasePath, isCleanMode, { device: 'celular' }), icon: Smartphone, description: 'Smartphones de todas las marcas' },
    { label: 'Ver más', href: catalogUrl, icon: ArrowRight, description: 'Explora todo el catálogo' },
  ];

  const allNavItems = [
    { label: 'Equipos', href: catalogUrl, megaMenuType: 'equipos' as const, section: null },
    { label: 'Convenios', href: `${heroUrl}#convenios`, section: 'convenios' },
    { label: 'Ver requisitos', href: `${heroUrl}#como-funciona`, section: 'como-funciona' },
    { label: '¿Tienes dudas?', href: `${heroUrl}#faq`, section: 'faq' },
  ];

  // Filtrar items según secciones activas
  const navItems = allNavItems.filter(item =>
    item.section === null || activeSections.includes(item.section)
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'equipos' | 'convenios' | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Logo Only mode: blue background with centered white logo
  if (logoOnly) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#4654CD] shadow-lg shadow-[#4654CD]/20">
        <div className="flex justify-center py-5">
          <img
            src={logo}
            alt="BaldeCash"
            className="h-12 object-contain brightness-0 invert"
          />
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Promo Banner */}
      {showPromo && !hidePromoBanner && promoBannerData && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#4654CD] to-[#5B68D8] text-white text-center py-2.5 px-4 text-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 relative">
            <Zap className="w-4 h-4 text-[#03DBD0]" />
            <span>
              {promoBannerData.highlight && <strong>{promoBannerData.highlight}</strong>} {promoBannerData.text}
            </span>
            {promoBannerData.ctaText && promoBannerData.ctaUrl && (
              <a href={buildInternalUrl(promoBannerData.ctaUrl, isCleanMode)} className="underline font-semibold ml-2 hover:no-underline hidden sm:inline">
                {promoBannerData.ctaText}
              </a>
            )}
            {promoBannerData.dismissible !== false && (
              <button
                className="absolute right-0 p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                onClick={() => setShowPromo(false)}
                aria-label="Cerrar promoción"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <nav
        className="fixed left-0 right-0 z-50 bg-white shadow-sm transition-all duration-200"
        style={{ top: showPromo && !hidePromoBanner && promoBannerData ? '40px' : 0 }}
      >
        <div className={fullWidth ? "px-4 lg:px-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href={heroUrl} className="flex items-center">
              <img
                src={logo}
                alt="BaldeCash"
                className="h-8 object-contain"
              />
            </a>

            {/* Desktop Navigation */}
            {!minimal && (
              <div className="hidden md:flex items-center gap-8">
                {navItems.map((item, index) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => item.megaMenuType && setActiveMegaMenu(item.megaMenuType)}
                    onMouseLeave={() => item.megaMenuType && setActiveMegaMenu(null)}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleAnchorClick(e, item.href)}
                      className="flex items-center gap-1 text-neutral-600 hover:text-[#4654CD] text-sm font-medium transition-colors"
                    >
                      {item.label}
                      {item.megaMenuType && <ChevronDown className={`w-3 h-3 transition-transform ${activeMegaMenu === item.megaMenuType ? 'rotate-180' : ''}`} />}
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
                        {activeMegaMenu === 'equipos' && (
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
            )}

            {/* Desktop CTA */}
            {!minimal && (
              <div className="hidden md:flex items-center gap-3">
                <Button
                  as="a"
                  href={customerPortal}
                  target="_blank"
                  variant="bordered"
                  radius="lg"
                  className="border-[#4654CD] text-[#4654CD] font-medium cursor-pointer hover:bg-[#4654CD] hover:text-white transition-colors"
                  startContent={<User className="w-4 h-4" />}
                >
                  Zona Estudiantes
                </Button>
              </div>
            )}

            {/* Custom Right Content - Desktop (for minimal mode) */}
            {minimal && rightContent && (
              <div className="hidden lg:flex items-center gap-3">
                {rightContent}
              </div>
            )}

            {/* Custom Right Content - Mobile (for minimal mode) */}
            {minimal && mobileRightContent && (
              <div className="flex lg:hidden items-center gap-2">
                {mobileRightContent}
              </div>
            )}

            {/* Mobile buttons */}
            {!minimal && (
              <div className="flex md:hidden items-center gap-2">
                <button
                  className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6 text-neutral-600" />
                  ) : (
                    <Menu className="w-6 h-6 text-neutral-600" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {!minimal && isMenuOpen && (
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
                            const currentPath = window.location.pathname;
                            // Hero y Landing tienen las mismas secciones (#convenios, #faq)
                            const isOnTargetPage = item.href.startsWith('#') || currentPath.includes('/prototipos/0.6');

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
                    href={customerPortal}
                    target="_blank"
                    variant="bordered"
                    radius="lg"
                    className="w-full border-[#4654CD] text-[#4654CD] font-medium cursor-pointer"
                    startContent={<User className="w-4 h-4" />}
                  >
                    Zona Estudiantes
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

export default Navbar;
