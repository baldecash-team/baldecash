'use client';

/**
 * FooterV2 - Columnas Claro
 *
 * Caracteristicas:
 * - Logo + tagline a la izquierda
 * - 3 columnas de navegacion
 * - Seccion de contacto
 * - Social icons + certificaciones
 * - Fondo: neutral-100
 */

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, MessageCircle, Phone, Mail, Shield, Lock, Award } from 'lucide-react';
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

export const FooterV2: React.FC<FooterProps> = ({ data }) => {
  return (
    <footer className="bg-neutral-100 text-neutral-800">
      <div className="container mx-auto px-4 py-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div className="lg:col-span-2">
            <div className="mb-2">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain"
              />
            </div>
            <p className="text-neutral-500 text-sm mb-4">{data.logo.tagline}</p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              {data.contact.email && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Mail className="w-4 h-4" />
                  <span>{data.contact.email}</span>
                </div>
              )}
              {data.contact.phone && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="w-4 h-4" />
                  <span>{data.contact.phone}</span>
                </div>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 mt-4">
              {data.social.map((social) => {
                const Icon = socialIcons[social.platform];
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-[#4654CD] hover:text-white hover:border-[#4654CD] transition-colors text-neutral-600"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Columns */}
          {data.navigation.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-neutral-800 mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-500 hover:text-[#4654CD] text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-4 border-t border-neutral-200">
          {data.certifications.map((cert) => {
            const Icon = certIcons[cert.icon as keyof typeof certIcons];
            return (
              <div key={cert.name} className="flex items-center gap-2 text-neutral-500">
                {Icon && <Icon className="w-4 h-4" />}
                <span className="text-xs">{cert.description}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Section - Legal */}
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-400 text-xs">{data.legal.copyright}</p>
            <div className="flex flex-wrap gap-4">
              {data.legal.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-neutral-400 hover:text-[#4654CD] text-xs transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterV2;
