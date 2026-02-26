# Páginas Legales v0.6 - Documentación Técnica

## Descripción

Conjunto de páginas con contenido legal estático. Usan un layout compartido con navbar/footer dinámicos de la landing.

---

## Estructura de Archivos

```
[landing]/legal/
├── components/
│   ├── index.ts              # Barrel exports
│   └── LegalPageLayout.tsx   # Layout compartido
│
├── terminos-y-condiciones/
│   ├── page.tsx              # Server component
│   └── TerminosYCondicionesClient.tsx
│
├── politica-de-privacidad/
│   ├── page.tsx
│   └── PoliticaDePrivacidadClient.tsx
│
└── libro-reclamaciones/
    ├── page.tsx
    └── LibroReclamacionesClient.tsx
```

---

## LegalPageLayout

**Archivo:** `components/LegalPageLayout.tsx`

Layout compartido que maneja navbar, footer y estructura de contenido.

```typescript
interface LegalPageLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated?: string;
}

export function LegalPageLayout({ children, title, lastUpdated }: LegalPageLayoutProps) {
  const { navbarProps, footerData, isLoading, hasError, landing } = useLayout();

  useScrollToTop();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar
        promoBannerData={navbarProps.promoBannerData}
        logoUrl={navbarProps.logoUrl}
        customerPortalUrl={navbarProps.customerPortalUrl}
        navbarItems={navbarProps.navbarItems}
        megamenuItems={navbarProps.megamenuItems}
        activeSections={navbarProps.activeSections}
        landing={landing}
      />

      <main className="flex-1 pt-40 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-neutral-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-['Baloo_2'] mb-2">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-sm text-neutral-500">
                Última actualización: {lastUpdated}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-neutral max-w-none">
            {children}
          </div>
        </div>
      </main>

      <Footer data={footerData} landing={landing} />
    </div>
  );
}
```

### Características

- Usa `useLayout()` para datos de navbar/footer
- Header con título y fecha de actualización
- Contenido con estilo `prose` de Tailwind
- Ancho máximo de 4xl (896px)
- Padding top de 40 (160px) para el navbar fijo

---

## Páginas Legales

### Términos y Condiciones

**Ruta:** `/prototipos/0.6/{landing}/legal/terminos-y-condiciones`

**Contenido:**
- Descripción de Baldecash y servicios
- Compromiso y responsabilidad
- Capacidad legal para contratar
- Registro y participación
- Procedimiento de solicitud
- Consentimiento en contratos
- Validez de ofertas
- Política de reembolsos
- Derechos de autor
- Protección de datos personales
- Anexo: Procedimiento de solicitud

```typescript
export function TerminosYCondicionesClient() {
  return (
    <LegalPageLayout
      title="Términos y Condiciones"
      lastUpdated="Junio 2023"
    >
      <p className="text-neutral-600 mb-8">
        La empresa Baldecash es titular de la plataforma...
      </p>

      <Section title="PRIMERO: Respecto de Baldecash">
        <p>Baldecash ofrece dos servicios principales:</p>
        <ul>...</ul>
      </Section>

      {/* Más secciones */}
    </LegalPageLayout>
  );
}
```

### Política de Privacidad

**Ruta:** `/prototipos/0.6/{landing}/legal/politica-de-privacidad`

**Contenido:**
- Responsable del tratamiento
- Datos que se recopilan
- Finalidad del tratamiento
- Base legal
- Destinatarios de datos
- Transferencias internacionales
- Derechos del usuario (ARCO)
- Seguridad de datos
- Cookies
- Cambios en la política

### Libro de Reclamaciones

**Ruta:** `/prototipos/0.6/{landing}/legal/libro-reclamaciones`

**Contenido:**
- Información del formulario INDECOPI
- Campos requeridos
- Proceso de atención
- Plazos de respuesta
- Información de contacto

---

## Rutas

| Página | Ruta |
|--------|------|
| Términos y Condiciones | `/legal/terminos-y-condiciones` |
| Política de Privacidad | `/legal/politica-de-privacidad` |
| Libro de Reclamaciones | `/legal/libro-reclamaciones` |

### URLs Completas de Ejemplo

```
/prototipos/0.6/home/legal/terminos-y-condiciones
/prototipos/0.6/home/legal/politica-de-privacidad
/prototipos/0.6/home/legal/libro-reclamaciones
/prototipos/0.6/laptops-estudiantes/legal/terminos-y-condiciones
```

---

## generateStaticParams

Cada página legal genera rutas para todas las landings conocidas:

```typescript
export function generateStaticParams() {
  return [
    { landing: 'home' },
    { landing: 'laptops-estudiantes' },
    { landing: 'celulares-2026' },
    { landing: 'motos-lima' },
  ];
}
```

---

## Estilos

### Clase prose

Las páginas usan la clase `prose` de Tailwind para tipografía:

```css
.prose {
  /* Títulos */
  h1, h2, h3, h4 { font-weight: bold; color: neutral-900; }

  /* Párrafos */
  p { color: neutral-600; margin-bottom: 1rem; }

  /* Listas */
  ul { list-style-type: disc; padding-left: 1.5rem; }
  ol { list-style-type: decimal; padding-left: 1.5rem; }

  /* Links */
  a { color: var(--color-primary); }
  a:hover { text-decoration: underline; }
}
```

### Helper Component: Section

```typescript
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-neutral-900 mb-3 font-['Asap']">
        {title}
      </h3>
      <div className="text-neutral-600 space-y-3">
        {children}
      </div>
    </section>
  );
}
```

---

## Cómo Extender

### Agregar Nueva Página Legal

1. **Crear directorio:**
```
[landing]/legal/nueva-pagina/
├── page.tsx
└── NuevaPaginaClient.tsx
```

2. **page.tsx:**
```typescript
import { NuevaPaginaClient } from './NuevaPaginaClient';

export function generateStaticParams() {
  return [
    { landing: 'home' },
    { landing: 'laptops-estudiantes' },
    { landing: 'celulares-2026' },
    { landing: 'motos-lima' },
  ];
}

export default function NuevaPaginaPage() {
  return <NuevaPaginaClient />;
}
```

3. **NuevaPaginaClient.tsx:**
```typescript
'use client';

import { LegalPageLayout } from '../components';

export function NuevaPaginaClient() {
  return (
    <LegalPageLayout
      title="Título de la Página"
      lastUpdated="Febrero 2024"
    >
      <p>Contenido introductorio...</p>

      <Section title="Primera Sección">
        <p>Contenido de la sección...</p>
      </Section>

      <Section title="Segunda Sección">
        <p>Más contenido...</p>
      </Section>
    </LegalPageLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-neutral-900 mb-3 font-['Asap']">
        {title}
      </h3>
      <div className="text-neutral-600 space-y-3">
        {children}
      </div>
    </section>
  );
}
```

4. **Exportar en index.ts:**
```typescript
export { LegalPageLayout } from './LegalPageLayout';
```

5. **Agregar link en Footer** (si corresponde)

### Cargar Contenido desde API

Si se necesita contenido dinámico:

```typescript
export function NuevaPaginaClient() {
  const [content, setContent] = useState<LegalContent | null>(null);

  useEffect(() => {
    fetch('/api/legal/nueva-pagina')
      .then(res => res.json())
      .then(setContent);
  }, []);

  if (!content) return <LoadingFallback />;

  return (
    <LegalPageLayout title={content.title} lastUpdated={content.lastUpdated}>
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
    </LegalPageLayout>
  );
}
```
