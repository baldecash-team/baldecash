'use client';

/**
 * Navbar - Banner Promocional + MegaMenu (basado en V6 de 0.4)
 * Estilo: Banner colorido arriba del navbar, con botón para cerrar
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import {
  Menu,
  X,
  Zap,
  User,
  Laptop,
  ChevronDown,
  Smartphone,
  Tablet,
  ArrowRight,
  Monitor,
  Tv,
  Watch,
  Headphones,
  Camera,
  Gamepad2,
  Printer,
  ShoppingBag,
  Package,
  Gift,
  Tag,
  Percent,
  Star,
  CreditCard,
  Clock,
} from 'lucide-react';
import type { PromoBannerData } from '../../types/hero';

// Helper function to build internal URLs with optional query params
const buildInternalUrl = (basePath: string, params?: Record<string, string>) => {
  if (!params || Object.keys(params).length === 0) {
    return basePath;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });

  return `${basePath}?${searchParams.toString()}`;
};

const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  // Check if href contains an anchor
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) return; // No anchor, let it navigate normally

  const anchor = href.substring(hashIndex);
  const pathBeforeAnchor = href.substring(0, hashIndex);

  // Check if we're already on the target page
  const currentPath = window.location.pathname;

  // Normalize paths by removing trailing slash for comparison
  const normalizePath = (path: string) => path.replace(/\/$/, '');

  // Only do smooth scroll if we're on the exact target page (landing home)
  const isOnTargetPage = pathBeforeAnchor && normalizePath(currentPath) === normalizePath(pathBeforeAnchor);

  if (isOnTargetPage) {
    e.preventDefault();
    const element = document.querySelector(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  // Otherwise, let the link navigate normally to the target page with anchor
};

interface MegaMenuItemData {
  label: string;
  href: string;
  icon: string;
  description: string;
}

interface NavbarItemData {
  label: string;
  href: string;
  section: string | null;
  has_megamenu?: boolean;
  badge_text?: string | null;
  badge_color?: string | null;
  megamenu_items?: MegaMenuItemData[];
  is_visible?: boolean;
}

interface NavbarProps {
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
  navbarItems?: NavbarItemData[];
  megamenuItems?: MegaMenuItemData[];
  /** Landing slug for dynamic URL building (e.g., 'home', 'laptops-estudiantes') */
  landing?: string;
  /** Offset from top when preview banner is shown (in pixels) */
  previewBannerOffset?: number;
}

// Map de iconos para megamenu (sincronizado con admin MEGAMENU_ICONS)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Dispositivos
  Laptop,
  Tablet,
  Smartphone,
  Monitor,
  Tv,
  Watch,
  Headphones,
  Camera,
  Gamepad2,
  Printer,
  // Comercio
  ShoppingBag,
  Package,
  Gift,
  Tag,
  Percent,
  Star,
  CreditCard,
  // Otros
  Zap,
  Clock,
  ArrowRight,
};

