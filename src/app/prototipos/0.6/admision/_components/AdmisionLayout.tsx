import type { ReactNode } from 'react';

/** Lienzo centrado, fondo blanco, para los flujos de admisión. */
export function AdmisionLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-6 box-border">
      {children}
    </main>
  );
}
