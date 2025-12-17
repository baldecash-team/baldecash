/brandbook /frontend

# Iteración de Sección

**Parámetros:** `$ARGUMENTS` = `{PROMPT_NUMBER} {VERSION}`

Ejemplo: `/iterar 01 0.3` o `/iterar 02 0.4`

## Instrucciones

1. Lee `.claude/docs/section-specs/PROMPT_{PROMPT_NUMBER}_*.md`
2. Usa los skills brandbook y frontend (ya cargados arriba)
3. Genera componentes según marcadores:
   - **[T]** = 3 versiones (V1, V2, V3)
   - **[F]** = 1 versión fija
4. Guarda en `src/app/prototipos/{VERSION}/{seccion}/`
5. Actualiza `public/prototipos/{VERSION}/config.json`
6. Crea `{Seccion}SettingsModal.tsx` para la sección

## Mapeo de PROMPTs

| # | Sección | Carpeta |
|---|---------|---------|
| 01 | Hero Landing | hero/ |
| 02 | Catálogo Layout | catalogo/ |
| 03 | Catálogo Cards | catalogo/ |
| 04 | Detalle Producto | detalle/ |
| 05 | Comparador | comparador/ |
| 06 | Quiz Ayuda | quiz/ |
| 07 | Estado Vacío | estados/ |
| 08-13 | Wizard/Form | wizard/ |
| 14 | Upsell | resultados/ |
| 15 | Aprobación | resultados/ |
| 16 | Rechazo | resultados/ |

## Estructura de salida

```
src/app/prototipos/{VERSION}/{seccion}/
├── components/
│   ├── {ComponenteV1}.tsx
│   ├── {ComponenteV2}.tsx
│   ├── {ComponenteV3}.tsx
│   └── {Seccion}SettingsModal.tsx
├── types/{seccion}.ts
├── data/mock{Seccion}Data.ts
└── page.tsx (preview)
```
