'use client';

/**
 * NavbarV10 - Con Progreso
 *
 * Concepto: Barra de progreso del funnel de conversion
 * Estilo: Steps visuales, muestra donde esta el usuario
 */

import React, { useState } from 'react';
import { Button, Progress } from '@nextui-org/react';
import { Menu, X, ShoppingCart, Check } from 'lucide-react';

const funnelSteps = [
  { id: 1, label: 'Elegir', completed: true },
  { id: 2, label: 'Datos', completed: false },
  { id: 3, label: 'Verificar', completed: false },
  { id: 4, label: 'Firmar', completed: false },
];

const navItems = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'FAQ', href: '#faq' },
];

export const NavbarV10: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentStep = 1;
  const progressPercent = (currentStep / funnelSteps.length) * 100;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        {/* Progress Bar */}
        <div className="h-1 bg-neutral-100">
          <div
            className="h-full bg-[#4654CD] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

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

            {/* Desktop - Funnel Steps */}
            <div className="hidden lg:flex items-center gap-0">
              {funnelSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        step.completed
                          ? 'bg-[#4654CD] text-white'
                          : currentStep === step.id
                          ? 'bg-[#4654CD]/20 text-[#4654CD] border-2 border-[#4654CD]'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {step.completed ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        step.completed || currentStep === step.id
                          ? 'text-neutral-800'
                          : 'text-neutral-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < funnelSteps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-3 ${
                        step.completed ? 'bg-[#4654CD]' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile - Simple Progress */}
            <div className="flex lg:hidden items-center gap-2">
              <span className="text-xs text-neutral-500">Paso {currentStep} de {funnelSteps.length}</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex lg:hidden items-center gap-6">
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
                className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors"
                startContent={<ShoppingCart className="w-4 h-4" />}
              >
                Mi carrito
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
              {/* Mobile Funnel Steps */}
              <div className="mb-4 pb-4 border-b border-neutral-100">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Tu progreso
                </p>
                <div className="flex items-center justify-between">
                  {funnelSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            step.completed
                              ? 'bg-[#4654CD] text-white'
                              : currentStep === step.id
                              ? 'bg-[#4654CD]/20 text-[#4654CD] border-2 border-[#4654CD]'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          {step.completed ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            step.id
                          )}
                        </div>
                        <span className="text-[10px] mt-1 text-neutral-500">{step.label}</span>
                      </div>
                      {index < funnelSteps.length - 1 && (
                        <div
                          className={`w-6 h-0.5 mx-1 ${
                            step.completed ? 'bg-[#4654CD]' : 'bg-neutral-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
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
                    startContent={<ShoppingCart className="w-4 h-4" />}
                  >
                    Mi carrito
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavbarV10;
