'use client';

/**
 * GamerProductDetailClient - Detalle de producto con estética gaming (Zona Gamer)
 * Reutiliza fetchProductDetail, useCatalogSharedState, ProductProvider, useProduct.
 * Tema: neon cyan (#00ffd5), neon purple (#6366f1), fondo oscuro (#0e0e0e)
 */

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Award, Calculator, Calendar, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, Eye, FileText, Headphones, Heart, ImageIcon, Info, Laptop, Network, Package, Percent, Scale, Star, TrendingUp, Usb, X, Zap, Cpu, MemoryStick, HardDrive, Monitor, Wifi, Battery, ShieldCheck, ShoppingCart, CircleAlert } from 'lucide-react';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useCatalogSharedState } from '@/app/prototipos/0.6/[landing]/catalogo/hooks/useCatalogSharedState';
import { ProductProvider, useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { fetchProductDetail, ProductDetailResult } from './api/productDetailApi';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import type { ProductSpec, ProductPort, SimilarProduct } from './types/detail';
import { generateFichaTecnica } from './utils/generateFichaTecnica';
import { generateGamerCronogramaPdf } from './utils/generateGamerCronogramaPdf';

// Theme helper (same as GamerCatalogoClient)
function gamerTheme(isDark: boolean) {
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
  const [selectedInitialPercent, setSelectedInitialPercent] = useState<number>(0);

  const catalogState = useCatalogSharedState(landing, previewKey);

  // Fetch product data desde el endpoint real de zona-gamer — sin fallback a mocks
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchProductDetail(landing, slug)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setData(result);
        } else {
          setError('Producto no encontrado');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Error al cargar el producto');
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [landing, slug]);

  // Set default term from payment plans
  useEffect(() => {
    if (data?.paymentPlans?.length) setSelectedTerm(data.paymentPlans[0].term);
  }, [data]);

  const product = data?.product;
  const paymentPlans = data?.paymentPlans || [];
  const similarProducts = data?.similarProducts || [];
  const limitations = data?.limitations || [];
  const certifications = data?.certifications || [];
  const isAvailable = data?.isAvailable !== false;
  const activePlan = paymentPlans.find((p) => p.term === selectedTerm) || paymentPlans[0];
  const lowestOption = activePlan?.options?.find((o) => o.initialPercent === selectedInitialPercent) || activePlan?.options?.[0];
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
    <div style={{ minHeight: '100vh', background: T.bg, color: T.textPrimary, '--gamer-cyan': T.neonCyan, '--gamer-purple': T.neonPurple, '--gamer-border': T.border, '--gamer-bg-card': T.bgCard, '--gradient-cyber': isDark ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)' } as React.CSSProperties}>
      <style>{FONTS_CSS}</style>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .gamer-gradient-text {
          background: linear-gradient(90deg, var(--gamer-purple) 0%, var(--gamer-cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gallery-img-wrap {
          overflow: hidden;
          cursor: zoom-in;
        }
        .gallery-img-wrap img {
          transition: transform 0.3s ease;
        }
        .gallery-img-wrap:hover img {
          transform: scale(1.8);
        }
        .gallery-thumb {
          width: 72px;
          height: 72px;
          flex: 0 0 72px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid var(--gamer-border, #e5e7eb);
          cursor: pointer;
          transition: border-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: #fff;
        }
        .gallery-thumb.active-thumb {
          border-color: #4654CD;
          box-shadow: 0 0 0 2px rgba(70,84,205,0.2);
        }
        .gallery-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .btn-loquiero-detalle {
          background: var(--gamer-cyan, #00ffd5);
          color: #0a0a0a;
          border: none;
          border-radius: 12px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-loquiero-detalle:hover { filter: brightness(0.9); }
        .spec-card {
          position: relative;
          background: var(--gamer-bg-card, #1a1a1a);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .spec-card::before, .spec-card::after {
          content: '';
          position: absolute;
          width: 14px;
          height: 14px;
          transition: opacity 0.25s ease;
          opacity: 0.4;
        }
        .spec-card::before { top: 9px; left: 9px; border-top: 2px solid var(--gamer-cyan); border-left: 2px solid var(--gamer-cyan); }
        .spec-card::after { bottom: 9px; right: 9px; border-bottom: 2px solid var(--gamer-cyan); border-right: 2px solid var(--gamer-cyan); }
        .spec-card:hover { transform: translateY(-3px); border-color: rgba(0,255,213,0.4); box-shadow: 0 0 20px rgba(0,255,213,0.15), 0 8px 24px rgba(0,0,0,0.4); }
        .spec-card:hover::before, .spec-card:hover::after { opacity: 1; }
        .spec-card-icon {
          width: 40px; height: 40px; border-radius: 8px;
          background: rgba(0,255,213,0.08); border: 1px solid rgba(0,255,213,0.2);
          display: flex; align-items: center; justify-content: center;
          color: var(--gamer-cyan); flex-shrink: 0;
        }
        .spec-card-title {
          font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.5px; color: #ffffff;
        }
        .spec-card-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 12px 0; }
        .spec-row { display: flex; align-items: center; justify-content: space-between; padding: 3px 0; }
        .spec-row-label { font-size: 13px; color: #ffffff; font-family: 'Rajdhani', sans-serif; }
        .spec-row-value { font-size: 13px; font-weight: 600; color: #ffffff; font-family: 'Rajdhani', sans-serif; text-align: right; }
        .spec-row-value.primary { color: var(--gamer-cyan); }
        @media (min-width: 768px) {
          .gamer-specs-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .gamer-detail-grid { grid-template-columns: 1fr 1fr !important; align-items: stretch !important; }
          .gamer-detail-gallery-order { order: 1; }
          .gamer-detail-pricing-order { order: 2; align-self: start; }
        }
        @media (max-width: 1023px) {
          .gamer-detail-gallery-order { order: 2; }
          .gamer-detail-pricing-order { order: 1; }
        }
        .gamer-term-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 0;
        }
        @media (min-width: 768px) {
          .gamer-term-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .gamer-term-grid { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>

      {/* HEADER */}
      <GamerNavbar
        theme={theme}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
        catalogUrl={routes.catalogo(landing)}
      />

      {/* SIDE NAV - only visible on xl+ */}
      <SideNav isDark={isDark} T={T} />

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 48px' }} className="detail-main product-font">
        {/* BREADCRUMB */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontFamily: F.raj, flexWrap: 'wrap', marginBottom: 24 }}>
          <button onClick={() => router.push(routes.landingHome(landing))} style={{ background: 'none', border: 'none', color: isDark ? '#a0a0a0' : '#737373', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0, textDecoration: 'none' }}>Inicio</button>
          <ChevronRight size={14} style={{ color: isDark ? '#555' : '#a3a3a3' }} />
          <button onClick={() => router.push(routes.catalogo(landing))} style={{ background: 'none', border: 'none', color: isDark ? '#a0a0a0' : '#737373', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0, textDecoration: 'none' }}>Catálogo</button>
          <ChevronRight size={14} style={{ color: isDark ? '#555' : '#a3a3a3' }} />
          <span style={{ color: isDark ? '#f0f0f0' : '#262626', fontWeight: 600 }}>{product.displayName || product.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32, alignItems: 'start', animation: 'fadeIn 0.4s ease-out' }} className="gamer-detail-grid">

        {/* LEFT: Gallery */}
        <div id="section-gallery" className="gamer-detail-gallery-order">
          <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Gallery header: brand + rating + title + specs line */}
            <div style={{ padding: '20px 20px 0', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ padding: '6px 12px', background: T.neonPurple, color: '#fff', fontSize: 14, fontWeight: 700, borderRadius: 8 }}>{product.brand}</span>
                {/* Rating solo si el backend trae reviews reales */}
                {product.rating != null && product.reviewCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={20} style={{ color: '#00ffd5', fill: '#00ffd5' }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{product.rating}</span>
                    <span style={{ fontSize: 14, color: T.textMuted }}>({product.reviewCount})</span>
                  </div>
                )}
              </div>
              <h1 className="gamer-gradient-text" style={{ fontFamily: F.raj, fontWeight: 700, fontSize: 'clamp(24px, 3vw, 30px)', lineHeight: 1.2, margin: '0 0 4px' }}>
                {product.displayName || product.name}
              </h1>
              {/* Quick specs pipe-separated line */}
              {quickSpecs.length > 0 && (
                <p style={{ fontSize: 14, fontFamily: F.raj, color: T.textPrimary, margin: '4px 0 0' }}>
                  {quickSpecs.map((s) => s.value).join(' | ')}
                </p>
              )}
            </div>

            {/* Main image viewer */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480, padding: '16px 24px', flex: 1 }}>
              <div
                className="gallery-img-wrap"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2) + '%';
                  const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2) + '%';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transformOrigin = `${x} ${y}`;
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transformOrigin = 'center center';
                }}
              >
                <Image src={currentImage.url} alt={currentImage.alt || product.name} width={480} height={440} style={{ objectFit: 'contain', maxHeight: 440, width: 'auto' }} priority />
              </div>
              {/* Imagen referencial label */}
              <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '5px 12px' }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.7)' }}>Imagen referencial</span>
              </div>
              {/* Image counter */}
              <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '5px 12px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{selectedImage + 1} / {images.length}</span>
              </div>
            </div>

            {/* Thumbnails with arrows */}
            {images.length > 1 && (
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${isDark ? T.border : '#f5f5f5'}` }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', border: `1px solid ${isDark ? T.border : '#e5e7eb'}`, background: isDark ? T.bgCard : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isDark ? T.textMuted : '#d1d5db', opacity: selectedImage === 0 ? 0.3 : 1, transition: 'all 0.2s' }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, transition: 'transform 0.3s' }}>
                      {images.map((img, idx) => (
                        <div
                          key={img.id}
                          className={`gallery-thumb${idx === selectedImage ? ' active-thumb' : ''}`}
                          onClick={() => setSelectedImage(idx)}
                          style={{ background: isDark ? T.bgSurface : '#fff' }}
                          role="button"
                          tabIndex={0}
                        >
                          <Image src={img.url} alt={img.alt || `Vista ${idx + 1}`} width={60} height={60} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', border: `1px solid ${isDark ? T.border : '#e5e7eb'}`, background: isDark ? T.bgCard : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isDark ? T.textMuted : '#9ca3af', opacity: selectedImage === images.length - 1 ? 0.3 : 1, transition: 'all 0.2s' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Pricing (sticky on desktop) */}
        <div id="section-pricing" className="gamer-detail-pricing-order" style={{ position: 'sticky', top: 168, alignSelf: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Pricing card */}
            <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : T.border}`, padding: 24, boxShadow: isDark ? '0 0 32px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontFamily: F.raj, fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: 0, margin: '0 0 4px' }}>Calcula tu cuota mensual</h3>
              <p style={{ fontFamily: F.raj, fontSize: '0.85rem', color: T.textPrimary, letterSpacing: 0, margin: '0 0 24px' }}>Selecciona el plazo que mejor se ajuste a tu presupuesto</p>

              {/* Initial payment selector */}
              {activePlan && activePlan.options.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.textPrimary, fontFamily: F.raj, letterSpacing: 0, textTransform: 'none', marginBottom: 12 }}>Cuota inicial (opcional)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {activePlan.options.map((opt) => {
                      const isActive = opt.initialPercent === selectedInitialPercent;
                      return (
                        <button key={opt.initialPercent} onClick={() => setSelectedInitialPercent(opt.initialPercent)} style={{
                          padding: '8px 16px', fontSize: 14, fontFamily: F.raj, borderRadius: 999, cursor: 'pointer', transition: 'all 0.2s',
                          fontWeight: isActive ? 700 : 500,
                          background: isActive ? T.neonCyan : T.bgSurface,
                          color: isActive ? '#0a0a0a' : T.textSecondary,
                          border: `1px solid ${isActive ? T.neonCyan : (isDark ? 'rgba(255,255,255,0.12)' : T.border)}`,
                          boxShadow: isActive ? `0 0 10px rgba(0,255,213,0.4)` : 'none',
                        }}>
                          {opt.initialPercent === 0 ? 'Sin inicial' : `S/${Math.round(opt.initialAmount)}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Term cards grid */}
              {availableTerms.length > 0 && (
                <div className="gamer-term-grid">
                  {availableTerms.map((term) => {
                    const plan = paymentPlans.find((p) => p.term === term);
                    const opt = plan?.options?.find((o) => o.initialPercent === selectedInitialPercent) || plan?.options?.[0];
                    const originalOpt = opt?.originalQuota;
                    const isSelected = term === selectedTerm;
                    return (
                      <button key={term} onClick={() => setSelectedTerm(term)} style={{
                        position: 'relative', padding: 16, borderRadius: 12, cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center',
                        background: isSelected ? `linear-gradient(135deg, rgba(0,255,213,0.12), rgba(0,255,213,0.06))` : T.bgSurface,
                        border: isSelected ? `2px solid ${T.neonCyan}` : '1px solid rgba(255,255,255,0.1)',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      }}>
                        <p style={{ fontSize: 12, color: T.textPrimary, fontFamily: F.mono, letterSpacing: 1, marginBottom: 8 }}>{term} meses</p>
                        {originalOpt && (
                          <p style={{ fontSize: 12, textDecoration: 'line-through', color: 'rgba(255,255,255,0.5)', fontFamily: F.mono, marginBottom: 4 }}>S/{Math.round(originalOpt)}</p>
                        )}
                        <p style={{ fontFamily: F.orb, fontSize: '1.25rem', fontWeight: 800, color: T.neonCyan, textShadow: isSelected ? '0 0 14px rgba(0,255,213,0.5)' : '0 0 10px rgba(0,255,213,0.5)', margin: 0 }}>
                          S/{opt ? Math.round(opt.monthlyQuota) : '—'}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: F.raj, marginTop: 4 }}>al mes</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Payment summary */}
              <div style={{ marginTop: 32, padding: 24, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: T.textPrimary, fontFamily: F.raj, letterSpacing: 0, marginBottom: 8 }}>Pagarías</p>
                {/* Cuota tachada solo si el backend trae originalQuota real (no inventamos descuento) */}
                {lowestOption?.originalQuota != null && lowestOption.originalQuota > lowestOption.monthlyQuota && (
                  <p style={{ textDecoration: 'line-through', fontSize: '1.25rem', color: 'rgba(255,255,255,0.5)', fontFamily: F.mono, marginBottom: 4 }}>
                    S/{Math.round(lowestOption.originalQuota)}/mes
                  </p>
                )}
                <p style={{ fontFamily: F.orb, fontSize: '2.5rem', fontWeight: 800, color: T.neonCyan, textShadow: '0 0 20px rgba(0,255,213,0.6)', lineHeight: 1.1, margin: 0 }}>
                  S/{lowestOption ? Math.round(lowestOption.monthlyQuota) : Math.round(product.lowestQuota)}
                  <span style={{ fontSize: '0.85rem', color: '#ffffff' }}>/mes</span>
                </p>
                <p style={{ fontSize: 14, color: T.textSecondary, fontFamily: F.raj, marginTop: 8 }}>durante {selectedTerm} meses</p>
                {lowestOption && lowestOption.initialPercent > 0 && lowestOption.initialAmount > 0 && (
                  <p style={{ fontSize: 12, color: T.textSecondary, fontFamily: F.raj, marginTop: 4 }}>
                    + S/{Math.round(lowestOption.initialAmount)} de inicial
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSolicitar} className="btn-loquiero-detalle" style={{ flex: 1, padding: '16px 0' }}>
                ¡Lo quiero! Solicitar ahora
              </button>
              <button onClick={handleToggleWishlist} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: cyanAlpha(0.1), border: `1px solid ${T.neonCyan}`, color: T.neonCyan }}>
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">{isWishlisted ? 'Guardado' : 'Al carrito'}</span>
              </button>
            </div>

            {/* Certifications — replica el comportamiento del home: muestra el header
                aunque data.certifications esté vacío, con los chips reales del backend */}
            <div id="section-certifications">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={16} style={{ color: '#16a34a' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? T.textPrimary : '#262626', margin: 0 }}>Producto certificado</h3>
                  <p style={{ fontSize: 12, color: isDark ? T.textMuted : '#737373', margin: 0 }}>Garantías verificadas</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {certifications.map((cert) => (
                  <span key={cert.code} title={cert.description} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5', border: `1px solid ${isDark ? T.border : '#e5e7eb'}`, color: isDark ? '#d4d4d4' : '#404040' }}>
                    <Award size={14} style={{ color: T.neonCyan }} />
                    {cert.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>{/* close grid */}
      </main>{/* close container */}

      {/* SPECS SECTION */}
      {product.specs && product.specs.length > 0 && (
        <section id="section-specs" style={{ maxWidth: 1280, margin: '64px auto 48px', padding: '0 24px' }}>
          <h2 style={{ fontFamily: F.raj, fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            Especificaciones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="gamer-specs-grid">
            {product.specs.map((spec, idx) => (
              <SpecCard key={idx} spec={spec} />
            ))}
          </div>
        </section>
      )}

      {/* PORTS SECTION */}
      <PortsSection T={T} isDark={isDark} ports={product.ports} />

      {/* FICHA TÉCNICA */}
      <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 24px' }}>
        <div style={{
          padding: 16, borderRadius: 16,
          background: isDark
            ? 'linear-gradient(to right, rgba(0,255,213,0.05), rgba(0,255,213,0.1))'
            : 'linear-gradient(to right, rgba(70,84,205,0.05), rgba(70,84,205,0.1))',
          border: isDark ? '1px solid rgba(0,255,213,0.2)' : '1px solid rgba(70,84,205,0.2)',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: T.neonCyan, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Download size={20} style={{ color: '#fff' }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 600, color: T.textPrimary, margin: 0, fontSize: 15 }}>Ficha Técnica</h4>
                <p style={{ fontSize: 14, color: T.textSecondary, margin: 0 }} className="hidden sm:block">Descarga todas las especificaciones en PDF</p>
              </div>
            </div>
            <button
              onClick={() => generateFichaTecnica({
                productName: product.displayName || product.name,
                brand: product.brand,
                imageUrl: product.images?.[0]?.url,
                specs: product.specs || [],
                ports: product.ports?.length ? product.ports.map((p) => ({ name: p.name, position: p.position, count: p.count })) : [],
                price: product.price,
                lowestQuota: product.lowestQuota,
              })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 10,
                border: `2px solid ${T.neonCyan}`, background: 'transparent', color: T.neonCyan,
                fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.2s',
                width: 'auto',
              }}
            >
              <Download size={16} />
              Descargar PDF
            </button>
          </div>
        </div>
      </section>

      {/* CRONOGRAMA / DETALLE DE CUOTAS */}
      <div id="cronograma">
        <CronogramaSection T={T} isDark={isDark} selectedTerm={selectedTerm} monthlyQuota={lowestOption?.monthlyQuota || product.lowestQuota} price={product.price} commission={lowestOption?.commissionAmount || null} productName={product.displayName || product.name} productBrand={product.brand} tea={activePlan?.tea} tcea={activePlan?.tcea} />
      </div>

      {/* SIMILAR PRODUCTS */}
      <div id="similares">
        {similarProducts.length > 0 && (
          <SimilarProductsSection
            T={T}
            isDark={isDark}
            similarProducts={similarProducts}
            currentQuota={lowestOption?.monthlyQuota || product.lowestQuota}
            landing={landing}
          />
        )}
      </div>

      <GamerFooter theme={theme} />
    </div>
  );
}

// ============================================
// Spec Card
// ============================================

// ============================================
// Ports Section
// ============================================

const PORT_ICON_MAP: Record<string, React.ReactNode> = {
  'usb-c': <Usb size={16} />, 'usb-a': <Usb size={16} />, 'usb': <Usb size={16} />,
  'hdmi': <Monitor size={16} />, 'audio': <Headphones size={16} />, 'audio jack': <Headphones size={16} />,
  'ethernet': <Network size={16} />, 'rj45': <Network size={16} />, 'sd': <HardDrive size={16} />,
  'lector sd': <HardDrive size={16} />,
};

function PortsSection({ T, isDark, ports }: { T: Theme; isDark: boolean; ports: ProductPort[] }) {
  // Si el backend no devuelve ports, ocultamos la sección (no inventamos puertos genéricos)
  if (!ports || ports.length === 0) return null;

  const portList = ports.map((p) => ({ name: p.name, position: p.position, count: p.count }));
  const leftPorts = portList.filter((p) => p.position === 'left');
  const rightPorts = portList.filter((p) => p.position === 'right');
  const totalPorts = portList.reduce((sum, p) => sum + (p.count || 1), 0);

  const getIcon = (name: string) => PORT_ICON_MAP[name.toLowerCase().split(' ')[0]] || <Usb size={16} />;

  const portItemStyle = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px',
    background: isDark ? T.bgSurface : '#fafafa',
    borderRadius: 8,
    border: `1px solid ${isDark ? T.border : '#e5e7eb'}`,
  };

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 24px' }}>
      <div style={{ background: isDark ? T.bgCard : '#fff', borderRadius: 16, padding: 24, boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: cyanAlphaStatic(0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Usb size={20} style={{ color: T.neonCyan }} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#fff' : '#171717', margin: 0 }}>Puertos y Conectividad</h3>
            <p style={{ fontSize: 14, color: isDark ? '#707070' : '#737373', margin: 0 }}>Distribución de puertos en el equipo</p>
          </div>
        </div>

        {/* Ports layout */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 16 }}>
          {/* Left ports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flex: '1 1 0', minWidth: 140 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#707070' : '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Izquierda</span>
            {leftPorts.map((port, i) => (
              <div key={i} style={portItemStyle}>
                <span style={{ color: T.neonCyan }}>{getIcon(port.name)}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: isDark ? '#d4d4d4' : '#404040' }}>{port.name}</span>
                {port.count > 1 && <span style={{ fontSize: 12, color: isDark ? '#707070' : '#737373' }}>×{port.count}</span>}
              </div>
            ))}
          </div>

          {/* Center laptop icon */}
          <div className="hidden sm:flex" style={{ flexShrink: 0, width: 128, height: 96, background: isDark ? T.bgSurface : '#f5f5f5', borderRadius: 8, alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 24, border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
            <Laptop size={48} style={{ color: isDark ? '#555' : '#a3a3a3' }} />
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 4, height: 32, background: 'rgba(0,255,213,0.3)', borderRadius: '0 4px 4px 0' }} />
            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 4, height: 32, background: 'rgba(0,255,213,0.3)', borderRadius: '4px 0 0 4px' }} />
          </div>

          {/* Right ports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', flex: '1 1 0', minWidth: 140 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#707070' : '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Derecha</span>
            {rightPorts.map((port, i) => (
              <div key={i} style={portItemStyle}>
                <span style={{ color: T.neonCyan }}>{getIcon(port.name)}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: isDark ? '#d4d4d4' : '#404040' }}>{port.name}</span>
                {port.count > 1 && <span style={{ fontSize: 12, color: isDark ? '#707070' : '#737373' }}>×{port.count}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Footer badges */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${isDark ? T.border : '#e5e7eb'}`, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <span style={{ padding: '4px 12px', background: cyanAlphaStatic(0.1), color: T.neonCyan, borderRadius: 999, fontSize: 12, fontWeight: 500 }}>{totalPorts} puertos totales</span>
          <span style={{ padding: '4px 12px', background: isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5', color: isDark ? '#a0a0a0' : '#525252', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>{leftPorts.length} izquierda • {rightPorts.length} derecha</span>
        </div>
      </div>
    </section>
  );
}

function cyanAlphaStatic(a: number) {
  return `rgba(0,255,213,${a})`;
}

// ============================================
// Side Navigation
// ============================================

const SIDE_NAV_ITEMS = [
  { id: 'section-gallery', icon: ImageIcon, label: 'Galería' },
  { id: 'section-pricing', icon: Calculator, label: 'Cuotas' },
  { id: 'section-specs', icon: Cpu, label: 'Specs' },
  { id: 'cronograma', icon: Calendar, label: 'Cronograma' },
  { id: 'similares', icon: Package, label: 'Similares' },
];

function SideNav({ isDark, T }: { isDark: boolean; T: Theme }) {
  const [activeSection, setActiveSection] = useState('section-gallery');
  const manualOverride = useRef<string | null>(null);
  const overrideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // If user just clicked a nav button, keep that section active
      if (manualOverride.current) { setActiveSection(manualOverride.current); return; }

      const scrollY = window.scrollY + 200;
      const sections: { id: string; top: number }[] = [];
      for (const item of SIDE_NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          let top = 0;
          let node: HTMLElement | null = el;
          while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
          sections.push({ id: item.id, top });
        }
      }
      sections.sort((a, b) => a.top - b.top);
      let current = sections[0]?.id || SIDE_NAV_ITEMS[0].id;
      for (const s of sections) {
        if (s.top <= scrollY) current = s.id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    // Force this section active for 1 second while smooth scroll completes
    manualOverride.current = id;
    setActiveSection(id);
    if (overrideTimer.current) clearTimeout(overrideTimer.current);
    overrideTimer.current = setTimeout(() => { manualOverride.current = null; }, 1000);

    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="hidden xl:block" style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 40 }}>
      <div style={{ background: isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: 16, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)', border: `1px solid ${T.border}`, padding: 8 }}>
        <nav className="flex flex-col gap-1">
          {SIDE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                title={item.label}
                className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${isActive ? 'text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'}`}
                style={isActive ? { background: T.neonCyan } : { background: 'transparent' }}
              >
                <Icon className="w-5 h-5" />
                <span className={`absolute left-full ml-3 px-2 py-1 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-white ${isActive ? '' : 'bg-neutral-800'}`} style={isActive ? { background: T.neonCyan } : undefined}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ============================================
// Financiamiento Modal
// ============================================

function FinanciamientoModal({ T, isDark, price, monthlyQuota, selectedTerm, totalPagar, tea, tcea, commission, onClose, onDownloadPdf }: { T: Theme; isDark: boolean; price: number; monthlyQuota: number; selectedTerm: number; totalPagar: number; tea?: number | null; tcea?: number | null; commission?: number | null; onClose: () => void; onDownloadPdf: () => void }) {
  // Block body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const bg = isDark ? '#1a1a1a' : '#fff';
  const surface = isDark ? '#252525' : '#fafafa';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const textMain = isDark ? '#f0f0f0' : '#171717';
  const textSec = isDark ? '#a0a0a0' : '#525252';
  const textMut = isDark ? '#707070' : '#737373';
  const accent = T.neonCyan;
  const purple = T.neonPurple;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      {/* Backdrop with blur */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />

      {/* Modal */}
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 50, width: '100%', maxWidth: 512, maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: bg, borderRadius: 16, border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>

        {/* Header — gradient purple→cyan */}
        <div style={{ background: `linear-gradient(135deg, ${purple}, ${accent})`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={20} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Detalle del Financiamiento</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Información completa de tu crédito</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={16} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Summary card */}
          <div style={{ background: isDark ? 'rgba(0,255,213,0.04)' : 'rgba(70,84,205,0.05)', borderRadius: 12, padding: 16, border: `1px solid ${isDark ? 'rgba(0,255,213,0.1)' : 'rgba(70,84,205,0.1)'}`, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: textSec, fontSize: 14 }}>Precio de lista del equipo</span>
              <span style={{ fontWeight: 600, color: textMain, fontSize: 14 }}>S/{price.toLocaleString('es-PE')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: textSec, fontSize: 14 }}>Cuota mensual</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: accent }}>S/{Math.round(monthlyQuota)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: textSec, fontSize: 14 }}>Plazo</span>
              <span style={{ fontWeight: 600, color: textMain, fontSize: 14 }}>{selectedTerm} meses</span>
            </div>
          </div>

          {/* Tasas — desde el plan seleccionado (backend) */}
          {(tea != null || tcea != null) && (
            <>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: textMain, display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 4px' }}>
                <Percent size={16} style={{ color: accent }} />
                Tasas de Interés
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: tea != null && tcea != null ? '1fr 1fr' : '1fr', gap: 12 }}>
                {tea != null && (
                  <div style={{ background: surface, borderRadius: 8, padding: 12, border: `1px solid ${border}` }}>
                    <p style={{ fontSize: 11, color: textMut, marginBottom: 4 }}>TEA (Tasa Efectiva Anual)</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: textMain, margin: 0 }}>{tea}%</p>
                  </div>
                )}
                {tcea != null && (
                  <div style={{ background: surface, borderRadius: 8, padding: 12, border: `1px solid ${border}` }}>
                    <p style={{ fontSize: 11, color: textMut, marginBottom: 4 }}>TCEA (Costo Efectivo Anual)</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: textMain, margin: 0 }}>{tcea}%</p>
                  </div>
                )}
              </div>
              <hr style={{ border: 'none', height: 1, background: border, margin: '12px 0' }} />
            </>
          )}

          {/* Comisión mensual — solo si el backend la envía */}
          {commission != null && commission > 0 && (
            <>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: textMain, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px' }}>
                <CircleAlert size={16} style={{ color: accent }} />
                Comisión mensual
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                <span style={{ fontSize: 14, color: textSec }}>Comisión mensual incluida en la cuota</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: textMain }}>S/{Math.round(commission)}</span>
              </div>
              <hr style={{ border: 'none', height: 1, background: border, margin: '12px 0' }} />
            </>
          )}

          {/* Total */}
          <div style={{ background: isDark ? 'rgba(0,255,213,0.06)' : '#f0fdf4', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${isDark ? 'rgba(0,255,213,0.15)' : 'rgba(34,197,94,0.2)'}` }}>
            <div>
              <p style={{ fontSize: 14, color: textSec, margin: 0 }}>Monto total a pagar</p>
              <p style={{ fontSize: 12, color: textMut, margin: 0 }}>{selectedTerm} cuotas de S/{Math.round(monthlyQuota)}</p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: isDark ? accent : '#16a34a', margin: 0 }}>S/{totalPagar.toLocaleString('es-PE')}</p>
          </div>

          {/* Disclaimer */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: textMut, marginTop: 8 }}>
            <Scale size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0 }}>Esta información es referencial. Las tasas y condiciones finales serán confirmadas al momento de la aprobación.</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderTop: `1px solid ${border}`, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: `2px solid ${isDark ? T.border : '#d4d4d4'}`, background: 'transparent', color: textMain, fontSize: 14, cursor: 'pointer' }}>Cerrar</button>
          <button onClick={onDownloadPdf} style={{ padding: '10px 16px', borderRadius: 10, border: `2px solid ${accent}`, background: 'transparent', color: accent, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={16} />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Cronograma Section
// ============================================

const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

function CronogramaSection({ T, isDark, selectedTerm, monthlyQuota, price, commission, productName, productBrand, tea, tcea }: { T: Theme; isDark: boolean; selectedTerm: number; monthlyQuota: number; price: number; commission: number | null; productName: string; productBrand: string; tea?: number | null; tcea?: number | null }) {
  const [expanded, setExpanded] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  // TEA viene del plan activo (backend). Si no hay TEA no calculamos amortización falsa.
  const effectiveTea = tea ?? null;
  const comisionMensual = commission != null ? commission : 0;

  const handleDownloadCronograma = useCallback(() => {
    generateGamerCronogramaPdf({
      productName,
      productBrand,
      price,
      term: selectedTerm,
      monthlyQuota: Math.round(monthlyQuota),
      tea: tea || undefined,
      tcea: tcea || undefined,
    });
  }, [price, selectedTerm, monthlyQuota, productName, productBrand, tea, tcea]);

  const rows = useMemo(() => {
    // Sin TEA del backend no calculamos amortización (evitamos data falsa)
    if (effectiveTea == null) return [];
    // Replicate light-mode Cronograma.tsx logic exactly for consistency
    const monthlyRate = effectiveTea / 100 / 12;
    const n = selectedTerm;
    // Derive principal from quota minus commission (exact float)
    const quotaNoComm = monthlyQuota - comisionMensual;
    const principal = monthlyRate > 0
      ? quotaNoComm * (Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n))
      : quotaNoComm * n;

    // French amortization with exact floats
    let balance = principal;
    const schedule: { interestF: number; balanceF: number }[] = [];
    for (let i = 0; i < n; i++) {
      const interestF = balance * monthlyRate;
      const quotaF = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      const capitalF = quotaF - interestF;
      balance = Math.max(0, balance - capitalF);
      schedule.push({ interestF, balanceF: balance });
    }

    const result = [];
    const now = new Date();
    const mesInicio = now.getMonth();
    const anioInicio = now.getFullYear();
    const montoFloor = Math.floor(monthlyQuota);
    const commissionFloor = comisionMensual > 0 ? Math.floor(comisionMensual) : 0;

    for (let i = 0; i < selectedTerm; i++) {
      const interesFloor = Math.floor(schedule[i].interestF);
      // Capital = Monto - Interés - Comisión (siempre cuadra, como en light mode)
      const capital = montoFloor - interesFloor - commissionFloor;
      const saldoFloor = Math.floor(schedule[i].balanceF);

      const mesIdx = (mesInicio + i) % 12;
      const anio = anioInicio + Math.floor((mesInicio + i) / 12);

      result.push({
        num: i + 1,
        fecha: `${MONTH_NAMES[mesIdx]} de ${anio}`,
        capital,
        interes: interesFloor,
        comision: commissionFloor,
        monto: montoFloor,
        saldo: saldoFloor,
        isLast: i === selectedTerm - 1,
      });
    }
    return result;
  }, [selectedTerm, monthlyQuota, comisionMensual, effectiveTea]);

  const visibleRows = expanded ? rows : rows.slice(0, 6);
  const totalPagar = rows.length * Math.round(monthlyQuota);

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 24px' }}>
      <div style={{ background: isDark ? T.bgCard : '#fff', borderRadius: 16, padding: 24, boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: cyanAlphaStatic(0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} style={{ color: T.neonCyan }} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#fff' : '#171717', margin: 0 }}>Detalle de Cuotas</h3>
              <p style={{ fontSize: 14, color: isDark ? '#707070' : '#737373', margin: 0 }}>{selectedTerm} pagos mensuales</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: isDark ? T.bgSurface : '#fafafa' }}>
                {['Cuota', 'Fecha', 'Capital', 'Interés', 'Comisión', 'Monto', 'Saldo'].map((h, i) => (
                  <th key={h} style={{ textAlign: i < 2 ? 'left' : 'right', padding: '12px', fontSize: 12, fontWeight: 600, color: isDark ? '#707070' : '#737373', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.num} style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5'}` }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: row.isLast ? (isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7') : cyanAlphaStatic(0.1), color: row.isLast ? '#16a34a' : T.neonCyan }}>
                      {row.num}
                    </div>
                  </td>
                  <td style={{ padding: 12, fontSize: 14, color: isDark ? '#a0a0a0' : '#525252', textTransform: 'capitalize' }}>{row.fecha}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, color: isDark ? '#d4d4d4' : '#404040' }}>S/{row.capital}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, color: isDark ? '#707070' : '#737373' }}>S/{row.interes}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, color: isDark ? '#707070' : '#737373' }}>S/{row.comision}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}><span style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#fff' : '#171717' }}>S/{row.monto}</span></td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, color: isDark ? '#a0a0a0' : '#525252' }}>S/{row.saldo.toLocaleString('es-PE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Toggle button */}
        {rows.length > 6 && (
          <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', marginTop: 16, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: T.neonCyan, background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? 'Ver menos' : 'Ver todo'}
          </button>
        )}

        {/* Footer: total + buttons */}
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button onClick={() => setShowDetail(true)} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: `2px solid ${T.neonCyan}`, background: 'transparent', color: T.neonCyan, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            <Info size={16} />
            Ver detalle de pago
          </button>
          <button onClick={handleDownloadCronograma} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: `2px solid ${isDark ? T.border : '#d4d4d4'}`, background: 'transparent', color: isDark ? '#d4d4d4' : '#404040', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            <Download size={16} />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Modal: Detalle del Financiamiento */}
      {showDetail && <FinanciamientoModal T={T} isDark={isDark} price={price} monthlyQuota={monthlyQuota} selectedTerm={selectedTerm} totalPagar={totalPagar} tea={tea} tcea={tcea} commission={commission} onClose={() => setShowDetail(false)} onDownloadPdf={handleDownloadCronograma} />}
    </section>
  );
}

