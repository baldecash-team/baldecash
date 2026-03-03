# Próximamente v0.6 - Documentación Técnica

## Descripción

Página genérica para secciones en desarrollo. Muestra un mensaje amigable con el navbar/footer de la landing actual.

---

## Estructura de Archivos

```
[landing]/proximamente/
├── page.tsx              # Server component wrapper
└── ProximamenteClient.tsx # Client component principal
```

---

## Componente Principal

### ProximamenteClient

**Archivo:** `[landing]/proximamente/ProximamenteClient.tsx`

```typescript
function ProximamenteContent() {
  const searchParams = useSearchParams();
  const seccion = searchParams.get('seccion') || '';
  const { navbarProps, footerData, isLoading, hasError, landing } = useLayout();

  const contenido = seccionTitulos[seccion] || defaultContent;

  // Show 404 if landing not found
  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar {...navbarProps} />
      <main className="flex-1 pt-40 pb-24 flex items-center justify-center">
        {/* Content */}
      </main>
      <Footer data={footerData} />
    </div>
  );
}
```

---

## Secciones Disponibles

### Mapeo de Secciones

```typescript
const seccionTitulos: Record<string, { titulo: string; descripcion: string }> = {
  accesorios: {
    titulo: 'Accesorios',
    descripcion: 'Próximamente podrás encontrar accesorios para complementar tu equipo.',
  },
  seguros: {
    titulo: 'Seguros',
    descripcion: 'Estamos preparando opciones de seguros para proteger tu inversión.',
  },
  promos: {
    titulo: 'Promociones',
    descripcion: 'Próximamente encontrarás ofertas y promociones exclusivas.',
  },
  nosotros: {
    titulo: 'Sobre nosotros',
    descripcion: 'Estamos preparando información sobre nuestra historia y misión.',
  },
  convenios: {
    titulo: 'Convenios',
    descripcion: 'Próximamente podrás ver todos nuestros convenios con instituciones educativas.',
  },
  empleo: {
    titulo: 'Trabaja con nosotros',
    descripcion: 'Estamos preparando nuestra bolsa de trabajo. ¡Pronto podrás postular!',
  },
  blog: {
    titulo: 'Blog',
    descripcion: 'Próximamente publicaremos artículos sobre tecnología y educación.',
  },
  ayuda: {
    titulo: 'Centro de ayuda',
    descripcion: 'Estamos preparando recursos y guías para ayudarte.',
  },
  faq: {
    titulo: 'Preguntas frecuentes',
    descripcion: 'Próximamente encontrarás respuestas a las preguntas más comunes.',
  },
  estado: {
    titulo: 'Estado de solicitud',
    descripcion: 'Próximamente podrás consultar el estado de tu solicitud aquí.',
  },
  contacto: {
    titulo: 'Contacto',
    descripcion: 'Estamos preparando más formas de contactarnos.',
  },
  sbs: {
    titulo: 'Regulación SBS',
    descripcion: 'Próximamente encontrarás información sobre nuestra regulación.',
  },
};

const defaultContent = {
  titulo: 'Esta sección',
  descripcion: 'Estamos trabajando en este contenido.',
};
```

### Tabla de Secciones

| Sección | Título | Uso típico |
|---------|--------|------------|
| `accesorios` | Accesorios | Links del megamenu |
| `seguros` | Seguros | Links del footer |
| `promos` | Promociones | Promo banner |
| `nosotros` | Sobre nosotros | Footer "Empresa" |
| `convenios` | Convenios | Navbar section |
| `empleo` | Trabaja con nosotros | Footer |
| `blog` | Blog | Footer |
| `ayuda` | Centro de ayuda | Footer |
| `faq` | Preguntas frecuentes | Navbar |
| `estado` | Estado de solicitud | Portal clientes |
| `contacto` | Contacto | Footer |
| `sbs` | Regulación SBS | Footer legal |

---

## Uso

### URLs de Ejemplo

```
/prototipos/0.6/home/proximamente
/prototipos/0.6/home/proximamente?seccion=accesorios
/prototipos/0.6/home/proximamente?seccion=seguros
/prototipos/0.6/laptops-estudiantes/proximamente?seccion=blog
```

### Parámetros URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `seccion` | string | Código de la sección (ver tabla arriba) |

---

## Layout

### Estructura Visual

```
┌─────────────────────────────────────────┐
│              Navbar (landing)            │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────┐             │
│         │  🏗️ Ícono      │             │
│         └─────────────────┘             │
│                                         │
│      "Estamos trabajando en esto"       │
│                                         │
│         ┌─────────────────┐             │
│         │   {sección}     │  (badge)    │
│         └─────────────────┘             │
│                                         │
│         {descripción}                   │
│                                         │
│         [← Volver al inicio]            │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 🔔 ¿Tienes alguna consulta?     │   │
│   │    prestamos@baldecash.com      │   │
│   └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│              Footer (landing)            │
└─────────────────────────────────────────┘
```

### Características

- Usa `useLayout()` para obtener navbar y footer de la landing actual
- Ícono de construcción (Construction de lucide-react)
- Badge con el nombre de la sección
- Descripción personalizada por sección
- Botón "Volver al inicio" que lleva a la landing
- Card de contacto con email de soporte
- Colores dinámicos via CSS variables

---

## generateStaticParams

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

## Cómo Extender

### Agregar Nueva Sección

1. **Agregar al mapeo** (`ProximamenteClient.tsx`):
```typescript
const seccionTitulos = {
  // ... existing
  nueva_seccion: {
    titulo: 'Nueva Sección',
    descripcion: 'Descripción de lo que vendrá en esta sección.',
  },
};
```

2. **Usar vía URL:**
```
/prototipos/0.6/home/proximamente?seccion=nueva_seccion
```

3. **Agregar link en el lugar apropiado** (navbar, footer, megamenu, etc.)

### Personalizar Ícono por Sección

Si se necesita un ícono diferente por sección:

```typescript
const seccionIconos: Record<string, React.ElementType> = {
  accesorios: Package,
  seguros: Shield,
  blog: FileText,
  // ...
};

const Icono = seccionIconos[seccion] || Construction;
```

### Convertir a Página Real

Cuando la sección esté lista:

1. Crear la página real en `[landing]/nueva-seccion/`
2. Actualizar links que apuntaban a `/proximamente?seccion=nueva_seccion`
3. Remover la sección del mapeo de `seccionTitulos`
