'use client';

/**
 * NavbarV6 - Con Banner Promocional
 *
 * Concepto: Banner de promoción dismissible con X
 * Estilo: Banner colorido arriba del navbar, con botón para cerrar
 * Uso: Para campañas, ofertas especiales, anuncios importantes
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import { Menu, X, Zap, User } from 'lucide-react';

const navItems = [
  { label: 'Equipos', href: '#equipos' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
];

export const NavbarV6: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);

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
                <a
                  key={item.label}
                  href={item.href}
                  className="relative text-neutral-600 hover:text-[#4654CD] text-sm font-medium transition-colors"
                >
                  {item.label}
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
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="light"
                className="text-neutral-600 font-medium cursor-pointer"
                startContent={<User className="w-4 h-4" />}
              >
                Mi cuenta
              </Button>
              <Button
                radius="lg"
                className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors"
              >
                Solicitar ahora
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
                    onClick={() => setIsMenuOpen(false)}
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
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  <Button
                    variant="bordered"
                    className="w-full border-neutral-300 text-neutral-700 font-medium cursor-pointer"
                    startContent={<User className="w-4 h-4" />}
                  >
                    Mi cuenta
                  </Button>
                  <Button
                    radius="lg"
                    className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
                  >
                    Solicitar ahora
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
