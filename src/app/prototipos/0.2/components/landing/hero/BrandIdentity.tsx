"use client";

/**
 * BrandIdentity Component
 *
 * Logo de BaldeCash + tagline
 * Diseño juvenil y cercano que transmite confianza y accesibilidad
 *
 * Estado: ✅ DEFINIDO - 1 versión final
 */

export const BrandIdentity = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 md:py-8">
      {/* Logo BaldeCash */}
      <div className="relative">
        <div className="bg-[#4247d2] px-8 py-4 md:px-12 md:py-6 rounded-2xl shadow-lg">
          <h1
            className="text-4xl md:text-6xl font-bold text-white text-center"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            BaldeCash
          </h1>
        </div>
        {/* Decorative glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-[#4247d2]/30 blur-xl -z-10"></div>
      </div>

      {/* Tagline */}
      <p
        className="text-lg md:text-xl text-[#737373] text-center max-w-xs"
        style={{ fontFamily: "'Asap', sans-serif" }}
      >
        Financiamiento para estudiantes
      </p>

      {/* Decorative underline */}
      <div className="h-1 w-16 bg-[#4247d2] rounded-full mt-2"></div>
    </div>
  );
};
