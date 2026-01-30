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
 */
export async function getLandingHeroData(slug: string): Promise<LandingHeroResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/landing/${slug}/hero`, {
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
    console.error('Error fetching landing hero:', error);
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
} {
  const components = data.components || [];

  // Encontrar cada componente por código o nombre
  const heroComponent = components.find(c => c.component_code === 'hero');
  const socialProofComponent = components.find(c =>
    c.component_code === 'social_proof' ||
    (c.content_config as Record<string, unknown>)?.component_name === 'social_proof'
  );
  const howItWorksComponent = components.find(c =>
    c.component_code === 'how_it_works' ||
    (c.content_config as Record<string, unknown>)?.component_name === 'how_it_works'
  );
  const faqComponent = components.find(c => c.component_code === 'faq');
  const testimonialsComponent = components.find(c => c.component_code === 'testimonials');
  const ctaComponent = components.find(c => c.component_code === 'cta');
  const promoBannerComponent = components.find(c => c.component_code === 'promo_banner');
  const navbarComponent = components.find(c => c.component_code === 'navbar');
  const footerComponent = components.find(c => c.component_code === 'footer');

  // Extraer items del navbar
  const navbarConfig = (navbarComponent?.content_config || {}) as Record<string, unknown>;
  const navbarItems: NavbarItemData[] = ((navbarConfig.items as NavbarItemData[]) || []).map(item => ({
    label: item.label || '',
    href: item.href || '',
    section: item.section,
    has_megamenu: item.has_megamenu,
  }));

  // Extraer megamenu items
  const megamenuItems: MegaMenuItemData[] = ((navbarConfig.megamenu_items as MegaMenuItemData[]) || []).map(item => ({
    label: item.label || '',
    href: item.href || '',
    icon: item.icon || '',
    description: item.description || '',
  }));

  // Determinar secciones activas para el navbar
  const activeSections: string[] = [];
  if (socialProofComponent) activeSections.push('convenios');
  if (howItWorksComponent) activeSections.push('como-funciona');
  if (faqComponent) activeSections.push('faq');

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

    heroContent = {
      headline: data.landing.hero_title || '',
      subheadline: data.landing.hero_subtitle || '',
      minQuota: (heroConfig.min_quota as number) || 49,
      primaryCta: {
        // Usar CTA desde landing table, fallback a content_config, luego valores por defecto
        text: data.landing.hero_cta_text || ctaPrimary?.text || 'Solicitar ahora',
        href: data.landing.hero_cta_url || ctaPrimary?.href || '#solicitar',
        variant: 'primary',
      },
      trustSignals: ((heroConfig.trust_signals as TrustSignal[]) || []).map((signal) => ({
        icon: signal.icon || '',
        text: signal.text || '',
        tooltip: signal.tooltip,
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

    // Extraer título y subtítulo del componente
    const socialTitle = socialProofComponent.component_name || undefined;
    const socialSubtitle = socialProofComponent.component_subtitle || undefined;

    // Instituciones desde API (backend filtra por institution_ids si existe en content_config)
    const institutions: Institution[] = (data.institutions || []).map((inst) => ({
      id: inst.id,
      code: inst.code || '',
      name: inst.name || '',
      shortName: inst.short_name || inst.name || '',
      logo: inst.logo || '',
      hasAgreement: true,
      agreementType: 'convenio_marco' as const,
    }));

    socialProof = {
      title: socialTitle,
      subtitle: socialSubtitle,
      chipText: (socialConfig.chip_text as string) || undefined,
      titleTemplate: (socialConfig.title_template as string) || undefined,
      highlightWord: (socialConfig.highlight_word as string) || undefined,
      testimonialsSubtitle: (socialConfig.testimonials_subtitle as string) || undefined,
      studentCount: stats.student_count || 0,
      institutionCount: stats.institution_count || institutions.length,
      yearsInMarket: stats.years_in_market || 5,
      institutions,
      mediaLogos: (socialConfig.media_logos as { name: string; logo: string; url?: string }[]) || [],
    };
  }

  // Extraer datos de how_it_works (null si el componente no existe)
  let howItWorksData: HowItWorksData | null = null;
  if (howItWorksComponent) {
    const howConfig = (howItWorksComponent.content_config || {}) as Record<string, unknown>;

    // Extraer título y subtítulo del componente
    const howTitle = howItWorksComponent.component_name || undefined;
    const howSubtitle = howItWorksComponent.component_subtitle || undefined;

    // Extraer títulos de columnas desde content_config
    const stepsTitle = (howConfig.steps_title as string) || undefined;
    const requirementsTitle = (howConfig.requirements_title as string) || undefined;

    howItWorksData = {
      title: howTitle,
      subtitle: howSubtitle,
      stepsTitle,
      requirementsTitle,
      steps: ((howConfig.steps as { id: number; title: string; description: string; icon: string; color?: string }[]) || []).map((step, index) => ({
        id: step.id || index + 1,
        title: step.title || '',
        description: step.description || '',
        icon: step.icon || 'Search',
        color: step.color,
      })),
      requirements: ((howConfig.requirements as { id: number; text: string; icon?: string }[]) || []).map((req, index) => ({
        id: req.id || index + 1,
        text: req.text || '',
        icon: req.icon,
      })),
      availableTerms: (howConfig.available_terms as number[]) || [6, 12, 18, 24],
    };
  }

  // Extraer datos de FAQ (null si el componente no existe)
  let faqData: FaqData | null = null;
  if (faqComponent) {
    // Usar FAQs desde API (tabla landing_faq) si existen
    const apiFaqs = data.faqs || [];

    // Extraer título y subtítulo del componente
    const faqTitle = faqComponent.component_name || undefined;
    const faqSubtitle = faqComponent.component_subtitle || undefined;

    // Extraer iconos y colores de categoría desde content_config
    const faqContentConfig = (faqComponent.content_config || {}) as Record<string, unknown>;
    const categoryIcons = faqContentConfig.category_icons as Record<string, string> | undefined;
    const categoryColors = faqContentConfig.category_colors as Record<string, string> | undefined;

    if (apiFaqs.length > 0) {
      // Obtener categorías únicas
      const categories = [...new Set(apiFaqs.map(f => f.category).filter(Boolean))] as string[];

      faqData = {
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
      };
    } else {
      // Fallback a datos por defecto si no hay FAQs en BD
      faqData = {
        title: faqTitle,
        subtitle: faqSubtitle,
        items: [
          { id: '1', question: '¿Necesito historial crediticio?', answer: 'No, no necesitas historial crediticio. Evaluamos tu perfil de estudiante.', category: 'Requisitos' },
          { id: '2', question: '¿Cuánto tiempo demora la aprobación?', answer: 'La aprobación es en 24 horas hábiles.', category: 'Proceso' },
          { id: '3', question: '¿Cuáles son las formas de pago?', answer: 'Puedes pagar por transferencia, Yape, Plin o en agentes.', category: 'Pagos' },
        ],
        categories: ['Requisitos', 'Proceso', 'Pagos'],
        categoryIcons,
        categoryColors,
      };
    }
  }

  // Extraer testimonios
  const testimonialsConfig = (testimonialsComponent?.content_config || {}) as Record<string, unknown>;
  const testimonials: Testimonial[] = ((testimonialsConfig.testimonials as Testimonial[]) || []).map((t, index) => ({
    id: t.id || String(index + 1),
    name: t.name || '',
    institution: t.institution || '',
    quote: t.quote || '',
    avatar: t.avatar,
    rating: t.rating ?? 5,
  }));

  // Extraer título de testimonios desde el componente
  const testimonialsTitle = testimonialsComponent?.component_name || undefined;

  // Extraer datos de CTA (null si el componente no existe)
  let ctaData: CtaData | null = null;
  if (ctaComponent) {
    const ctaConfig = (ctaComponent.content_config || {}) as Record<string, unknown>;
    const buttons = (ctaConfig.buttons || {}) as Record<string, { text?: string; text_line2?: string; url?: string }>;

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
    };
  }

  // Extraer datos de Promo Banner (null si el componente no existe)
  let promoBannerData: PromoBannerData | null = null;
  if (promoBannerComponent) {
    const promoConfig = (promoBannerComponent.content_config || {}) as Record<string, unknown>;

    promoBannerData = {
      text: (promoConfig.text as string) || '',
      highlight: (promoConfig.highlight as string) || undefined,
      ctaText: (promoConfig.cta_text as string) || undefined,
      ctaUrl: (promoConfig.cta_url as string) || undefined,
      icon: (promoConfig.icon as string) || undefined,
      dismissible: (promoConfig.dismissible as boolean) ?? true,
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

    footerData = {
      tagline: (footerConfig.tagline as string) || undefined,
      columns: (footerConfig.columns as { title: string; links: { label: string; href: string }[] }[]) || undefined,
      newsletter: (footerConfig.newsletter as { title: string; description: string; placeholder: string; button_text: string }) || undefined,
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
  };
}

/**
 * Hook helper para obtener datos del hero
 * Combina la llamada a la API y la transformación de datos
 */
export async function fetchHeroData(slug: string): Promise<{
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
} | null> {
  const data = await getLandingHeroData(slug);

  if (!data) {
    return null;
  }

  return transformLandingData(data);
}
