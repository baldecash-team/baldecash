# Guía de Trabajo: Claude Terminal + BaldeCash Prompts

## Resumen de Prompts Generados (16 Total)

| # | Archivo | Descripción | Preguntas | Prioridad |
|---|---------|-------------|-----------|-----------|
| 1 | `PROMPT_01_HERO_LANDING.md` | Hero Section / Landing | 18 | Alta - MVP |
| 2 | `PROMPT_02_CATALOGO_LAYOUT_FILTROS.md` | Layout y Filtros del Catálogo | 36 | Alta - MVP |
| 3 | `PROMPT_03_CATALOGO_CARDS.md` | Product Cards | 29 | Alta - MVP |
| 4 | `PROMPT_04_DETALLE_PRODUCTO.md` | Detalle de Producto | 24 | Alta - MVP |
| 5 | `PROMPT_05_COMPARADOR.md` | Comparador de Productos | 8 | Media |
| 6 | `PROMPT_06_QUIZ_AYUDA.md` | Quiz "¿No te decides?" | 5 | Baja |
| 7 | `PROMPT_07_ESTADO_VACIO.md` | Estado Vacío (sin resultados) | 2 | Baja |
| 8 | `PROMPT_08_FORM_ESTRUCTURA.md` | Wizard - Estructura General | 22 | Alta - MVP |
| 9 | `PROMPT_09_FORM_CAMPOS.md` | Wizard - Componentes de Campos | 30 | Alta - MVP |
| 10 | `PROMPT_10_FORM_DATOS_PERSONALES.md` | Wizard - Paso Datos Personales | 13 | Alta - MVP |
| 11 | `PROMPT_11_FORM_DATOS_ACADEMICOS.md` | Wizard - Paso Datos Académicos | 14 | Alta - MVP |
| 12 | `PROMPT_12_FORM_DATOS_ECONOMICOS.md` | Wizard - Paso Datos Económicos | 15 | Alta - MVP |
| 13 | `PROMPT_13_FORM_RESUMEN.md` | Wizard - Paso Resumen/Confirmación | 20 | Alta - MVP |
| 14 | `PROMPT_14_UPSELL.md` | Upsell - Accesorios + Seguros | 16 | Media |
| 15 | `PROMPT_15_APROBACION.md` | Pantalla de Aprobación/Éxito | 13 | Alta - MVP |
| 16 | `PROMPT_16_RECHAZO.md` | Pantalla de Rechazo | 19 | Alta - MVP |

**Total: 285 preguntas cubiertas**

---

## Paso a Paso: Configuración Inicial

### Paso 1: Preparar el Repositorio

```bash
# 1. Clonar el repositorio (si no lo tienes)
git clone https://github.com/baldecash-team/baldecash.git
cd baldecash

# 2. Instalar dependencias
npm install

# 3. Verificar que el proyecto corre
npm run dev

# 4. Abrir en navegador: http://localhost:3000
```

### Paso 2: Copiar los Prompts al Proyecto

Crea una carpeta `prompts/` en la raíz del proyecto y copia los 3 archivos:

```
baldecash/
├── prompts/                          # NUEVA CARPETA
│   ├── PROMPT_01_HERO_LANDING.md
│   ├── PROMPT_02_CATALOGO_LAYOUT_FILTROS.md
│   └── PROMPT_03_CATALOGO_CARDS.md
├── src/
│   └── app/
│       └── prototipos/
│           └── 0.2/                  # Aquí se generará el código
└── ...
```

### Paso 3: Configurar Claude Terminal (Claude Code)

```bash
# 1. Instalar Claude Code CLI (si no lo tienes)
npm install -g @anthropic-ai/claude-code

# 2. Autenticarse
claude login

# 3. Navegar al proyecto
cd /ruta/a/baldecash

# 4. Iniciar Claude Terminal
claude
```

---

## Paso a Paso: Generar Componentes

### Opción A: Prompt Completo (Recomendado para empezar)

```bash
# En Claude Terminal, ejecutar:

> Lee el archivo prompts/PROMPT_01_HERO_LANDING.md y genera todos los componentes 
  siguiendo la estructura de archivos especificada. Comienza por los tipos y datos 
  de prueba, luego los componentes base, y finalmente las 3 versiones de cada 
  componente con iteración T.
```

### Opción B: Prompt por Partes (Para más control)

#### Parte 1: Tipos y Datos

