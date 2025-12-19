'use client';

/**
 * FooterV9 - Con Calculadora
 *
 * Concepto: Mini simulador de cuotas
 * Estilo: Herramienta util en el footer
 */

import React, { useState } from 'react';
import { Button, Slider } from '@nextui-org/react';
import { Calculator, ArrowRight, Facebook, Instagram, Linkedin } from 'lucide-react';

const quickLinks = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Términos', href: '#terminos' },
];

const socialLinks = [
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
];

export const FooterV9: React.FC = () => {
  const [amount, setAmount] = useState(2500);
  const [months, setMonths] = useState(24);
  const currentYear = new Date().getFullYear();

  const monthlyQuota = Math.round((amount / months) * 1.15);

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Calculator Section */}
      <div className="bg-[#4654CD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5" />
                <span className="font-semibold">Calcula tu cuota</span>
              </div>
              <p className="text-white/80 text-sm">
                Simula cuánto pagarías mensualmente por tu laptop
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="space-y-6">
                {/* Amount Slider */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Monto</span>
                    <span className="font-semibold">S/{amount.toLocaleString()}</span>
                  </div>
                  <Slider
                    aria-label="Monto"
                    size="sm"
                    step={100}
                    minValue={1000}
                    maxValue={5000}
                    value={amount}
                    onChange={(value) => setAmount(value as number)}
                    classNames={{
                      filler: 'bg-white',
                      thumb: 'bg-white border-2 border-white w-4 h-4 shadow-sm cursor-pointer',
                      track: 'bg-white/30 h-1',
                    }}
                  />
                </div>

                {/* Months Slider */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Plazo</span>
                    <span className="font-semibold">{months} meses</span>
                  </div>
                  <Slider
                    aria-label="Plazo"
                    size="sm"
                    step={6}
                    minValue={12}
                    maxValue={48}
                    value={months}
                    onChange={(value) => setMonths(value as number)}
                    classNames={{
                      filler: 'bg-white',
                      thumb: 'bg-white border-2 border-white w-4 h-4 shadow-sm cursor-pointer',
                      track: 'bg-white/30 h-1',
                    }}
                  />
                </div>

                {/* Result */}
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs">Tu cuota mensual</p>
                      <p className="text-2xl font-bold font-['Baloo_2']">
                        S/{monthlyQuota}
                      </p>
                    </div>
                    <Button
                      className="bg-white text-[#4654CD] font-semibold cursor-pointer hover:bg-neutral-100 transition-colors"
                      endContent={<ArrowRight className="w-4 h-4" />}
                    >
                      Solicitar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <a href="/prototipos/0.4/hero" className="flex items-center">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-8 object-contain brightness-0 invert"
            />
          </a>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Social & Copyright */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-[#4654CD] transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            © {currentYear} Balde K S.A.C. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV9;
