/**
 * Banner de error/aviso reutilizable (mejora de UI de mensajes de error).
 * Reemplaza el texto rojo plano por un bloque con ícono, fondo suave y borde.
 */
interface ErrorBannerProps {
  message: string;
  /** `error` (rojo) o `warn` (ámbar). */
  tone?: 'error' | 'warn';
  className?: string;
}

export function ErrorBanner({ message, tone = 'error', className = '' }: ErrorBannerProps) {
  const palette =
    tone === 'warn'
      ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#92400e]'
      : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#b91c1c]';

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm leading-snug text-left ${palette} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 mt-0.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
