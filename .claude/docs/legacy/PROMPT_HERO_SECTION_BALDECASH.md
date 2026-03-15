# Prompt: Hero Section - BaldeCash Web 2.0

## Contexto del Proyecto

### Descripción General
BaldeCash es una fintech peruana que proporciona financiamiento de laptops y equipos electrónicos específicamente para estudiantes universitarios que no tienen acceso a sistemas bancarios tradicionales. La empresa tiene convenios con 32 instituciones educativas y enfrenta una tasa de rechazo del 81%, por lo que la experiencia de usuario debe ser empática y optimizada para conversión.

### Público Objetivo
- Estudiantes universitarios peruanos (18-28 años)
- Sin historial crediticio bancario
- Usuarios móviles principalmente (mobile-first)
- Conectividad variable (optimizar para bajo ancho de banda)

### Repositorio
- **URL**: https://github.com/baldecash-team/baldecash
- **Stack**: Next.js 14+ con App Router, TypeScript
- **UI Library**: HeroUI (NextUI)
- **Estilos**: Tailwind CSS

---

## Guía de Marca

### Colores Principales
```css
/* Primarios */
--brand-blue: #4654CD;      /* Azul principal - CTAs, headers, énfasis */
--brand-aqua: #03DBD0;      /* Aqua/Turquesa - Acentos, highlights, éxito */

/* Derivados sugeridos */
--brand-blue-light: #6B77D8;
--brand-blue-dark: #3544A8;
--brand-aqua-light: #4DE8E0;
--brand-aqua-dark: #02B8AF;

/* Neutros */
--neutral-50: #FAFAFA;
--neutral-100: #F5F5F5;
--neutral-200: #E5E5E5;
--neutral-500: #737373;
--neutral-800: #262626;
--neutral-900: #171717;
```

### Tipografías
```css
/* Títulos y headings */
font-family: 'Baloo 2', cursive;

/* Cuerpo de texto y UI */
font-family: 'Asap', sans-serif;
```

### Tono de Comunicación
- **Juvenil y cercano** (NO formal/bancario)
- Empático y motivador
- Directo y sin tecnicismos financieros
- Genera confianza sin ser corporativo

---

## Estructura de Componentes a Generar

Debes generar componentes para la **Hero Section** de la landing page, organizada en los siguientes sub-grupos:

```
src/
├── components/
│   └── landing/
│       └── hero/
│           ├── HeroSection.tsx          # Componente principal que integra todo
│           ├── BrandIdentity.tsx         # Logo + tagline
│           ├── ProfileIdentification.tsx # Pregunta "¿Eres estudiante?"
│           ├── InstitutionalBanner.tsx   # Banner personalizado por institución
│           ├── SocialProof.tsx           # Logos, contador, reviews
│           ├── Navigation.tsx            # Navbar/menú principal
│           └── HeroCTA.tsx               # Botones de acción principales
```

---

## Especificaciones por Sub-Grupo

### 1. Identidad de Marca (`BrandIdentity.tsx`)
**Estado: ✅ DEFINIDO - Generar 1 versión final**

| Aspecto | Decisión |
|---------|----------|
| Emoción a transmitir | Confianza y curiosidad en los primeros 3 segundos |
| Estilo visual | Juvenil y cercano (NO banco/fintech formal) |
| Video introductorio | NO incluir en esta fase |
| Tagline | Sí, usar: **"Financiamiento para estudiantes"** |

**Requerimientos del componente:**
- Logo de BaldeCash prominente
- Tagline "Financiamiento para estudiantes" visible junto al logo
- Diseño que transmita juventud, accesibilidad y confianza
- Usar tipografía Baloo 2 para el tagline

---

### 2. Identificación de Perfil (`ProfileIdentification.tsx`)
**Estado: 🔄 REQUIERE 3 VERSIONES**

| Aspecto | Decisión |
|---------|----------|
| Pregunta inicial | Sí, incluir "¿Eres estudiante?" |
| Propósito | Que el usuario se sienta identificado y active un CTA visible |
| Contexto UX | Filtrar usuarios no elegibles temprano ahorra tiempo a todos |

**Generar 3 versiones visuales diferentes:**

**Versión A - Modal/Overlay:**
- Pregunta como modal centrado al cargar la página
- Opciones claras: "Sí, soy estudiante" / "No, solo estoy explorando"
- Animación sutil de entrada

**Versión B - Inline destacado:**
- Pregunta integrada en el hero como sección destacada
- Cards o botones grandes para seleccionar
- Sin interrumpir el flujo visual

