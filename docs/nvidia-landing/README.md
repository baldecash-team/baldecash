# Landing NVIDIA — Documentación

Contexto para implementar la landing especial de NVIDIA, encargada a Silvana.

## Archivos

| Documento | Contenido |
|---|---|
| [CONTEXT.md](./CONTEXT.md) | Patrón arquitectónico (igual a MacBook Neo), datos de la landing en BD, archivos a crear/modificar, rama de trabajo, checklist |
| [PERFORMANCE.md](./PERFORMANCE.md) | 12 reglas de rendimiento validadas en MacBook Neo y Zona Gamer (LazySection, lazy imports, imágenes, videos, scroll, fonts, etc.) |
| [GPU_SECTION.md](./GPU_SECTION.md) | Sección "La laptop ideal para cada GeForce RTX" — endpoint, agrupación por GPU, imágenes de chips |
| [ASSETS.md](./ASSETS.md) | Diccionario de todos los assets en S3 (GPUs, laptops, software, fondos, videos) con sus URLs |
| [LINKS.md](./LINKS.md) | Cómo construir los links de los botones (catálogo y detalle de producto) con el helper `routes` |
| [THEME_DARK.md](./THEME_DARK.md) | Tema oscuro + botones verdes en las páginas de flujo (catálogo, detalle, solicitar, formulario, complementos, confirmación) — **mismos componentes, sin duplicar como gamer**; switch por slug (`DARK_LANDINGS`). Incluye ejemplo real copy/paste, solución de modales/portales (§5.5), inventario del trabajo (~1.967 colores / ~90 archivos) y casos borde |

## Resumen rápido

- **Patrón:** igual a MacBook Neo — solo el HOME es especializado, el resto usa componentes genéricos
- **Landing ID:** `168` (slug `nvidia`)
- **Catálogo:** habilitado (el preset `catalog-off` fue eliminado). Por ahora los links de catálogo/detalle apuntan a `zona-gamer` — ver `LINKS.md`
- **Rama:** `feature/nvidia-landing` — sin PR ni merge a main
- **Sección de GPUs:** consume `/public/landing/zona-gamer/products?limit=200` (cambiar a `nvidia` cuando tenga productos)
- **Assets:** todos en S3 bajo `https://baldecash.s3.amazonaws.com/images/nvidia/` (ver `ASSETS.md`)
