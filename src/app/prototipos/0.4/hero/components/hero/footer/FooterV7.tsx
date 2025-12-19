'use client';

/**
 * FooterV7 - Con Social Feed
 *
 * Concepto: Preview de Instagram/TikTok
 * Estilo: Conexion con redes sociales
 */

import React from 'react';
import { Instagram, Heart, MessageCircle, Facebook, Linkedin } from 'lucide-react';

const instagramPosts = [
  { id: 1, likes: 234, comments: 12 },
  { id: 2, likes: 189, comments: 8 },
  { id: 3, likes: 312, comments: 24 },
  { id: 4, likes: 156, comments: 6 },
];

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

export const FooterV7: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Instagram Feed Section */}
      <div className="bg-neutral-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-[#E4405F]" />
              <span className="font-semibold">@baldecash</span>
            </div>
            <a
              href="https://instagram.com/baldecash"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#4654CD] hover:underline"
            >
              Seguir en Instagram
            </a>
          </div>

          {/* Instagram Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {instagramPosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square bg-neutral-700 rounded-lg overflow-hidden group cursor-pointer"
              >
                {/* Placeholder for image */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#4654CD]/30 to-[#03DBD0]/30" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
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

          {/* Social */}
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

export default FooterV7;