**Versión C - Floating/Sticky:**
- Banner flotante o sticky en la parte superior
- Diseño minimalista que no obstruye
- Dismissible después de responder

---

### 3. Personalización Institucional (`InstitutionalBanner.tsx`)
**Estado: 🔄 REQUIERE 3 VERSIONES**

| Aspecto | Decisión |
|---------|----------|
| Logo de institución | Sí, mostrar prominentemente para generar pertenencia |
| Banner personalizado | Sí, mensaje de bienvenida por institución |
| Ejemplo | "Bienvenido estudiante UPN - Tienes condiciones especiales" |

**Props del componente:**
```typescript
interface InstitutionalBannerProps {
  institutionName: string;      // Ej: "UPN", "UPC", "USIL"
  institutionLogo?: string;     // URL del logo
  hasSpecialConditions: boolean;
  customMessage?: string;
}
```

**Generar 3 versiones visuales diferentes:**

**Versión A - Banner horizontal completo:**
- Ocupa todo el ancho arriba del hero
- Logo de institución + mensaje personalizado
- Colores que combinen con la institución

**Versión B - Badge/Chip flotante:**
- Elemento pequeño en esquina del hero
- Logo de institución como avatar
- Tooltip o expandible con detalles

**Versión C - Sección integrada en hero:**
- Área dedicada dentro del hero section
- Logo grande + mensaje de bienvenida
- Destaca las condiciones especiales con badge

---

### 4. Social Proof (`SocialProof.tsx`)
**Estado: 🔄 REQUIERE 3 VERSIONES (parcial)**

| Aspecto | Decisión |
|---------|----------|
| Elementos arriba del fold | Premios, logos de convenios y reviews |
| Logos de convenios | Mostrar (32 instituciones), formato por definir |
| Menciones regulatorias | "Regulado por SBS" en footer únicamente |
| Contador de estudiantes | Sí, incluir "X estudiantes ya financiados" |

**Generar 3 versiones para los logos de convenios:**

**Versión A - Carrusel automático:**
- Logos en movimiento horizontal continuo
- Muestra 5-6 logos a la vez
- Texto: "32 instituciones confían en nosotros"

**Versión B - Grid compacto:**
- Grid de logos pequeños (4x4 o similar)
- Todos visibles a la vez
- Hover para resaltar

**Versión C - Contador + logos destacados:**
- Número grande "32+" con texto
- Solo 4-5 logos de instituciones principales
- Link "Ver todas las instituciones"

**Contador de estudiantes (incluir en todas las versiones):**
- Número animado (counter animation)
- Texto: "estudiantes ya financiados"
- Icono de estudiantes/graduados

---

### 5. Navegación y Menú (`Navigation.tsx`)
**Estado: ✅ DEFINIDO - Generar 1 versión final**

| Aspecto | Decisión |
|---------|----------|
| Cantidad de opciones | Pocas, priorizar las más importantes |
| "Zona Estudiantes" | Sí es claro, mantener como portal post-venta |
| Botón de ingreso | Sí, "Zona Estudiantes" como CTA para login |

**Estructura del menú:**
```typescript
const menuItems = [
  { label: "Conócenos", href: "/conocenos" },
  { label: "Productos", href: "/productos" },
  { label: "Ofertas", href: "/ofertas" },
  { label: "FAQ", href: "/faq" },
];

// CTA separado
const loginCTA = {
  label: "Zona Estudiantes",
  href: "/zona-estudiantes",
  isButton: true
};
```

**Requerimientos:**
- Logo BaldeCash a la izquierda
- Menú items centrados o a la derecha
- "Zona Estudiantes" como botón destacado (CTA secundario)
- Responsive: hamburger menu en móvil
- Usar componentes HeroUI: `Navbar`, `NavbarBrand`, `NavbarContent`, `NavbarItem`

---

### 6. CTAs Principales (`HeroCTA.tsx`)
**Estado: 🔄 REQUIERE 3 VERSIONES**

| Aspecto | Decisión |
|---------|----------|
| Texto del CTA principal | Por definir - explorar opciones |
| Cantidad de CTAs | Primario + secundario |
| Incluir beneficio en CTA | Por definir - explorar opciones |

**Generar 3 versiones con diferentes combinaciones:**

**Versión A - Enfoque en acción directa:**
```jsx
<Button color="primary" size="lg">Ver laptops disponibles</Button>
<Button variant="bordered" size="lg">Conocer requisitos</Button>
```

**Versión B - Enfoque en beneficio/precio:**
```jsx
<Button color="primary" size="lg">Laptops desde S/49/mes</Button>
<Button variant="light" size="lg">¿Cómo funciona?</Button>
```