export const Navbar: React.FC<NavbarProps> = ({ hidePromoBanner = false, fullWidth = false, minimal = false, logoOnly = false, rightContent, mobileRightContent, activeSections = [], promoBannerData, logoUrl, customerPortalUrl, navbarItems = [], megamenuItems = [], landing = 'home', previewBannerOffset = 0 }) => {
  // Normalize landing to remove trailing slashes
  const normalizedLanding = landing.replace(/\/+$/, '');
  const heroUrl = `/prototipos/0.6/${normalizedLanding}`;

  // Transform links: handle relative paths and build full URLs
  const transformLink = (href: string): string => {
    if (!href) return '#';

    // Skip external links, anchors, and special protocols
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return href;
    }

    // Handle anchors - prepend heroUrl
    if (href.startsWith('#')) {
      return `${heroUrl}${href}`;
    }

    // If it's an absolute path starting with /prototipos, return as-is
    if (href.startsWith('/prototipos/')) {
      return href;
    }

    // Relative path: build full URL with landing base
    return `${heroUrl}/${href}`;
  };

  // Check if a link is external (opens in new tab)
  const isExternalLink = (href: string): boolean => {
    return href.startsWith('http://') || href.startsWith('https://');
  };

  // Transform megamenuItems from API (legacy - para compatibilidad)
  const legacyMegaMenuItems = megamenuItems.map(item => ({
    label: item.label,
    href: transformLink(item.href),
    icon: iconMap[item.icon] || ArrowRight,
    description: item.description,
  }));

  // Transform navbarItems from API (no fallback - data must come from backend)
  // Ahora cada item puede tener su propio megamenu_items
  const allNavItems = navbarItems.map(item => ({
    label: item.label,
    href: transformLink(item.href),
    megaMenuType: item.has_megamenu ? 'equipos' as const : undefined,
    section: item.section,
    badge_text: item.badge_text,
    badge_color: item.badge_color,
    is_visible: item.is_visible,
    // Transformar megamenu_items individuales
    megaMenuItems: (item.megamenu_items || []).map(mi => ({
      label: mi.label,
      href: transformLink(mi.href),
      icon: iconMap[mi.icon] || ArrowRight,
      description: mi.description,
    })),
  }));

  // Filtrar items según visibilidad y secciones activas
  // 1. Solo mostrar items visibles (is_visible !== false)
  // 2. Items sin section (null o "") siempre se muestran
  // 3. Items con section solo se muestran si la sección está activa
  const navItems = allNavItems.filter(item =>
    item.is_visible !== false &&
    (!item.section || activeSections.includes(item.section))
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'equipos' | 'convenios' | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Logo Only mode: blue background with centered white logo
  if (logoOnly) {
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 shadow-lg"
        style={{
          backgroundColor: 'var(--color-primary, #4654CD)',
          boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--color-primary, #4654CD) 20%, transparent)',
        }}
      >
        <div className="flex justify-center py-5">
          <img
            src={logoUrl}
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
        <div
          className="fixed left-0 right-0 z-[60] text-white text-center py-2 sm:py-2.5 px-4 text-sm"
          style={{
            top: previewBannerOffset,
            background: `linear-gradient(to right, var(--color-primary, #4654CD), color-mix(in srgb, var(--color-primary, #4654CD) 85%, white))`,
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 relative">
            <Zap className="w-4 h-4 shrink-0 hidden sm:block" style={{ color: 'var(--color-secondary, #03DBD0)' }} />
            <span className="pr-8 sm:pr-0">
              {promoBannerData.highlight && <strong>{promoBannerData.highlight}</strong>} {promoBannerData.text}
              {promoBannerData.ctaText && promoBannerData.ctaUrl && (
                <a href={transformLink(promoBannerData.ctaUrl)} className="underline font-semibold ml-2 hover:no-underline">
                  {promoBannerData.ctaText}
                </a>
              )}
            </span>
            {promoBannerData.dismissible !== false && (
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
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
        style={{ top: showPromo && !hidePromoBanner && promoBannerData ? (40 + previewBannerOffset) : previewBannerOffset }}
      >
        <div className={fullWidth ? "px-4 lg:px-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href={heroUrl} className="flex items-center">
              <img
                src={logoUrl}
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
                      className="flex items-center gap-1 text-neutral-600 text-sm font-medium transition-colors hover:[color:var(--color-primary,#4654CD)]"
                      {...(isExternalLink(item.href) && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      {item.label}
                      {item.megaMenuType && <ChevronDown className={`w-3 h-3 transition-transform ${activeMegaMenu === item.megaMenuType ? 'rotate-180' : ''}`} />}
                      {item.badge_text && (
                        <Chip
                          size="sm"
                          radius="sm"
                          classNames={{
                            base: 'absolute -top-4 -right-6 px-1 py-0 h-4 min-w-0',
                            content: 'text-[10px] font-bold text-white px-1',
                          }}
                          style={{ backgroundColor: item.badge_color || 'var(--color-secondary, #03DBD0)' }}
                        >
                          {item.badge_text}
                        </Chip>
                      )}
                    </a>

                    {/* MegaMenu - Individual por item */}
                    {item.megaMenuType === 'equipos' && item.megaMenuItems.length > 0 && (
                      <AnimatePresence>
                        {activeMegaMenu === 'equipos' && (
                          <motion.div
                            className="absolute top-full left-0 pt-2 w-80 z-[100]"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div className="bg-white rounded-xl shadow-xl border border-neutral-100 p-4 grid gap-2">
                              {item.megaMenuItems.map((menuItem) => (
                                <a
                                  key={menuItem.label}
                                  href={menuItem.href}
                                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
                                  onClick={(e) => {
                                    handleAnchorClick(e, menuItem.href);
                                    setActiveMegaMenu(null);
                                  }}
                                  {...(isExternalLink(menuItem.href) && { target: '_blank', rel: 'noopener noreferrer' })}
                                >
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                    style={{
                                      backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)',
                                    }}
                                  >
                                    <menuItem.icon className="w-5 h-5 [color:var(--color-primary,#4654CD)]" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-neutral-800 group-hover:[color:var(--color-primary,#4654CD)] transition-colors">
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
                  href={customerPortalUrl}
                  target="_blank"
                  variant="bordered"
                  radius="lg"
                  className="font-medium cursor-pointer transition-colors hover:text-white"
                  style={{
                    borderColor: 'var(--color-primary, #4654CD)',
                    color: 'var(--color-primary, #4654CD)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary, #4654CD)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = 'var(--color-primary, #4654CD)';
                  }}
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
                          className="flex items-center justify-between w-full py-3 text-neutral-600 font-medium cursor-pointer hover:[color:var(--color-primary,#4654CD)]"
                          onClick={() => setMobileExpanded(mobileExpanded === item.megaMenuType ? null : item.megaMenuType!)}
                        >
                          <span className="flex items-center gap-2">
                            {item.label}
                            {item.badge_text && (
                              <Chip
                                size="sm"
                                radius="sm"
                                classNames={{
                                  base: 'px-1.5 py-0 h-5',
                                  content: 'text-[10px] font-bold text-white',
                                }}
                                style={{ backgroundColor: item.badge_color || 'var(--color-secondary, #03DBD0)' }}
                              >
                                {item.badge_text}
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
                                {item.megaMenuType === 'equipos' && item.megaMenuItems.map((subItem) => (
                                  <a
                                    key={subItem.label}
                                    href={subItem.href}
                                    className="block py-2 text-sm text-neutral-500 hover:[color:var(--color-primary,#4654CD)]"
                                    onClick={(e) => {
                                      // External links don't need special handling
                                      if (isExternalLink(subItem.href)) {
                                        setIsMenuOpen(false);
                                        return;
                                      }
                                      const hashIndex = subItem.href.indexOf('#');
                                      if (hashIndex !== -1) {
                                        const anchor = subItem.href.substring(hashIndex);
                                        const pathBeforeAnchor = subItem.href.substring(0, hashIndex);
                                        const currentPath = window.location.pathname;

                                        // Normalize paths by removing trailing slash
                                        const normalizePath = (path: string) => path.replace(/\/$/, '');
                                        const isOnTargetPage = pathBeforeAnchor && normalizePath(currentPath) === normalizePath(pathBeforeAnchor);

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
                                      } else {
                                        setIsMenuOpen(false);
                                      }
                                    }}
                                    {...(isExternalLink(subItem.href) && { target: '_blank', rel: 'noopener noreferrer' })}
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
                        className="block py-3 text-neutral-600 font-medium hover:[color:var(--color-primary,#4654CD)]"
                        {...(isExternalLink(item.href) && { target: '_blank', rel: 'noopener noreferrer' })}
                        onClick={(e) => {
                          // External links don't need special handling
                          if (isExternalLink(item.href)) {
                            setIsMenuOpen(false);
                            return;
                          }
                          const hashIndex = item.href.indexOf('#');
                          if (hashIndex !== -1) {
                            const anchor = item.href.substring(hashIndex);
                            const pathBeforeAnchor = item.href.substring(0, hashIndex);
                            const currentPath = window.location.pathname;

                            // Normalize paths by removing trailing slash
                            const normalizePath = (path: string) => path.replace(/\/$/, '');
                            const isOnTargetPage = pathBeforeAnchor && normalizePath(currentPath) === normalizePath(pathBeforeAnchor);

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
                    href={customerPortalUrl}
                    target="_blank"
                    variant="bordered"
                    radius="lg"
                    className="w-full font-medium cursor-pointer transition-colors"
                    style={{
                      borderColor: 'var(--color-primary, #4654CD)',
                      color: 'var(--color-primary, #4654CD)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary, #4654CD)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = 'var(--color-primary, #4654CD)';
                    }}
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
