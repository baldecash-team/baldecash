import Link from 'next/link';
import { variants, type VariantType } from './shared/lib/variants';

const variantKeys: VariantType[] = ['premium', 'balanced', 'lite'];

const weights: Record<VariantType, string> = {
  premium: '~35 MB',
  balanced: '~13 MB',
  lite: '~5 MB',
};

const icons: Record<VariantType, string> = {
  premium: '🎬',
  balanced: '⚡',
  lite: '🪶',
};

export default function MacbookNeoV3Index() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{
        backgroundColor: '#fbfbfd',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      }}
    >
      <h1
        className="mb-2 text-center text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.025em]"
        style={{ color: '#1d1d1f' }}
      >
        MacBook Neo — Landing V3
      </h1>
      <p className="mb-12 text-center text-lg" style={{ color: '#6e6e73' }}>
        Selecciona una variante para ver la landing page
      </p>

      <div className="grid w-full max-w-[960px] gap-6 md:grid-cols-3">
        {variantKeys.map((key) => {
          const v = variants[key];
          return (
            <Link
              key={key}
              href={`/prototipos/0.5/macbook-neo-v3/${key}`}
              className="group cursor-pointer rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: '#fff',
                borderColor: 'rgba(0,0,0,0.06)',
              }}
            >
              <div className="mb-4 text-4xl">{icons[key]}</div>
              <h2
                className="mb-1 text-xl font-bold"
                style={{ color: '#1d1d1f' }}
              >
                {v.name}
              </h2>
              <p
                className="mb-4 text-sm leading-relaxed"
                style={{ color: '#6e6e73' }}
              >
                {v.description}
              </p>

              <div className="space-y-2 text-xs" style={{ color: '#86868b' }}>
                <div className="flex justify-between">
                  <span>Peso estimado</span>
                  <span className="font-medium">{weights[key]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Smooth scroll</span>
                  <span>{v.useLenis ? 'Lenis' : 'Nativo'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Animaciones</span>
                  <span>
                    {v.useGSAPScrub ? 'GSAP Scrub' : v.useGSAPToggle ? 'GSAP Toggle' : 'CSS'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hero</span>
                  <span>
                    {v.useVideoHero ? 'Video scrub' : v.assets.heroVideo ? 'Video autoplay' : 'Imagen'}
                  </span>
                </div>
              </div>

              <div
                className="mt-6 text-center text-sm font-medium transition-colors group-hover:underline"
                style={{ color: '#0066CC' }}
              >
                Ver variante →
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
