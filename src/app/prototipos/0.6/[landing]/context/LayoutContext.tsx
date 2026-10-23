'use client';

/**
 * LayoutContext - Shared layout data for all pages under [landing]
 * Fetches navbar, footer, and company data ONCE and shares across all pages
 *
 * Preview Mode Support:
 * When PreviewContext has active preview credentials for this landing,
 * uses getLandingLayoutById with preview_key instead of slug-based API.
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getLandingLayout, type LandingLayoutResponse } from '@/app/prototipos/0.6/services/landingApi';
import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import type { PromoBannerData, FooterData, AgreementData } from '@/app/prototipos/0.6/types/hero';

import { OVERLAY_VARIANT_LOGOS, getDeferredPayment, getCalculadora, campanaAbierta as campanaRecibe, type DeferredPaymentConfig, type CalculadoraConfig } from '@/app/prototipos/0.6/types/landingConfig';
import { isDarkLanding, admiteDiseno2, NVIDIA_GREEN, NVIDIA_TURQUOISE } from '@/app/prototipos/0.6/utils/theme';
import { colorSobrePrimary, primaryParaTexto } from '@/app/prototipos/0.6/utils/colorContrast';

interface NavbarProps {
  promoBannerData?: PromoBannerData | null;
  logoUrl?: string;
  logoClassName?: string;
  customerPortalUrl?: string;
  portalButtonText?: string;
  navbarItems?: { label: string; href: string; section: string | null; has_megamenu?: boolean }[];
  megamenuItems?: { label: string; href: string; icon: string; description: string }[];
  activeSections?: string[];
  institutionLogo?: string;
  institutionName?: string;
  /**
   * Visibilidad del logo institucional, resuelta desde
   * `layout.show_agreement_logo`. Las paginas secundarias la reenvian al
   * Navbar y al Footer tal cual (BAL-2970).
   */
  showInstitutionLogo?: boolean;
}

