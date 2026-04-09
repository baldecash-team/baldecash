'use client';

/**
 * GamerSolicitarClient — Página de solicitud con estética gamer (Zona Gamer)
 * Reutiliza ProductContext, WizardConfigContext y otros hooks del flujo estándar.
 */

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Clock, Shield, ArrowRight, ArrowLeft, Check, ChevronDown, ChevronLeft, ChevronRight, Info, Package, Plus, Search, ShoppingCart, Tag, Users, X, Zap } from 'lucide-react';
import { useProduct } from './context/ProductContext';
import { useScrollToTop } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';

// ── Theme ──
function gamerTheme(isDark: boolean) {
  return {
    bg: isDark ? '#0e0e0e' : '#f5f5f5',
    bgCard: isDark ? '#1a1a1a' : '#ffffff',
    bgSurface: isDark ? '#1e1e1e' : '#f0f0f0',
    neonCyan: isDark ? '#00ffd5' : '#00b396',
    neonPurple: isDark ? '#6366f1' : '#4f46e5',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#555',
    textMuted: isDark ? '#707070' : '#888',
  };
}

const F = {
  raj: "'Rajdhani', sans-serif",
  orb: "'Orbitron', sans-serif",
  mono: "'Share Tech Mono', monospace",
};

const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap');`;

// ── Mock accessories for zona-gamer ──
const GAMER_ACCESSORIES = [
  { id: 'acc-1', name: 'Razer Kraken V3', category: 'Auriculares', desc: 'Auriculares gaming con sonido envolvente 7.1 y micrófono desmontable.', image: '/images/zona-gamer/acc/kraken-dark.png', price: 15, totalPrice: 180, specs: ['Sonido envolvente 7.1 THX Spatial', 'Micrófono desmontable HyperClear', 'Drivers TriForce de 50mm', 'Almohadillas de espuma con memoria'] },
  { id: 'acc-2', name: 'Razer Kraken V4', category: 'Auriculares', desc: 'Audio inmersivo con drivers TriForce de 50mm y micrófono HyperClear.', image: '/images/zona-gamer/acc/kraken-dark.png', price: 20, totalPrice: 240, specs: ['Drivers TriForce de 50mm', 'Micrófono HyperClear desmontable', 'Conexión USB + 3.5mm', 'Iluminación Chroma RGB'] },
  { id: 'acc-3', name: 'Razer DeathAdder Essential Black', category: 'Mouse', desc: 'Mouse gaming ergonómico con sensor óptico de 6400 DPI.', image: '/images/zona-gamer/acc/basilisk-dark.png', price: 13, totalPrice: 156, specs: ['Sensor óptico de 6400 DPI', 'Diseño ergonómico clásico', 'Conexión alámbrica', 'Color negro con iluminación verde'] },
  { id: 'acc-4', name: 'Razer Basilisk V3 Chroma', category: 'Mouse', desc: 'Mouse gaming con sensor Focus Pro 26K, scroll inteligente y Chroma RGB.', image: '/images/zona-gamer/acc/basilisk-dark.png', price: 18, totalPrice: 216, specs: ['Sensor Focus Pro 26K DPI', 'Scroll inteligente HyperScroll', 'Iluminación Chroma RGB', '11 botones programables'] },
  { id: 'acc-5', name: 'Razer Sphex', category: 'Pad Mouse', desc: 'Pad mouse ultrafino con superficie optimizada para sensores gaming.', image: '/images/zona-gamer/acc/firefly-dark.png', price: 8, totalPrice: 96, specs: ['Diseño ultrafino', 'Superficie optimizada para sensores', 'Base adherente anti-deslizante', 'Compatible con todos los sensores'] },
  { id: 'acc-6', name: 'Razer Firefly V2 Pro', category: 'Pad Mouse', desc: 'Pad mouse con iluminación Chroma RGB de borde completo y superficie micro-texturizada.', image: '/images/zona-gamer/acc/firefly-dark.png', price: 10, totalPrice: 120, specs: ['Iluminación Chroma RGB perimetral', 'Superficie micro-texturizada', 'Cable USB-C integrado', 'Compatible con Razer Synapse'] },
  { id: 'acc-7', name: 'Teros TE-4072G RGB', category: 'Teclado', desc: 'Teclado gaming con iluminación RGB y diseño compacto.', image: '/images/zona-gamer/acc/blackwidow-dark.png', price: 12, totalPrice: 144, specs: ['Iluminación RGB personalizable', 'Diseño compacto', 'Switches mecánicos', 'Cable USB trenzado'] },
  { id: 'acc-8', name: 'Razer BlackWidow V3', category: 'Teclado', desc: 'Teclado mecánico con switches Green táctiles y Chroma RGB.', image: '/images/zona-gamer/acc/blackwidow-dark.png', price: 22, totalPrice: 264, specs: ['Switches Razer Green táctiles', 'Iluminación Chroma RGB por tecla', 'Reposamuñecas magnético', 'Construcción en aluminio'] },
  { id: 'acc-9', name: 'Corsair TC100', category: 'Sillón Gaming', desc: 'Sillón gaming ergonómico con soporte lumbar y reposabrazos ajustable.', image: '/images/zona-gamer/acc/corsair-dark.png', price: 45, totalPrice: 540, specs: ['Soporte lumbar ajustable', 'Reposabrazos 3D', 'Reclinable hasta 160°', 'Base de acero clase 4'] },
];
const ACC_PAGE_SIZE = 6;

