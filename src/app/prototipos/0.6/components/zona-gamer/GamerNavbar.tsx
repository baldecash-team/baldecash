'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Moon, Sun, Menu, X, Zap, Search, Heart, ShoppingCart, User, Laptop, Loader2, Trash2 } from 'lucide-react';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { fetchCatalogData } from '@/app/prototipos/0.6/services/catalogApi';
import { WishlistDrawer } from '@/app/prototipos/0.6/[landing]/catalogo/components/wishlist/WishlistDrawer';
import { useCatalogSharedState } from '@/app/prototipos/0.6/[landing]/catalogo/hooks/useCatalogSharedState';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';

interface GamerNavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  catalogUrl: string;
  hideSecondaryBar?: boolean;
  fullWidth?: boolean;
  onMobileMenuChange?: (open: boolean) => void;
}

const NAV_SECTIONS = [
  { id: 'catalogo', label: 'Packs Gamer' },
  { id: 'brands', label: 'Marcas' },
  { id: 'linea-combate', label: 'Series' },
  { id: 'games', label: 'Top Games' },
  { id: 'stories', label: 'Historias Reales' },
];

const LANDING_SLUG = 'zona-gamer';

interface SearchResult {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  brand: string;
  thumbnail: string;
  quotaMonthly: number;
}

