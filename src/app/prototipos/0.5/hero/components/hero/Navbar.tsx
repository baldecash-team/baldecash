'use client';

/**
 * Navbar - Banner Promocional + MegaMenu (basado en V6 de 0.4)
 * Estilo: Banner colorido arriba del navbar, con botón para cerrar
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import { Menu, X, Zap, User, Laptop, ChevronDown, Smartphone, Tablet, ArrowRight } from 'lucide-react';

// Helper function to build internal URLs with mode propagation
const buildInternalUrl = (basePath: string, isCleanMode: boolean) => {
  return isCleanMode ? `${basePath}?mode=clean` : basePath;
};

const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  if (href.startsWith('#')) {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

interface NavbarProps {
  isCleanMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isCleanMode = false }) => {
  const catalogUrl = buildInternalUrl('/prototipos/0.5/catalogo/catalog-preview', isCleanMode);
  const heroUrl = buildInternalUrl('/prototipos/0.5/hero/hero-preview', isCleanMode);

  const megaMenuItems = [
    { label: 'Laptops', href: catalogUrl, icon: Laptop, description: 'Portátiles para trabajo y estudio' },
    { label: 'Tablets', href: catalogUrl, icon: Tablet, description: 'Tablets para toda ocasión' },
    { label: 'Celulares', href: catalogUrl, icon: Smartphone, description: 'Smartphones de todas las marcas' },
    { label: 'Ver más', href: catalogUrl, icon: ArrowRight, description: 'Explora todo el catálogo' },
  ];

  const navItems = [
    { label: 'Equipos', href: catalogUrl, megaMenuType: 'equipos' as const },
    { label: 'Convenios', href: '#convenios' },
    { label: '¿Tienes dudas?', href: '#faq' },
  ];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'equipos' | 'convenios' | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <>
      {/* Promo Banner */}
      <AnimatePresence>
        {showPromo && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#4654CD] to-[#5B68D8] text-white text-center py-2.5 px-4 text-sm"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 relative">
              <Zap className="w-4 h-4 text-[#03DBD0]" />
              <span>
                <strong>Oferta especial:</strong> 0% interés en tu primera cuota
              </span>
              <a href="#ofertas" className="underline font-semibold ml-2 hover:no-underline hidden sm:inline">
                Ver más
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

      <nav
        className="fixed left-0 right-0 z-50 bg-white shadow-sm transition-all duration-200"
        style={{ top: showPromo ? '40px' : 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href={heroUrl} className="flex items-center">
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

            {/* Mobile buttons */}
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

export default Navbar;
