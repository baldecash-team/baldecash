interface VideoIntroProps {
  onStart: () => void;
  /** Nombre del solicitante para personalizar el saludo (mejora #6). */
  applicantName?: string;
}

const BULLETS = [
  'Te mostramos una pregunta a la vez.',
  'Respondes con un video corto, a tu ritmo.',
  'Lo revisamos y seguimos con tu solicitud.',
];

/**
 * Pantalla de bienvenida al flujo de video-autoservicio.
 */
export function VideoIntro({ onStart, applicantName }: VideoIntroProps) {
  return (
    <div className="flex flex-col gap-5">
      {applicantName && (
        <p className="text-[#4654CD] text-sm font-semibold">Hola, {applicantName}</p>
      )}
      <h1 className="font-extrabold text-2xl text-[#1f2937] leading-tight">
        Cuéntanos sobre tu negocio
      </h1>

      <p className="text-[#6b7280] text-sm leading-relaxed">
        Para terminar tu evaluación nos encantaría conocerte un poco más. Te haremos 3 preguntas
        cortas y nos respondes en un video; toma menos de 2 minutos y puedes repetir tu respuesta
        las veces que quieras.
      </p>

      <div className="flex flex-col gap-3">
        {BULLETS.map((text, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-[#1f2937]">
            <span className="w-5 h-5 rounded-full bg-[#ECECFB] text-[#4654CD] text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <button
        className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
        onClick={onStart}
      >
        Comenzar
      </button>
    </div>
  );
}
