'use client';

/**
 * NavbarV3 - Fondo solido que cambia estilo al scroll
 *
 * Caracteristicas:
 * - Siempre con fondo solido (NUNCA transparente)
 * - Cambia de estilo sutil al hacer scroll
 * - Transicion suave de colores
 * - Logo y texto adaptan colores
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { NavbarProps } from '../../../types/hero';
import { mockNavItems } from '../../../data/mockHeroData';

export const NavbarV3: React.FC<NavbarProps> = ({
  logoSrc = '/logo-baldecash.svg',
  items = mockNavItems,
  onLogin,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-sm'
          : 'bg-[#4654CD]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/prototipos/0.3/hero" className="flex items-center">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className={`h-8 object-contain transition-all ${
                isScrolled ? '' : 'brightness-0 invert'
              }`}
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? item.isActive
                      ? 'text-[#4654CD]'
                      : 'text-neutral-600 hover:text-[#4654CD]'
                    : item.isActive
                    ? 'text-white'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="bordered"
              className={`font-medium transition-colors cursor-pointer ${
                isScrolled
                  ? 'border-[#4654CD] text-[#4654CD]'
                  : 'border-white text-white hover:bg-white/10'
              }`}
              startContent={<User className="w-4 h-4" />}
              onPress={onLogin}
            >
              Zona Estudiantes
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors cursor-pointer ${
              isScrolled ? 'hover:bg-neutral-100' : 'hover:bg-white/20'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {isMobileMenuOpen ? (
              <X
                className={`w-6 h-6 ${
                  isScrolled ? 'text-neutral-700' : 'text-white'
                }`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${
                  isScrolled ? 'text-neutral-700' : 'text-white'
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-neutral-100"
          >
            <div className="px-4 py-4 space-y-1">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    item.isActive
                      ? 'bg-[#4654CD]/5 text-[#4654CD]'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              ))}
              <div className="pt-4 border-t border-neutral-100 mt-4">
                <Button
                  variant="bordered"
                  className="w-full border-[#4654CD] text-[#4654CD] font-medium cursor-pointer"
                  startContent={<User className="w-4 h-4" />}
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    onLogin?.();
                  }}
                >
                  Zona Estudiantes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavbarV3;
