# BaldeCash Hero Section 2.0 - Prototipo 0.2

Componentes de la Hero Section con múltiples variantes visuales para testing y comparación.

## 📋 Resumen

Este prototipo implementa la Hero Section de BaldeCash con diferentes versiones de componentes clave, permitiendo comparar y evaluar diferentes enfoques de diseño UX/UI.

## 🎯 Objetivos

- Reducir la tasa de rechazo del 81%
- Mejorar la conversión de estudiantes universitarios
- Diseño mobile-first optimizado para conexiones lentas
- Tono juvenil y cercano (no corporativo/bancario)

## 📦 Componentes Generados

### Componentes Únicos (1 versión)
- ✅ **BrandIdentity** - Logo + tagline de BaldeCash
- ✅ **Navigation** - Navbar responsivo con menú hamburguesa

### Componentes con 3 Variantes

#### ProfileIdentification
- **V1 - Modal**: Modal centrado, interrumpe el flujo
- **V2 - Inline**: Cards integradas en el hero
- **V3 - Floating**: Banner sticky en la parte superior

#### InstitutionalBanner
- **V1 - Full Banner**: Banner horizontal completo
- **V2 - Badge**: Chip flotante en esquina
- **V3 - Integrated**: Sección dedicada dentro del hero

#### SocialProof
- **V1 - Carousel**: Logos en movimiento continuo
- **V2 - Grid**: Grid compacto con todos los logos visibles
- **V3 - Featured**: Contador + logos destacados

#### HeroCTA
- **V1 - Action Focus**: "Ver laptops disponibles" + "Conocer requisitos"
- **V2 - Price Focus**: "Laptops desde S/49/mes" + "¿Cómo funciona?"
- **V3 - Capability Focus**: "Conoce tu capacidad de crédito" + "Explorar catálogo"

## 🚀 Uso

### Ver el Prototipo

```bash
npm run dev
```

Navega a: `http://localhost:3000/prototipos/0.2`

### Comparar Versiones

La página de preview incluye controles para alternar entre las diferentes versiones de cada componente en tiempo real.

### Importar Componentes

```typescript
import { HeroSection } from "@/app/prototipos/0.2/components/landing/hero";

// Ejemplo de uso
<HeroSection
  profileIdentificationVersion={1}
  institutionalBannerVersion={2}
  socialProofVersion={3}
  ctaVersion={1}
  institution={{
    name: "UPN",
    logo: "/logos/upn.png",
    hasSpecialConditions: true,
  }}
  socialProof={{
    studentCount: 5247,
    institutions: [...],
  }}
/>
```

## 🎨 Guía de Marca

### Colores
- **Brand Blue**: `#4654CD` - CTAs, headers, énfasis
- **Brand Aqua**: `#03DBD0` - Acentos, highlights, éxito
- **Neutrals**: `#FAFAFA`, `#F5F5F5`, `#E5E5E5`, `#737373`, `#262626`

### Tipografías
- **Headings**: 'Baloo 2', cursive
- **Body**: 'Asap', sans-serif

### Tono
- Juvenil y cercano (NO formal/bancario)
- Empático y motivador
- Directo y sin tecnicismos

## 📱 Mobile-First

- Diseño optimizado para móvil (375px)
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Touch targets mínimo 44x44px
- Sin hover-only interactions

## ♿ Accesibilidad

- Contraste mínimo WCAG AA (4.5:1)
- Focus states visibles
- Aria labels en elementos interactivos
- Navegación por teclado

## 📊 Próximos Pasos

1. **Testing A/B**: Implementar tracking para comparar conversión entre versiones
2. **User Testing**: Validar con usuarios reales de las instituciones aliadas
3. **Optimización**: Ajustar según métricas de conversión
4. **Implementación**: Integrar la versión ganadora en producción

## 🔧 Stack Técnico

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: NextUI (HeroUI)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📄 Archivos Generados

```
src/app/prototipos/0.2/
├── page.tsx                                    # Preview/Comparison page
├── components/
│   └── landing/
│       └── hero/
│           ├── types.ts                        # Shared TypeScript types
│           ├── index.ts                        # Barrel exports
│           ├── HeroSection.tsx                 # Main integrator
│           ├── BrandIdentity.tsx               # Logo + tagline
│           ├── Navigation.tsx                  # Navbar
│           ├── ProfileIdentificationV1.tsx     # Modal version
│           ├── ProfileIdentificationV2.tsx     # Inline version
│           ├── ProfileIdentificationV3.tsx     # Floating version
│           ├── InstitutionalBannerV1.tsx       # Full banner
│           ├── InstitutionalBannerV2.tsx       # Badge/Chip
│           ├── InstitutionalBannerV3.tsx       # Integrated
│           ├── SocialProofV1.tsx               # Carousel
│           ├── SocialProofV2.tsx               # Grid
│           ├── SocialProofV3.tsx               # Counter + featured
│           ├── HeroCTAV1.tsx                   # Action focus
│           ├── HeroCTAV2.tsx                   # Price focus
│           └── HeroCTAV3.tsx                   # Capability focus
└── README.md
```

## 📝 Notas

- Todos los componentes usan placeholders para datos (logos, imágenes, etc.)
- Los logos de instituciones deben ser provistos en `/public/logos/`
- El código es production-ready y sigue las convenciones de Next.js 14+
- Las animaciones están optimizadas para performance

## 🙋 Feedback

Para reportar issues o sugerencias, contactar al equipo de desarrollo de BaldeCash.

---

**Versión**: 0.2
**Fecha**: 2025-12-15
**Autor**: Claude Code (Anthropic)
