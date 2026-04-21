/**
 * Gamer theme utilities — shared across all gamer catalog components.
 */

export function gamerTheme(isDark: boolean) {
  return {
    bg: isDark ? '#0e0e0e' : '#f5f5f5',
    bgCard: isDark ? '#1a1a1a' : '#ffffff',
    bgSurface: isDark ? '#1e1e1e' : '#f0f0f0',
    neonCyan: isDark ? '#00ffd5' : '#00897a',
    neonPurple: isDark ? '#6366f1' : '#4f46e5',
    neonRed: '#ff0055',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#555',
    textMuted: isDark ? '#707070' : '#888',
  };
}

export type GamerTheme = ReturnType<typeof gamerTheme>;

// Badge color mapping — paleta consolidada: cyan (primario), purple (secundario), red (funcional)
export const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  recomendado: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' },
  mas_vendido: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' },
  oferta: { bg: 'rgba(255,0,85,0.2)', text: '#ff3366', border: 'rgba(255,0,85,0.55)' },
  cuota_baja: { bg: 'rgba(0,255,213,0.15)', text: '#00ffd5', border: 'rgba(0,255,213,0.4)' },
  nuevo: { bg: 'rgba(0,255,213,0.15)', text: '#00ffd5', border: 'rgba(0,255,213,0.4)' },
  premium: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' },
  destacado: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' },
  economico: { bg: 'rgba(0,255,213,0.15)', text: '#00ffd5', border: 'rgba(0,255,213,0.4)' },
};
