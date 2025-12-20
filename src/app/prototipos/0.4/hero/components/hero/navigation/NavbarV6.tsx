'use client';

/**
 * NavbarV6 - Con Mega Menu
 *
 * Concepto: Dropdown mega menu para categorias
 * Estilo: Grid de categorias con imagenes
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Menu, X, ChevronDown, Laptop, Monitor, Headphones, Mouse, Shield, GraduationCap } from 'lucide-react';

const categories = [
  { label: 'Laptops', href: '#laptops', icon: Laptop, description: 'Para estudios y trabajo' },
  { label: 'PCs', href: '#pcs', icon: Monitor, description: 'Alto rendimiento' },
  { label: 'Accesorios', href: '#accesorios', icon: Headphones, description: 'Complementa tu equipo' },
  { label: 'Periféricos', href: '#perifericos', icon: Mouse, description: 'Teclados, mouse y más' },
  { label: 'Seguros', href: '#seguros', icon: Shield, description: 'Protege tu inversión' },
  { label: 'Estudiantes', href: '#estudiantes', icon: GraduationCap, description: 'Ofertas especiales' },
];

const navItems = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
];

export const NavbarV6: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {/* Productos Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <button className="flex items-center gap-1 text-neutral-600 hover:text-[#4654CD] text-sm font-medium transition-colors cursor-pointer">
                  Productos
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega Menu */}
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 p-6 w-[500px]">
                        <div className="grid grid-cols-2 gap-4">
                          {categories.map((category) => (
                            <a
                              key={category.label}
                              href={category.href}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#4654CD]/5 transition-colors cursor-pointer group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4654CD]/20 transition-colors">
                                <category.icon className="w-5 h-5 text-[#4654CD]" />
                              </div>
                              <div>
                                <p className="font-semibold text-neutral-800 group-hover:text-[#4654CD] transition-colors">
                                  {category.label}
                                </p>
                                <p className="text-xs text-neutral-500">{category.description}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                          <a href="#catalogo" className="text-sm text-[#4654CD] hover:underline font-medium">
                            Ver todo el catálogo →
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
                radius="lg"
                className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors"
              >
                Solicitar ahora
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
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Productos</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {categories.map((category) => (
                  <a
                    key={category.label}
                    href={category.href}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#4654CD]/5 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <category.icon className="w-4 h-4 text-[#4654CD]" />
                    <span className="text-sm text-neutral-700">{category.label}</span>
                  </a>
                ))}
              </div>
              <div className="border-t border-neutral-100 pt-4 space-y-3">
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
              </div>
              <div className="pt-4 border-t border-neutral-100 mt-4">
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
      </nav>
    </>
  );
};

export default NavbarV6;
