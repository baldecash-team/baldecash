'use client';

/**
 * FooterV8 - Con FAQ Preview
 *
 * Concepto: 3 preguntas frecuentes colapsables
 * Estilo: Soporte inmediato sin salir
 */

import React, { useState } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { HelpCircle, Facebook, Instagram, Linkedin } from 'lucide-react';

const faqItems = [
  {
    question: '¿Necesito historial crediticio?',
    answer: 'No, evaluamos tu perfil de forma integral. Aunque no tengas historial, puedes calificar si eres estudiante de una institución con convenio.',
  },
  {
    question: '¿Cuánto demora la aprobación?',
    answer: 'El proceso es muy rápido. Recibes una respuesta preliminar en minutos y la aprobación final en máximo 24 horas hábiles.',
  },
  {
    question: '¿Puedo pagar antes de tiempo?',
    answer: 'Sí, puedes realizar pagos adelantados sin ninguna penalidad. Incluso puedes cancelar la totalidad de tu deuda cuando quieras.',
  },
];

const quickLinks = [
  { label: 'Laptops', href: '#laptops' },
  { label: 'Convenios', href: '#convenios' },
  { label: 'Términos', href: '#terminos' },
  { label: 'Privacidad', href: '#privacidad' },
];

const socialLinks = [
  { icon: Facebook, href: '#facebook', label: 'Facebook' },
  { icon: Instagram, href: '#instagram', label: 'Instagram' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
];

export const FooterV8: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      {/* FAQ Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-[#4654CD]" />
            <span className="font-semibold">Preguntas frecuentes</span>
          </div>

          <Accordion
            className="gap-2"
            itemClasses={{
              base: 'bg-neutral-800/50 rounded-lg mb-2',
              title: 'text-white text-sm font-medium',
              trigger: 'px-4 py-3 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors',
              content: 'text-neutral-400 text-sm px-4 pb-4',
              indicator: 'text-neutral-400',
            }}
          >
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                aria-label={item.question}
                title={item.question}
              >
                {item.answer}
              </AccordionItem>
            ))}
          </Accordion>

          <a
            href="#faq"
            className="inline-block mt-4 text-sm text-[#4654CD] hover:underline"
          >
            Ver todas las preguntas →
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div>
            <a href="/prototipos/0.4/hero" className="inline-block mb-4">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain brightness-0 invert"
              />
            </a>
            <div className="flex items-center gap-3">
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

          {/* Copyright */}
          <p className="text-sm text-neutral-500">
            © {currentYear} Balde K S.A.C.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV8;
