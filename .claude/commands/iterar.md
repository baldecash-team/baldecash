/brandbook /frontend

# Iteración de Sección

**Parámetros:** `$ARGUMENTS` = `{PROMPT_NUMBER} {VERSION}`

Ejemplo: `/iterar 01 0.4` o `/iterar 02 0.4`

## Instrucciones

1. Lee `.claude/docs/{VERSION}/section-specs/PROMPT_{PROMPT_NUMBER}_*.md`
2. Usa los skills brandbook y frontend (ya cargados arriba)
3. Genera componentes según marcadores:
   - **[ITERAR - 6 versiones]** = 6 versiones (V1, V2, V3, V4, V5, V6)
   - **[DEFINIDO]** = 1 versión fija aplicada a todas las variantes
4. Guarda en `src/app/prototipos/{VERSION}/{seccion}/`
5. Actualiza `public/prototipos/{VERSION}/config.json`
6. Crea `{Seccion}SettingsModal.tsx` para la sección
7. Incluye `TokenCounter` flotante en page.tsx (ver sección Token Counter)

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
│   ├── {ComponenteV4}.tsx
│   ├── {ComponenteV5}.tsx
│   ├── {ComponenteV6}.tsx
│   └── {Seccion}SettingsModal.tsx
├── types/{seccion}.ts
├── data/mock{Seccion}Data.ts
└── page.tsx (preview con TokenCounter)
```

## Token Counter (OBLIGATORIO)

Cada página de preview DEBE incluir el componente `TokenCounter` como botón flotante encima del botón de configuración.

### Implementación en page.tsx:

```tsx
// Importar el componente
import { TokenCounter } from '@/components/ui/TokenCounter';

// En el JSX, agregar encima del botón de Settings:
<div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
  <TokenCounter
    sectionId="PROMPT_{NUMBER}"
    version="{VERSION}"
  />
  <Button isIconOnly onPress={() => setIsSettingsOpen(true)}>
    <Settings className="w-5 h-5" />
  </Button>
  {/* otros botones */}
</div>
```

### Actualización del contador:

Al finalizar la ejecución de `/iterar`, se debe actualizar el archivo:
`public/prototipos/{VERSION}/token-usage.json`

```json
{
  "iterations": [
    {
      "promptNumber": "01",
      "section": "hero",
      "timestamp": "2024-12-19T12:00:00.000Z",
      "estimatedTokens": {
        "input": 15000,
        "output": 25000,
        "total": 40000
      },
      "filesGenerated": 24,
      "componentsCreated": ["NavbarV1-V6", "HeroBannerV1-V6", "..."]
    }
  ],
  "totalTokensUsed": 40000
}
```

## Reporte Final (OBLIGATORIO)

Al terminar cada iteración, mostrar resumen:

```
═══════════════════════════════════════════════════════
  ITERACIÓN COMPLETADA - PROMPT_{NUMBER} v{VERSION}
═══════════════════════════════════════════════════════
  Sección: {nombre_seccion}
  Archivos generados: {count}
  Componentes creados: {lista}

  TOKENS ESTIMADOS:
  ├─ Input:  ~{input_tokens} tokens
  ├─ Output: ~{output_tokens} tokens
  └─ Total:  ~{total_tokens} tokens

  Archivo actualizado: public/prototipos/{VERSION}/token-usage.json
═══════════════════════════════════════════════════════
```
