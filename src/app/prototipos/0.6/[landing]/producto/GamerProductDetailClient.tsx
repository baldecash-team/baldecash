'use client';

/**
 * GamerProductDetailClient - Detalle de producto con estética gaming (Zona Gamer)
 * Reutiliza fetchProductDetail, useCatalogSharedState, ProductProvider, useProduct.
 * Tema: neon cyan (#00ffd5), neon purple (#6366f1), fondo oscuro (#0e0e0e)
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Heart, Sun, Moon, Zap, Cpu, MemoryStick, HardDrive, Monitor, Wifi, Battery, ShieldCheck } from 'lucide-react';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useCatalogSharedState } from '@/app/prototipos/0.6/[landing]/catalogo/hooks/useCatalogSharedState';
import { ProductProvider, useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { fetchProductDetail, ProductDetailResult } from './api/productDetailApi';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import type { ProductSpec } from './types/detail';

// Theme helper (same as GamerCatalogoClient)
function gamerTheme(isDark: boolean) {
  return {
    bg: isDark ? '#0e0e0e' : '#f5f5f5',
    bgCard: isDark ? '#1a1a1a' : '#ffffff',
    bgSurface: isDark ? '#1e1e1e' : '#f0f0f0',
    neonCyan: isDark ? '#00ffd5' : '#00b396',
    neonPurple: isDark ? '#6366f1' : '#4f46e5',
    neonRed: '#ff0055',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#555',
    textMuted: isDark ? '#707070' : '#888',
  };
}

type Theme = ReturnType<typeof gamerTheme>;

// Spec icon mapping
const SPEC_ICONS: Record<string, React.ReactNode> = {
  procesador: <Cpu size={20} />, processor: <Cpu size={20} />,
  memoria: <MemoryStick size={20} />, ram: <MemoryStick size={20} />,
  almacenamiento: <HardDrive size={20} />, storage: <HardDrive size={20} />,
  pantalla: <Monitor size={20} />, display: <Monitor size={20} />,
  gpu: <Zap size={20} />, 'tarjeta gráfica': <Zap size={20} />,
  conectividad: <Wifi size={20} />, connectivity: <Wifi size={20} />,
  batería: <Battery size={20} />, battery: <Battery size={20} />,
  garantía: <ShieldCheck size={20} />, warranty: <ShieldCheck size={20} />,
};

const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;500;600;700&family=Bebas+Neue&display=swap');`;

// Font shorthand constants
const F = {
  raj: "'Rajdhani', sans-serif",
  orb: "'Orbitron', sans-serif",
  mono: "'Share Tech Mono', monospace",
  bar: "'Barlow Condensed', sans-serif",
  bebas: "'Bebas Neue', sans-serif",
} as const;

// ============================================
// Main export
// ============================================

export function GamerProductDetailClient() {
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';
  return (
    <ProductProvider landingSlug={landing}>
      <Suspense fallback={<LoadingFallback />}>
        <DetailContent />
      </Suspense>
    </ProductProvider>
  );
}

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #2a2a2a', borderTopColor: '#00ffd5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#707070', fontFamily: F.raj, fontSize: 14 }}>Cargando producto...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================
// Content
// ============================================

function DetailContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';
  const slugArray = params.slug as string[] | undefined;
  const slug = slugArray?.join('/') || '';
  const { setSelectedProduct } = useProduct();
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';
  const T = gamerTheme(isDark);

  const [data, setData] = useState<ProductDetailResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState(12);

  const catalogState = useCatalogSharedState(landing, previewKey);

  // Fetch product data
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchProductDetail(landing, slug)
      .then((result) => { if (!cancelled) { setData(result); setIsLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err?.message || 'Error al cargar el producto'); setIsLoading(false); } });
    return () => { cancelled = true; };
  }, [landing, slug]);

  // Set default term from payment plans
  useEffect(() => {
    if (data?.paymentPlans?.length) setSelectedTerm(data.paymentPlans[0].term);
  }, [data]);

  const product = data?.product;
  const paymentPlans = data?.paymentPlans || [];
  const activePlan = paymentPlans.find((p) => p.term === selectedTerm) || paymentPlans[0];
  const lowestOption = activePlan?.options?.[0];
  const isWishlisted = product ? catalogState.isInWishlist(product.id) : false;

  const handleToggleWishlist = useCallback(() => {
    if (!product) return;
    catalogState.toggleWishlist({
      productId: product.id,
      name: product.displayName || product.name,
      shortName: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      lowestQuota: lowestOption?.monthlyQuota || 0,
      brand: product.brand,
      slug: product.slug,
      months: (selectedTerm || 24) as 6 | 12 | 18 | 24,
      initialPercent: 0,
      initialAmount: 0,
      monthlyPayment: lowestOption?.monthlyQuota || 0,
      addedAt: Date.now(),
    });
  }, [product, catalogState, lowestOption, selectedTerm]);

  const handleSolicitar = useCallback(() => {
    if (!product) return;
    setSelectedProduct({
      id: product.id,
      slug: product.slug,
      name: product.displayName || product.name,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: lowestOption?.monthlyQuota || 0,
      months: selectedTerm || 24,
      initialPercent: 0,
      initialAmount: 0,
      image: product.images?.[0]?.url || '',
      type: product.deviceType,
    });
    router.push(routes.solicitar(landing));
  }, [product, landing, router, setSelectedProduct, lowestOption, selectedTerm]);

  if (isLoading) return <LoadingFallback />;

  // Error / not found
  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: F.raj, color: T.textPrimary, padding: 32 }}>
        <style>{FONTS_CSS}</style>
        <Zap size={48} style={{ color: T.neonCyan, marginBottom: 16 }} />
        <h2 style={{ fontSize: 28, fontFamily: F.bebas, letterSpacing: 2, marginBottom: 8 }}>Producto no encontrado</h2>
        <p style={{ color: T.textSecondary, marginBottom: 24, textAlign: 'center' }}>
          {error || 'No pudimos encontrar este producto. Es posible que ya no esté disponible.'}
        </p>
        <button onClick={() => router.push(routes.catalogo(landing))} style={{ background: `linear-gradient(135deg, ${T.neonCyan}, ${T.neonPurple})`, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontFamily: F.raj, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Volver al catálogo
        </button>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [{ id: '0', url: '/images/zona-gamer/placeholder-product.png', alt: product.name, type: 'main' as const }];
  const currentImage = images[selectedImage] || images[0];

  const quickSpecs = product.specs?.slice(0, 5).map((s) => ({ label: s.category, value: s.specs?.[0]?.value || '' })).filter((s) => s.value) || [];
  const availableTerms = paymentPlans.map((p) => p.term);
  const cyanAlpha = (a: number) => isDark ? `rgba(0,255,213,${a})` : `rgba(0,179,150,${a})`;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.textPrimary }}>
      <style>{FONTS_CSS}</style>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @media (min-width: 768px) { .gamer-detail-grid { grid-template-columns: 1fr 420px !important; } }
      `}</style>

      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: isDark ? 'rgba(14,14,14,0.92)' : 'rgba(245,245,245,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => router.push(routes.catalogo(landing))} aria-label="Volver al catálogo" style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: T.textSecondary, fontSize: 14, fontFamily: F.raj }}>
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Catálogo</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={20} style={{ color: T.neonCyan }} />
              <span style={{ fontFamily: F.orb, fontWeight: 700, fontSize: 16, color: T.textPrimary }}>ZONA</span>
              <span style={{ fontFamily: F.orb, fontSize: 11, padding: '2px 8px', background: `linear-gradient(135deg, ${T.neonCyan}, ${T.neonPurple})`, borderRadius: 4, color: '#fff', fontWeight: 700, letterSpacing: 2 }}>GAMING</span>
            </div>
          </div>
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Cambiar tema" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, padding: 8, cursor: 'pointer', color: T.textSecondary, display: 'flex', alignItems: 'center' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* BREADCRUMB */}
      <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px 8px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontFamily: F.raj, color: T.textMuted, flexWrap: 'wrap' }}>
        <button onClick={() => router.push(routes.catalogo(landing))} style={{ background: 'none', border: 'none', color: T.neonCyan, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>Catálogo</button>
        <ChevronRight size={14} />
        <span>{product.brand}</span>
        <ChevronRight size={14} />
        <span style={{ color: T.textSecondary }}>{product.displayName || product.name}</span>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 48px', display: 'grid', gridTemplateColumns: '1fr', gap: 40, animation: 'fadeIn 0.4s ease-out' }} className="gamer-detail-grid">

        {/* LEFT: Gallery */}
        <div>
          <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360, position: 'relative', overflow: 'hidden' }}>
            <Image src={currentImage.url} alt={currentImage.alt || product.name} width={480} height={360} style={{ objectFit: 'contain', maxHeight: 360, width: 'auto' }} priority />
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {images.map((img, idx) => (
                <button key={img.id} onClick={() => setSelectedImage(idx)} style={{ width: 64, height: 64, borderRadius: 8, border: `2px solid ${idx === selectedImage ? T.neonCyan : T.border}`, background: T.bgSurface, cursor: 'pointer', padding: 4, flexShrink: 0, transition: 'border-color 0.2s' }}>
                  <Image src={img.url} alt={img.alt || `Vista ${idx + 1}`} width={56} height={56} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                </button>
              ))}
            </div>
          )}
          <p style={{ fontSize: 11, color: T.textMuted, marginTop: 8, fontFamily: F.mono }}>* Imagen referencial</p>
        </div>

        {/* RIGHT: Pricing (sticky) */}
        <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: 28 }}>
            {/* Brand */}
            <p style={{ fontFamily: F.mono, fontSize: 12, color: T.neonCyan, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{product.brand}</p>
            {/* Product name */}
            <h1 style={{ fontFamily: F.bebas, fontSize: 32, letterSpacing: 1.5, lineHeight: 1.1, margin: '0 0 16px', color: T.textPrimary }}>{product.displayName || product.name}</h1>

            {/* Quick spec chips */}
            {quickSpecs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {quickSpecs.map((s, i) => (
                  <span key={i} style={{ fontSize: 11, fontFamily: F.mono, padding: '4px 10px', borderRadius: 6, background: cyanAlpha(0.08), border: `1px solid ${cyanAlpha(0.2)}`, color: T.neonCyan }}>{s.value}</span>
                ))}
              </div>
            )}

            {/* Price box */}
            <div style={{ background: cyanAlpha(0.05), border: `1px solid ${cyanAlpha(0.15)}`, borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: T.textMuted, fontFamily: F.raj, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Cuota mensual</p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontFamily: F.raj, fontSize: 18, color: T.textSecondary }}>S/</span>
                <span style={{ fontFamily: F.orb, fontSize: 42, fontWeight: 700, color: T.neonCyan, lineHeight: 1 }}>
                  {lowestOption ? Math.round(lowestOption.monthlyQuota) : Math.round(product.lowestQuota)}
                </span>
                <span style={{ fontFamily: F.raj, fontSize: 14, color: T.textMuted }}>/mes</span>
              </div>
              {lowestOption?.initialAmount != null && lowestOption.initialAmount > 0 && (
                <p style={{ fontSize: 11, color: T.textMuted, fontFamily: F.mono, marginTop: 6 }}>Inicial: S/{Math.round(lowestOption.initialAmount)}</p>
              )}
            </div>

            {/* Payment term selector */}
            {availableTerms.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontFamily: F.raj, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Plazo de pago</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {availableTerms.map((term) => (
                    <button key={term} onClick={() => setSelectedTerm(term)} style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, fontFamily: F.bar, fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s',
                      border: term === selectedTerm ? `2px solid ${T.neonCyan}` : `1px solid ${T.border}`,
                      background: term === selectedTerm ? cyanAlpha(0.1) : 'transparent',
                      color: term === selectedTerm ? T.neonCyan : T.textSecondary,
                    }}>{term} meses</button>
                  ))}
                </div>
              </div>
            )}

            {/* Lo quiero */}
            <button onClick={handleSolicitar} style={{ width: '100%', padding: '14px 0', borderRadius: 10, background: `linear-gradient(135deg, ${T.neonCyan}, ${T.neonPurple})`, color: '#fff', fontFamily: F.raj, fontWeight: 700, fontSize: 18, border: 'none', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              Lo quiero
            </button>

            {/* Wishlist */}
            <button onClick={handleToggleWishlist} style={{ width: '100%', padding: '12px 0', borderRadius: 10, background: 'transparent', border: `1px solid ${isWishlisted ? T.neonRed : T.border}`, color: isWishlisted ? T.neonRed : T.textSecondary, fontFamily: F.raj, fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
              <Heart size={16} fill={isWishlisted ? T.neonRed : 'none'} />
              {isWishlisted ? 'En favoritos' : 'Agregar a favoritos'}
            </button>
          </div>
        </div>
      </main>

      {/* SPECS SECTION */}
      {product.specs && product.specs.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 64px' }}>
          <h2 style={{ fontFamily: F.bebas, fontSize: 28, letterSpacing: 2, color: T.textPrimary, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu size={22} style={{ color: T.neonCyan }} /> Especificaciones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {product.specs.map((spec, idx) => (
              <SpecCard key={idx} spec={spec} T={T} />
            ))}
          </div>
        </section>
      )}

      <GamerFooter theme={theme} />
    </div>
  );
}

// ============================================
// Spec Card
// ============================================

function SpecCard({ spec, T }: { spec: ProductSpec; T: Theme }) {
  const icon = SPEC_ICONS[spec.category.toLowerCase()] || <Cpu size={20} />;
  return (
    <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
        <span style={{ color: T.neonCyan }}>{icon}</span>
        <h3 style={{ fontFamily: F.bar, fontWeight: 600, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, margin: 0, color: T.textPrimary }}>{spec.category}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {spec.specs.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontFamily: F.raj, color: T.textMuted }}>{item.label}</span>
            <span style={{ fontSize: 13, fontFamily: F.mono, color: item.highlight ? T.neonCyan : T.textSecondary, textAlign: 'right' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