// ── Main export ──
export function GamerSolicitarClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0e0e0e' }} />}>
      <SolicitarContent />
    </Suspense>
  );
}

function SolicitarContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';
  useScrollToTop();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';
  const T = gamerTheme(isDark);

  const { selectedProduct } = useProduct();
  const product = selectedProduct;

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptPromos, setAcceptPromos] = useState(false);
  const [selectedAccIds, setSelectedAccIds] = useState<Set<string>>(new Set());
  const [accFilter, setAccFilter] = useState('Todos');
  const [accSearch, setAccSearch] = useState('');
  const [accPage, setAccPage] = useState(0);
  const [accDetailId, setAccDetailId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [termDropdownOpen, setTermDropdownOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(product?.months || 12);
  const [termsError, setTermsError] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  // Block body scroll when modal is open
  useEffect(() => {
    if (accDetailId) { document.body.style.overflow = 'hidden'; }
    return () => { document.body.style.overflow = ''; };
  }, [accDetailId]);

  const toggleAcc = useCallback((id: string) => {
    setSelectedAccIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleStart = useCallback(() => {
    if (!acceptTerms) {
      setTermsError(true);
      termsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setTermsError(false);
    router.push(routes.solicitarStep(landing, 'datos-personales'));
  }, [router, landing, acceptTerms]);

  const cyanAlpha = (a: number) => isDark ? `rgba(0,255,213,${a})` : `rgba(0,179,150,${a})`;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.textPrimary, '--gamer-cyan': T.neonCyan, '--gamer-purple': T.neonPurple, '--gamer-border': T.border, '--gradient-cyber': isDark ? 'linear-gradient(135deg, #6366f1 0%, #82e2d2 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)' } as React.CSSProperties}>
      <style>{FONTS_CSS}</style>
      <style>{`
        .btn-loquiero-detalle {
          position: relative; overflow: hidden;
          background: var(--gradient-cyber);
          color: #fff; border: none; border-radius: 12px;
          font-family: 'Rajdhani', sans-serif; font-size: 1.1rem; font-weight: 700;
          cursor: pointer; transition: all 0.3s;
        }
        .btn-loquiero-detalle::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .btn-loquiero-detalle:hover::before { left: 100%; }
      `}</style>

      {/* NAVBAR */}
      <GamerNavbar theme={theme} onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')} catalogUrl={routes.catalogo(landing)} hideSecondaryBar />

      {/* MAIN */}
      <main style={{ maxWidth: 896, margin: '0 auto', padding: '56px 16px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: cyanAlpha(0.1), borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileText size={32} style={{ color: T.neonCyan }} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: F.raj, marginBottom: 12, color: T.textPrimary }}>Solicitud de Financiamiento</h1>
          <p style={{ fontSize: 18, color: T.textSecondary }}>Completa el formulario para solicitar tu equipo tecnológico</p>
        </div>

        {/* Product summary */}
        {product && (
          <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: 32, overflow: 'hidden' }}>
            {/* Header bar */}
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}`, background: cyanAlpha(0.05), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={16} style={{ color: T.neonCyan }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>Producto seleccionado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>Plazo:</span>
                <div style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setTermDropdownOpen(!termDropdownOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 32, padding: '0 12px', borderRadius: 8, border: `2px solid ${T.neonCyan}`, background: isDark ? T.bgCard : '#fff', cursor: 'pointer', fontSize: 14, color: T.textPrimary, gap: 6 }}>
                    <span>{selectedMonths} meses</span>
                    <ChevronDown size={14} style={{ color: T.textMuted, transition: 'transform 0.2s', transform: termDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>
                  {termDropdownOpen && (
                    <div style={{ position: 'absolute', zIndex: 50, top: '100%', right: 0, marginTop: 4, minWidth: 140, background: isDark ? T.bgCard : '#fff', border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', padding: 4 }}>
                      {[6, 12, 18, 24].map((m) => (
                        <button key={m} type="button" onClick={() => { setSelectedMonths(m); setTermDropdownOpen(false); }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: 14, borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: m === selectedMonths ? T.neonCyan : 'transparent', color: m === selectedMonths ? (isDark ? '#0a0a0a' : '#fff') : T.textPrimary }}>
                          <span>{m} meses</span>
                          {m === selectedMonths && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Product content */}
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 96, height: 96, background: T.bgSurface, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.image && <Image src={product.image} alt={product.name} width={88} height={88} style={{ objectFit: 'contain' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: T.neonCyan, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.brand}</p>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginTop: 2 }}>{product.name}</h3>
                  {/* Initial payment pills */}
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Inicial:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 999, background: T.neonCyan, color: isDark ? '#0a0a0a' : '#fff', fontWeight: 500 }}>Sin inicial</span>
                      <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 999, background: T.bgSurface, color: T.textSecondary }}>S/{Math.round(product.price * 0.1)}</span>
                      <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 999, background: T.bgSurface, color: T.textSecondary }}>S/{Math.round(product.price * 0.2)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: T.neonCyan, marginTop: 8 }}>
                    S/{Math.round(product.monthlyPayment)}/mes
                    <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 400, marginLeft: 4 }}>x {product.months} meses</span>
                  </p>
                </div>
                {/* Remove button */}
                <button onClick={() => router.push(routes.catalogo(landing))} style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'transparent', color: T.textMuted, cursor: 'pointer', flexShrink: 0 }} title="Quitar producto">
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Footer: total */}
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>Cuota total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: T.neonCyan }}>S/{Math.round(product.monthlyPayment)}/mes</span>
            </div>
          </div>
        )}

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { icon: <Clock size={24} />, title: '1-2 minutos', sub: 'Tiempo estimado' },
            { icon: <FileText size={24} />, title: '4 pasos', sub: 'Proceso simple' },
            { icon: <Shield size={24} />, title: '100% Seguro', sub: 'Datos protegidos' },
          ].map((card, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 12, padding: 16, border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div style={{ color: T.neonCyan, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{card.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>{card.title}</p>
              <p style={{ fontSize: 12, color: T.textMuted }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Lo que necesitarás */}
        <div style={{ background: T.bgCard, borderRadius: 12, padding: 24, border: `1px solid ${T.border}`, marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary, fontFamily: F.raj, marginBottom: 16 }}>Lo que necesitarás</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { num: '1', title: 'Documento de identidad', sub: 'DNI, CE o Pasaporte vigente' },
              { num: '2', title: 'Constancia de estudios', sub: 'Documento que acredite tu matrícula vigente' },
              { num: '3', title: 'Información de contacto', sub: 'Teléfono y correo electrónico activos' },
            ].map((item) => (
              <div key={item.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: cyanAlpha(0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.neonCyan }}>{item.num}</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accesorios */}
        <div style={{ background: T.bgCard, borderRadius: 12, padding: '16px 24px 24px', border: `1px solid ${T.border}`, marginBottom: 32 }}>
          {/* Header */}
          <div style={{ background: cyanAlpha(0.05), borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: cyanAlpha(0.1), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={24} style={{ color: T.neonCyan }} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary, fontFamily: F.raj, marginBottom: 4 }}>Los estudiantes también llevan...</h2>
                <p style={{ fontSize: 14, color: T.textSecondary }}>7 de cada 10 estudiantes agregan al menos un accesorio a su compra.</p>
              </div>
            </div>
          </div>

          {/* Filters + Search */}
          <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Category pills */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {['Todos', ...Array.from(new Set(GAMER_ACCESSORIES.map((a) => a.category)))].map((cat) => {
                const count = cat === 'Todos' ? GAMER_ACCESSORIES.length : GAMER_ACCESSORIES.filter((a) => a.category === cat).length;
                const isActive = accFilter === cat;
                return (
                  <button key={cat} onClick={() => { setAccFilter(cat); setAccPage(0); }} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: isActive ? T.neonCyan : T.bgSurface, color: isActive ? (isDark ? '#0a0a0a' : '#fff') : T.textSecondary }}>
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
            {/* Search + count */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
                <input type="text" placeholder="Buscar accesorio..." value={accSearch} onChange={(e) => { setAccSearch(e.target.value); setAccPage(0); }} style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 8, background: T.bgSurface, color: T.textPrimary, outline: 'none' }} />
              </div>
              {(() => {
                const filtered = GAMER_ACCESSORIES.filter((a) => (accFilter === 'Todos' || a.category === accFilter) && (!accSearch || a.name.toLowerCase().includes(accSearch.toLowerCase())));
                const totalPages = Math.ceil(filtered.length / ACC_PAGE_SIZE);
                const canPrev = accPage > 0;
                const canNext = accPage < totalPages - 1;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: T.textMuted }}>{filtered.length} accesorios</span>
                    <button disabled={!canPrev} onClick={() => setAccPage((p) => p - 1)} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: canPrev ? 'pointer' : 'default', transition: 'all 0.2s', background: canPrev ? T.neonCyan : T.bgSurface, color: canPrev ? '#fff' : T.textMuted, opacity: canPrev ? 1 : 0.5 }}>
                      <ChevronLeft size={16} />
                    </button>
                    <button disabled={!canNext} onClick={() => setAccPage((p) => p + 1)} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: canNext ? 'pointer' : 'default', transition: 'all 0.2s', background: canNext ? T.neonCyan : T.bgSurface, color: canNext ? '#fff' : T.textMuted, opacity: canNext ? 1 : 0.5 }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {GAMER_ACCESSORIES
              .filter((a) => (accFilter === 'Todos' || a.category === accFilter) && (!accSearch || a.name.toLowerCase().includes(accSearch.toLowerCase())))
              .slice(accPage * ACC_PAGE_SIZE, (accPage + 1) * ACC_PAGE_SIZE)
              .map((acc) => {
                const isSelected = selectedAccIds.has(acc.id);
                return (
                  <button key={acc.id} onClick={() => toggleAcc(acc.id)} type="button" style={{ display: 'flex', flexDirection: 'column', background: T.bgCard, borderRadius: 12, border: `2px solid ${isSelected ? T.neonCyan : 'transparent'}`, boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)', padding: 16, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', height: '100%' }}>
                    {/* Check icon */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: isSelected ? 1 : 0, transform: isSelected ? 'scale(1)' : 'scale(0)' }}>
                        <Check size={14} style={{ color: '#fff' }} />
                      </div>
                    </div>
                    {/* Image */}
                    <div style={{ width: '100%', height: 96, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                      <Image src={acc.image} alt={acc.name} width={80} height={80} style={{ objectFit: 'contain', maxHeight: 80 }} />
                    </div>
                    {/* Name + desc */}
                    <h4 style={{ fontWeight: 600, fontSize: 14, color: T.textPrimary, marginBottom: 4, minHeight: '2.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{acc.name}</h4>
                    <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 8, minHeight: '2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{acc.desc}</p>
                    {/* Ver detalles */}
                    <div onClick={(e) => { e.stopPropagation(); setAccDetailId(acc.id); }} role="button" tabIndex={0} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: T.neonCyan, background: cyanAlpha(0.1), fontWeight: 500, padding: '8px 12px', borderRadius: 8, marginBottom: 12, cursor: 'pointer', transition: 'background 0.2s' }}>
                      <Info size={14} />
                      Ver detalles
                    </div>
                    {/* Price + plus */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div>
                        <span style={{ color: T.neonCyan, fontWeight: 700, fontSize: 14 }}>+S/{acc.price}/mes</span>
                        <p style={{ fontSize: 10, color: T.textMuted }}>en {product?.months || 24} meses</p>
                      </div>
                      <Plus size={20} style={{ color: T.textMuted, transition: 'all 0.2s', opacity: isSelected ? 0 : 1, transform: isSelected ? 'scale(0)' : 'scale(1)' }} />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Términos */}
        <div ref={termsRef} style={{ background: T.bgCard, borderRadius: 12, padding: 24, border: `1px solid ${termsError && !acceptTerms ? T.neonCyan : T.border}`, marginBottom: 32, transition: 'all 0.3s', boxShadow: termsError && !acceptTerms ? `0 0 0 3px ${cyanAlpha(0.3)}` : 'none' }}>
          <h3 style={{ fontWeight: 600, color: T.textPrimary, marginBottom: 16 }}>Términos y Condiciones</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Términos - obligatorio */}
            <div>
              <button type="button" onClick={() => { setAcceptTerms(!acceptTerms); if (!acceptTerms) setTermsError(false); }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${termsError && !acceptTerms ? T.neonCyan : (acceptTerms ? T.neonCyan : (isDark ? T.border : '#d1d5db'))}`, background: acceptTerms ? T.neonCyan : (isDark ? T.bgCard : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'all 0.2s', boxShadow: termsError && !acceptTerms ? `0 0 0 2px ${cyanAlpha(0.3)}` : 'none' }}>
                  {acceptTerms && <Check size={14} style={{ color: isDark ? '#0a0a0a' : '#fff' }} />}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: termsError && !acceptTerms ? T.neonCyan : T.textPrimary }}>{termsError && !acceptTerms ? 'Acepto los términos y condiciones' : 'Acepto los términos y condiciones'}</p>
                  <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>He leído y acepto los términos de uso del servicio</p>
                </div>
              </button>
              {termsError && !acceptTerms && (
                <p style={{ fontSize: 12, color: T.neonCyan, marginTop: 8, marginLeft: 36 }}>Debes aceptar los términos y condiciones para continuar</p>
              )}
            </div>
            {/* Privacidad */}
            <button type="button" onClick={() => setAcceptPrivacy(!acceptPrivacy)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${acceptPrivacy ? T.neonCyan : (isDark ? T.border : '#d1d5db')}`, background: acceptPrivacy ? T.neonCyan : (isDark ? T.bgCard : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'all 0.2s' }}>
                {acceptPrivacy && <Check size={14} style={{ color: isDark ? '#0a0a0a' : '#fff' }} />}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>Acepto la política de privacidad</p>
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>He leído y acepto cómo se usan y protegen mis datos personales</p>
              </div>
            </button>
            {/* Promos */}
            <button type="button" onClick={() => setAcceptPromos(!acceptPromos)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${acceptPromos ? T.neonCyan : (isDark ? T.border : '#d1d5db')}`, background: acceptPromos ? T.neonCyan : (isDark ? T.bgCard : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'all 0.2s' }}>
                {acceptPromos && <Check size={14} style={{ color: isDark ? '#0a0a0a' : '#fff' }} />}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>Quiero recibir promociones</p>
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Acepto recibir ofertas y novedades por correo electrónico</p>
              </div>
            </button>
          </div>
        </div>

        {/* Cupón */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ background: T.bgCard, borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Tag size={20} style={{ color: T.neonCyan }} />
              <h3 style={{ fontWeight: 600, color: T.textPrimary, fontFamily: F.raj }}>Cupón de descuento</h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Ingresa tu código"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: `2px solid ${T.border}`, background: T.bgSurface, color: T.textPrimary, fontSize: 14, fontWeight: 500, textTransform: 'uppercase', outline: 'none' }}
              />
              <button style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: T.neonCyan, color: isDark ? '#0a0a0a' : '#fff', fontWeight: 600, fontSize: 14, fontFamily: F.raj, cursor: 'pointer' }}>
                Aplicar
              </button>
            </div>
            <p style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>Prueba con el código <span style={{ fontFamily: F.mono, fontWeight: 500, color: T.neonCyan }}>PROMO</span></p>
          </div>
        </div>

        {/* CTA */}
        <button onClick={handleStart} className="btn-loquiero-detalle" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', fontSize: 18, boxShadow: '0 0 20px rgba(0,255,213,0.2), 0 0 40px rgba(99,102,241,0.15)' }}>
          <span>Comenzar Solicitud</span>
          <ArrowRight size={20} />
        </button>
        <button onClick={() => router.push(routes.catalogo(landing))} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, padding: '8px 0', background: 'none', border: 'none', color: T.textMuted, fontSize: 14, cursor: 'pointer', transition: 'color 0.2s' }}>
          <ArrowLeft size={16} />
          <span>Volver al catálogo</span>
        </button>

      </main>

      {/* Accessory detail modal */}
      {accDetailId && (() => {
        const acc = GAMER_ACCESSORIES.find((a) => a.id === accDetailId);
        if (!acc) return null;
        const isSelected = selectedAccIds.has(acc.id);
        const months = product?.months || 12;
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setAccDetailId(null)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 50, width: '100%', maxWidth: 448, maxHeight: 'calc(100vh - 8rem)', display: 'flex', flexDirection: 'column', background: isDark ? T.bgCard : '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: `1px solid ${T.border}` }}>
              {/* Header */}
              <div style={{ background: `linear-gradient(135deg, ${T.neonPurple}, ${T.neonCyan})`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={20} style={{ color: '#fff' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</h2>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{acc.category}</p>
                </div>
                <button onClick={() => setAccDetailId(null)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={16} style={{ color: '#fff' }} />
                </button>
              </div>
              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Image */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <Image src={acc.image} alt={acc.name} width={112} height={112} style={{ objectFit: 'contain', maxHeight: 112 }} />
                </div>
                {/* Specs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {acc.specs.map((spec, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <Check size={14} style={{ color: T.neonCyan, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, color: T.textSecondary }}>{spec}</span>
                    </div>
                  ))}
                </div>
                {/* Price card */}
                <div style={{ background: cyanAlpha(0.06), borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: T.neonCyan }}>S/ {acc.price}</span>
                    <span style={{ fontSize: 14, color: T.textMuted, marginLeft: 4 }}>/mes</span>
                  </div>
                  <span style={{ fontSize: 12, color: T.textMuted }}>S/ {acc.totalPrice} · {months} cuotas</span>
                </div>
                {/* Add button */}
                <button onClick={() => { toggleAcc(acc.id); setAccDetailId(null); }} style={{ width: '100%', height: 44, borderRadius: 10, border: 'none', background: isSelected ? '#22c55e' : T.neonCyan, color: isSelected ? '#fff' : (isDark ? '#0a0a0a' : '#fff'), fontWeight: 500, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isSelected ? <Check size={16} /> : <Plus size={16} />}
                  {isSelected ? 'Quitar accesorio' : 'Agregar accesorio'}
                </button>
                {/* Trust message */}
                <p style={{ fontSize: 12, color: T.textMuted, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Users size={14} />
                  +15,000 estudiantes confían en nosotros
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <GamerFooter theme={theme} />
    </div>
  );
}
