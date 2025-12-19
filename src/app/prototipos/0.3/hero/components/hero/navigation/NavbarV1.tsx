'use client';

/**
 * NavbarV1 - Sticky siempre visible con fondo solido
 *
 * Caracteristicas:
 * - Siempre visible al hacer scroll
 * - Fondo solido blanco con sombra sutil
 * - Logo a la izquierda, items al centro, CTA a la derecha
 * - Mobile: hamburger menu
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavbarProps } from '../../../types/hero';
import { mockNavItems } from '../../../data/mockHeroData';

export const NavbarV1: React.FC<NavbarProps> = ({
  logoSrc = '/logo-baldecash.svg',
  items = mockNavItems,
  onLogin,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/prototipos/0.3/hero" className="flex items-center">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-8 object-contain"
            />
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
    </nav>
  );
};

export default NavbarV1;
