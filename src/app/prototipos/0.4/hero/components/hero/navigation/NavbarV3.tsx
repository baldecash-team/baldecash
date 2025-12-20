'use client';

/**
 * NavbarV3 - Transparente a Solido
 *
 * Concepto: Transparente en top, se vuelve solido al scroll
 * Estilo: Transicion suave de transparente a blanco
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Menu, X, User } from 'lucide-react';

const navItems = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
];

export const NavbarV3: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/prototipos/0.4/hero" className="flex items-center">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className={`h-8 object-contain transition-all ${
                isScrolled ? 'brightness-100' : 'brightness-0 invert'
              }`}
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? 'text-neutral-600 hover:text-[#4654CD]'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="light"
              radius="lg"
              className={`font-medium cursor-pointer ${
                isScrolled ? 'text-neutral-600' : 'text-white'
              }`}
              startContent={<User className="w-4 h-4" />}
            >
              Mi cuenta
            </Button>
            <Button
              radius="lg"
              className={`font-semibold cursor-pointer transition-colors ${
                isScrolled
                  ? 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                  : 'bg-white text-[#4654CD] hover:bg-neutral-100'
              }`}
            >
              Solicitar ahora
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-neutral-600' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-neutral-600' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block py-2 text-neutral-600 hover:text-[#4654CD] font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <Button
                radius="lg"
                className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
              >
                Solicitar ahora
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default NavbarV3;
