# BaldeCash Web 5.0 - Especificaciones por Sección

Documentación de las decisiones UX/UI para la versión 0.5.

## Diferencias con Versión 0.4

| Aspecto | 0.4 | 0.5 |
|---------|-----|-----|
| Versiones | 6 (V1-V6) | **2 (V1-V2)** |
| Objetivo | Explorar variedad | **Refinar versión seleccionada** |
| Foco | Variedad visual | **Pulido y producción** |
| Ortografía | Con tildes | **Con tildes (reforzado)** |

---

## Filosofía v0.5

La versión 0.5 usa **2 versiones** para iteración más rápida y enfocada:

| Versión | Enfoque |
|---------|---------|
| **V1** | Versión base / conservadora |
| **V2** | Versión alternativa / experimental |

Objetivos:
1. **Consolidar** - Tomar las mejores decisiones de cada sección
2. **Pulir** - Mejorar detalles de UX, animaciones, estados
3. **Consistencia** - Asegurar coherencia entre secciones
4. **Producción** - Preparar componentes para versión final

---

## Índice de Secciones

Las especificaciones de prompts se irán agregando conforme se iteren:

| # | Archivo | Sección | Estado |
|---|---------|---------|--------|
| 1 | `PROMPT_01_*.md` | Hero / Landing | Pendiente |
| 2 | `PROMPT_02_CATALOGO.md` | Catálogo (config fija + color selector) | ✅ Completado |
| 3 | `PROMPT_03_*.md` | Catálogo - Product Cards | Pendiente |
| ... | ... | ... | ... |

---

## Cómo Usar

```bash
# Iterar una sección específica
/iterar {número} 0.5

# Ejemplo
/iterar 1 0.5
```

---

## Skills Relacionados

Antes de generar cualquier sección, invocar:
- `brandbook` → Colores (#4654CD), tipografía (Baloo 2, Asap), restricciones
- `frontend` → Stack (Next.js, NextUI), patrones, decisiones UX

---

## Estructura de Archivos

```
src/app/prototipos/0.5/[sección]/
├── page.tsx                    # Página principal
├── [sección]-preview/
│   └── page.tsx                # Preview con configurador
├── components/
│   └── [sección]/
│       ├── [Componente]V1.tsx  # Versión 1 - base
│       ├── [Componente]V2.tsx  # Versión 2 - alternativa
│       └── [Sección]SettingsModal.tsx
├── types/
│   └── [sección].ts
└── data/
    └── mock[Sección]Data.ts
```

---

## Convenciones

Ver `../CONVENTIONS.md` para reglas globales de:
- Ortografía en español (tildes obligatorias)
- Componentes compartidos de UI
- TypeScript patterns
- Next.js patterns
- Colores y estilos
