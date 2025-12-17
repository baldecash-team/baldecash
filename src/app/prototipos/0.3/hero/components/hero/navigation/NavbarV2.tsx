'use client';

/**
 * NavbarV2 - Oculta al bajar, aparece al subir
 *
 * Caracteristicas:
 * - Se oculta cuando el usuario hace scroll hacia abajo
 * - Reaparece cuando hace scroll hacia arriba
 * - Transicion suave con framer-motion
 * - Ideal para maximizar espacio de contenido
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { NavbarProps } from '../../../types/hero';
import { mockNavItems } from '../../../data/mockHeroData';

export const NavbarV2: React.FC<NavbarProps> = ({
  logoSrc = '/logo-baldecash.svg',
  items = mockNavItems,
  onLogin,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const direction = latest > lastScrollY ? 'down' : 'up';

    if (direction === 'down' && latest > 100) {
      setIsVisible(false);
      setIsMobileMenuOpen(false);
    } else if (direction === 'up') {
      setIsVisible(true);
    }

    setLastScrollY(latest);
  });

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/prototipos/0.3/hero" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#4654CD] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-['Baloo_2'] font-bold text-xl text-neutral-800 hidden sm:block">
              BaldeCash
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-[#4654CD] ${
                  item.isActive ? 'text-[#4654CD]' : 'text-neutral-600'
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
              className="border-[#4654CD] text-[#4654CD] font-medium cursor-pointer"
              startContent={<User className="w-4 h-4" />}
              onPress={onLogin}
            >
              Zona Estudiantes
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-neutral-700" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-700" />
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

export default NavbarV2;
