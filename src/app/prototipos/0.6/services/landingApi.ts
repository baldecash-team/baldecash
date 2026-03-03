/**
 * Landing API Service - BaldeCash v0.6
 * Servicio para consumir datos de landing desde el backend
 */

import type {
  HeroContent,
  SocialProofData,
  HowItWorksData,
  FaqData,
  Testimonial,
  Institution,
  TrustSignal,
  CtaData,
  PromoBannerData,
  NavbarItemData,
  MegaMenuItemData,
  FooterData,
  CompanyData,
  CompanySocialLinks,
} from '../types/hero';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

/**
 * Tipos de respuesta de la API
 */
interface LandingResponse {
  id: number;
  slug: string;
  name: string;
  title: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text?: string;
  hero_cta_url?: string;
  hero_cta_url_params?: string;
  banner_images?: { url: string; alt?: string }[];
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  meta_title: string;
  meta_description: string;
  template?: {
    id: number;
    code: string;
    name: string;
  };
  institution?: {
    id: number;
    code: string;
    name: string;
    logo_url: string;
  };
  features?: Record<string, unknown>;
}

interface HomeComponentResponse {
  id: number;
  component_code: string;
  component_name: string;
  component_subtitle?: string;
  component_version: string;
  is_visible: boolean;
  display_order: number;
  config?: Record<string, unknown>;
  content_config?: Record<string, unknown>;
}

interface ApiFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  display_order?: number;
}

interface ApiInstitution {
  id: string;
  code: string;
  name: string;
  short_name?: string;
  logo?: string;
  type?: string;
  is_active?: boolean;
}

interface ApiCompanyInfo {
  name?: string | null;
  legal_name?: string | null;
  logo_url?: string | null;
  main_phone?: string | null;
  main_email?: string | null;
  website_url?: string | null;
  customer_portal_url?: string | null;
  support_phone?: string | null;
  support_email?: string | null;
  support_whatsapp?: string | null;
  support_hours?: string | null;
  sbs_registration?: string | null;
  social_links?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
  } | null;
}

interface LandingHeroResponse {
  landing: LandingResponse;
  components: HomeComponentResponse[];
  faqs?: ApiFaqItem[];
  institutions?: ApiInstitution[];
  company?: ApiCompanyInfo;
}

/**
 * Obtiene solo los metadatos SEO de una landing (para generateMetadata)
 * Usa el endpoint existente pero extrae solo lo necesario
 */
export async function getLandingMeta(slug: string): Promise<{
  meta_title: string | null;
  meta_description: string | null;
  name: string;
} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/landing/${slug}`, {
      cache: 'no-store', // Sin cache para ver cambios inmediatos desde el admin
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      name: data.name || slug,
    };
  } catch {
    return null;
  }
}

/**
 * Obtiene los datos de una landing por slug
 */
export async function getLandingBySlug(slug: string): Promise<LandingResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/landing/${slug}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching landing:', error);
    return null;
  }
}

/**
 * Obtiene los datos completos del hero para una landing
 * Incluye landing básico + home_components
 * @param slug - Landing slug
 * @param preview - Si true, devuelve datos aunque la landing esté en draft (para admin preview)
 */
export async function getLandingHeroData(slug: string, preview: boolean = false): Promise<LandingHeroResponse | null> {
  try {
    const url = preview
      ? `${API_BASE_URL}/public/landing/${slug}/hero?preview=true`
      : `${API_BASE_URL}/public/landing/${slug}/hero`;

    const response = await fetch(url, {
      cache: preview ? 'no-store' : undefined, // No cache en preview para ver cambios inmediatos
      next: preview ? undefined : { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching landing hero:', error);
    return null;
  }
}

/**
 * Obtiene los datos completos del hero para una landing por ID
 * Usado para preview en admin cuando el slug puede haber sido modificado pero no guardado
 * @param landingId - Landing ID
 * @param previewKey - Hash de preview para acceder a landings no publicadas
 */
export async function getLandingHeroDataById(landingId: number, previewKey: string | null = null): Promise<LandingHeroResponse | null> {
  try {
    const url = previewKey
      ? `${API_BASE_URL}/public/landing/id/${landingId}/hero?preview_key=${encodeURIComponent(previewKey)}`
      : `${API_BASE_URL}/public/landing/id/${landingId}/hero`;

    const response = await fetch(url, {
      cache: 'no-store', // Siempre no-store para preview por ID
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching landing hero by ID:', error);
    return null;
  }
}

/**
 * Respuesta del endpoint /layout (navbar + footer + promo_banner + catalog_secondary_navbar + company)
 */
export interface LandingLayoutResponse {
  navbar: HomeComponentResponse | null;
  footer: HomeComponentResponse | null;
  promo_banner: HomeComponentResponse | null;
  catalog_secondary_navbar: HomeComponentResponse | null;
  company: {
    name?: string;
    legal_name?: string;
    logo_url?: string;
    main_phone?: string;
    main_email?: string;
    website_url?: string;
    customer_portal_url?: string;
    support_phone?: string;
    support_email?: string;
    support_whatsapp?: string;
    support_hours?: string;
    sbs_registration?: string;
    social_links?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
      tiktok?: string;
    };
  } | null;
  primary_color?: string | null;
  secondary_color?: string | null;
}

/**
 * Obtiene solo los datos de layout (navbar + footer + company)
 * Endpoint ligero para páginas secundarias (legal, about, etc.)
 */
export async function getLandingLayout(slug: string): Promise<LandingLayoutResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/landing/${slug}/layout`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching landing layout:', error);
    return null;
  }
}

