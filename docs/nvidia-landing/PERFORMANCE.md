# Landing NVIDIA — Rendimiento

Patrones validados en MacBook Neo y Zona Gamer. Aplicar todos.

---

## 1. LazySection — secciones below-the-fold

Copiar el wrapper de `MacBookNeoLanding.tsx` al inicio de `NvidiaLanding.tsx`. También existe en `components/zona-gamer/LazySection.tsx`.

```typescript
function LazySection({ children, fallbackHeight = 400 }: { children: ReactNode; fallbackHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible
        ? <Suspense fallback={<div style={{ height: fallbackHeight }} />}>{children}</Suspense>
        : <div style={{ height: fallbackHeight }} />}
    </div>
  );
}
```

**Regla: el hero nunca va en LazySection. Todo lo below-fold, sí.**

---

## 2. Lazy imports

```typescript
// Hero: import normal
import NvidiaHero from './NvidiaHero';

// Todo lo demás: lazy
const NvidiaGPUSection = lazy(() => import('./NvidiaGPUSection'));
const NvidiaSpecs      = lazy(() => import('./NvidiaSpecs'));
const NvidiaPlanes     = lazy(() => import('./NvidiaPlanes'));
```

---

## 3. `useDeviceCapabilities` — adaptar animaciones

```typescript
const { tier } = useDeviceCapabilities();
// 'enhanced' → desktop potente, full animations
// 'base'     → mobile, batería <20%, viewport <480px, prefers-reduced-motion

{tier === 'enhanced' && <ParticleEffect />}
{tier === 'base' && <StaticBackground />}

// Videos: nunca en tier === 'base'
{tier === 'enhanced' && <video autoPlay muted loop ... />}
```

---

## 4. `useLenis` — smooth scroll

```typescript
useLenis(); // al inicio del componente raíz — se omite si reduced-motion
```

---

## 5. Imágenes

```typescript
// Hero (LCP): eager + fetchPriority high
<img src={heroUrl} fetchPriority="high" loading="eager" alt="..." />

// Below-fold: lazy + dimensiones explícitas
<img src={url} loading="lazy" width={800} height={600} alt="..." />

// Error fallback obligatorio
<img
  src={url}
  loading="lazy"
  onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
  alt="..."
/>

// Preconnect S3 (antes del return principal)
<link rel="preconnect" href="https://baldecash.s3.amazonaws.com" />
<link rel="dns-prefetch" href="https://baldecash.s3.amazonaws.com" />
```

---

## 6. Videos

```typescript
// Hero: preload="auto" + poster obligatorio (evita flash negro)
<video preload="auto" poster={posterUrl} muted autoPlay loop playsInline>
  <source src={videoUrl} type="video/mp4" />
</video>

// Below-fold: dentro de LazySection, nunca en tier === 'base'
{tier === 'enhanced' && (
  <LazySection fallbackHeight={500}>
    <video ... />
  </LazySection>
)}
```

---

## 7. Animaciones — GPU-accelerated

```typescript
// will-change en elementos que se transforman frecuentemente
style={{ willChange: 'transform' }}

// Preferir transform + opacity (GPU), nunca width/height/top/left (reflow)
style={{ transform: 'translateY(-10px)', opacity: 0 }}

// Framer Motion: variants declarativas
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
<motion.div variants={variants} initial="hidden" animate="visible" />
```

---

## 8. Scroll listener — passive

```typescript
window.addEventListener('scroll', onScroll, { passive: true });
return () => window.removeEventListener('scroll', onScroll);
```

---

## 9. Google Fonts — sin duplicados

```typescript
useEffect(() => {
  const id = 'nvidia-google-fonts';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=...&display=swap';
  document.head.appendChild(link);
}, []);
```

---

## 10. CSS variables con ResizeObserver (navbar sticky)

```typescript
useEffect(() => {
  const el = navRef.current;
  if (!el) return;
  const update = () =>
    document.documentElement.style.setProperty('--nvidia-nav-height', `${el.offsetHeight}px`);
  const ro = new ResizeObserver(update);
  ro.observe(el);
  update();
  return () => ro.disconnect();
}, []);

// Uso: style={{ paddingTop: 'var(--nvidia-nav-height, 64px)' }}
```

---

## 11. Scroll lock al abrir modales

```typescript
// Al abrir:
const savedScroll = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.top = `-${savedScroll}px`;

// Al cerrar:
document.body.style.position = '';
document.body.style.top = '';
window.scrollTo(0, savedScroll); // evita salto de página
```

---

## 12. Theme persistence — hydration guard

```typescript
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  const saved = localStorage.getItem('nvidia-theme') as 'dark' | 'light' | null;
  if (saved) setTheme(saved);
  setHydrated(true);
}, []);

useEffect(() => {
  if (hydrated) localStorage.setItem('nvidia-theme', theme);
}, [theme, hydrated]);
```
