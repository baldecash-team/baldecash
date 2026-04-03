'use client';

/**
 * HomeSkeleton - Skeleton de la landing home (above-the-fold)
 * Replica la estructura visible del hero: navbar + hero banner
 * con imagen de fondo en blur y placeholders animados
 */

const HERO_BG_URL = 'https://baldecash.s3.amazonaws.com/landings/1/hero-0979679d.webp';

function ShimmerBlock({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-white/20 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Navbar skeleton */}
      <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="h-8 w-32 rounded bg-neutral-200 animate-pulse" />
          {/* Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <div className="h-4 w-16 rounded bg-neutral-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-neutral-200 animate-pulse" />
            <div className="h-4 w-16 rounded bg-neutral-200 animate-pulse" />
          </div>
          {/* CTA button */}
          <div className="hidden md:block h-10 w-40 rounded-lg bg-neutral-200 animate-pulse" />
          {/* Mobile menu icon */}
          <div className="md:hidden h-6 w-6 rounded bg-neutral-200 animate-pulse" />
        </div>
      </div>

      {/* Hero banner skeleton */}
      <main className="flex-1 pt-16">
        <section className="relative min-h-[600px] h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden">
          {/* Background image blurred */}
          <img
            src={HERO_BG_URL}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

          {/* Content placeholders */}
          <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl w-full">
              {/* Badge */}
              <ShimmerBlock className="h-7 w-36 mb-6" />

              {/* Headline */}
              <ShimmerBlock className="h-12 w-full mb-3" />
              <ShimmerBlock className="h-12 w-3/4 mb-6" />

              {/* Subheadline */}
              <ShimmerBlock className="h-5 w-full mb-2" />
              <ShimmerBlock className="h-5 w-2/3 mb-8" />

              {/* Price box */}
              <ShimmerBlock className="h-16 w-72 rounded-xl mb-8" />

              {/* CTA button */}
              <ShimmerBlock className="h-12 w-52 mb-8" />

              {/* Trust signals */}
              <div className="flex flex-wrap gap-6">
                <ShimmerBlock className="h-5 w-32" />
                <ShimmerBlock className="h-5 w-28" />
                <ShimmerBlock className="h-5 w-36" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