/**
 * Transforma los datos de la API al formato esperado por los componentes
 */
export function transformLandingData(data: LandingHeroResponse): {
  heroContent: HeroContent | null;
  socialProof: SocialProofData | null;
  howItWorksData: HowItWorksData | null;
  faqData: FaqData | null;
  ctaData: CtaData | null;
  promoBannerData: PromoBannerData | null;
  navbarItems: NavbarItemData[];
  megamenuItems: MegaMenuItemData[];
  testimonials: Testimonial[];
  testimonialsTitle?: string;
  activeSections: string[];
  hasCta: boolean;
  logoUrl?: string;
  customerPortalUrl?: string;
  footerData: FooterData | null;
  primaryColor: string;
  secondaryColor: string;
} {
  const components = data.components || [];

  // Encontrar cada componente por código o nombre
  const heroComponent = components.find(c => c.component_code === 'hero');
  const socialProofComponent = components.find(c =>
    c.component_code === 'social_proof' ||
    (c.content_config as Record<string, unknown>)?.component_name === 'social_proof'
  );
  // Buscar how_it_works por múltiples criterios:
  // 1. component_code === 'how_it_works'
  // 2. content_config.component_name === 'how_it_works'
  // 3. content_config tiene 'steps' Y 'requirements' (estructura del componente)
  const howItWorksComponent = components.find(c => {
    if (c.component_code === 'how_it_works') return true;
    const contentConfig = c.content_config as Record<string, unknown> | undefined;
    if (contentConfig?.component_name === 'how_it_works') return true;
    // Detectar por estructura: tiene steps y requirements
    if (contentConfig?.steps && contentConfig?.requirements) return true;
    return false;
  });
  const faqComponent = components.find(c => c.component_code === 'faq');
  const testimonialsComponent = components.find(c => c.component_code === 'testimonials');
  const ctaComponent = components.find(c => c.component_code === 'cta');
  const promoBannerComponent = components.find(c => c.component_code === 'promo_banner');
  const navbarComponent = components.find(c => c.component_code === 'navbar');
  const footerComponent = components.find(c => c.component_code === 'footer');

  // Extraer items del navbar
  const navbarConfig = (navbarComponent?.content_config || {}) as Record<string, unknown>;
  const rawNavbarItems = (navbarConfig.items as Array<NavbarItemData & { megamenu_items?: MegaMenuItemData[] }>) || [];

  const navbarItems: NavbarItemData[] = rawNavbarItems.map(item => ({
    label: item.label || '',
    href: item.href || '',
    section: item.section,
    has_megamenu: item.has_megamenu,
    badge_text: item.badge_text,
    badge_color: item.badge_color,
    megamenu_items: item.megamenu_items, // Pasar megamenu_items individuales
    is_visible: item.is_visible,
  }));

  // Extraer megamenu items del primer item que tenga has_megamenu (para compatibilidad)
  // Ahora cada item puede tener su propio megamenu_items
  const itemWithMegamenu = rawNavbarItems.find(item => item.has_megamenu && item.megamenu_items?.length);
  const megamenuItems: MegaMenuItemData[] = (itemWithMegamenu?.megamenu_items || []).map(item => ({
    label: item.label || '',
    href: item.href || '',
    icon: item.icon || '',
    description: item.description || '',
  }));

  // Determinar secciones activas basándose en:
  // 1. Que exista el componente en la BD
  // 2. Que exista un item visible del navbar que apunte a esa sección
  const visibleNavbarSections = navbarItems
    .filter(item => item.is_visible !== false && item.section)
    .map(item => item.section);

  const activeSections: string[] = [];
  if (socialProofComponent && visibleNavbarSections.includes('convenios')) {
    activeSections.push('convenios');
  }
  if (howItWorksComponent && visibleNavbarSections.includes('como-funciona')) {
    activeSections.push('como-funciona');
  }
  if (faqComponent && visibleNavbarSections.includes('faq')) {
    activeSections.push('faq');
  }
  if (testimonialsComponent && visibleNavbarSections.includes('testimonios')) {
    activeSections.push('testimonios');
  }

  // Flag para CTA
  const hasCta = !!ctaComponent;

  // Extraer datos de hero (null si el componente no existe)
  let heroContent: HeroContent | null = null;
  if (heroComponent) {
    const heroConfig = (heroComponent.content_config || {}) as Record<string, unknown>;
    const ctaPrimary = heroConfig.cta_primary as { text?: string; href?: string } | undefined;

    // Background image desde landing.banner_images (primer imagen)
    const bannerImages = data.landing.banner_images || [];
    const backgroundImage = bannerImages.length > 0 ? bannerImages[0].url : undefined;

    // Combinar hero_cta_url + hero_cta_url_params si existen
    const heroBaseUrl = data.landing.hero_cta_url || ctaPrimary?.href || '#';
    const heroUrlParams = data.landing.hero_cta_url_params || '';
    const fullHeroCtaUrl = heroBaseUrl && heroUrlParams ? `${heroBaseUrl}${heroUrlParams}` : heroBaseUrl;

    heroContent = {
      headline: data.landing.hero_title || '',
      subheadline: data.landing.hero_subtitle || '',
      minQuota: (heroConfig.minQuota ?? heroConfig.min_quota ?? 0) as number,
      primaryCta: {
        text: data.landing.hero_cta_text || ctaPrimary?.text || '',
        href: fullHeroCtaUrl,
        variant: 'primary',
      },
      trustSignals: ((heroConfig.trust_signals as (TrustSignal & { is_visible?: boolean })[]) || []).map((signal) => ({
        icon: signal.icon || '',
        text: signal.text || '',
        tooltip: signal.tooltip,
        is_visible: signal.is_visible,
      })),
      backgroundImage,
      badgeText: (heroConfig.badge_text as string) || undefined,
    };
  }

  // Extraer datos de social_proof (null si el componente no existe)
  let socialProof: SocialProofData | null = null;
  if (socialProofComponent) {
    const socialConfig = (socialProofComponent.content_config || {}) as Record<string, unknown>;
    const stats = (socialConfig.stats || {}) as Record<string, number>;

    // Extraer título y subtítulo desde content_config
    const socialTitle = (socialConfig.title as string) || undefined;
    const socialSubtitle = (socialConfig.subtitle as string) || undefined;

    // Instituciones desde API (backend filtra por institution_ids si existe en content_config)
    const institutions: Institution[] = (data.institutions || []).map((inst) => ({
      id: inst.id,
      code: inst.code || '',
      name: inst.name || '',
      shortName: inst.short_name || inst.name || '',
      logo: inst.logo || '',
      hasAgreement: (inst as { has_agreement?: boolean }).has_agreement ?? false,
      agreementType: (inst as { agreement_type?: string }).agreement_type as 'convenio_marco' | 'convenio_especifico' | 'alianza' | undefined,
      is_active: inst.is_active,
    }));

    // Leer student_count: primero directo del config (Admin V3), luego de stats (legacy)
    // El admin guarda como string (ej: "+10,000"), parseamos el número
    const rawStudentCount = socialConfig.student_count || stats.student_count;
    const studentCount = typeof rawStudentCount === 'string'
      ? parseInt(rawStudentCount.replace(/[^0-9]/g, ''), 10) || 0
      : (rawStudentCount as number) || 0;

    // Leer institution_count: primero directo del config (Admin V3), luego de stats (legacy)
    const rawInstitutionCount = socialConfig.institution_count ?? stats.institution_count;
    const institutionCount = typeof rawInstitutionCount === 'number'
      ? rawInstitutionCount
      : institutions.length;

    socialProof = {
      title: socialTitle,
      subtitle: socialSubtitle,
      chipText: (socialConfig.chip_text as string) || undefined,
      titleTemplate: (socialConfig.title_template as string) || undefined,
      highlightWord: (socialConfig.highlight_word as string) || undefined,
      testimonialsSubtitle: (socialConfig.testimonials_subtitle as string) || undefined,
      studentCount,
      institutionCount,
      yearsInMarket: stats.years_in_market || 0,
      institutions,
      mediaLogos: (socialConfig.media_logos as { name: string; logo: string; url?: string }[]) || [],
    };
  }

  // Extraer datos de how_it_works (null si el componente no existe)
  let howItWorksData: HowItWorksData | null = null;
  if (howItWorksComponent) {
    const howConfig = (howItWorksComponent.content_config || {}) as Record<string, unknown>;

    // Extraer título y subtítulo desde content_config
    const howTitle = (howConfig.title as string) || undefined;
    const howSubtitle = (howConfig.subtitle as string) || undefined;

    // Extraer títulos de columnas desde content_config
    const stepLabel = (howConfig.step_label as string) || undefined;
    const stepsTitle = (howConfig.steps_title as string) || undefined;
    const requirementsTitle = (howConfig.requirements_title as string) || undefined;

    howItWorksData = {
      title: howTitle,
      subtitle: howSubtitle,
      stepLabel,
      stepsTitle,
      requirementsTitle,
      steps: ((howConfig.steps as { id: number; title: string; description: string; icon: string; color?: string; is_visible?: boolean }[]) || []).map((step, index) => ({
        id: step.id || index + 1,
        title: step.title || '',
        description: step.description || '',
        icon: step.icon || '',
        color: step.color,
        is_visible: step.is_visible,
      })),
      requirements: ((howConfig.requirements as { id: number; text: string; icon?: string; is_visible?: boolean }[]) || []).map((req, index) => ({
        id: req.id || index + 1,
        text: req.text || '',
        icon: req.icon,
        is_visible: req.is_visible,
      })),
      availableTerms: (howConfig.available_terms as number[]) || [],
    };
  }

  // Extraer datos de FAQ (null si el componente no existe)
  let faqData: FaqData | null = null;
  if (faqComponent) {
    // Usar FAQs desde API (tabla landing_faq) si existen
    const apiFaqs = data.faqs || [];

    // Extraer config del componente
    const faqContentConfig = (faqComponent.content_config || {}) as Record<string, unknown>;

    // Extraer título de component_name, subtítulo de content_config.subtitle
    const faqTitle = faqComponent.component_name || undefined;
    const faqSubtitle = (faqContentConfig.subtitle as string) || undefined;

    // Extraer iconos y colores de categoría desde content_config
    const categoryIcons = faqContentConfig.category_icons as Record<string, string> | undefined;
    const categoryColors = faqContentConfig.category_colors as Record<string, string> | undefined;

    // Obtener categorías únicas
    const categories = [...new Set(apiFaqs.map(f => f.category).filter(Boolean))] as string[];

    // 100% backend: si no hay FAQs en BD, faqData queda null y la sección no se renderiza
    faqData = apiFaqs.length > 0 ? {
      title: faqTitle,
      subtitle: faqSubtitle,
      items: apiFaqs.map((faq) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      })),
      categories: categories.length > 0 ? categories : undefined,
      categoryIcons,
      categoryColors,
    } : null;
  }

  // Extraer testimonios (solo si el componente está visible)
  const testimonialsConfig = (testimonialsComponent?.content_config || {}) as Record<string, unknown>;
  const isTestimonialsVisible = testimonialsComponent?.is_visible !== false;
  const testimonials: Testimonial[] = isTestimonialsVisible
    ? ((testimonialsConfig.testimonials as Testimonial[]) || []).map((t, index) => ({
        id: t.id || String(index + 1),
        name: t.name || '',
        institution: t.institution || '',
        quote: t.quote || '',
        avatar: t.avatar,
        rating: t.rating ?? 0,
        is_visible: t.is_visible,
      }))
    : [];

  // Extraer título de testimonios desde el componente (solo si visible)
  const testimonialsTitle = isTestimonialsVisible
    ? testimonialsComponent?.component_name || undefined
    : undefined;

  // Extraer datos de CTA (null si el componente no existe)
  let ctaData: CtaData | null = null;
  if (ctaComponent) {
    const ctaConfig = (ctaComponent.content_config || {}) as Record<string, unknown>;
    const buttons = (ctaConfig.buttons || {}) as Record<string, { text?: string; text_line2?: string; url?: string }>;

    // Extraer legal_links si existen
    const legalLinksRaw = ctaConfig.legal_links as { terms?: { text?: string; url?: string }; privacy?: { text?: string; url?: string } } | undefined;
    const legalLinks = legalLinksRaw ? {
      terms: {
        text: legalLinksRaw.terms?.text || '',
        url: legalLinksRaw.terms?.url || '',
      },
      privacy: {
        text: legalLinksRaw.privacy?.text || '',
        url: legalLinksRaw.privacy?.url || '',
      },
    } : undefined;

    ctaData = {
      buttons: {
        catalog: {
          text: buttons.catalog?.text || '',
          url: buttons.catalog?.url || '',
        },
        quiz: {
          text: buttons.quiz?.text || '',
          text_line2: buttons.quiz?.text_line2 || '',
        },
        whatsapp: {
          text: buttons.whatsapp?.text || '',
          url: buttons.whatsapp?.url || '',
        },
      },
      responseTime: (ctaConfig.response_time as string) || '',
      microcopy: (ctaConfig.microcopy as string) || undefined,
      highlightWord: (ctaConfig.highlight_word as string) || undefined,
      legalLinks,
      sectionTitle: (ctaConfig.section_title as string) || undefined,
      sectionSubtitle: (ctaConfig.section_subtitle as string) || undefined,
    };
  }

  // Extraer datos de Promo Banner (null si el componente no existe)
  let promoBannerData: PromoBannerData | null = null;
  if (promoBannerComponent) {
    const promoConfig = (promoBannerComponent.content_config || {}) as Record<string, unknown>;

    // Combinar cta_url + cta_url_params si existen
    const baseUrl = (promoConfig.cta_url as string) || '';
    const urlParams = (promoConfig.cta_url_params as string) || '';
    const fullCtaUrl = baseUrl && urlParams ? `${baseUrl}${urlParams}` : baseUrl || undefined;

    promoBannerData = {
      text: (promoConfig.text as string) || '',
      highlight: (promoConfig.highlight as string) || undefined,
      ctaText: (promoConfig.cta_text as string) || undefined,
      ctaUrl: fullCtaUrl,
      icon: (promoConfig.icon as string) || undefined,
      dismissible: (promoConfig.dismissible as boolean) ?? false,
    };
  }

  // Extraer datos de Footer (null si el componente no existe)
  let footerData: FooterData | null = null;
  if (footerComponent || data.company) {
    const footerConfig = (footerComponent?.content_config || {}) as Record<string, unknown>;

    // Transformar company data
    const companyData: CompanyData | undefined = data.company ? {
      name: data.company.name,
      legal_name: data.company.legal_name,
      logo_url: data.company.logo_url,
      main_phone: data.company.main_phone,
      main_email: data.company.main_email,
      website_url: data.company.website_url,
      customer_portal_url: data.company.customer_portal_url,
      support_phone: data.company.support_phone,
      support_email: data.company.support_email,
      support_whatsapp: data.company.support_whatsapp,
      support_hours: data.company.support_hours,
      sbs_registration: data.company.sbs_registration,
      social_links: data.company.social_links as CompanySocialLinks | null,
    } : undefined;

    // Transform columns: url → href for links, combining base + params
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
          href: baseUrl + params,
        };
      }),
    }));

    footerData = {
      tagline: (footerConfig.tagline as string) || undefined,
      columns: transformedColumns,
      newsletter: (footerConfig.newsletter as { enabled?: boolean; title: string; description: string; placeholder: string; button_text: string }) || undefined,
      sbs_text: (footerConfig.sbs_text as string) || undefined,
      copyright_text: (footerConfig.copyright_text as string) || undefined,
      social_links: (footerConfig.social_links as { platform: string; url: string }[]) || undefined,
      company: companyData,
    };
  }

  return {
    heroContent,
    socialProof,
    howItWorksData,
    faqData,
    ctaData,
    promoBannerData,
    navbarItems,
    megamenuItems,
    testimonials,
    testimonialsTitle,
    activeSections,
    hasCta,
    logoUrl: data.landing.logo_url || undefined,
    customerPortalUrl: data.company?.customer_portal_url || undefined,
    footerData,
    primaryColor: data.landing.primary_color || '#4654CD',
    secondaryColor: data.landing.secondary_color || '#03DBD0',
  };
}

