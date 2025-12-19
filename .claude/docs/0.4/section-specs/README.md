# BaldeCash Web 4.0 - Especificaciones por Seccion

Documentacion de las 285 decisiones UX/UI organizadas en 16 prompts con **10 versiones por componente**.

## Diferencias con Version 0.3

| Aspecto | 0.3 | 0.4 |
|---------|-----|-----|
| Versiones por componente | 3 | **10** |
| Nivel de detalle | Conceptual | **Replicable al 90%** |
| Objetivo | Explorar opciones | **Seleccionar version final** |

---

## Filosofia de las 10 Versiones

Cada componente iterable sigue esta progresion tematica para explorar el espacio de diseno completo:

### Categoria Visual (V1-V4)

| Version | Nombre | Elementos Clave | Referencia |
|---------|--------|-----------------|------------|
| **V1** | Foto Producto | Laptop sobre fondo blanco/neutro, iluminacion de estudio, sin contexto | Amazon, Best Buy |
| **V2** | Foto Lifestyle | Estudiante usando laptop en biblioteca/cafe, luz natural, ambiente aspiracional | Apple, Samsung |
| **V3** | Ilustracion Flat | Personajes vectoriales estilizados, paleta limitada, lineas limpias, estilo corporativo moderno | Notion, Stripe, Linear |
| **V4** | Abstracto Flotante | Shapes geometricos (circulos, blobs), elementos 3D sutiles, precio en badge flotante, sombras difusas, micro-animaciones | Nubank, Revolut |

### Categoria Layout (V5-V7)

| Version | Nombre | Elementos Clave | Referencia |
|---------|--------|-----------------|------------|
| **V5** | Split 50/50 | Pantalla dividida verticalmente, texto izquierda + visual derecha, alineacion clara | Webflow, Framer |
| **V6** | Centrado Hero | Titulo grande centrado, subtitulo debajo, CTA prominente, visual arriba o como fondo | Spotify, Netflix |
| **V7** | Asimetrico Bold | Tipografia oversized, elementos que se salen del grid, overlapping intencional, espacios negativos | Airbnb, Figma |

### Categoria Contenido (V8-V9)

| Version | Nombre | Elementos Clave | Referencia |
|---------|--------|-----------------|------------|
| **V8** | Data-Driven | Numeros grandes (S/49/mes), contadores animados, badges de confianza, estadisticas prominentes | Fintech apps, Dashboards |
| **V9** | Storytelling | Testimonios integrados, timeline del journey, copy emocional, micro-narrativas | Duolingo, Headspace |

### Categoria Interaccion (V10)

| Version | Nombre | Elementos Clave | Referencia |
|---------|--------|-----------------|------------|
| **V10** | Interactivo | Calculadora de cuotas inline, sliders de monto, tabs animados, reveal on scroll | Stripe Pricing, Kayak |

---

## Como Usar

Cuando se genere una seccion, leer el PROMPT correspondiente y:
- `[T]` = Generar **10 versiones** (V1-V10)
- `[F]` = Generar 1 version unica

## Indice de Secciones

### MVP Core (Prioridad Alta)

| # | Archivo | Seccion | Iteraciones |
|---|---------|---------|-------------|
| 1 | `PROMPT_01_HERO_LANDING.md` | Hero / Landing | 10 |
| 2 | `PROMPT_02_CATALOGO_LAYOUT_FILTROS.md` | Catalogo - Layout y Filtros | 10 |
| 3 | `PROMPT_03_CATALOGO_CARDS.md` | Catalogo - Product Cards | 10 |
| 4 | `PROMPT_04_DETALLE_PRODUCTO.md` | Detalle de Producto | 10 |
| 8 | `PROMPT_08_FORM_ESTRUCTURA.md` | Wizard - Estructura | 10 |
| 9 | `PROMPT_09_FORM_CAMPOS.md` | Wizard - Componentes | - |
| 10 | `PROMPT_10_FORM_DATOS_PERSONALES.md` | Wizard - Datos Personales | - |
| 11 | `PROMPT_11_FORM_DATOS_ACADEMICOS.md` | Wizard - Datos Academicos | - |
| 12 | `PROMPT_12_FORM_DATOS_ECONOMICOS.md` | Wizard - Datos Economicos | - |
| 13 | `PROMPT_13_FORM_RESUMEN.md` | Wizard - Resumen | - |
| 15 | `PROMPT_15_APROBACION.md` | Pantalla Aprobacion | 10 |
| 16 | `PROMPT_16_RECHAZO.md` | Pantalla Rechazo | 10 |

### Features Secundarios

| # | Archivo | Seccion | Iteraciones |
|---|---------|---------|-------------|
| 5 | `PROMPT_05_COMPARADOR.md` | Comparador | 10 |
| 6 | `PROMPT_06_QUIZ_AYUDA.md` | Quiz "No te decides?" | 10 |
| 7 | `PROMPT_07_ESTADO_VACIO.md` | Estado Vacio | 10 |
| 14 | `PROMPT_14_UPSELL.md` | Upsell - Accesorios y Seguros | 10 |

---

## Guia de Trabajo

Ver `GUIA_TRABAJO_CLAUDE_TERMINAL.md` para:
- Workflow paso a paso
- Comandos de Claude Terminal
- Checklist de calidad
- Estructura de carpetas esperada

## Skills Relacionados

Antes de generar cualquier seccion, invocar:
- `brandbook` -> Colores (#4654CD), tipografia (Baloo 2, Asap), restricciones
- `frontend` -> Stack (Next.js, NextUI), patrones, decisiones UX

---

## Estructura de Archivos por Seccion (10 versiones)

```
src/app/prototipos/0.4/[seccion]/
├── page.tsx                    # Redirect a preview
├── [seccion]-preview/
│   └── page.tsx                # Preview con Settings Modal (10 opciones)
├── [seccion]-v1/
│   └── page.tsx                # V1: Foto Producto
├── [seccion]-v2/
│   └── page.tsx                # V2: Foto Lifestyle
├── [seccion]-v3/
│   └── page.tsx                # V3: Ilustracion Flat
├── [seccion]-v4/
│   └── page.tsx                # V4: Abstracto Flotante
├── [seccion]-v5/
│   └── page.tsx                # V5: Split 50/50
├── [seccion]-v6/
│   └── page.tsx                # V6: Centrado Hero
├── [seccion]-v7/
│   └── page.tsx                # V7: Asimetrico Bold
├── [seccion]-v8/
│   └── page.tsx                # V8: Data-Driven
├── [seccion]-v9/
│   └── page.tsx                # V9: Storytelling
├── [seccion]-v10/
│   └── page.tsx                # V10: Interactivo
├── components/
│   └── [seccion]/
│       ├── [Seccion]SettingsModal.tsx
│       └── [componente]/
│           ├── [Componente]V1.tsx
│           ├── [Componente]V2.tsx
│           ├── ...
│           └── [Componente]V10.tsx
├── types/
│   └── [seccion].ts
└── data/
    └── mock[Seccion]Data.ts
```

---

## Proceso de Seleccion

1. **Generar** las 10 versiones de cada componente iterable
2. **Revisar** en el preview con el modal de configuracion
3. **Seleccionar** la version ganadora por componente
4. **Documentar** la version elegida en `DECISIONES_0.4.md`
5. **Refinar** la version elegida sera la base para 0.5