```bash
> Lee prompts/PROMPT_01_HERO_LANDING.md. 
  Genera primero:
  1. src/app/prototipos/0.2/hero/types/hero.ts
  2. src/app/prototipos/0.2/hero/data/mockHeroData.ts
```

#### Parte 2: Componentes Base

```bash
> Continúa con PROMPT_01_HERO_LANDING.md.
  Genera los componentes base:
  1. HeroSettingsButton.tsx (botón flotante)
  2. HeroSettingsModal.tsx (modal de configuración)
  3. HeroSection.tsx (wrapper principal)
```

#### Parte 3: Versiones de Componentes

```bash
> Continúa con PROMPT_01_HERO_LANDING.md.
  Genera las 3 versiones de BrandIdentity:
  1. BrandIdentityV1.tsx - Logo + tagline centrado
  2. BrandIdentityV2.tsx - Logo lateral + mensaje
  3. BrandIdentityV3.tsx - Logo minimalista
```

```bash
> Genera las 4 versiones de ProfileIdentification:
  1. ProfileIdentificationV1.tsx - Modal centrado
  2. ProfileIdentificationV2.tsx - Cards integradas
  3. ProfileIdentificationV3.tsx - Banner sticky
  4. ProfileIdentificationV4.tsx - Sin sección
```

... y así sucesivamente para cada grupo de componentes.

#### Parte 4: Páginas de Preview

```bash
> Genera las páginas finales:
  1. src/app/prototipos/0.2/hero/page.tsx (redirect)
  2. src/app/prototipos/0.2/hero/hero-preview/page.tsx (con modal de configuracion)
```

---

## Flujo de Trabajo Recomendado

### Semana 1: Catálogo (Prompts 1-4)

| Día | Prompt | Resultado |
|-----|--------|-----------|
| 1-2 | #1 Hero/Landing | Hero con 6 grupos de componentes |
| 3-4 | #2 Layout/Filtros | Sistema de filtros completo |
| 5 | #3 Cards | Product cards con 3 enfoques |
| 6-7 | #4 Detalle | Página de detalle con tabs, galería, cronograma |

### Semana 2: Wizard de Solicitud (Prompts 8-13)

| Día | Prompt | Resultado |
|-----|--------|-----------|
| 1-2 | #8 Estructura | Wizard container, progress, navigation |
| 3 | #9 Campos | Todos los componentes de formulario |
| 4 | #10 Personal | Paso 1: DNI + autocompletado RENIEC |
| 5 | #11 Académico | Paso 2: Institución + carrera |
| 6 | #12 Económico | Paso 3: Fuente de ingresos |
| 7 | #13 Resumen | Paso 4: Confirmación + cupón |

### Semana 3: Resultados y Features (Prompts 5-7, 14-16)

| Día | Prompt | Resultado |
|-----|--------|-----------|
| 1-2 | #15 Aprobación | Pantalla de éxito con confetti |
| 3-4 | #16 Rechazo | Pantalla empática con alternativas |
| 5 | #14 Upsell | Accesorios y seguros |
| 6 | #5 Comparador | Comparación lado a lado |
| 7 | #6-7 Quiz/Vacío | Features secundarios |

---

## Comandos Útiles en Claude Terminal

### Ver estructura actual

```bash
> Muestra la estructura de archivos en src/app/prototipos/0.2/
```

### Verificar componente

```bash
> Lee el archivo src/app/prototipos/0.2/hero/components/HeroCtaV1.tsx 
  y verifica que cumple con la guía de marca (color #4247d2, sin emojis, 
  sin gradientes, tipografía Baloo 2/Asap)
```

### Corregir errores

```bash
> Hay un error de TypeScript en ProductCardV1.tsx. 
  El tipo Product no tiene la propiedad X. Corrígelo.
```

### Agregar funcionalidad

```bash
> Agrega animación de entrada con framer-motion al componente 
  SocialProofV1.tsx cuando entra en viewport
```

### Refactorizar

```bash
> Extrae la lógica de cálculo de cuotas en ProductCard a un 
  hook personalizado useQuotaCalculation
```

---

## Verificación de Calidad

### Checklist por Componente

```markdown
- [ ] TypeScript sin errores
- [ ] Usa color primario #4247d2
- [ ] Tipografía Baloo 2 para títulos
- [ ] Tipografía Asap para cuerpo
- [ ] Sin emojis (solo Lucide icons)
- [ ] Sin gradientes
- [ ] Mobile-first (375px funciona)
- [ ] Hover states definidos
- [ ] Focus states para accesibilidad
- [ ] Loading state si aplica
- [ ] Error state si aplica
```