/**
 * Hook helper para obtener datos del hero
 * Combina la llamada a la API y la transformación de datos
 * @param slug - Landing slug
 * @param preview - Si true, devuelve datos aunque la landing esté en draft (para admin preview)
 */
export async function fetchHeroData(slug: string, preview: boolean = false): Promise<{
  heroContent: HeroContent | null;
  socialProof: SocialProofData | null;
  howItWorksData: HowItWorksData | null;
  faqData: FaqData | null;
  ctaData: CtaData | null;
  promoBannerData: PromoBannerData | null;
  navbarItems: NavbarItemData[];
  megamenuItems: MegaMenuItemData[];
  testimonials: Testimonial[];
  testimonialsTitle?: string;
  activeSections: string[];
  hasCta: boolean;
  logoUrl?: string;
  customerPortalUrl?: string;
  footerData: FooterData | null;
  primaryColor: string;
  secondaryColor: string;
} | null> {
  const data = await getLandingHeroData(slug, preview);

  if (!data) {
    return null;
  }

  return transformLandingData(data);
}

// ============================================
// Accessory Types
// ============================================

interface ApiAccessoryResponse {
  landing_id: number;
  landing_slug: string;
  accessories: ApiAccessory[];
  total: number;
}

interface ApiAccessory {
  id: string;
  name: string;
  description: string;
  price: number;
  monthlyQuota: number;
  image: string;
  category: string;
  isRecommended: boolean;
  compatibleWith: string[];
  specs: { label: string; value: string }[];
  brand?: {
    name: string;
    slug: string;
  } | null;
}

