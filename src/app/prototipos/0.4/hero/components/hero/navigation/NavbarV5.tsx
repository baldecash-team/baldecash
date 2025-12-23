'use client';

/**
 * NavbarV5 - Search Prominente (E-commerce Style)
 *
 * Concepto: Barra de búsqueda central prominente estilo e-commerce
 * Estilo: Search bar amplio, sugerencias al escribir, CTAs claros
 */

import React, { useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import { Menu, X, Search, Laptop, Clock, TrendingUp, Sparkles } from 'lucide-react';

const recentSearches = ['Lenovo Ideapad', 'HP Pavilion', 'MacBook Air'];
const popularSearches = ['Laptops gamer', 'Laptops para estudios', 'Tablets'];

const catalogUrl = '/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=2&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1&pricingoptions=false&mode=clean';
const convenioUrl = '/prototipos/0.4/convenio/convenio-preview?navbar=3&hero=2&benefits=1&testimonials=1&faq=2&cta=6&footer=2&mode=clean';

const navItems = [
  { label: 'Laptops', href: catalogUrl },
  { label: 'Convenios', href: convenioUrl },
  { label: 'Preguntas frecuentes', href: '#faq' },
];

// Smooth scroll handler for anchor links
const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  if (href.startsWith('#')) {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

export const NavbarV5: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Logo */}
            <a href="/prototipos/0.4/hero" className="flex items-center flex-shrink-0">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain"
              />
            </a>

            {/* Search Bar - Desktop - Prominente */}
            <div className="hidden md:flex flex-1 max-w-2xl relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="¿Qué laptop estás buscando?"
                startContent={<Search className="w-5 h-5 text-[#4654CD]" />}
                classNames={{
                  base: 'w-full',
                  inputWrapper: 'bg-[#4654CD]/5 hover:bg-[#4654CD]/10 border-2 border-[#4654CD]/20 focus-within:border-[#4654CD] focus-within:bg-white transition-all h-12 rounded-xl shadow-none ring-0 outline-none focus-within:ring-0',
                  input: 'text-base placeholder:text-neutral-500 focus:ring-0 focus:outline-none',
                  innerWrapper: 'focus:ring-0',
                }}
              />

              {/* Search Suggestions Dropdown */}
              {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 z-50">
                  {searchQuery ? (
                    <div className="space-y-2">
                      <a href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#4654CD]/5 transition-colors cursor-pointer border border-transparent hover:border-[#4654CD]/20">
                        <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                          <Laptop className="w-5 h-5 text-[#4654CD]" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-neutral-800">
                            Buscar &quot;{searchQuery}&quot;
                          </span>
                          <p className="text-xs text-neutral-500">Ver todos los resultados</p>
                        </div>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Búsquedas recientes */}
                      <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" /> Búsquedas recientes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search) => (
                            <a
                              key={search}
                              href="#"
                              className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 hover:bg-[#4654CD]/10 hover:text-[#4654CD] rounded-full transition-colors font-medium"
                            >
                              {search}
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Populares */}
                      <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5" /> Más buscados
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {popularSearches.map((search) => (
                            <a
                              key={search}
                              href="#"
                              className="flex items-center gap-2 p-3 text-sm text-neutral-700 bg-gradient-to-r from-neutral-50 to-white border border-neutral-100 hover:border-[#4654CD]/30 hover:from-[#4654CD]/5 hover:to-white rounded-xl transition-all"
                            >
                              <Sparkles className="w-4 h-4 text-[#03DBD0]" />
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
            <div className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="text-neutral-600 hover:text-[#4654CD] text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <Button
                as="a"
                href="https://zonaclientes.baldecash.com"
                target="_blank"
                size="md"
                radius="lg"
                variant="bordered"
                className="border-neutral-300 text-neutral-700 font-semibold cursor-pointer px-6"
              >
                Mi cuenta
              </Button>
            </div>

            {/* Mobile buttons */}
            <div className="flex md:hidden items-center gap-2">
              <button
                className="p-2.5 rounded-xl bg-[#4654CD]/10 hover:bg-[#4654CD]/20 cursor-pointer transition-colors"
                onClick={() => {
                  setIsSearchFocused(!isSearchFocused);
                  setIsMenuOpen(false);
                }}
              >
                <Search className="w-5 h-5 text-[#4654CD]" />
              </button>
              <button
                className="p-2.5 rounded-xl hover:bg-neutral-100 cursor-pointer transition-colors"
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  setIsSearchFocused(false);
                }}
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
              placeholder="¿Qué laptop buscas?"
              startContent={<Search className="w-5 h-5 text-[#4654CD]" />}
              classNames={{
                inputWrapper: 'bg-[#4654CD]/5 border-2 border-[#4654CD]/20 h-12 rounded-xl',
                input: 'text-base',
              }}
              autoFocus
            />
            {/* Mobile search suggestions */}
            <div className="mt-3 space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase">Populares</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <a
                    key={search}
                    href="#"
                    className="px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded-full"
                  >
                    {search}
                  </a>
                ))}
              </div>
            </div>
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
                  className="block py-3 text-neutral-700 hover:text-[#4654CD] font-medium text-lg"
                  onClick={(e) => {
                    handleAnchorClick(e, item.href);
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-neutral-100">
                <Button
                  as="a"
                  href="https://zonaclientes.baldecash.com"
                  target="_blank"
                  size="lg"
                  radius="lg"
                  variant="bordered"
                  className="w-full border-neutral-300 text-neutral-700 font-semibold cursor-pointer h-12"
                >
                  Mi cuenta
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavbarV5;
