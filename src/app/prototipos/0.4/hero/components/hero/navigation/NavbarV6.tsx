'use client';

/**
 * NavbarV6 - Con Banner Promocional y MegaMenu
 *
 * Concepto: Banner de promoción + MegaMenu para equipos
 * Estilo: Banner colorido arriba del navbar, con botón para cerrar
 * Uso: Para campañas, ofertas especiales, anuncios importantes
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import { Menu, X, Zap, User, Laptop, ChevronDown, Smartphone, Monitor, Headphones } from 'lucide-react';

const catalogUrl = '/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=3&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=3';

const megaMenuItems = [
  { label: 'Laptops', href: catalogUrl, icon: Laptop, description: 'Portátiles para trabajo y estudio' },
  { label: 'Celulares', href: catalogUrl, icon: Smartphone, description: 'Smartphones de todas las marcas' },
  { label: 'Monitores', href: catalogUrl, icon: Monitor, description: 'Pantallas para tu productividad' },
  { label: 'Accesorios', href: catalogUrl, icon: Headphones, description: 'Complementa tu equipo' },
];

const convenioUrl = '/prototipos/0.4/convenio/convenio-preview?navbar=3&hero=2&benefits=1&testimonials=1&faq=2&cta=6&footer=2&mode=clean';

const navItems = [
  { label: 'Equipos', href: catalogUrl, hasMegaMenu: true },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Convenios', href: convenioUrl },
  { label: '¿Tienes dudas?', href: '#faq' },
];

// Smooth scroll handler for anchor links
const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  if (href.startsWith('#')) {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

export const NavbarV6: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [showMegaMenu, setShowMegaMenu] = useState(false);

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
            <a href="/prototipos/0.4/hero" className="flex items-center">
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
                  onMouseEnter={() => item.hasMegaMenu && setShowMegaMenu(true)}
                  onMouseLeave={() => item.hasMegaMenu && setShowMegaMenu(false)}
                >
                  <a
                    href={item.href}
                    onClick={(e) => handleAnchorClick(e, item.href)}
                    className="flex items-center gap-1 text-neutral-600 hover:text-[#4654CD] text-sm font-medium transition-colors"
                  >
                    {item.label}
                    {item.hasMegaMenu && <ChevronDown className={`w-3 h-3 transition-transform ${showMegaMenu ? 'rotate-180' : ''}`} />}
                    {index === 0 && (
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: 'absolute -top-4 -right-6 bg-[#03DBD0] px-1 py-0 h-4 min-w-0',
                          content: 'text-[10px] font-bold text-white px-1',
                        }}
                      >
                        NEW
                      </Chip>
                    )}
                  </a>

                  {/* MegaMenu */}
                  {item.hasMegaMenu && (
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
              <div className="px-4 py-4 space-y-3">
                {navItems.map((item, index) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between py-2 text-neutral-600 hover:text-[#4654CD] font-medium"
                    onClick={(e) => {
                      handleAnchorClick(e, item.href);
                      setIsMenuOpen(false);
                    }}
                  >
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
                        NEW
                      </Chip>
                    )}
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

export default NavbarV6;