// ============================================
// Similar Products Section
// ============================================

function SimilarProductsSection({ T, isDark, similarProducts, currentQuota, landing }: { T: Theme; isDark: boolean; similarProducts: SimilarProduct[]; currentQuota: number; landing: string }) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Similares vienen directo del backend (data.similarProducts)
  const products = similarProducts;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 316, behavior: 'smooth' });
  }, []);

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 24px' }}>
      <div style={{ background: isDark ? T.bgCard : '#fff', borderRadius: 16, padding: 24, boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${isDark ? T.border : '#e5e7eb'}` }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#fff' : '#171717', margin: '0 0 4px' }}>También te puede interesar</h3>
            <p style={{ fontSize: 14, color: isDark ? '#707070' : '#737373', margin: 0 }}>Desliza para explorar más opciones</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => scroll(-1)} disabled={!canScrollLeft} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canScrollLeft ? 'pointer' : 'default', border: 'none', background: isDark ? T.bgSurface : '#f5f5f5', color: canScrollLeft ? (isDark ? '#fff' : '#404040') : (isDark ? '#555' : '#d4d4d4'), opacity: canScrollLeft ? 1 : 0.5, transition: 'all 0.2s' }}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll(1)} disabled={!canScrollRight} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canScrollRight ? 'pointer' : 'default', border: 'none', background: isDark ? T.bgSurface : '#f5f5f5', color: canScrollRight ? (isDark ? '#fff' : '#404040') : (isDark ? '#555' : '#d4d4d4'), opacity: canScrollRight ? 1 : 0.5, transition: 'all 0.2s' }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollRef} onScroll={updateScrollState} style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 24, scrollbarWidth: 'none' }}>
          {products.map((prod) => {
            // quotaDifference viene del backend; si no, calculamos vs la cuota actual
            const diff = prod.quotaDifference != null ? prod.quotaDifference : Math.round(prod.monthlyQuota) - Math.round(currentQuota);
            const displayName = prod.displayName || prod.name;
            return (
              <div key={prod.id} style={{ width: 300, minWidth: 300, flexShrink: 0, scrollSnapAlign: 'start' }}>
                <div style={{ height: '100%', borderRadius: 16, overflow: 'hidden', background: isDark ? T.bgSurface : '#fff', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}>
                  {/* Image */}
                  <div style={{ position: 'relative', padding: 16, background: isDark ? 'linear-gradient(to bottom, #1e1e1e, #1a1a1a)' : 'linear-gradient(to bottom, #fafafa, #fff)' }}>
                    <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: 12, marginBottom: 8 }}>
                      <Image src={prod.thumbnail} alt={displayName} width={268} height={200} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <p style={{ fontSize: 10, color: isDark ? '#555' : '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginBottom: 8 }}>Imagen referencial</p>
                    {/* Match badge — solo si el backend lo trae */}
                    {prod.matchScore > 0 && (
                      <div style={{ position: 'absolute', top: 12, left: 12, padding: '6px 12px', background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.neonCyan }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#fff' : '#171717' }}>{prod.matchScore}% match</span>
                      </div>
                    )}
                    {/* Price diff badge */}
                    <div style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', borderRadius: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 4, background: T.neonPurple, color: '#fff' }}>
                      <TrendingUp size={14} />
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{diff >= 0 ? '+' : ''}S/{diff}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ fontSize: 12, color: T.neonCyan, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{prod.brand}</p>
                    <h3 style={{ fontWeight: 700, color: isDark ? '#fff' : '#262626', fontSize: 18, marginBottom: 12, minHeight: '3.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{displayName}</h3>

                    {/* Quota box */}
                    <div style={{ borderRadius: 16, padding: '16px 24px', marginBottom: 12, background: isDark ? 'rgba(0,255,213,0.04)' : 'rgba(70,84,205,0.05)' }}>
                      <p style={{ fontSize: 12, color: isDark ? '#707070' : '#737373', marginBottom: 4 }}>Cuota mensual</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                        <span style={{ fontSize: 30, fontWeight: 900, color: T.neonCyan }}>S/{Math.round(prod.monthlyQuota)}</span>
                        <span style={{ fontSize: 16, color: isDark ? '#555' : '#a3a3a3' }}>/mes</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, marginTop: 4, color: T.neonPurple }}>
                        <TrendingUp size={12} />
                        <span>vs S/{Math.round(currentQuota)}/mes actual</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, minHeight: 16 }} />

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => router.push(routes.producto(landing, prod.slug))} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: `2px solid ${T.neonCyan}`, background: 'transparent', color: T.neonCyan, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Eye size={18} className="hidden md:block" />
                        Detalle
                      </button>
                      <button onClick={() => router.push(routes.solicitar(landing))} className="btn-loquiero-detalle" style={{ flex: 1, padding: '12px 0', fontWeight: 700, fontSize: 14 }}>
                        Lo quiero
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile hint */}
        <p className="md:hidden" style={{ textAlign: 'center', fontSize: 12, color: isDark ? '#555' : '#a3a3a3', marginTop: 0 }}>Desliza para ver más →</p>
      </div>
    </section>
  );
}

// ============================================
// Spec Card
// ============================================

function SpecCard({ spec }: { spec: ProductSpec }) {
  const icon = SPEC_ICONS[spec.category.toLowerCase()] || <Cpu size={20} />;
  return (
    <div className="spec-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div className="spec-card-icon">{icon}</div>
        <span className="spec-card-title">{spec.category}</span>
      </div>
      <div className="spec-card-divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {spec.specs.map((item, i) => (
          <div key={i} className="spec-row">
            <span className="spec-row-label">{item.label}</span>
            <span className={`spec-row-value${item.highlight ? ' primary' : ''}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
