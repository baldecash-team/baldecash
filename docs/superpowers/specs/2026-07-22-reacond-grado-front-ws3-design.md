# WS3 (baldecash front) — selector de grado real de reacondicionados

- **Fecha:** 2026-07-22
- **Repo:** baldecash (Next.js) — worktree `feat/reacond-grado-front` (desde origin/main)
- **Depende de:** ws2 WS1 (grados = Product separados, ya implementado) + una **adición de API en ws2** (grade-siblings).
- **Artifact de diseño:** https://claude.ai/code/artifact/4cbff374-fcfc-4f33-86d1-9165c80faf7d

## Contexto (verificado en el código)

El frontend YA tiene, para reacondicionados:
- **Filtro "Condición" (Nuevo / Semi nuevo)** en el catálogo estándar (`TechnicalFiltersStyled.tsx:154`), con envío `conditions` a ws2, facets, badge en la tarjeta (`ProductCard.tsx`/`ConditionBadge.tsx`) y sync a URL (`queryFilters.ts`). Se auto-muestra cuando el facet trae >1 condición.
- **Selector de grado A/B/C en el detalle de copia-home** (`CopiaHomeMobileDetail.tsx` / `CopiaHomeDesktopDetail.tsx`), con galería referencial por grado (`iphoneGradeGallery.ts`) y specs por grado. **PERO es FE-only**: `const GRADES` (línea 46) tiene los grados hardcodeados; **solo Grado A es comprable, B/C bloqueados** (`disponible: false`) porque "el backend no modela grados".

## Objetivo

Volver el selector de grado **real**: cada grado (A/B/C) mapea a un **Product real** de ws2 (`MODELO_r_a/_b/_c`) con su propio stock/precio/disponibilidad. B/C se vuelven comprables cuando tienen stock. Reusa la UI existente de copia-home; no se construye de cero.

## Decisiones

- **Reusar** el selector de grado de copia-home (UI ya hecha), reemplazando el mock `GRADES` FE-only por datos reales del API.
- **Grados = Products hermanos**: el detalle muestra un card con selector A/B/C; cada opción es un Product real. Al elegir un grado, cambia precio/stock/CTA como con el `ColorSelector`.

## Dependencia de backend (ws2) — bloqueante

El front necesita, para un modelo reacondicionado, la lista de sus **grados hermanos** con datos reales. Hoy la API no los agrupa (grados son Products sueltos). Se requiere en ws2 (nuevo, análogo a `color_siblings`):

- Exponer `grade_siblings` (o similar) en el detalle/best-offer: `[{ grade: 'A'|'B'|'C', product_id, slug, price, stock_available, is_available }]`, agrupando los Products con el mismo modelo base y `condition='reacondicionada'`.
- Criterio de agrupación: por `family_id`, o por prefijo del nombre/slug antes del sufijo `_r_<letra>`, o un campo explícito. (A definir en el plan de ws2.)

**Sin esta API, WS3 no puede volver real el selector** (seguiría FE-only). Es un pre-requisito.

## Workstream (una vez lista la API)

1. **Normalizar condición** `nueva/nuevo` ↔ `reacondicionada/reacondicionado` (`CatalogLayoutV4.tsx:294`, `queryFilters.ts`, `utils/condition.ts`) para que chips/filtros/envío sean coherentes.
2. **Consumir `grade_siblings`** en el servicio de detalle (`producto/.../detail` + `catalogApi.ts`), tipando `grade` en el detalle (`producto/types/detail.ts`, hoy solo `condition`).
3. **Selector de grado real**: en `CopiaHomeMobileDetail.tsx`/`CopiaHomeDesktopDetail.tsx`, reemplazar `const GRADES` FE-only por los grados del API; `disponible` = `stock_available>0`; al elegir grado, actualizar el Product activo (precio, cuota, CTA "Lo quiero"). Mantener la galería referencial (`iphoneGradeGallery.ts`) para iPhones.
4. **Grado comprable**: quitar el blindaje "solo A comprable"; B/C comprables si `is_available`. El grado elegido define el `product_id` que va al submit.
5. **Catálogo estándar** (renueva, no copia-home): decidir si los grados salen como tarjetas separadas (con badge de grado) o si el detalle estándar también tendrá selector de grado (replicar patrón). MVP: badge de grado en la tarjeta + selector en el detalle.

## Testing (jest, el repo ya lo usa)

- Normalizador de condición (unit).
- Mapeo `grade_siblings` → opciones del selector (unit).
- Render del selector con grados reales: A/B/C, disponibilidad por stock, cambio de precio/CTA al elegir.

## Riesgos / pendientes

- **Bloqueante:** la API `grade_siblings` en ws2 (nuevo workstream de backend). Sin ella, WS3 queda en normalización + badge, sin selector real.
- No romper copia-home actual (iPhone seminuevo) — el selector real debe degradar a FE-only si el API no trae grade_siblings.
- Poblar los Products-grado en ws2 (data) para que el filtro/selector tengan qué mostrar.