/**
 * Obtiene los accesorios disponibles para una landing
 */
export async function getLandingAccessories(slug: string): Promise<ApiAccessory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/landing/${slug}/accessories`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Landing accessories not found for slug: ${slug}`);
        return [];
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data: ApiAccessoryResponse = await response.json();
    return data.accessories || [];
  } catch (error) {
    console.error('Error fetching landing accessories:', error);
    return [];
  }
}

// ============================================
// Insurance Types
// ============================================

interface ApiInsuranceResponse {
  landing_id: number;
  landing_slug: string;
  plans: ApiInsurancePlan[];
  total: number;
}

interface ApiInsurancePlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  tier: 'basic' | 'standard' | 'premium';
  isRecommended: boolean;
  isMandatory: boolean;
  coverage: {
    name: string;
    description: string;
    icon: string;
    maxAmount?: number;
    coveragePercent?: number;
  }[];
  exclusions: string[];
  provider?: {
    name: string;
    code: string;
  } | null;
  category?: {
    name: string;
    code: string;
    icon: string;
  } | null;
  durationMonths: number;
  waitingPeriodDays: number;
  termsUrl: string;
}

/**
 * Obtiene los planes de seguro disponibles para una landing
 */
export async function getLandingInsurances(slug: string): Promise<ApiInsurancePlan[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/landing/${slug}/insurances`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Landing insurances not found for slug: ${slug}`);
        return [];
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data: ApiInsuranceResponse = await response.json();
    return data.plans || [];
  } catch (error) {
    console.error('Error fetching landing insurances:', error);
    return [];
  }
}

// ============================================
// Coming Soon API Types
// ============================================

export interface ComingSoonSection {
  section_key: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
}

interface ComingSoonResponse {
  sections: ComingSoonSection[];
}

/**
 * Obtiene el contenido de "Próximamente" para una landing
 * @param slug - Slug de la landing (opcional - sin slug devuelve contenido global)
 */
export async function getComingSoonContent(slug?: string): Promise<ComingSoonSection[]> {
  try {
    const params = slug ? `?slug=${encodeURIComponent(slug)}` : '';
    const response = await fetch(`${API_BASE_URL}/public/landing/coming-soon${params}`, {
      next: { revalidate: 300 }, // Cache 5 minutos
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('[ComingSoon] No content found');
        return [];
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data: ComingSoonResponse = await response.json();
    return data.sections || [];
  } catch (error) {
    console.error('Error fetching coming soon content:', error);
    return [];
  }
}