**Versión C - Enfoque en capacidad del usuario:**
```jsx
<Button color="primary" size="lg">Conoce tu capacidad de crédito</Button>
<Button variant="bordered" size="lg">Explorar catálogo</Button>
```

**Requerimientos para todas las versiones:**
- Botón primario con color brand-blue (#4654CD)
- Botón secundario complementario
- Tamaño grande (lg) para móvil
- Hover states con brand-aqua (#03DBD0)
- Iconos opcionales (flecha, laptop, calculadora)

---

## Reglas de Generación

### Para componentes con 🔄 REQUIERE 3 VERSIONES:

1. **Nombrar archivos con sufijo de versión:**
   ```
   ProfileIdentificationV1.tsx
   ProfileIdentificationV2.tsx
   ProfileIdentificationV3.tsx
   ```

2. **Cada versión debe ser visualmente distinta:**
   - Diferente layout/composición
   - Diferente uso del espacio
   - Diferente jerarquía visual
   - Misma funcionalidad, diferente presentación

3. **Documentar diferencias:**
   ```typescript
   /**
    * ProfileIdentification - Versión A (Modal/Overlay)
    * 
    * Características:
    * - Pregunta presentada como modal centrado
    * - Interrumpe el flujo para asegurar respuesta
    * - Ideal para: maximizar tasa de respuesta
    * - Trade-off: puede sentirse intrusivo
    */
   ```

4. **Crear componente wrapper para preview:**
   ```typescript
   // ProfileIdentificationPreview.tsx
   export const ProfileIdentificationPreview = () => (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       <div>
         <h3>Versión A - Modal</h3>
         <ProfileIdentificationV1 />
       </div>
       <div>
         <h3>Versión B - Inline</h3>
         <ProfileIdentificationV2 />
       </div>
       <div>
         <h3>Versión C - Floating</h3>
         <ProfileIdentificationV3 />
       </div>
     </div>
   );
   ```

### Para componentes con ✅ DEFINIDO:

1. **Generar una sola versión final**
2. **Implementar exactamente según las decisiones documentadas**
3. **Optimizar para producción**

---

## Criterios de Buenas Prácticas UX/UI

### Accesibilidad
- Contraste mínimo WCAG AA (4.5:1 para texto)
- Focus states visibles
- Aria labels en elementos interactivos
- Navegación por teclado

### Mobile-First
- Diseñar primero para móvil (375px)
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Touch targets mínimo 44x44px
- Evitar hover-only interactions

### Performance
- Lazy loading para imágenes
- Optimizar para conexiones lentas
- Skeleton loaders donde aplique
- Minimizar JavaScript en above-the-fold

### Conversión
- CTA principal visible sin scroll
- Reducir fricción cognitiva
- Jerarquía visual clara
- Mensajes que generan confianza

---

## Ejemplo de Uso de HeroUI

```typescript
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Link,
  Card,
  CardBody,
  Chip,
  Avatar,
} from "@heroui/react";

// Ejemplo de navbar
export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Logo />
          <p className="font-bold text-inherit">BaldeCash</p>
        </NavbarBrand>
      </NavbarContent>
      
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/conocenos">
            Conócenos
          </Link>
        </NavbarItem>
        {/* ... más items */}
      </NavbarContent>
      
      <NavbarContent justify="end">
        <NavbarItem>
          <Button 
            as={Link} 
            color="primary" 
            href="/zona-estudiantes" 
            variant="solid"
          >
            Zona Estudiantes
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
```

---

## Entregables Esperados

1. **Componentes individuales** (6 archivos base + versiones)
2. **HeroSection.tsx** que integre todos los componentes
3. **Página de preview** para comparar versiones lado a lado
4. **Types/interfaces** en archivo separado si es necesario
5. **Comentarios** explicando decisiones de diseño

---

## Comando de Ejecución Sugerido

```bash
# Generar todos los componentes del Hero Section
claude "Genera los componentes del Hero Section de BaldeCash siguiendo las especificaciones del archivo PROMPT_HERO_SECTION_BALDECASH.md. Empieza por los componentes definidos (sin versiones) y luego genera las 3 versiones para cada componente que lo requiera."
```

---

## Notas Adicionales

- **No hay datos de ejemplo** para esta primera versión. Usar placeholders apropiados.
- Los logos de instituciones y el contador deben ser dinámicos (props)
- Considerar estados: loading, error, empty para componentes que consuman data
- El código debe ser production-ready y seguir las convenciones del repositorio existente
