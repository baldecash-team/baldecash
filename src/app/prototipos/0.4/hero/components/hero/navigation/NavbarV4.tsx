'use client';

/**
 * NavbarV4 - Hamburger Siempre
 *
 * Concepto: Menu hamburger en todas las pantallas
 * Estilo: Fullscreen overlay, minimalista
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Menu, X, ArrowRight } from 'lucide-react';

const catalogUrl = '/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=3&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=3';
const convenioUrl = '/prototipos/0.4/convenio/convenio-preview?navbar=3&hero=2&benefits=1&testimonials=1&faq=2&cta=6&footer=2&mode=clean';

const navItems = [
  { label: 'Laptops', href: catalogUrl },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Convenios', href: convenioUrl },
  { label: 'Preguntas frecuentes', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
];

// Smooth scroll handler for anchor links
const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, closeMenu: () => void) => {
  if (href.startsWith('#')) {
    e.preventDefault();
    closeMenu();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    closeMenu();
  }
};

export const NavbarV4: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
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

            {/* Menu button - Always visible */}
            <button
              className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer flex items-center gap-2"
              onClick={() => setIsMenuOpen(true)}
            >
              <span className="text-sm font-medium text-neutral-600 hidden sm:inline">Menu</span>
              <Menu className="w-6 h-6 text-neutral-600" />
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-100">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain"
              />
              <button
                className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-6 h-6 text-neutral-600" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)]">
              <nav className="space-y-6">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    className="block text-3xl md:text-5xl font-bold text-neutral-900 hover:text-[#4654CD] transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={(e) => handleAnchorClick(e, item.href, () => setIsMenuOpen(false))}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-neutral-100">
              <Button
                as="a"
                href="https://zonaclientes.baldecash.com"
                target="_blank"
                size="lg"
                radius="lg"
                variant="bordered"
                className="w-full border-neutral-300 text-neutral-700 font-semibold cursor-pointer"
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                Mi cuenta
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavbarV4;
