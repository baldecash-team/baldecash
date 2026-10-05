interface SuccessScreenProps {
  title: string;
  message: string;
  /** Muestra el badge "Te avisamos por WhatsApp". */
  whatsapp?: boolean;
}

/**
 * Pantalla de éxito reutilizable (check con anillos + título + mensaje + badge WhatsApp).
 */
export function SuccessScreen({ title, message, whatsapp }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center gap-5 text-center py-6">
      <div className="relative flex items-center justify-center">
        <span className="absolute w-24 h-24 rounded-full bg-[#4654CD]/10" />
        <span className="absolute w-[76px] h-[76px] rounded-full bg-[#4654CD]/20" />
        <div className="relative w-16 h-16 rounded-full bg-[#4654CD] text-white flex items-center justify-center shadow-lg shadow-[#4654CD]/30">
          <svg
            viewBox="0 0 24 24"
            className="w-9 h-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      </div>

      <h1 className="font-extrabold text-2xl text-[#1f2937]">{title}</h1>
      <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs">{message}</p>

      {whatsapp && (
        <div className="flex items-center gap-2 rounded-full bg-[#16a34a]/10 text-[#16a34a] px-4 py-2 text-sm font-medium">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42l-.48-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
          </svg>
          Te avisamos por WhatsApp
        </div>
      )}
    </div>
  );
}
