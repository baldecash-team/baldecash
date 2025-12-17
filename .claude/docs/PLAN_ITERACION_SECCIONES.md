# Plan de Iteración por Secciones - BaldeCash Web 3.0

## Estado Actual

### Fase 1: Organización de Documentación
- [x] Mover PROMPT_*.md de `skills/structure/` a `docs/section-specs/`
- [x] Crear README.md en section-specs
- [x] Actualizar referencias en SKILL.md de frontend

### Fase 2: Sistema Base en `_shared/`
- [x] `types/config.types.ts` - Tipos de configuración
- [x] `hooks/usePrototypeConfig.ts` - Hook para config global
- [x] `hooks/useSectionSettings.ts` - Hook para settings por sección
- [x] `components/SettingsButton.tsx` - Botón flotante
- [x] `components/SettingsModal.tsx` - Modal de selección
- [x] `versions-history.json` - Histórico global
- [x] `public/prototipos/0.3/config.json` - Config inicial v0.3
- [x] `index.ts` - Exports centralizados

---

## Pasos Restantes

### Fase 3: Crear Primera Sección con Sistema Completo (Hero)
Ubicación: `src/app/prototipos/0.3/hero/`

1. **Leer especificación**
   ```
   Archivo: .claude/docs/section-specs/PROMPT_01_HERO_LANDING.md
   ```

2. **Crear estructura de carpetas**
   ```
   src/app/prototipos/0.3/hero/
   ├── page.tsx                    # Redirect a preview
   ├── hero-preview/
   │   └── page.tsx                # Preview con Settings Modal
   ├── components/
   │   └── hero/
   │       ├── HeroSettingsModal.tsx
   │       ├── brand-identity/
   │       │   ├── BrandIdentityV1.tsx
   │       │   ├── BrandIdentityV2.tsx
   │       │   └── BrandIdentityV3.tsx
   │       ├── profile-identification/
   │       │   ├── ProfileIdV1.tsx
   │       │   ├── ProfileIdV2.tsx
   │       │   ├── ProfileIdV3.tsx
   │       │   └── ProfileIdV4.tsx
   │       ├── social-proof/
   │       │   ├── SocialProofV1.tsx
   │       │   ├── SocialProofV2.tsx
   │       │   └── SocialProofV3.tsx
   │       ├── navbar/
   │       │   ├── NavbarV1.tsx
   │       │   ├── NavbarV2.tsx
   │       │   └── NavbarV3.tsx
   │       └── hero-cta/
   │           ├── HeroCtaV1.tsx
   │           ├── HeroCtaV2.tsx
   │           └── HeroCtaV3.tsx
   ├── types/
   │   └── hero.ts
   └── data/
       └── mockHeroData.ts
   ```

3. **Crear componentes por versión**
   - Usar skills `brandbook` + `frontend` para contexto
   - Seguir especificaciones del PROMPT_01
   - Componentes marcados [T] = 3 versiones
   - Componentes marcados [F] = 1 versión

4. **Integrar Settings Modal específico**
   - Usar `useSectionSettings('hero', '0.3', defaultSettings)`
   - Usar `generateSettingsGroups('hero', currentSettings)`

5. **Crear preview page con switch dinámico**
   ```tsx
   // hero-preview/page.tsx
   const settings = useSectionSettings('hero', '0.3', {
     brandIdentity: 1,
     profileIdentification: 1,
     socialProof: 1,
     navbar: 1,
     heroCta: 1,
   });

   // Renderizar versión según settings
   {settings.brandIdentity === 1 && <BrandIdentityV1 />}
   {settings.brandIdentity === 2 && <BrandIdentityV2 />}
   {settings.brandIdentity === 3 && <BrandIdentityV3 />}
   ```

### Fase 4: Iterar Secciones Restantes (MVP Core)

Repetir proceso de Fase 3 para cada sección:

| Orden | Sección | PROMPT | Prioridad |
|-------|---------|--------|-----------|
| 1 | Hero | PROMPT_01 | Alta |
| 2 | Catálogo Layout | PROMPT_02 | Alta |
| 3 | Catálogo Cards | PROMPT_03 | Alta |
| 4 | Wizard Estructura | PROMPT_08 | Alta |
| 5 | Wizard Campos | PROMPT_09 | Alta |
| 6 | Resultados | PROMPT_15 + PROMPT_16 | Alta |
| 7 | Detalle Producto | PROMPT_04 | Media |
| 8 | Upsell | PROMPT_14 | Media |

### Fase 5: Testing y Validación

1. **Por cada sección**
   - Probar todas las combinaciones de versiones
   - Verificar persistencia en localStorage
   - Validar mobile responsive

2. **Actualizar histórico**
   - Registrar decisiones en `versions-history.json`
   - Documentar resultados de testing

### Fase 6: Consolidación

1. **Seleccionar versiones ganadoras**
   - Actualizar `config.json` con versiones finales
   - Cambiar status a "approved"

2. **Crear versión 0.4**
   - Copiar config.json
   - Iterar sobre componentes que necesiten mejora

---

## Prompt para Generar Sección

```
Genera la sección [NOMBRE] para BaldeCash Web 3.0 v0.3

Consulta estos archivos antes de codificar:
1. .claude/docs/section-specs/PROMPT_XX_[SECCION].md
2. Usa skills: brandbook, frontend

Estructura esperada:
- Componentes marcados [T] → 3 versiones (V1, V2, V3)
- Componentes marcados [F] → 1 versión
- Preview page con SettingsButton + SettingsModal
- Integración con useSectionSettings hook

Requisitos:
- Mobile-first
- Sin gradientes ni emojis
- Color primario #4654CD
- Tipografía: Baloo 2 (headings), Asap (body)
- Cuota mensual prominente sobre precio total
```

---

## Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| `.claude/skills/brandbook/SKILL.md` | Colores, tipografía, restricciones |
| `.claude/skills/frontend/SKILL.md` | Stack, patrones, decisiones UX |
| `.claude/docs/section-specs/PROMPT_*.md` | Especificaciones por sección |
| `src/app/prototipos/_shared/` | Sistema de versionado |
| `public/prototipos/0.3/config.json` | Config del prototipo actual |

---

## Comandos Útiles

```bash
# Ver estructura actual
ls -la src/app/prototipos/

# Verificar config
cat public/prototipos/0.3/config.json

# Ejecutar dev server
npm run dev

# Ver prototipo
open http://localhost:3000/prototipos/0.3/hero/hero-preview
```
