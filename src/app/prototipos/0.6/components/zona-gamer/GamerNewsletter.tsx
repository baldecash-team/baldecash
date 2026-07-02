'use client';

import { useState } from 'react';
import { Phone, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export interface GamerNewsletterData {
  title?: string;
  subtitle?: string;
  button_text?: string;
  placeholder?: string;
  landing_slug?: string;
}

interface GamerNewsletterProps {
  theme: 'dark' | 'light';
  data?: GamerNewsletterData | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export function GamerNewsletter({ theme, data }: GamerNewsletterProps) {
  const isDark = theme === 'dark';
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (phone.length !== 9) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, landing_slug: data?.landing_slug ?? 'zona-gamer' }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus('success');
        setMessage(json.message || '¡Número registrado!');
        setPhone('');
      } else {
        setStatus('error');
        setMessage(json.detail || 'Error al registrar');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión');
    }
  };

  if (!data) return null;
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const bgSurface = isDark ? '#1e1e1e' : '#f0f0f0';
  const textMuted = isDark ? '#707070' : '#888';
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#6366f1' : '#4f46e5';
  const gradient = isDark
    ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(0,255,213,0.05))'
    : 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(14,148,133,0.05))';

  const title = data?.title ?? '';
  const subtitle = data?.subtitle ?? '';
  const buttonText = data?.button_text ?? '';
  const placeholder = data?.placeholder ?? '';

  return (
    <div className="relative overflow-hidden" style={{ background: gradient, borderTop: `1px solid ${border}`, marginTop: 60 }}>
      <div className="absolute top-0 left-0 right-0 h-px opacity-40"
        style={{ background: `linear-gradient(135deg, ${neonPurple}, ${neonCyan})` }} />

      <div
        className="max-w-[1280px] mx-auto flex items-center justify-between gap-8 flex-col md:flex-row"
        style={{ padding: '40px 24px' }}
      >
        <div className="md:text-left text-center">
          <h3
            className="mb-1.5"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: isDark ? '#f0f0f0' : '#1a1a1a', letterSpacing: 0.2 }}
          >
            {title}
          </h3>
          <p className="text-sm" style={{ color: isDark ? '#a0a0a0' : '#555' }}>
            {subtitle}
          </p>
        </div>

        <div className="flex gap-3 items-center flex-col sm:flex-row w-full md:w-auto">
          {status === 'success' ? (
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: neonCyan }}>
              <CheckCircle className="w-5 h-5" />
              {message}
            </div>
          ) : (
            <>
              <div
                className={`flex items-center gap-2 h-11 px-3 w-[280px] max-w-full rounded-xl border-2 transition-all ${isDark ? 'focus-within:border-[#00ffd5] focus-within:shadow-[0_0_15px_rgba(0,255,213,0.1)]' : 'focus-within:border-[#00897a] focus-within:shadow-[0_0_15px_rgba(0,137,122,0.1)]'}`}
                style={{ borderColor: border, background: bgSurface }}
              >
                <Phone className="w-4 h-4 shrink-0" style={{ color: textMuted }} />
                <input
                  type="tel"
                  placeholder={placeholder}
                  maxLength={9}
                  value={phone}
                  disabled={status === 'loading'}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ fontFamily: "'Share Tech Mono', monospace", letterSpacing: 1, color: isDark ? '#f0f0f0' : '#1a1a1a' }}
                />
                <span className="text-[11px] shrink-0" style={{ fontFamily: "'Share Tech Mono', monospace", color: textMuted }}>
                  {phone.length}/9
                </span>
              </div>

              <div className="flex flex-col gap-1 sm:w-auto w-full">
                <button
                  onClick={handleSubmit}
                  disabled={phone.length !== 9 || status === 'loading'}
                  className="flex items-center gap-2 h-11 px-6 border-none rounded-xl text-[13px] font-bold cursor-pointer transition-all hover:-translate-y-0.5 text-white whitespace-nowrap justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{ fontFamily: "'Share Tech Mono', monospace", background: neonPurple }}
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>{buttonText}</span><Send className="w-4 h-4" /></>}
                </button>
                {status === 'error' && (
                  <div className="flex items-center gap-1 text-[11px]" style={{ color: '#ff4444' }}>
                    <AlertCircle className="w-3 h-3" />
                    {message}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
