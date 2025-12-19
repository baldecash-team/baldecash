'use client';

/**
 * NavbarV7 - Con Search Prominente
 *
 * Concepto: Barra de busqueda central estilo e-commerce
 * Estilo: Search bar amplio, sugerencias al escribir
 */

import React, { useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import { Menu, X, Search, Laptop, Clock, TrendingUp } from 'lucide-react';

const recentSearches = ['Lenovo Ideapad', 'HP Pavilion', 'MacBook Air'];
const popularSearches = ['Laptops gamer', 'Laptops para estudios', 'Accesorios'];

const navItems = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
];

export const NavbarV7: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <a href="/prototipos/0.4/hero" className="flex items-center flex-shrink-0">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain"
              />
            </a>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Buscar laptops, marcas, modelos..."
                startContent={<Search className="w-4 h-4 text-neutral-400" />}
                classNames={{
                  base: 'w-full',
                  inputWrapper: 'bg-neutral-100 hover:bg-neutral-50 border border-transparent focus-within:border-[#4654CD] focus-within:bg-white transition-all h-10',
                  input: 'text-sm',
                }}
              />

              {/* Search Suggestions Dropdown */}
              {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 z-50">
                  {searchQuery ? (
                    <div className="space-y-2">
                      <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#4654CD]/5 transition-colors cursor-pointer">
                        <Laptop className="w-5 h-5 text-neutral-400" />
                        <span className="text-sm">
                          Resultados para "<span className="font-semibold">{searchQuery}</span>"
                        </span>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Recientes
                        </p>
                        <div className="space-y-1">
                          {recentSearches.map((search) => (
                            <a
                              key={search}
                              href="#"
                              className="block px-2 py-1.5 text-sm text-neutral-600 hover:text-[#4654CD] hover:bg-[#4654CD]/5 rounded-lg transition-colors"
                            >
                              {search}
                            </a>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Populares
                        </p>
                        <div className="space-y-1">
                          {popularSearches.map((search) => (
                            <a
                              key={search}
                              href="#"
                              className="block px-2 py-1.5 text-sm text-neutral-600 hover:text-[#4654CD] hover:bg-[#4654CD]/5 rounded-lg transition-colors"
                            >
                              {search}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-neutral-600 hover:text-[#4654CD] text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <Button
                className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors"
              >
                Solicitar
              </Button>
            </div>

            {/* Mobile buttons */}
            <div className="flex md:hidden items-center gap-2">
              <button
                className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer"
                onClick={() => setIsSearchFocused(!isSearchFocused)}
              >
                <Search className="w-5 h-5 text-neutral-600" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-neutral-100 cursor-pointer"
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
        </div>

        {/* Mobile Search Bar */}
        {isSearchFocused && (
          <div className="md:hidden px-4 pb-4 bg-white border-t border-neutral-100">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar laptops..."
              startContent={<Search className="w-4 h-4 text-neutral-400" />}
              classNames={{
                inputWrapper: 'bg-neutral-100 border border-neutral-200 h-10',
                input: 'text-sm',
              }}
              autoFocus
            />
          </div>
        )}

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

export default NavbarV7;