interface LayoutContextValue {
  layoutData: LandingLayoutResponse | null;
  navbarProps: NavbarProps | null;
  footerData: FooterData | null;
  agreementData: AgreementData | null;
  isLoading: boolean;
  hasError: boolean; // true when landing not found or API error (for 404 display)
  landing: string;
  /** Stable numeric landing ID for feature detection (null while loading) */
  landingId: number | null;
  primaryColor: string;
  secondaryColor: string;
  primaryColorRgb: string;
  secondaryColorRgb: string;
  /** Whether this landing is being previewed with preview_key */
  isPreviewMode: boolean;
  /** Landing ID when in preview mode */
  previewLandingId: number | null;
  /** Public system configuration flags from backend */
  settings: Record<string, string>;
  catalogBanner: Record<string, unknown> | null;
  /**
   * Id del componente del banner, para la analítica.
   *
   * `catalogBanner` es el `content_config` -la configuración-, no el
   * componente: el id vive un nivel arriba. Leerlo de ahí con un cast daba
   * siempre `undefined`, y por eso `banner_id` llegaba null a `user_event`.
   */
  catalogBannerId: number | null;
  /** Newsletter component config from layout */
  newsletterData: { title?: string; subtitle?: string; button_text?: string; placeholder?: string } | null;
  /** Overlay variant from landing config (e.g. 'cade') */
  overlayVariant: string | null;
  /** Pago diferido de la landing (null si no está habilitado). */
  deferredPayment: DeferredPaymentConfig | null;
  /**
   * Configuración de la calculadora de efectivo, o null si esta landing no la
   * tiene. Vive acá por el mismo motivo que el selector de plazo: la decisión
   * es de la landing, no de la pantalla que la dibuja.
   */
  calculadora: CalculadoraConfig | null;
  /**
   * Si el plazo se puede cambiar desde el resumen del producto.
   *
   * Vive acá y no en cada pantalla porque el selector se dibuja en tres —la
   * portada de solicitar, cada paso del formulario y complementos— y antes solo
   * la primera consultaba la configuración. El resultado era que el ingrediente
   * tapaba una de tres, y el selector reaparecía apenas la persona avanzaba.
   */
  puedeCambiarPlazo: boolean;
  /**
   * Si la imagen del producto se muestra durante el recorrido de solicitud.
   *
   * Vive acá y no en cada pantalla porque la imagen se dibuja en cuatro
   * lugares: la portada de solicitar y tres bloques de la barra de producto
   * seleccionado. Con la decisión repartida, apagarla en una y olvidarse de
   * otra es cuestión de tiempo, que es exactamente lo que pasó con el selector
   * de plazo.
   */
  mostrarImagenProducto: boolean;
  /**
   * Si el paso final del formulario muestra el resumen de los datos ya
   * ingresados.
   *
   * Vive acá, junto a sus hermanos, para que la regla de «ausencia significa
   * encendido» se decida en un solo lugar y no en cada pantalla que lo lea.
   */
  mostrarResumen: boolean;
  /**
   * Secciones de la portada de «Solicitar» que se pueden ocultar por landing
   * (BAL-4700): «Producto seleccionado», las tarjetas de tiempo/pasos/
   * seguridad y «Lo que necesitarás». Viven acá por lo mismo que sus
   * hermanos: la regla de «ausencia significa encendido» en un solo lugar.
   */
  mostrarProductoSeleccionado: boolean;
  mostrarDatosRapidos: boolean;
  mostrarRequisitos: boolean;
  /**
   * Si en mobile las 4 cards de uso del catálogo se muestran como chips en
   * una sola fila (BAL-3880), en vez de las cards 2x2 de siempre.
   *
   * A diferencia de los flags de arriba, este preset es opt-in: ninguna
   * landing lo trae hoy y el default es APAGADO. Por eso abajo se compara
   * contra `=== true` y no contra `!== false` — con `!== false` los chips se
   * prenderían de golpe en las 100+ landings que no tienen la clave.
   */
  chipsDeUso: boolean;
  /**
   * Si el catálogo muestra las 4 tarjetas de uso ("Encuentra tu equipo
   * ideal") y su título.
   *
   * Reemplaza la regex sobre el slug (`isSecondFinancingLanding`) que hasta
   * BAL-3883 decidía esto: una landing nueva de segundo financiamiento ya no
   * hereda el comportamiento por su nombre, lo decide el preset.
   */
  filtroPorUso: boolean;
  /**
   * Si el catálogo muestra la franja con el contador de equipos y el
   * selector de orden.
   *
   * Mismo motivo que `filtroPorUso`: la decisión viaja por preset, no por el
   * slug de la landing.
   */
  barraDeOrden: boolean;
  /**
   * Diseño de la solicitud (BAL-4958): `1` es el actual, `2` es el modal "Lo
   * quiero". Se resuelve con `resolveDisenoSolicitud` desde
   * `features.solicitud_design`; cualquier valor que no sea `2` (ni el string
   * `'2'`) cae en `1`. Preferí `useDisenoSolicitud()` en vez de leer este
   * campo directo.
   */
  disenoSolicitud: 1 | 2;
  /**
   * "Lo quiero" abre el modal de accesorios, términos y cupón y pasa directo
   * al primer paso del formulario (BAL-4852). Derivado de `disenoSolicitud
   * === 2` y `admiteDiseno2(landing)` (gamer y tema oscuro quedan fuera,
   * BAL-4969 I-2); se conserva con este nombre porque así lo consumen catálogo y
   * ficha. Opcional en el tipo para que los contextos armados a mano (tests,
   * mocks) sigan valiendo; sin el campo es `false`.
   */
  loQuieroModal?: boolean;
  /**
   * `disenoSolicitud` ya salió de `/config` (BAL-4969, casuísticas). Mientras
   * es `false`, `disenoSolicitud` vale el `1` por defecto y NO dice nada: las
   * guardas del paso y la medición esperan a este flag. Opcional por los
   * contextos armados a mano (tests, mocks): sin el campo cuenta como resuelto.
   */
  disenoResuelto?: boolean;
  /**
   * La campaña sigue recibiendo solicitudes (`application_cap.abierto` de
   * `/config`). Diseño 2 no tiene la intro que lo avisaba en Diseño 1, así
   * que lo avisa en el paso (BAL-4969, casuísticas). Sin el dato: abierta.
   */
  campanaAbierta?: boolean;
}

