# Página Próximamente - BaldeCash v0.6

## Descripción

Página genérica para secciones que están en desarrollo. Muestra un mensaje de "Estamos trabajando en esto" con información específica según la sección solicitada.

## Ubicación

```
src/app/prototipos/0.6/[landing]/proximamente/
├── page.tsx              # Server component wrapper
└── ProximamenteClient.tsx # Client component principal
```

## URL

```
/prototipos/0.6/{landing}/proximamente/?seccion={seccion}
```

**Ejemplos:**
- `/prototipos/0.6/home/proximamente/?seccion=nosotros`
- `/prototipos/0.6/home/proximamente/?seccion=blog`
- `/prototipos/0.6/laptops-estudiantes/proximamente/?seccion=convenios`

## Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `landing` | path | Sí | Slug del landing (ej: `home`, `laptops-estudiantes`) |
| `seccion` | query | No | Identificador de la sección (ej: `nosotros`, `blog`) |

## Fuente de datos

### Desde API (vía `useLayout()`)
- Navbar (logo, menú, promo banner)
- Footer
- Landing slug

### Hardcodeado en frontend
- Títulos y descripciones de secciones
- Icono (Construction)
- Textos fijos
- Email de contacto

## Secciones soportadas

| seccion | titulo | descripcion |
|---------|--------|-------------|
| `accesorios` | Accesorios | Próximamente podrás encontrar accesorios para complementar tu equipo. |
| `seguros` | Seguros | Estamos preparando opciones de seguros para proteger tu inversión. |
| `promos` | Promociones | Próximamente encontrarás ofertas y promociones exclusivas. |
| `nosotros` | Sobre nosotros | Estamos preparando información sobre nuestra historia y misión. |
| `convenios` | Convenios | Próximamente podrás ver todos nuestros convenios con instituciones educativas. |
| `empleo` | Trabaja con nosotros | Estamos preparando nuestra bolsa de trabajo. ¡Pronto podrás postular! |
| `blog` | Blog | Próximamente publicaremos artículos sobre tecnología y educación. |
| `ayuda` | Centro de ayuda | Estamos preparando recursos y guías para ayudarte. |
| `faq` | Preguntas frecuentes | Próximamente encontrarás respuestas a las preguntas más comunes. |
| `estado` | Estado de solicitud | Próximamente podrás consultar el estado de tu solicitud aquí. |
| `contacto` | Contacto | Estamos preparando más formas de contactarnos. |
| `sbs` | Regulación SBS | Próximamente encontrarás información sobre nuestra regulación. |

### Sección por defecto

Si `seccion` no existe en el mapeo o no se proporciona:

```typescript
const defaultContent = {
  titulo: 'Esta sección',
  descripcion: 'Estamos trabajando en este contenido.',
};
```

## Estructura visual

```
┌─────────────────────────────────────────┐
│              NAVBAR                      │
├─────────────────────────────────────────┤
│                                         │
│          [Icono Construction]           │
│                                         │
│     "Estamos trabajando en esto"        │
│                                         │
│         ┌───────────────────┐           │
│         │  {titulo seccion} │  ← Badge  │
│         └───────────────────┘           │
│                                         │
│        {descripcion seccion}            │
│                                         │
│       [← Volver al inicio]              │
│                                         │
│   ┌─────────────────────────────┐       │
│   │ 🔔 ¿Tienes alguna consulta? │       │
│   │    prestamos@baldecash.com  │       │
│   └─────────────────────────────┘       │
│                                         │
├─────────────────────────────────────────┤
│              FOOTER                      │
└─────────────────────────────────────────┘
```

## Componentes utilizados

| Componente | Fuente | Uso |
|------------|--------|-----|
| `Navbar` | `components/hero/Navbar` | Navegación principal |
| `Footer` | `components/hero/Footer` | Pie de página |
| `Button` | `@nextui-org/react` | Botón "Volver al inicio" |
| `Construction` | `lucide-react` | Icono principal |
| `ArrowLeft` | `lucide-react` | Icono del botón |
| `Bell` | `lucide-react` | Icono de la card de contacto |
| `CubeGridSpinner` | `_shared` | Loading state |

## Estilos

### Colores
- **Primario:** `#4654CD` (azul BaldeCash)
- **Fondo badge:** `#4654CD/10`
- **Fondo card contacto:** `amber-100`
- **Fondo página:** `neutral-50`

### Tipografía
- **Título principal:** `font-['Baloo_2']`, `text-2xl sm:text-3xl`, `font-bold`
- **Badge:** `text-sm`, `font-medium`
- **Descripción:** `text-neutral-500`

## Código clave

### Mapeo de secciones (ProximamenteClient.tsx:19-68)

```typescript
const seccionTitulos: Record<string, { titulo: string; descripcion: string }> = {
  nosotros: {
    titulo: 'Sobre nosotros',
    descripcion: 'Estamos preparando información sobre nuestra historia y misión.',
  },
  // ... más secciones
};
```

### Obtención del contenido (ProximamenteClient.tsx:85-88)

```typescript
const searchParams = useSearchParams();
const seccion = searchParams.get('seccion') || '';
const contenido = seccionTitulos[seccion] || defaultContent;
```

### Badge de sección (ProximamenteClient.tsx:123-125)

```typescript
<div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4654CD]/10 rounded-full mb-4">
  <span className="text-sm font-medium text-[#4654CD]">{contenido.titulo}</span>
</div>
```

## Landings pre-generadas (Static Export)

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

## Decisiones de diseño

1. **Contenido hardcodeado:** Los títulos y descripciones están en el frontend para simplicidad. No requiere cambios frecuentes.

2. **Reutilización de layout:** Usa `useLayout()` para obtener navbar y footer del landing, manteniendo consistencia visual.

3. **Sección genérica:** Un solo componente maneja todas las secciones "próximamente" mediante query params.

4. **Email de contacto:** Se muestra `prestamos@baldecash.com` como alternativa mientras la sección no está disponible.

## Mejoras futuras (opcionales)

- [ ] Mover configuración de secciones a base de datos
- [ ] Agregar fecha estimada de disponibilidad
- [ ] Permitir suscripción para notificación cuando esté lista
- [ ] Agregar iconos personalizados por sección

---

**Última actualización:** 2026-02-22