export function GamerNavbar({ theme, onToggleTheme, catalogUrl, hideSecondaryBar, fullWidth, onMobileMenuChange }: GamerNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const setMobileOpenAndNotify = useCallback((open: boolean) => {
    setMobileOpen(open);
    onMobileMenuChange?.(open);
  }, [onMobileMenuChange]);
  const pathname = usePathname();
  const router = useRouter();
  const landingHome = routes.landingHome(LANDING_SLUG);
  const isOnLanding = pathname === landingHome || pathname === landingHome + '/';

  const isDark = theme === 'dark';
  const V = cssVars(isDark);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);
  const searchDragControls = useDragControls();
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(LANDING_SLUG) ? preview.previewKey : null;
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist } = useCatalogSharedState(LANDING_SLUG, previewKey);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await fetchCatalogData(LANDING_SLUG, {
          filters: { q: q.trim() },
          limit: 8,
        });
        if (data) {
          setSearchResults(data.products.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            displayName: p.displayName,
            brand: p.brand,
            thumbnail: p.thumbnail,
            quotaMonthly: p.quotaMonthly,
          })));
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const handleSelectProduct = useCallback((slug: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(routes.producto(LANDING_SLUG, slug));
  }, [router]);

  const handleViewAll = useCallback(() => {
    setShowDropdown(false);
    const q = searchQuery.trim();
    setSearchQuery('');
    setSearchResults([]);
    router.push(routes.catalogo(LANDING_SLUG, q ? `q=${encodeURIComponent(q)}` : ''));
  }, [router, searchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleViewAll();
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }, [handleViewAll]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileOpenAndNotify(false);
  };

  return (
    <>

      {/* Header */}
      <header
        className="sticky z-[100] backdrop-blur-[20px] border-b"
        style={{
          top: 0,
          height: 'clamp(52px, 10vw, 64px)',
          background: isDark ? 'rgba(14,14,14,0.85)' : 'rgba(255,255,255,0.92)',
          borderColor: V.border,
        }}
      >
        <div className={`${fullWidth ? '' : 'max-w-[1280px] mx-auto'} px-3 sm:px-6 w-full flex items-center justify-between h-full`}>
        {/* header-left */}
        <div className="flex items-center">
          <a href={routes.landingHome('zona-gamer')} className="flex items-center gap-2 no-underline">
            <Image
              src="/images/zona-gamer/logo baldecash/LOGO OFI.png"
              alt="BaldeCash"
              width={140}
              height={32}
              className="object-contain"
              style={{ height: 'clamp(22px, 5vw, 30px)', width: 'auto' }}
            />
            <span
              className="gaming-badge-blink"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 9,
                fontWeight: 700,
                color: V.neonRed,
                background: 'rgba(255,32,64,0.08)',
                border: '1px solid rgba(255,32,64,0.25)',
                padding: '2px 6px',
                borderRadius: 4,
                letterSpacing: 2,
                textTransform: 'uppercase',
                animation: 'gamingBlink 2s ease-in-out infinite',
              }}
            >
              GAMING
            </span>
            <style>{`
              @keyframes gamingBlink {
                0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(255,0,85,0.2); }
                50% { opacity: 0.4; box-shadow: 0 0 0 rgba(255,0,85,0); }
              }
            `}</style>
          </a>
        </div>

        {/* header-nav */}
        <nav className="hidden md:flex items-center" style={{ gap: 28, fontSize: 14 }}>
          {/* Catálogo — always a link */}
          <a
            href={catalogUrl}
            className="no-underline transition-colors"
            style={{ color: isDark ? '#fff' : '#333', fontSize: 14, fontWeight: 400, fontFamily: "'Rajdhani', sans-serif" }}
          >
            Catálogo
          </a>
          {/* Landing sections — scroll if on landing, link if not */}
          {NAV_SECTIONS.map((item) =>
            isOnLanding ? (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="bg-transparent border-none cursor-pointer no-underline transition-colors p-0"
                style={{ color: isDark ? '#fff' : '#333', fontSize: 14, fontWeight: 400, fontFamily: "'Rajdhani', sans-serif" }}
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.id}
                href={`${landingHome}#${item.id}`}
                className="no-underline transition-colors"
                style={{ color: isDark ? '#fff' : '#333', fontSize: 14, fontWeight: 400, fontFamily: "'Rajdhani', sans-serif" }}
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* header-right */}
        <div className="flex items-center" style={{ gap: 'clamp(6px, 2vw, 12px)' }}>
          {/* zona-estudiantes */}
          <a
            href="#"
            className="hidden md:flex items-center no-underline transition-all"
            style={{
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: V.neonPurple,
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.12)',
            }}
          >
            <User className="w-3.5 h-3.5" />
            Zona Gamers
          </a>

          {/* theme-toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center cursor-pointer transition-all relative"
            style={{
              width: 'clamp(34px, 8vw, 40px)',
              height: 'clamp(34px, 8vw, 40px)',
              borderRadius: 10,
              background: V.bgSurface,
              border: `1px solid ${V.border}`,
              color: isDark ? '#fff' : '#555',
            }}
            title="Cambiar tema"
          >
            {isDark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
          </button>

          {/* hamburger-btn (mobile only) */}
          <button
            onClick={() => setMobileOpenAndNotify(!mobileOpen)}
            className="hidden max-md:flex items-center justify-center"
            style={{
              width: 'clamp(32px, 8vw, 36px)',
              height: 'clamp(32px, 8vw, 36px)',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${V.border}`,
              color: V.textSecondary,
            }}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        </div>{/* close max-w container */}
      </header>

      {/* Secondary Navbar */}
      {!hideSecondaryBar && <div
        className="sticky z-[99] border-b backdrop-blur-[20px]"
        style={{
          top: 'clamp(52px, 10vw, 64px)',
          background: isDark ? 'rgba(14,14,14,0.95)' : 'rgba(255,255,255,0.95)',
          borderColor: V.border,
        }}
      >
        <div className={`${fullWidth ? '' : 'max-w-[1280px] mx-auto'} px-3 sm:px-6 flex items-center justify-between h-11 sm:h-14 gap-2 sm:gap-4`}>
          {/* Mobile: search icon button (opens overlay) */}
          <button
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
            }}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all"
            style={{
              background: V.bgSurface,
              borderColor: V.border,
              color: isDark ? '#fff' : '#555',
            }}
            title="Buscar"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Desktop: inline search */}
          <div className="hidden md:flex flex-1 justify-center min-w-0">
            <div ref={searchRef} style={{ position: 'relative', width: 600, maxWidth: '100%' }}>
            <div
              className="flex items-center w-full h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border-2 transition-all focus-within:border-[rgba(70,84,205,0.5)]"
              style={{
                background: V.bgSurface,
                borderColor: showDropdown ? 'rgba(70,84,205,0.5)' : 'rgba(70,84,205,0.2)',
              }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: isDark ? '#fff' : '#999' }} />
              <input
                type="text"
                placeholder="Buscar equipos..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => { if (searchQuery.trim() && searchResults.length > 0) setShowDropdown(true); }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                style={{
                  color: isDark ? '#fff' : '#333',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '0.5px',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: V.textMuted, padding: 2 }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown (desktop) */}
            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 6,
                  background: isDark ? '#1a1a1a' : '#fff',
                  border: `1px solid ${V.border}`,
                  borderRadius: 12,
                  boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.15)',
                  maxHeight: 400,
                  overflowY: 'auto',
                  zIndex: 200,
                }}
              >
                {isSearching && (
                  <div style={{ padding: '16px 20px', textAlign: 'center', color: V.textMuted, fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>
                    Buscando...
                  </div>
                )}

                {!isSearching && searchResults.length === 0 && searchQuery.trim() && (
                  <div style={{ padding: '16px 20px', textAlign: 'center', color: V.textMuted, fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>
                    No se encontraron equipos para &ldquo;{searchQuery}&rdquo;
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product.slug)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          width: '100%',
                          padding: '10px 16px',
                          background: 'none',
                          border: 'none',
                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}`,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#f8f8f8'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        {/* Thumbnail */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                          background: isDark ? '#111' : '#f5f5f5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {product.thumbnail ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.name}
                              width={44}
                              height={44}
                              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                            />
                          ) : (
                            <Laptop className="w-5 h-5" style={{ color: V.textMuted }} />
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 600, color: isDark ? '#f0f0f0' : '#333',
                            fontFamily: "'Rajdhani', sans-serif",
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {product.displayName || product.name}
                          </div>
                          <div style={{ fontSize: 11, color: V.textMuted, fontFamily: "'Share Tech Mono', monospace" }}>
                            {product.brand}
                          </div>
                        </div>

                        {/* Price */}
                        <div style={{
                          fontSize: 13, fontWeight: 700, color: V.neonCyan,
                          fontFamily: "'Orbitron', sans-serif", whiteSpace: 'nowrap',
                        }}>
                          S/{Math.round(product.quotaMonthly)}<span style={{ fontSize: 10, color: V.textMuted }}>/mes</span>
                        </div>
                      </button>
                    ))}

                    {/* View all link */}
                    <button
                      onClick={handleViewAll}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        color: V.neonPurple,
                        fontFamily: "'Rajdhani', sans-serif",
                        textAlign: 'center',
                      }}
                    >
                      Ver todos los resultados para &ldquo;{searchQuery}&rdquo;
                    </button>
                  </>
                )}
              </div>
            )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsWishlistDrawerOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border cursor-pointer transition-all hover:border-[#00ffd5] hover:text-[#00ffd5] relative"
              style={{
                background: V.bgSurface,
                borderColor: V.border,
                color: isDark ? '#fff' : '#555',
              }}
              title="Favoritos"
            >
              <Heart className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  minWidth: 18, height: 18, borderRadius: '50%',
                  background: '#ff0055', color: '#fff',
                  fontSize: 10, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(255,0,85,0.5)', padding: '0 4px', lineHeight: 1,
                }}>
                  {wishlistCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>}

      {/* Mobile Search Bottom Sheet — rendered OUTSIDE backdrop-blur parent so fixed positioning anchors to viewport */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="gamer-search-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => { setIsMobileSearchOpen(false); setShowDropdown(false); }}
              className="md:hidden fixed inset-0 bg-black/50 z-[9998]"
              style={{ touchAction: 'none' }}
            />
            {/* Sheet */}
            <motion.div
              key="gamer-search-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragControls={searchDragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) { setIsMobileSearchOpen(false); setShowDropdown(false); }
              }}
              className={`md:hidden fixed bottom-0 left-0 right-0 rounded-t-3xl z-[9999] flex flex-col max-h-[calc(100vh-6rem)] ${isDark ? 'gamer-search-dark' : 'gamer-search-light'}`}
              style={{
                background: isDark ? '#0e0e0e' : '#fff',
                overscrollBehavior: 'contain',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              {/* Drag handle */}
              <div
                onPointerDown={(e) => searchDragControls.start(e)}
                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
              >
                <div className="w-10 h-1.5 rounded-full" style={{ background: isDark ? '#2a2a2a' : '#d4d4d4' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: isDark ? 'rgba(0,255,213,0.15)' : 'rgba(0,137,122,0.12)' }}
                  >
                    <Search className="w-4 h-4" style={{ color: V.neonCyan }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold" style={{ color: V.textPrimary, fontFamily: "'Rajdhani', sans-serif" }}>Buscar equipos</h2>
                    <p className="text-xs" style={{ color: V.textMuted, fontFamily: "'Rajdhani', sans-serif" }}>Encuentra tu equipo ideal</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsMobileSearchOpen(false); setShowDropdown(false); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ background: 'transparent', color: V.textSecondary, border: 'none' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input */}
              <div className="px-4 pb-4">
                <div
                  className="flex items-center w-full rounded-xl border-2 transition-colors focus-within:border-[#00ffd5]"
                  style={{
                    background: isDark ? '#151515' : '#f3f3f3',
                    borderColor: 'transparent',
                  }}
                >
                  {isSearching && searchQuery.trim() ? (
                    <Loader2 className="w-5 h-5 ml-4 flex-shrink-0 animate-spin" style={{ color: V.neonCyan }} />
                  ) : (
                    <Search className="w-5 h-5 ml-4 flex-shrink-0" style={{ color: V.textMuted }} />
                  )}
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="Buscar por marca, modelo..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent px-3 py-4 text-base outline-none"
                    style={{
                      color: V.textPrimary,
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}
                      className="mr-3 p-1"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: V.textMuted }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-2 pb-2" style={{ overscrollBehavior: 'contain' }}>
                {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                  <div style={{ padding: '16px 20px', textAlign: 'center', color: V.textMuted, fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>
                    No se encontraron equipos para &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => { handleSelectProduct(product.slug); setIsMobileSearchOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                          padding: '10px 14px', background: 'none', border: 'none',
                          borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                          background: isDark ? '#111' : '#f5f5f5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {product.thumbnail ? (
                            <Image src={product.thumbnail} alt={product.name} width={44} height={44} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                          ) : (
                            <Laptop className="w-5 h-5" style={{ color: V.textMuted }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 600, color: V.textPrimary,
                            fontFamily: "'Rajdhani', sans-serif",
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {product.displayName || product.name}
                          </div>
                          <div style={{ fontSize: 11, color: V.textMuted, fontFamily: "'Share Tech Mono', monospace" }}>
                            {product.brand}
                          </div>
                        </div>
                        <div style={{
                          fontSize: 13, fontWeight: 700, color: V.neonCyan,
                          fontFamily: "'Orbitron', sans-serif", whiteSpace: 'nowrap',
                        }}>
                          S/{Math.round(product.quotaMonthly)}<span style={{ fontSize: 10, color: V.textMuted }}>/mes</span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 flex gap-2" style={{ borderTop: `1px solid ${V.border}` }}>
                {searchQuery.trim() ? (
                  <>
                    <button
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); mobileSearchInputRef.current?.focus(); }}
                      className="px-4 min-w-20 h-10 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
                      style={{
                        background: 'transparent',
                        color: V.textMuted,
                        fontFamily: "'Rajdhani', sans-serif",
                        border: 'none',
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpiar
                    </button>
                    <button
                      onClick={() => { handleViewAll(); setIsMobileSearchOpen(false); }}
                      disabled={searchResults.length === 0}
                      className="flex-1 h-10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
                      style={{
                        background: V.neonCyan,
                        color: isDark ? '#0a0a0a' : '#fff',
                        fontFamily: "'Rajdhani', sans-serif",
                        border: 'none',
                        opacity: searchResults.length > 0 ? 1 : 0.4,
                        cursor: searchResults.length > 0 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Search className="w-4 h-4" />
                      Ver resultados
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsMobileSearchOpen(false); setShowDropdown(false); }}
                    className="flex-1 h-10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: V.neonCyan,
                      color: isDark ? '#0a0a0a' : '#fff',
                      fontFamily: "'Rajdhani', sans-serif",
                      border: 'none',
                    }}
                  >
                    <Search className="w-4 h-4" />
                    Cerrar
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="md:hidden fixed inset-0 z-[39]"
              onClick={() => setMobileOpenAndNotify(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            />
            {/* Menu panel */}
            <motion.div
              className="md:hidden fixed left-0 right-0 z-40 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                top: 'clamp(52px, 10vw, 64px)',
                background: isDark ? '#0e0e0e' : '#fff',
                borderBottom: `1px solid ${V.border}`,
                boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.12)',
              }}
            >
              <div className="px-4 py-4 flex flex-col gap-0">
                {/* Catálogo link */}
                <a
                  href={catalogUrl}
                  className="block w-full text-left py-3 text-[15px] font-semibold no-underline transition-colors hover:text-[#00ffd5]"
                  style={{ color: V.neonCyan, fontFamily: "'Rajdhani', sans-serif", borderBottom: `1px solid ${V.border}` }}
                >
                  Catálogo
                </a>
                {/* Landing sections */}
                {NAV_SECTIONS.map((item, i) =>
                  isOnLanding ? (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className="block w-full text-left py-3 text-[15px] font-semibold bg-transparent border-none cursor-pointer transition-colors hover:text-[#00ffd5]"
                      style={{ color: V.textSecondary, fontFamily: "'Rajdhani', sans-serif", borderBottom: i < NAV_SECTIONS.length - 1 ? `1px solid ${V.border}` : 'none' }}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <a
                      key={item.id}
                      href={`${landingHome}#${item.id}`}
                      className="block w-full text-left py-3 text-[15px] font-semibold no-underline transition-colors hover:text-[#00ffd5]"
                      style={{ color: V.textSecondary, fontFamily: "'Rajdhani', sans-serif", borderBottom: i < NAV_SECTIONS.length - 1 ? `1px solid ${V.border}` : 'none' }}
                    >
                      {item.label}
                    </a>
                  )
                )}
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl no-underline text-sm font-semibold"
                  style={{
                    border: '2px solid rgba(0,255,213,0.3)',
                    color: V.neonCyan,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  <User className="w-3.5 h-3.5" />
                  Zona Gamers
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Wishlist Drawer — gamer-themed, accessible from any gamer page */}
      <WishlistDrawer
        isOpen={isWishlistDrawerOpen}
        onClose={() => setIsWishlistDrawerOpen(false)}
        products={wishlist}
        onRemoveProduct={(productId) => removeFromWishlist(productId)}
        onClearAll={() => clearWishlist()}
        onViewProduct={(productId) => {
          setIsWishlistDrawerOpen(false);
          const item = wishlist.find((w) => w.productId === productId);
          if (item?.slug) {
            router.push(routes.producto(LANDING_SLUG, item.slug));
          }
        }}
        themeClassName={isDark ? 'gamer-wishlist-dark' : 'gamer-wishlist-light'}
      />

      {/* Gamer Wishlist Drawer theme overrides (usa primary cyan gamer) */}
      <style>{`
        .gamer-wishlist-dark, .gamer-wishlist-dark *,
        .gamer-wishlist-light, .gamer-wishlist-light * {
          font-family: 'Rajdhani', sans-serif;
        }
        .gamer-wishlist-dark {
          --color-primary: #00ffd5;
          --color-primary-rgb: 0,255,213;
          background: #0e0e0e !important;
          color: #f0f0f0 !important;
        }
        .gamer-wishlist-light {
          --color-primary: #00897a;
          --color-primary-rgb: 0,137,122;
          background: #f5f5f5 !important;
          color: #1a1a1a !important;
        }
        .gamer-wishlist-dark .bg-white { background: #1a1a1a !important; }
        .gamer-wishlist-dark .bg-neutral-50 { background: #151515 !important; }
        .gamer-wishlist-dark .bg-neutral-100 { background: #252525 !important; }
        .gamer-wishlist-dark .bg-neutral-200 { background: #2a2a2a !important; }
        .gamer-wishlist-dark .bg-neutral-300 { background: #333 !important; }
        .gamer-wishlist-dark .border-neutral-100,
        .gamer-wishlist-dark .border-neutral-200,
        .gamer-wishlist-dark .border-neutral-300 { border-color: #2a2a2a !important; }
        .gamer-wishlist-dark .text-neutral-900,
        .gamer-wishlist-dark .text-neutral-800 { color: #f0f0f0 !important; }
        .gamer-wishlist-dark .text-neutral-700 { color: #d4d4d4 !important; }
        .gamer-wishlist-dark .text-neutral-600 { color: #a0a0a0 !important; }
        .gamer-wishlist-dark .text-neutral-500 { color: #888 !important; }
        .gamer-wishlist-dark .text-neutral-400 { color: #666 !important; }
        .gamer-wishlist-dark .text-neutral-300 { color: #555 !important; }
        .gamer-wishlist-dark .text-foreground,
        .gamer-wishlist-dark .text-default-foreground { color: #f0f0f0 !important; }
        .gamer-wishlist-dark button.border-neutral-300 {
          border-color: #3a3a3a !important;
          color: #d4d4d4 !important;
        }
        .gamer-wishlist-dark button.border-neutral-300:hover {
          border-color: #00ffd5 !important;
          color: #00ffd5 !important;
        }
        .gamer-wishlist-dark .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\] {
          background: rgba(0,255,213,0.15) !important;
        }
        .gamer-wishlist-dark .text-\\[var\\(--color-primary\\)\\],
        .gamer-wishlist-dark .fill-\\[var\\(--color-primary\\)\\] {
          color: #00ffd5 !important;
          fill: #00ffd5 !important;
        }
        .gamer-wishlist-dark .rounded-full.bg-neutral-100 { background: #252525 !important; }
        .gamer-wishlist-dark .bg-amber-50 { background: rgba(245, 158, 11, 0.12) !important; }
        .gamer-wishlist-dark .border-amber-200 { border-color: rgba(245, 158, 11, 0.35) !important; }
        .gamer-wishlist-dark .text-amber-600 { color: #fbbf24 !important; }
        .gamer-wishlist-dark .text-amber-700 { color: #fcd34d !important; }
        .gamer-wishlist-dark .text-red-500 { color: #ff4d6d !important; }
        .gamer-wishlist-dark .hover\\:bg-red-50:hover { background: rgba(255,77,109,0.1) !important; }
        .gamer-wishlist-dark .hover\\:text-red-500:hover { color: #ff4d6d !important; }
        .gamer-wishlist-dark .rounded-t-3xl .bg-neutral-300 { background: #00ffd5 !important; opacity: 0.4; }
        .gamer-wishlist-light .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\] {
          background: rgba(0,137,122,0.12) !important;
        }
        .gamer-wishlist-light .text-\\[var\\(--color-primary\\)\\],
        .gamer-wishlist-light .fill-\\[var\\(--color-primary\\)\\] {
          color: #00897a !important;
          fill: #00897a !important;
        }
        .gamer-wishlist-light .rounded-t-3xl .bg-neutral-300 { background: #00897a !important; opacity: 0.35; }
      `}</style>
    </>
  );
}

function cssVars(isDark: boolean) {
  return {
    bgDarkest: isDark ? '#0e0e0e' : '#f2f2f2',
    bgSurface: isDark ? '#1e1e1e' : '#f0f0f0',
    neonCyan: isDark ? '#00ffd5' : '#00897a',
    neonPurple: isDark ? '#6366f1' : '#4f46e5',
    neonRed: '#ff0055',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#555',
    textMuted: isDark ? '#707070' : '#888',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
  };
}
