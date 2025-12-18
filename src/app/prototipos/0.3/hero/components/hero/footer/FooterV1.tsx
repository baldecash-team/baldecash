'use client';

/**
 * FooterV1 - Minimalista Oscuro
 *
 * Caracteristicas:
 * - Logo centrado + links inline
 * - Social icons circulares
 * - Copyright en una linea
 * - Fondo: neutral-900
 */

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, MessageCircle, Phone, Shield, Lock, Award } from 'lucide-react';
import { FooterProps } from '../../../types/hero';

const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: MessageCircle,
  whatsapp: Phone,
};

const certIcons = {
  Shield: Shield,
  Lock: Lock,
  Award: Award,
};

export const FooterV1: React.FC<FooterProps> = ({ data }) => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Logo + Tagline Centered */}
        <div className="text-center mb-6">
          <h2 className="font-['Baloo_2'] text-2xl font-bold">
            {data.logo.text}<span className="text-[#03DBD0]">.com</span>
          </h2>
          <p className="text-neutral-400 text-sm mt-1">{data.logo.tagline}</p>
        </div>

        {/* Links Inline */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {data.navigation.flatMap((section) =>
            section.links.slice(0, 2).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-neutral-400 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))
          )}
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-3 mb-6">
          {data.social.map((social) => {
            const Icon = socialIcons[social.platform];
            return (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-[#4654CD] transition-colors"
                aria-label={social.label}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>

        {/* Certifications */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {data.certifications.map((cert) => {
            const Icon = certIcons[cert.icon as keyof typeof certIcons];
            return (
              <div key={cert.name} className="flex items-center gap-1.5 text-neutral-500">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span className="text-xs">{cert.description}</span>
              </div>
            );
          })}
        </div>

        {/* Legal */}
        <div className="text-center border-t border-neutral-800 pt-4">
          <div className="flex flex-wrap justify-center gap-4 mb-2">
            {data.legal.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-neutral-500 hover:text-white text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-neutral-600 text-xs">{data.legal.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterV1;
