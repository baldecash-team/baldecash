'use client';

/**
 * FooterV3 - Compacto con CTA WhatsApp
 *
 * Caracteristicas:
 * - Logo pequeno
 * - Links esenciales inline
 * - WhatsApp como CTA destacado
 * - Copyright minimal
 * - Fondo: #4654CD (primario)
 */

import React from 'react';
import Link from 'next/link';
import { Button } from '@nextui-org/react';
import { MessageCircle, Shield, Lock, Award } from 'lucide-react';
import { FooterProps } from '../../../types/hero';

const certIcons = {
  Shield: Shield,
  Lock: Lock,
  Award: Award,
};

export const FooterV3: React.FC<FooterProps> = ({ data }) => {
  const whatsappLink = data.social.find((s) => s.platform === 'whatsapp');

  return (
    <footer className="bg-[#4654CD] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Top Row: Logo + WhatsApp CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <img
            src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
            alt="BaldeCash"
            className="h-8 object-contain brightness-0 invert"
          />

          {whatsappLink && (
            <Button
              as="a"
              href={whatsappLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#4654CD] font-semibold"
              startContent={<MessageCircle className="w-4 h-4" />}
            >
              Chatea con nosotros
            </Button>
          )}
        </div>

        {/* Links Inline */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {data.navigation.flatMap((section) =>
            section.links.slice(0, 2).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))
          )}
        </div>

        {/* Certifications */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {data.certifications.map((cert) => {
            const Icon = certIcons[cert.icon as keyof typeof certIcons];
            return (
              <div key={cert.name} className="flex items-center gap-1.5 text-white/60">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span className="text-xs">{cert.description}</span>
              </div>
            );
          })}
        </div>

        {/* Legal */}
        <div className="text-center border-t border-white/20 pt-4">
          <div className="flex flex-wrap justify-center gap-4 mb-2">
            {data.legal.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white/50 hover:text-white text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-white/40 text-xs">{data.legal.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV3;