/**
 * Resuelve `features.solicitud_design` a `1` o `2` (BAL-4958).
 *
 * El preset `solicitud-design-v2` es `value_type` int, pero por las dudas de
 * cómo lo entregue el backend se acepta tanto el número `2` como el string
 * `'2'`. Cualquier otro valor -incluida la ausencia de la clave- cae en `1`,
 * que es el diseño actual: una landing sin el preset no cambia.
 */
export function resolveDisenoSolicitud(value: unknown): 1 | 2 {
  return value === 2 || value === '2' ? 2 : 1;
}

/**
 * Convert hex color to RGB string for use with rgba()
 * Example: "#4654CD" -> "70, 84, 205"
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  // Fallback to default primary color RGB
  return '70, 84, 205';
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({
  children,
  landingOverride,
}: {
  children: React.ReactNode;
  /**
   * Fuerza el slug de landing en vez de leerlo de `useParams()`. Necesario
   * para rutas fuera de `[landing]/**` (ej. `/kyc/[token]`, Task 5) que no
   * tienen ese segmento en la URL pero sí conocen el landing por otra vía
   * (`landing_slug` del estado resuelto por el backend).
   */
  landingOverride?: string;
}) {
  const params = useParams();
  const landing = landingOverride || (params.landing as string) || 'home';

  const layoutSlug = landing;

  // Check if we're in preview mode for this landing
  // Wait for preview context to hydrate from sessionStorage before fetching
  const preview = usePreview();
  const isPreviewHydrated = preview.isHydrated;
  const isPreviewMode = preview.isPreviewingLanding(landing);
  const previewLandingId = isPreviewMode ? preview.landingId : null;
  const previewKey = isPreviewMode ? preview.previewKey : null;

  const [layoutData, setLayoutData] = useState<LandingLayoutResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [overlayVariant, setOverlayVariant] = useState<string | null>(null);
  const [deferredPayment, setDeferredPayment] = useState<DeferredPaymentConfig | null>(null);
  const [calculadora, setCalculadora] = useState<CalculadoraConfig | null>(null);
  const [showAgreementLogo, setShowAgreementLogo] = useState(true);
  const [puedeCambiarPlazo, setPuedeCambiarPlazo] = useState(true);
  const [mostrarImagenProducto, setMostrarImagenProducto] = useState(true);
  const [mostrarResumen, setMostrarResumen] = useState(true);
  const [mostrarProductoSeleccionado, setMostrarProductoSeleccionado] = useState(true);
  const [mostrarDatosRapidos, setMostrarDatosRapidos] = useState(true);
  const [mostrarRequisitos, setMostrarRequisitos] = useState(true);
  const [chipsDeUso, setChipsDeUso] = useState(false);
  const [filtroPorUso, setFiltroPorUso] = useState(true);
  const [barraDeOrden, setBarraDeOrden] = useState(true);
  const [disenoSolicitud, setDisenoSolicitud] = useState<1 | 2>(1);
  // De qué landing es el diseño que hay: si cambia la landing, el viejo no vale.
  const [disenoPara, setDisenoPara] = useState<string | null>(null);
  const disenoResuelto = disenoPara === landing;
  const [campanaAbierta, setCampanaAbierta] = useState(true);

  // Fetch landing config for overlay variant (logo override) + pago diferido
  // + visibilidad del logo de convenio
  useEffect(() => {
    // Con `previewKey` (vista previa de una landing en borrador) el backend
    // resuelve el diseño de esa landing; sin ella, una no publicada cae en D1.
    fetchLandingConfig(landing, previewKey).then(cfg => {
      // Encadenamiento opcional: una landing sin ingredientes de este grupo no
      // trae el espacio de nombres, y sin esto el contexto entero se cae.
      setOverlayVariant(cfg.features?.overlay_variant || '');
      setDeferredPayment(getDeferredPayment(cfg));
      setCalculadora(getCalculadora(cfg));
      // `!== false` y no `=== true`: si el backend no manda la clave el valor
      // es undefined, y ausencia significa encendido. Al reves, cualquier
      // landing de convenio sin el ingrediente perderia su logo.
      setShowAgreementLogo(cfg.layout?.show_agreement_logo !== false);
      // Mismo criterio que el logo: ausencia significa encendido. Con `=== true`
      // cualquier landing sin el ingrediente perdería su selector de plazo.
      setPuedeCambiarPlazo(cfg.features?.can_change_term !== false);
      // Mismo criterio que arriba: ausencia significa encendido. El preset es
      // nuevo, así que ninguna landing existente trae la clave; comparar contra
      // verdadero les borraría la imagen a todas de golpe.
      setMostrarImagenProducto(cfg.features?.show_product_image !== false);
      // Mismo criterio: ausencia significa encendido. Ninguna landing existente
      // trae la clave; comparar contra verdadero les quitaría el resumen a todas.
      setMostrarResumen(cfg.features?.show_summary !== false);
      // Las tres secciones de la portada de «Solicitar» (BAL-4700). Mismo
      // criterio: solo un `false` explícito las oculta. Hoy ninguna landing
      // trae el ingrediente, y un `=== true` les borraría las tres a todas.
      setMostrarProductoSeleccionado(cfg.features?.show_selected_product !== false);
      setMostrarDatosRapidos(cfg.features?.show_quick_facts !== false);
      setMostrarRequisitos(cfg.features?.show_requirements !== false);
      // Al reves que los flags de arriba: este preset es opt-in y ninguna
      // landing lo trae todavia, asi que ausencia significa APAGADO. Copiar
      // el `!== false` del vecino prenderia los chips en las 100+ landings
      // existentes de golpe.
      setChipsDeUso(cfg.features?.has_usage_chips === true);
      // Mismo criterio que el logo y el selector de plazo: ausencia significa
      // encendido. Antes de BAL-3883 esto se decidía con una regex sobre el
      // slug (`renueva-*`); ahora lo decide el preset y una landing nueva de
      // segundo financiamiento no hereda el comportamiento por su nombre.
      setFiltroPorUso(cfg.features?.has_usage_filter !== false);
      setBarraDeOrden(cfg.features?.has_catalog_sort_bar !== false);
      // BAL-4958: reemplaza al ingrediente `lo-quiero-modal-on`. Cualquier
      // valor que no sea 2 (número o string) cae en el diseño actual.
      setDisenoSolicitud(resolveDisenoSolicitud(cfg.features?.solicitud_design));
      setDisenoPara(landing);
      setCampanaAbierta(campanaRecibe(cfg));
    });
  }, [landing, previewKey]);

  // Fetch layout data once on mount (wait for preview context to hydrate first)
  useEffect(() => {
    // Don't fetch until we know if we're in preview mode
    if (!isPreviewHydrated) return;

    let isMounted = true;

    const fetchLayoutData = async () => {
      try {
        // Use slug-based API, with preview_key if in preview mode
        const data = await getLandingLayout(layoutSlug, previewKey);

        if (isMounted) {
          setLayoutData(data);
          // If API returns null (404), mark as error
          if (!data) {
            setHasError(true);
          }
        }
      } catch (error) {
        console.error('Error fetching layout data:', error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLayoutData();

    return () => {
      isMounted = false;
    };
  }, [landing, isPreviewHydrated, isPreviewMode, previewKey]);

  // Transform layout data for Navbar props
  const navbarProps = useMemo((): NavbarProps | null => {
    if (!layoutData) return null;

    const navbarConfig = layoutData.navbar?.content_config as Record<string, unknown> | undefined;
    const promoConfig = layoutData.promo_banner?.content_config as Record<string, unknown> | undefined;

    const navbarItems = navbarConfig?.items as { label: string; href: string; section: string | null; has_megamenu?: boolean }[] | undefined;
    const megamenuItems = navbarConfig?.megamenu_items as { label: string; href: string; icon: string; description: string }[] | undefined;

    // Combinar cta_url + cta_url_params si existen
    const baseUrl = (promoConfig?.cta_url as string) || '';
    const urlParams = (promoConfig?.cta_url_params as string) || '';
    const fullCtaUrl = baseUrl && urlParams ? `${baseUrl}${urlParams}` : baseUrl || undefined;

    const promoBannerData: PromoBannerData | null = promoConfig ? {
      text: (promoConfig.text as string) || '',
      highlight: promoConfig.highlight as string | undefined,
      ctaText: promoConfig.cta_text as string | undefined,
      ctaUrl: fullCtaUrl,
      icon: promoConfig.icon as string | undefined,
      dismissible: (promoConfig.dismissible as boolean) ?? true,
    } : null;

    // Agreement data for co-branding (convenio landings).
    // El logo se omite si `layout.show_agreement_logo` esta apagado; el nombre
    // se conserva porque el Navbar lo usa como alt text cuando si hay logo.
    const agreement = layoutData.agreement;
    // El convenio manda; el branding suelto es el fallback de las landings que
    // NO son de convenio y aun asi tienen una institucion de referencia
    // (`lead-flujo-normal` -> SENATI). El backend nunca manda los dos: cuando
    // hay convenio propio, `institution_branding` viene en null.
    const branding = layoutData.institution_branding;
    const institutionLogo = showAgreementLogo
      ? (agreement?.institution_logo || branding?.institution_logo)
      : undefined;

    const variantLogo = overlayVariant !== null ? OVERLAY_VARIANT_LOGOS[overlayVariant] : undefined;
    const logoResolved = overlayVariant !== null;

    return {
      promoBannerData,
      logoUrl: logoResolved ? (variantLogo || layoutData.company?.logo_url) : undefined,
      logoClassName: variantLogo ? 'h-12 object-contain' : undefined,
      customerPortalUrl: layoutData.company?.customer_portal_url,
      portalButtonText: (navbarConfig?.portal_button_text as string) || undefined,
      navbarItems: navbarItems || [],
      megamenuItems: megamenuItems || [],
      // Derive active sections from navbar items (if an item has a section, it's active)
      activeSections: (navbarItems || [])
        .filter((item) => item.section)
        .map((item) => item.section as string),
      institutionLogo: institutionLogo || undefined,
      institutionName: agreement?.institution_name || branding?.institution_name || undefined,
      showInstitutionLogo: showAgreementLogo,
    };
  }, [layoutData, overlayVariant, showAgreementLogo]);

  // Transform layout data for Footer props
  const footerData = useMemo((): FooterData | null => {
    if (!layoutData) return null;

    const footerConfig = layoutData.footer?.content_config as Record<string, unknown> | undefined;
    if (!footerConfig) return null;

    // Transform columns: normalize url -> href for links, combining base + params
    const rawColumns = footerConfig.columns as Array<{
      title: string;
      links: Array<{ label: string; url?: string; href?: string; url_params?: string; href_params?: string }>;
    }> | undefined;

    const transformedColumns = rawColumns?.map(col => ({
      title: col.title,
      links: col.links.map(link => {
        const baseUrl = link.href || link.url || '';
        const params = link.href_params || link.url_params || '';
        return {
          label: link.label,
          href: (baseUrl + params) || '#',
        };
      }),
    }));

    return {
      tagline: footerConfig.tagline as string | undefined,
      columns: transformedColumns,
      newsletter: footerConfig.newsletter as { title: string; description: string; placeholder: string; button_text: string } | undefined,
      sbs_text: footerConfig.sbs_text as string | undefined,
      copyright_text: footerConfig.copyright_text as string | undefined,
      social_links: footerConfig.social_links as { platform: string; url: string }[] | undefined,
      company: layoutData.company ? {
        name: layoutData.company.name,
        legal_name: layoutData.company.legal_name,
        logo_url: layoutData.company.logo_url,
        main_phone: layoutData.company.main_phone,
        main_address: layoutData.company.main_address,
        main_email: layoutData.company.main_email,
        website_url: layoutData.company.website_url,
        customer_portal_url: layoutData.company.customer_portal_url,
        support_phone: layoutData.company.support_phone,
        support_email: layoutData.company.support_email,
        support_whatsapp: layoutData.company.support_whatsapp,
        support_hours: layoutData.company.support_hours,
        sbs_registration: layoutData.company.sbs_registration,
        social_links: layoutData.company.social_links as { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; youtube?: string; tiktok?: string } | undefined,
      } : undefined,
    };
  }, [layoutData]);

  // Extract landing ID for feature detection
  const landingId = layoutData?.landing_id ?? null;

  // Extract colors from layout data.
  // Landings oscuras (nvidia) fuerzan verde/turquesa NVIDIA → todos los botones
  // que ya usan bg-[var(--color-primary)] quedan verdes sin tocarlos. Ver THEME_DARK.md §4.
  const dark = isDarkLanding(landing);
  const primaryColor = dark ? NVIDIA_GREEN : (layoutData?.primary_color || '#4654CD');
  const secondaryColor = dark ? NVIDIA_TURQUOISE : (layoutData?.secondary_color || '#03DBD0');
  const primaryColorRgb = hexToRgb(primaryColor);
  const secondaryColorRgb = hexToRgb(secondaryColor);
  // Diseño 2 (BAL-4969, I-1): el kit usa el color de la landing, y con un
  // primary claro (isil, ucal, nvidia…) el blanco encima o el primary sobre
  // blanco no se leen. Estas dos variables resuelven el texto legible; Diseño 1
  // no las usa. Los defaults (sin landing) viven en globals.css.
  const onPrimaryColor = colorSobrePrimary(primaryColor);
  const primaryTextColor = primaryParaTexto(primaryColor);

  // Set CSS variables on :root so they're available to portals (modals, drawers)
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-primary-rgb', primaryColorRgb);
    document.documentElement.style.setProperty('--color-secondary-rgb', secondaryColorRgb);
    document.documentElement.style.setProperty('--color-on-primary', onPrimaryColor);
    document.documentElement.style.setProperty('--color-primary-text', primaryTextColor);

    // Tema oscuro: data-theme en <html> para que los tokens de globals.css apliquen
    // también a modales/drawers montados en portales (fuera del layout). THEME_DARK.md §5.5.
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'nvidia');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    return () => {
      // Clean up on unmount
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--color-primary-rgb');
      document.documentElement.style.removeProperty('--color-secondary-rgb');
      document.documentElement.style.removeProperty('--color-on-primary');
      document.documentElement.style.removeProperty('--color-primary-text');
      document.documentElement.removeAttribute('data-theme');
    };
  }, [dark, primaryColor, secondaryColor, primaryColorRgb, secondaryColorRgb, onPrimaryColor, primaryTextColor]);

  // Extract public settings from layout data
  const settings = useMemo<Record<string, string>>(() => layoutData?.settings ?? {}, [layoutData]);

  // Extract catalog banner data
  const catalogBanner = useMemo(() => (layoutData?.catalog_banner?.content_config as Record<string, unknown>) ?? null, [layoutData]);
  const catalogBannerId = useMemo(() => layoutData?.catalog_banner?.id ?? null, [layoutData]);

  // Newsletter lives inside footer.content_config.newsletter (set from admin Footer tab)
  const newsletterData = useMemo(() => {
    const nl = footerData?.newsletter;
    if (!nl || nl.enabled === false) return null;
    return {
      title: nl.title || undefined,
      subtitle: nl.description || undefined,
      button_text: nl.button_text || undefined,
      placeholder: nl.placeholder || undefined,
    };
  }, [footerData]);

  // Extract agreement data for convenio pages
  //
  // Cuando `layout.show_agreement_logo` esta apagado se vacia el logo ACA, en
  // el origen, en vez de pasar una prop a cada pagina. El Footer condiciona por
  // `agreementData?.institution_logo`, asi que esto apaga de una sus 21 call
  // sites (y los 11 del Navbar, que leen el mismo objeto) sin poder olvidarse
  // de ninguno.
  //
  // Se borra SOLO el logo: el nombre de la institucion se sigue usando como
  // texto en ConvenioHero, ConvenioFaq y ConvenioCta, y ahi debe seguir.
  const agreementData = useMemo((): AgreementData | null => {
    if (!layoutData) return null;
    const agreement = layoutData.agreement;
    if (!agreement) return null;
    if (showAgreementLogo) return agreement;
    // `hide_logo` va junto al logo vacio: el footer tiene un fallback de texto
    // que se enciende cuando NO hay logo, asi que vaciarlo a secas hacia que
    // imprimiera el nombre de la institucion. Con la marca en el objeto, los 21
    // call sites del Footer la reciben sin tener que pasarles una prop.
    return { ...agreement, institution_logo: undefined, hide_logo: true };
  }, [layoutData, showAgreementLogo]);

  const value = useMemo(() => ({
    layoutData,
    navbarProps,
    footerData,
    agreementData,
    // El layout Y el diseño de la solicitud (BAL-4969, casuísticas): sin
    // esperar a `/config`, la página se pintaba en Diseño 1 y saltaba a
    // Diseño 2 (parpadeo), y un "Lo quiero" temprano iba a la intro de
    // Diseño 1. `/config` ya trae el diseño efectivo (preset o modo global).
    isLoading: isLoading || !disenoResuelto,
    hasError,
    landing,
    landingId,
    primaryColor,
    secondaryColor,
    primaryColorRgb,
    secondaryColorRgb,
    isPreviewMode,
    previewLandingId,
    settings,
    catalogBanner,
    catalogBannerId,
    newsletterData,
    overlayVariant,
    deferredPayment,
    calculadora,
    puedeCambiarPlazo,
    mostrarImagenProducto,
    mostrarResumen,
    mostrarProductoSeleccionado,
    mostrarDatosRapidos,
    mostrarRequisitos,
    chipsDeUso,
    filtroPorUso,
    barraDeOrden,
    disenoSolicitud,
    // Las landings sin Diseño 2 (gamer, tema oscuro: BAL-4969 I-2) no abren el modal.
    loQuieroModal: disenoSolicitud === 2 && admiteDiseno2(landing),
    disenoResuelto,
    campanaAbierta,
  }), [layoutData, navbarProps, footerData, agreementData, isLoading, hasError, landing, landingId, primaryColor, secondaryColor, primaryColorRgb, secondaryColorRgb, isPreviewMode, previewLandingId, settings, catalogBanner, catalogBannerId, newsletterData, overlayVariant, deferredPayment, calculadora, puedeCambiarPlazo, mostrarImagenProducto, mostrarResumen, mostrarProductoSeleccionado, mostrarDatosRapidos, mostrarRequisitos, chipsDeUso, filtroPorUso, barraDeOrden, disenoSolicitud, disenoResuelto, campanaAbierta]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

/**
 * Selector para el diseño de la solicitud (BAL-4958): `1` (actual) o `2`
 * (modal "Lo quiero"). Vive junto a `useLayout` porque es el mismo contexto;
 * existe como selector propio para que los consumidores que solo necesitan
 * esto no repitan `useLayout().disenoSolicitud` en cada archivo.
 */
export function useDisenoSolicitud(): 1 | 2 {
  return useLayout().disenoSolicitud;
}

export default LayoutContext;
