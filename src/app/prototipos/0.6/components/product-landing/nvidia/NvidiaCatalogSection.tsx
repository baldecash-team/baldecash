'use client';

/**
 * #catalogo — "La laptop ideal para cada GeForce RTX".
 * Sección DINÁMICA: trae productos de la API (landing nvidia, catálogo propio) y los
 * agrupa por modelo de GPU. Ver GPU_SECTION.md.
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { fetchCatalogData } from '@/app/prototipos/0.6/services/catalogApi';
import { parseNvidiaModel } from '@/app/prototipos/0.6/utils/nvidiaGpu';
import { gpuChipUrl } from '../data/nvidiaData';
import { changeTab } from './viewTransition';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import type { CatalogProduct } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';

// Slug del catálogo y de las rutas. nvidia ya tiene catálogo propio (mismos productos
// y slugs que zona-gamer); los "Lo quiero" apuntan a /nvidia/producto/{slug}.
const SOURCE_SLUG = 'nvidia';

const fmt = (n: number) => 'S/ ' + new Intl.NumberFormat('es-PE').format(n);

interface GpuGroup {
  key: string;       // 'RTX 3050'
  family: string;
  model: string;
  series: string;    // 'Serie 30'
  minQuota: number;
  products: CatalogProduct[];
}

function gpuStringOf(p: CatalogProduct): string | undefined {
  const raw = p.rawSpecs?.gpu;
  if (typeof raw === 'string' && raw) return raw;
  return p.specs?.gpu?.model || undefined;
}

// Marcas con capitalización correcta (la API las trae en minúscula)
const BRANDS: Record<string, string> = { hp: 'HP', msi: 'MSI', asus: 'Asus', acer: 'Acer', lenovo: 'Lenovo', dell: 'Dell', gigabyte: 'Gigabyte' };

/** Nombre limpio "Marca Modelo" (ej. "Lenovo LOQ 15IAX9") a partir de la API. */
function laptopName(p: CatalogProduct): string {
  const model = p.name.replace(/^laptop\s+/i, '').trim();
  const brand = BRANDS[p.brand] || (p.brand ? p.brand.charAt(0).toUpperCase() + p.brand.slice(1) : '');
  return brand && !model.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${model}` : model;
}

/** Specs cortas: "RTX 5050 8GB · 24GB · 1TB SSD" */
function specOf(p: CatalogProduct): string {
  const s = p.specs;
  const parts: string[] = [];
  if (s?.gpu?.model) parts.push(`${s.gpu.model}${s.gpu.vram ? ` ${s.gpu.vram}GB` : ''}`);
  if (s?.ram?.size) parts.push(`${s.ram.size}GB`);
  if (s?.storage?.size) {
    const st = s.storage.size >= 1024 ? `${Math.round(s.storage.size / 1024)}TB` : `${s.storage.size}GB`;
    parts.push(`${st} ${(s.storage.type || 'SSD').toUpperCase()}`);
  }
  return parts.join(' · ');
}

function buildGroups(products: CatalogProduct[]): GpuGroup[] {
  const acc: Record<string, GpuGroup> = {};
  for (const product of products) {
    const gpuStr = gpuStringOf(product);
    if (!gpuStr) continue;
    const parsed = parseNvidiaModel(gpuStr);
    if (!parsed?.model) continue;
    const key = `${parsed.family} ${parsed.model}`;
    if (!acc[key]) {
      acc[key] = {
        key,
        family: parsed.family,
        model: parsed.model,
        series: `Serie ${parsed.model.slice(0, 2)}`,
        minQuota: Infinity,
        products: [],
      };
    }
    acc[key].products.push(product);
    const q = product.quotaMonthly;
    if (q) acc[key].minQuota = Math.min(acc[key].minQuota, q);
  }
  // Laptops recomendadas primero, luego por cuota
  for (const g of Object.values(acc)) {
    g.products.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.quotaMonthly - b.quotaMonthly);
  }
  return Object.values(acc).sort((a, b) => parseInt(a.model) - parseInt(b.model));
}

export default function NvidiaCatalogSection() {
  const [groups, setGroups] = useState<GpuGroup[] | null>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCatalogData(SOURCE_SLUG, { limit: 200 }).then((data) => {
      if (!alive) return;
      const g = buildGroups(data?.products ?? []);
      setGroups(g);
      setActive(g[0]?.key ?? null);
    });
    return () => { alive = false; };
  }, []);

  const current = useMemo(
    () => groups?.find((g) => g.key === active) ?? null,
    [groups, active]
  );

  return (
    <section className="section" id="catalogo">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Nuestro catálogo</span>
          <h2>La laptop ideal para cada <span className="grad-text">GeForce RTX</span></h2>
          <p>Elige la GeForce RTX ideal para ti y mira las laptops que la incluyen, con su cuota mensual.</p>
        </div>

        {groups === null && <CatalogSkeleton />}

        {groups && groups.length === 0 && (
          <p>Pronto tendremos laptops disponibles para esta sección.</p>
        )}

        {groups && groups.length > 0 && (
          <div className="gt reveal">
            <div className="sl-tabs" role="tablist" aria-label="Filtrar laptops por tarjeta gráfica">
              {groups.map((g) => {
                const isOn = g.key === active;
                const hot = g.model === '5050';
                return (
                  <button key={g.key} type="button" role="tab" aria-selected={isOn}
                    className={`sl-tab${isOn ? ' on' : ''}${hot ? ' gt-hot' : ''}`}
                    onClick={() => changeTab(() => setActive(g.key))}>
                    RTX {g.model}{hot && <span className="gt-star">★</span>}
                    {isOn && <span className="sl-underline" style={{ viewTransitionName: 'sl-ul-catalog' } as CSSProperties} />}
                  </button>
                );
              })}
            </div>

            {current && (
              <div className="gt-panel">
                <div className="gt-hero">
                  <img src={gpuChipUrl(current.model)} alt={`GeForce ${current.key}`} loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
                  <div className="gt-info">
                    <span className="gt-name">GeForce {current.key}</span>
                    <span className="gt-serie">{current.series} · {current.products.length} laptop{current.products.length > 1 ? 's' : ''}</span>
                    {Number.isFinite(current.minQuota) && (
                      <span className="gt-from">
                        <span className="lbl">cuota desde</span>
                        <span className="q">{fmt(current.minQuota)}<small> /mes</small></span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="gt-list">
                  {current.products.map((p) => (
                    <div className="lp-item" key={p.id}>
                      <span className="lp-thumb">
                        <img src={p.thumbnail} alt={laptopName(p)} loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }} />
                      </span>
                      {p.isFeatured && <span className="lp-rec">Recomendada</span>}
                      <b>{laptopName(p)}</b>
                      <small>{specOf(p)}</small>
                      {p.quotaMonthly ? <span className="c">{fmt(p.quotaMonthly)}<small> /mes</small></span> : null}
                      <a className="lp-want" href={routes.producto(SOURCE_SLUG, p.slug)}>
                        Lo quiero
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{CATALOG_CSS}</style>
    </section>
  );
}

function CatalogSkeleton() {
  return (
    <div className="gt-skeleton" aria-hidden="true">
      <div className="gt-sk hero" />
      <div className="gt-sk-list">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="gt-sk card" />)}
      </div>
    </div>
  );
}

const CATALOG_CSS = `
.nvidia-landing #catalogo .sl-tabs{margin:0 auto 34px;width:max-content;max-width:100%;}
.nvidia-landing .gt{margin-top:32px;}
.nvidia-landing .gt-panel{display:grid;grid-template-columns:.78fr 2fr;gap:clamp(28px,4vw,56px);align-items:start;}
.nvidia-landing .gt-hero{display:flex;flex-direction:column;align-items:center;text-align:center;view-transition-name:gt-hero;}
.nvidia-landing .gt-hero img{width:100%;max-width:250px;object-fit:contain;filter:drop-shadow(0 22px 38px rgba(0,0,0,.55));}
.nvidia-landing .gt-info{display:flex;flex-direction:column;align-items:center;}
.nvidia-landing .gt-name{font-family:"Baloo 2";font-weight:700;font-size:1.35rem;margin-top:16px;line-height:1.1;}
.nvidia-landing .gt-serie{font-size:.82rem;color:var(--muted-2);margin-top:3px;}
.nvidia-landing .gt-from{display:flex;flex-direction:column;gap:2px;margin-top:16px;}
.nvidia-landing .gt-from .lbl{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-2);}
.nvidia-landing .gt-from .q{font-family:"Baloo 2";font-weight:700;font-size:1.9rem;line-height:1;color:#fff;font-variant-numeric:tabular-nums;}
.nvidia-landing .gt-from .q small{font-size:.7rem;color:var(--muted);font-weight:400;}
.nvidia-landing .gt-list{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;height:470px;overflow-y:auto;align-content:start;view-transition-name:gt-list;scrollbar-width:thin;scrollbar-color:#2a2a30 transparent;}
.nvidia-landing .gt-list::-webkit-scrollbar{width:8px;}
.nvidia-landing .gt-list::-webkit-scrollbar-thumb{background:#2a2a30;border-radius:8px;border:2px solid transparent;background-clip:padding-box;}
@media(max-width:860px){
  .nvidia-landing .gt-panel{grid-template-columns:1fr;gap:24px;}
  .nvidia-landing .gt-hero{position:static;flex-direction:row;text-align:left;justify-content:flex-start;align-items:center;gap:18px;}
  .nvidia-landing .gt-hero img{max-width:120px;}
  .nvidia-landing .gt-info{align-items:flex-start;}
  .nvidia-landing .gt-name{margin-top:0;}
  .nvidia-landing .gt-from{margin-top:8px;}
  .nvidia-landing .gt-list{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:520px){.nvidia-landing .gt-list{grid-template-columns:1fr;}}
/* item de laptop */
.nvidia-landing .lp-item{position:relative;display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:2px;padding:0;}
.nvidia-landing .lp-thumb{width:100%;height:108px;display:flex;align-items:center;justify-content:center;margin-bottom:6px;}
.nvidia-landing .lp-thumb img{max-width:96%;max-height:108px;object-fit:contain;}
.nvidia-landing .lp-item b{font-family:"Baloo 2";font-weight:600;font-size:.88rem;line-height:1.2;}
.nvidia-landing .lp-item small{font-size:.68rem;color:var(--muted);line-height:1.3;}
.nvidia-landing .lp-item .c{font-family:"Baloo 2";font-weight:700;font-size:1.1rem;color:#fff;font-variant-numeric:tabular-nums;margin-top:4px;}
.nvidia-landing .lp-item .c small{font-size:.58rem;color:var(--muted);font-weight:400;}
.nvidia-landing .lp-rec{position:absolute;top:6px;left:6px;z-index:2;font-size:.6rem;letter-spacing:.07em;text-transform:uppercase;font-weight:700;color:#08130a;background:var(--green-glow);border-radius:999px;padding:2px 9px;box-shadow:0 0 12px rgba(143,224,0,.45);}
.nvidia-landing .lp-want{margin-top:10px;display:inline-flex;align-items:center;gap:6px;background:#76B900;color:#fff;font-family:"Baloo 2";font-weight:600;font-size:.78rem;line-height:1;padding:9px 15px;border-radius:10px;transition:background .2s;text-decoration:none;}
.nvidia-landing .lp-want:hover{background:#8fe000;}
.nvidia-landing .lp-want svg{width:15px;height:15px;margin-right:-3px;}
/* tab estrella (5050) */
.nvidia-landing .gt-star{margin-left:4px;display:inline-block;}
.nvidia-landing .sl-tab.gt-hot{color:var(--green-glow);animation:gtTabGlow 1.5s ease-in-out infinite;}
.nvidia-landing .sl-tab.gt-hot::before{content:"";position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:138%;height:210%;border-radius:50%;background:radial-gradient(ellipse,rgba(118,185,0,.55),transparent 70%);filter:blur(7px);z-index:-1;pointer-events:none;animation:gtTabHalo 1.5s ease-in-out infinite;}
@keyframes gtTabGlow{0%,100%{text-shadow:0 0 3px rgba(143,224,0,.5);}50%{text-shadow:0 0 12px var(--green-glow),0 0 24px var(--green);}}
@keyframes gtTabHalo{0%,100%{opacity:.28;}50%{opacity:.85;}}
@media(prefers-reduced-motion:reduce){.nvidia-landing .sl-tab.gt-hot,.nvidia-landing .sl-tab.gt-hot::before{animation:none;}}
/* skeleton */
.nvidia-landing .gt-skeleton{display:grid;grid-template-columns:.78fr 2fr;gap:clamp(28px,4vw,56px);}
@media(max-width:860px){.nvidia-landing .gt-skeleton{grid-template-columns:1fr;}}
.nvidia-landing .gt-sk{border-radius:14px;background:linear-gradient(90deg,#0f0f18,#171722,#0f0f18);background-size:200% 100%;animation:nvsk 1.2s infinite;}
.nvidia-landing .gt-sk.hero{height:300px;}
.nvidia-landing .gt-sk-list{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media(max-width:520px){.nvidia-landing .gt-sk-list{grid-template-columns:repeat(2,1fr);}}
.nvidia-landing .gt-sk.card{height:200px;}
@keyframes nvsk{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
/* Animación al cambiar de pestaña: la GPU y la lista entran con fade-up escalonado
   (replica el gsap.fromTo del prototipo). Pseudo-elementos globales de View Transitions. */
::view-transition-old(gt-hero),::view-transition-old(gt-list){animation:gtOut .16s ease both;}
::view-transition-new(gt-hero){animation:gtIn .4s cubic-bezier(.23,1,.32,1) both;}
::view-transition-new(gt-list){animation:gtIn .4s cubic-bezier(.23,1,.32,1) .06s both;}
@keyframes gtOut{to{opacity:0;}}
@keyframes gtIn{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
`;
