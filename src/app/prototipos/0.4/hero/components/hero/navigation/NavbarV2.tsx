'use client';

/**
 * NavbarV2 - Hide on Scroll Down
 *
 * Concepto: Se oculta al bajar, reaparece al subir
 * Estilo: Animacion suave, fondo solido
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Menu, X, User } from 'lucide-react';

const catalogUrl = '/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=3&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=3';

const navItems = [
  { label: 'Laptops', href: catalogUrl },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'Preguntas frecuentes', href: '#faq' },
];

export const NavbarV2: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const direction = latest > lastScrollY ? 'down' : 'up';
    if (direction === 'down' && latest > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(latest);
  });

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
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
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-neutral-600 hover:text-[#4654CD] text-sm font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              as="a"
              href="https://zonaclientes.baldecash.com"
              target="_blank"
              variant="light"
              radius="lg"
              className="text-neutral-600 font-medium cursor-pointer"
              startContent={<User className="w-4 h-4" />}
            >
              Mi cuenta
            </Button>
          </div>

          {/* Mobile menu button */}
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
            <div className="pt-4 border-t border-neutral-100">
              <Button
                as="a"
                href="https://zonaclientes.baldecash.com"
                target="_blank"
                variant="bordered"
                radius="lg"
                className="w-full border-neutral-300 text-neutral-700 font-medium cursor-pointer"
              >
                Mi cuenta
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default NavbarV2;
