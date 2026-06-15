'use client';

/**
 * NvidiaNavbar — header de la landing NVIDIA para las RUTAS DE FLUJO
 * (catálogo, detalle, solicitar, complementos, confirmación).
 *
 * Es visualmente idéntico al header inline del home (NvidiaLanding), pero como
 * aquí no existen las secciones (#baldecash, #catalogo, …), los enlaces NAVEGAN
 * al home de la landing con el ancla correspondiente: /{landing}#seccion.
 * NvidiaLanding honra ese hash al montar y hace scroll a la sección.
 *
 * Patrón equivalente al GamerNavbar de zona-gamer (un header propio por ruta).
 */
import { useEffect, useRef, useState } from 'react';
import { quienesSomos, navLinks } from '../data/nvidiaData';
import { landingHome } from '@/app/prototipos/0.6/utils/routes';

const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap';

export function NvidiaNavbar({ landing }: { landing: string }) {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const home = landingHome(landing);

  // Fuente Baloo 2 (guard de duplicados) — igual que NvidiaLanding
  useEffect(() => {
    const id = 'nvidia-google-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet'; link.href = GOOGLE_FONTS;
    document.head.appendChild(link);
  }, []);

  // Estado "scrolled" (igual que el home)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Expone la altura del header fijo para que el contenido y la barra secundaria
  // (buscador/carrito) queden PEGADOS justo debajo (misma var que usa el Navbar
  // compartido). Un ResizeObserver la mantiene exacta aunque el header cambie de
  // alto al hacer scroll (padding 18px→12px). Además fijamos --promo-banner-height
  // a 0 porque este header no tiene barra promo (si quedara un valor viejo del
  // Navbar compartido, la barra secundaria se solaparía con el header).
  useEffect(() => {
    const el = headerRef.current;
    const root = document.documentElement;
    root.style.setProperty('--promo-banner-height', '0px');
    const apply = () => root.style.setProperty('--header-total-height', `${el?.offsetHeight ?? 68}px`);
    apply();
    const ro = el ? new ResizeObserver(apply) : null;
    if (el && ro) ro.observe(el);
    window.addEventListener('resize', apply);
    // NO removemos --header-total-height / --promo-banner-height en el cleanup:
    // con doble montaje (StrictMode) el cleanup de una instancia borraría la var de
    // la otra y la barra secundaria caería al fallback 6.5rem (hueco). La variable se
    // sobreescribe sola con el navbar de la siguiente ruta.
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, []);

  return (
    <div className="nv-navbar-host">
      <style>{NV_NAV_CSS}</style>
      <header ref={headerRef} className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href={`${home}#top`} className="lockup">
            <img className="lockup-logo" src={quienesSomos.partnerLogo} alt="BaldeCash × NVIDIA" />
          </a>
          <nav className="nav-links">
            {navLinks.map((l) => (
              <a key={l.sectionId} href={`${home}#${l.sectionId}`}>{l.label}</a>
            ))}
          </nav>
        </div>
      </header>
    </div>
  );
}

/* CSS replicado del header de NvidiaLanding (scopeado a .nv-navbar-host para que
   funcione fuera del contenedor .nvidia-landing del home). */
const NV_NAV_CSS = `
.nv-navbar-host{--maxw:1240px;--muted:#9aa0ae;--line:rgba(255,255,255,.08);}
/* En las rutas de flujo (no hay hero detrás) el header es SIEMPRE opaco (para que el
   contenido no se vea a través) y de ALTURA CONSTANTE (no se encoge al scrollear, así
   la barra de búsqueda queda pegada siempre, sin huecos al hacer scroll). */
.nv-navbar-host .nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--line);padding:13px 0;font-family:"Baloo 2",system-ui,sans-serif;background:rgba(7,7,12,.92);backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%);}
.nv-navbar-host .nav-inner{position:relative;width:100%;max-width:var(--maxw);padding:0 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;}
.nv-navbar-host .lockup{display:inline-flex;align-items:center;}
.nv-navbar-host .lockup-logo{height:32px;width:auto;object-fit:contain;display:block;}
.nv-navbar-host .nav-links{display:flex;gap:18px;align-items:center;position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;}
.nv-navbar-host .nav-links a{background:none;border:0;font-family:"Baloo 2";font-size:.9rem;color:var(--muted);font-weight:500;transition:color .25s;cursor:pointer;white-space:nowrap;text-decoration:none;}
.nv-navbar-host .nav-links a:hover{color:#fff;}
@media(max-width:1100px){.nv-navbar-host .nav-links{display:none;}}
`;

export default NvidiaNavbar;
