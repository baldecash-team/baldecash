# BaldeCash Web 4.0 - Especificaciones por Seccion

Documentacion de las 285 decisiones UX/UI organizadas en 16 prompts con **6 versiones por componente**.

## Diferencias con Version 0.3

| Aspecto | 0.3 | 0.4 |
|---------|-----|-----|
| Versiones por componente | 3 | **6** |
| Nivel de detalle | Conceptual | **Replicable al 90%** |
| Objetivo | Explorar opciones | **Seleccionar version final** |

---

## Filosofia de las 6 Versiones

Cada componente iterable sigue esta progresion tematica para explorar el espacio de diseno completo:

### Categoria Visual (V1-V3)

| Version | Nombre | Elementos Clave | Referencia |
|---------|--------|-----------------|------------|
| **V1** | Foto Producto | Laptop sobre fondo blanco/neutro, iluminacion de estudio, sin contexto | Amazon, Best Buy |
| **V2** | Foto Lifestyle | Estudiante usando laptop en biblioteca/cafe, luz natural, ambiente aspiracional | Apple, Samsung |
| **V3** | Ilustracion Flat | Personajes vectoriales estilizados, paleta limitada, lineas limpias, estilo corporativo moderno | Notion, Stripe, Linear |

### Categoria Fintech (V4)

| Version | Nombre | Elementos Clave | Referencia |
|---------|--------|-----------------|------------|
| **V4** | Fintech/Data | Numeros grandes (S/49/mes), badges flotantes, shapes geometricos, sombras difusas, estadisticas prominentes | Nubank, Revolut |

### Categoria Layout (V5)

| Version | Nombre | Elementos Clave | Referencia |
|---------|--------|-----------------|------------|
| **V5** | Bold/Impact | Tipografia oversized, elementos asimetricos, overlapping intencional, espacios negativos, CTA prominente | Airbnb, Figma, Spotify |

### Categoria Interaccion (V6)

| Version | Nombre | Elementos Clave | Referencia |
|---------|--------|-----------------|------------|
| **V6** | Interactivo | Calculadora de cuotas inline, sliders de monto, tabs animados, reveal on scroll, micro-animaciones | Stripe Pricing, Kayak |

---

## Keyboard Shortcuts para Navegación Rápida

En las páginas de preview, usar estos atajos para cambiar versiones sin abrir el modal de configuración:

| Shortcut | Acción |
|----------|--------|
| `1` - `6` | Cambiar a versión específica (V1-V6) |
| `←` | Versión anterior |
| `→` | Versión siguiente |
| `Tab` | Siguiente subgrupo de componentes |
| `Shift+Tab` | Subgrupo anterior |
| `O` | Ocultar/mostrar overlays |
| `S` | Abrir modal de Settings |
| `Esc` | Cerrar modal |

### Overlays

Los overlays (badges de versión, FABs de configuración) pueden ocultarse para ver el diseño limpio:
- Presiona `O` para toggle rápido
- Usa el botón de ojo en los FABs

### URLs con Parámetros

Las versiones se sincronizan con la URL para compartir configuraciones:
```
/prototipos/0.4/hero/hero-preview?navbar=2&brand=3&footer=1
```

---

## Como Usar

Cuando se genere una seccion, leer el PROMPT correspondiente y:
- `[T]` = Generar **6 versiones** (V1-V6)
- `[F]` = Generar 1 version unica

## Indice de Secciones

### MVP Core (Prioridad Alta)

| # | Archivo | Seccion | Iteraciones |
|---|---------|---------|-------------|
| 1 | `PROMPT_01_HERO_LANDING.md` | Hero / Landing | 6 |
| 2 | `PROMPT_02_CATALOGO_LAYOUT_FILTROS.md` | Catalogo - Layout y Filtros | 6 |
| 3 | `PROMPT_03_CATALOGO_CARDS.md` | Catalogo - Product Cards | 6 |
| 4 | `PROMPT_04_DETALLE_PRODUCTO.md` | Detalle de Producto | 6 |
| 8 | `PROMPT_08_FORM_ESTRUCTURA.md` | Wizard - Estructura | 6 |
| 9 | `PROMPT_09_FORM_CAMPOS.md` | Wizard - Componentes | - |
| 10 | `PROMPT_10_FORM_DATOS_PERSONALES.md` | Wizard - Datos Personales | - |
| 11 | `PROMPT_11_FORM_DATOS_ACADEMICOS.md` | Wizard - Datos Academicos | - |
| 12 | `PROMPT_12_FORM_DATOS_ECONOMICOS.md` | Wizard - Datos Economicos | - |
| 13 | `PROMPT_13_FORM_RESUMEN.md` | Wizard - Resumen | - |
| 15 | `PROMPT_15_APROBACION.md` | Pantalla Aprobacion | 6 |
| 16 | `PROMPT_16_RECHAZO.md` | Pantalla Rechazo | 6 |

### Features Secundarios

| # | Archivo | Seccion | Iteraciones |
|---|---------|---------|-------------|
| 5 | `PROMPT_05_COMPARADOR.md` | Comparador | 6 |
| 6 | `PROMPT_06_QUIZ_AYUDA.md` | Quiz "No te decides?" | 6 |
| 7 | `PROMPT_07_ESTADO_VACIO.md` | Estado Vacio | 6 |
| 14 | `PROMPT_14_UPSELL.md` | Upsell - Accesorios y Seguros | 6 |

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

## Estructura de Archivos por Seccion (6 versiones)

```
src/app/prototipos/0.4/[seccion]/
├── page.tsx                    # Redirect a preview
├── [seccion]-preview/
│   └── page.tsx                # Preview con Settings Modal (6 opciones)
├── [seccion]-v1/
│   └── page.tsx                # V1: Foto Producto
├── [seccion]-v2/
│   └── page.tsx                # V2: Foto Lifestyle
├── [seccion]-v3/
│   └── page.tsx                # V3: Ilustracion Flat
├── [seccion]-v4/
│   └── page.tsx                # V4: Fintech/Data
├── [seccion]-v5/
│   └── page.tsx                # V5: Bold/Impact
├── [seccion]-v6/
│   └── page.tsx                # V6: Interactivo
├── components/
│   └── [seccion]/
│       ├── [Seccion]SettingsModal.tsx
│       └── [componente]/
│           ├── [Componente]V1.tsx
│           ├── [Componente]V2.tsx
│           ├── [Componente]V3.tsx
│           ├── [Componente]V4.tsx
│           ├── [Componente]V5.tsx
│           └── [Componente]V6.tsx
├── types/
│   └── [seccion].ts
└── data/
    └── mock[Seccion]Data.ts
```

---

## Proceso de Seleccion

1. **Generar** las 6 versiones de cada componente iterable
2. **Revisar** en el preview con el modal de configuracion
3. **Seleccionar** la version ganadora por componente
4. **Documentar** la version elegida en `DECISIONES_0.4.md`
5. **Refinar** la version elegida sera la base para 0.5
