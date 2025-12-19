'use client';

/**
 * NavbarV8 - Minimalista
 *
 * Concepto: Solo logo + CTA, ultra simple
 * Estilo: Maximo espacio negativo, elegante
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, ArrowRight } from 'lucide-react';

const navItems = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
];

export const NavbarV8: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/prototipos/0.4/hero" className="flex items-center">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-10 object-contain"
              />
            </a>

            {/* Desktop - Only CTA */}
            <div className="hidden md:flex items-center">
              <Button
                className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors px-8"
                size="lg"
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Solicitar laptop
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

        {/* Mobile Menu - Slide from right */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 bg-white z-40">
            <div className="flex flex-col h-full">
              <div className="flex-1 px-6 py-8 space-y-6">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block text-2xl font-semibold text-neutral-800 hover:text-[#4654CD] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="p-6 border-t border-neutral-100">
                <Button
                  className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
                  size="lg"
                  endContent={<ArrowRight className="w-4 h-4" />}
                >
                  Solicitar laptop
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavbarV8;