### Probar en Navegador

```bash
# URLs de prueba
http://localhost:3000/prototipos/0.2/hero
http://localhost:3000/prototipos/0.2/hero/hero-preview
http://localhost:3000/prototipos/0.2/catalogo
http://localhost:3000/prototipos/0.2/catalogo/catalog-preview
```

---

## Solución de Problemas Comunes

### Error: Módulo no encontrado

```bash
> El import de @nextui-org/react no funciona. 
  Verifica que está instalado y actualiza los imports.
```

### Error: Tipos no coinciden

```bash
> Hay un error de tipos entre Product y ProductCardProps. 
  Alinea las interfaces según types/product.ts
```

### Componente no renderiza

```bash
> El componente HeroSettingsModal no se muestra. 
  Verifica el estado isOpen y el z-index del modal.
```

### Estilos no aplican

```bash
> Los estilos de Tailwind no se ven. 
  Verifica que el archivo está incluido en content de tailwind.config.
```

---

## Estructura Final Esperada

```
src/app/prototipos/0.2/
├── hero/
│   ├── page.tsx
│   ├── hero-preview/
│   │   └── page.tsx              # Con modal de configuracion
│   ├── components/
│   │   └── hero/
│   │       ├── HeroSection.tsx
│   │       ├── HeroSettingsButton.tsx
│   │       ├── HeroSettingsModal.tsx
│   │       ├── brand/
│   │       │   ├── BrandIdentityV1.tsx
│   │       │   ├── BrandIdentityV2.tsx
│   │       │   └── BrandIdentityV3.tsx
│   │       ├── profile/
│   │       │   ├── ProfileIdentificationV1.tsx
│   │       │   ├── ProfileIdentificationV2.tsx
│   │       │   ├── ProfileIdentificationV3.tsx
│   │       │   └── ProfileIdentificationV4.tsx
│   │       ├── ... (más componentes)
│   ├── types/
│   │   └── hero.ts
│   ├── data/
│   │   └── mockHeroData.ts
│   └── HERO_README.md
├── catalogo/
│   ├── page.tsx
│   ├── catalog-preview/
│   │   └── page.tsx
│   ├── catalog-v1/
│   │   └── page.tsx
│   ├── catalog-v2/
│   │   └── page.tsx
│   ├── catalog-v3/
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── CatalogLayoutV1.tsx
│   │   │   ├── CatalogLayoutV2.tsx
│   │   │   └── CatalogLayoutV3.tsx
│   │   ├── filters/
│   │   │   ├── FilterSection.tsx
│   │   │   ├── BrandFilterV1.tsx
│   │   │   ├── BrandFilterV2.tsx
│   │   │   ├── BrandFilterV3.tsx
│   │   │   ├── ... (más filtros)
│   │   ├── cards/
│   │   │   ├── ProductCardV1.tsx
│   │   │   ├── ProductCardV2.tsx
│   │   │   ├── ProductCardV3.tsx
│   │   │   ├── ... (más componentes de cards)
│   │   └── sorting/
│   │       └── SortDropdown.tsx
│   ├── types/
│   │   ├── catalog.ts
│   │   └── product.ts
│   ├── data/
│   │   ├── mockCatalogData.ts
│   │   └── mockProducts.ts
│   └── CATALOG_README.md
```

---

## Orden de Implementación Sugerido

### MVP Core (Prioridad Alta)
1. Hero/Landing (#1)
2. Catálogo Layout + Filtros (#2)
3. Product Cards (#3)
4. Detalle Producto (#4)
5. Wizard Estructura (#8)
6. Wizard Campos (#9)
7. Wizard Datos Personales (#10)
8. Wizard Datos Académicos (#11)
9. Wizard Datos Económicos (#12)
10. Wizard Resumen (#13)
11. Aprobación (#15)
12. Rechazo (#16)

### Features Secundarios (Prioridad Media/Baja)
13. Upsell (#14)
14. Comparador (#5)
15. Quiz Ayuda (#6)
16. Estado Vacío (#7)

---

## Contacto y Soporte

Si encuentras problemas con los prompts o necesitas ajustes, puedes:

1. Modificar directamente el archivo .md del prompt
2. Agregar contexto adicional en el comando de Claude Terminal
3. Iterar sobre componentes específicos

¡Éxito con la implementación! 🚀
