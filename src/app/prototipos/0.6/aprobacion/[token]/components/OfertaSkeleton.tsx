'use client';

/** Skeleton de carga de la página de oferta: header con logo + tabs + grilla. */
import { Navbar } from '../../../components/hero/Navbar';

export function OfertaSkeleton({ logoUrl }: { logoUrl: string }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar logoOnly fullWidth logoUrl={logoUrl} />
      <div className="pt-16" />

      {/* Tabs placeholder */}
      <div className="border-b border-gray-200 bg-white">
        <div className="w-full px-3 py-2.5 sm:px-4 lg:px-6">
          <div className="flex gap-2">
            <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-9 w-48 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Grilla de cards placeholder */}
      <div className="w-full px-3 py-6 sm:px-4 lg:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-3">
              <div className="mb-3 aspect-[4/3] w-full animate-pulse rounded-xl bg-gray-200" />
              <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="mb-4 h-6 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-10 flex-1 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-10 flex-1 animate-pulse rounded-xl bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
