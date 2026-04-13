'use client';

import { useState } from 'react';
import { Phone, Send } from 'lucide-react';

interface GamerNewsletterProps {
  theme: 'dark' | 'light';
}

export function GamerNewsletter({ theme }: GamerNewsletterProps) {
  const isDark = theme === 'dark';
  const [phone, setPhone] = useState('');
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const bgSurface = isDark ? '#1e1e1e' : '#f0f0f0';
  const textMuted = isDark ? '#707070' : '#888';
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#6366f1' : '#4f46e5';
  const gradient = isDark
    ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(0,255,213,0.05))'
    : 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(14,148,133,0.05))';

  return (
    <div className="relative overflow-hidden" style={{ background: gradient, borderTop: `1px solid ${border}`, marginTop: 60 }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-40"
        style={{ background: `linear-gradient(135deg, ${neonPurple}, ${neonCyan})` }} />

      <div
        className="max-w-[1280px] mx-auto flex items-center justify-between gap-8 flex-col md:flex-row"
        style={{ padding: '40px 24px' }}
      >
        <div className="md:text-left text-center">
          <h3
            className="mb-1.5"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, fontWeight: 700 }}
          >
            Recibe ofertas exclusivas
          </h3>
          <p className="text-sm" style={{ color: isDark ? '#a0a0a0' : '#555' }}>
            Sé el primero en enterarte de promociones y nuevos equipos
          </p>
        </div>

        <div className="flex gap-3 items-center flex-col sm:flex-row w-full md:w-auto">
          <div
            className="flex items-center gap-2 h-11 px-3 w-[280px] max-w-full rounded-xl border-2 transition-all focus-within:border-[#00ffd5] focus-within:shadow-[0_0_15px_rgba(0,255,213,0.1)]"
            style={{ borderColor: border, background: bgSurface }}
          >
            <Phone className="w-4 h-4 shrink-0" style={{ color: textMuted }} />
            <input
              type="tel"
              placeholder="999 999 999"
              maxLength={9}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                letterSpacing: 1,
                color: isDark ? '#f0f0f0' : '#1a1a1a',
              }}
            />
            <span className="text-[11px] shrink-0" style={{ fontFamily: "'Share Tech Mono', monospace", color: textMuted }}>
              {phone.length}/9
            </span>
          </div>

          <button
            className="flex items-center gap-2 h-11 px-6 border-none rounded-xl text-[13px] font-bold cursor-pointer transition-all hover:-translate-y-0.5 text-white whitespace-nowrap sm:w-auto w-full justify-center"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              background: neonPurple,
            }}
          >
            Enviar
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
