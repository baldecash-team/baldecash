'use client';

import React, { useState } from 'react';
import { HelpCircle, GraduationCap, MessageSquare } from 'lucide-react';
import { type GamerTheme } from './gamerTheme';

export function GamerHelpButton({ isDark, T, onOpenChat, onStartTour }: { isDark: boolean; T: GamerTheme; onOpenChat: () => void; onStartTour: () => void }) {
  const [open, setOpen] = useState(false);
  const neonCyan = T.neonCyan;
  const border = T.border;
  const bgCard = T.bgCard;
  const textPrimary = T.textPrimary;
  const textMuted = T.textMuted;

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 100 }}>
      {/* Dropdown */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', bottom: 52, left: 0, zIndex: 100,
            width: 256, borderRadius: 12, overflow: 'hidden',
            background: bgCard, border: `1px solid ${border}`,
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
          }}>
            <button
              onClick={() => { setOpen(false); onStartTour(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${border}`,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(0,255,213,0.08)' : 'rgba(0,137,122,0.08)', flexShrink: 0 }}>
                <GraduationCap size={20} style={{ color: neonCyan }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>Ver tour guiado</p>
                <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>Aprende a usar el catálogo</p>
              </div>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onOpenChat();
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,213,0.08)', flexShrink: 0 }}>
                <MessageSquare size={20} style={{ color: '#00ffd5' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>Habla con nosotros</p>
                <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>Te ayudamos al instante</p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: neonCyan, color: isDark ? '#0a0a0a' : '#fff', fontSize: 13, fontWeight: 700,
          fontFamily: "'Rajdhani', sans-serif",
          boxShadow: isDark ? '0 4px 16px rgba(0,255,213,0.3)' : '0 4px 16px rgba(0,137,122,0.25)',
          transition: 'all 0.3s',
        }}
      >
        <HelpCircle size={16} />
        <span className="hidden sm:inline">¿Necesitas ayuda?</span>
      </button>
    </div>
  );
}
