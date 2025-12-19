'use client';

/**
 * NavbarV5 - Bottom Navigation (Mobile)
 *
 * Concepto: Navbar inferior en mobile, estilo app nativa
 * Estilo: Icons + labels, tab activo destacado
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Home, Grid, HelpCircle, User, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Inicio', href: '#', icon: Home },
  { label: 'Laptops', href: '#laptops', icon: Grid },
  { label: 'Ayuda', href: '#faq', icon: HelpCircle },
  { label: 'Cuenta', href: '#cuenta', icon: User },
];

const topNavItems = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
];

export const NavbarV5: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Top navbar for desktop */}
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
            <div className="hidden md:flex items-center gap-8">
              {topNavItems.map((item) => (
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
                className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors"
              >
                Solicitar ahora
              </Button>
            </div>

            {/* Mobile spacer - bottom nav handles navigation */}
            <div className="md:hidden w-8" />
          </div>
        </div>
      </nav>

      {/* Bottom navigation for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(index)}
              className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${
                activeTab === index
                  ? 'text-[#4654CD]'
                  : 'text-neutral-400'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${
                activeTab === index ? 'text-[#4654CD]' : 'text-neutral-400'
              }`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Safe area spacer for iPhone */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </nav>
    </>
  );
};

export default NavbarV5;
