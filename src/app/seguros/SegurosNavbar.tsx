'use client';

/**
 * SegurosNavbar — header de PRODUCCIÓN para la página /seguros.
 *
 * A diferencia del Navbar del prototipo 0.5 (cuyos enlaces apuntan a
 * /prototipos/0.5/...), este header enlaza a baldecash.com y NO muestra la barra
 * promocional. El logo lleva al home de producción, igual que el navbar de /home.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Menu, X, User } from 'lucide-react';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.baldecash.com';
const ZONA_CLIENTES = 'https://zonaclientes.baldecash.com';
const LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

const navItems = [
  { label: 'Equipos', href: `${SITE}/home/catalogo` },
  { label: 'Convenios', href: `${SITE}/home#convenios` },
  { label: 'Ver requisitos', href: `${SITE}/home#como-funciona` },
  { label: '¿Tienes dudas?', href: `${SITE}/home#faq` },
];

export const SegurosNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo → home de producción */}
          <a href={SITE} className="flex items-center">
            <img src={LOGO} alt="BaldeCash" className="h-8 object-contain" />
          </a>

          {/* Navegación desktop */}
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

          {/* CTA desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              as="a"
              href={ZONA_CLIENTES}
              target="_blank"
              variant="bordered"
              radius="lg"
              className="border-[#4654CD] text-[#4654CD] font-medium cursor-pointer hover:bg-[#4654CD] hover:text-white transition-colors"
              startContent={<User className="w-4 h-4" />}
            >
              Zona Estudiantes
            </Button>
          </div>

          {/* Botón mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir menú"
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

      {/* Menú mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-neutral-100"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block py-3 text-neutral-600 hover:text-[#4654CD] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-neutral-100">
                <Button
                  as="a"
                  href={ZONA_CLIENTES}
                  target="_blank"
                  variant="bordered"
                  radius="lg"
                  className="w-full border-[#4654CD] text-[#4654CD] font-medium cursor-pointer"
                  startContent={<User className="w-4 h-4" />}
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

export default SegurosNavbar;
