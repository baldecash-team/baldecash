# Guía de Agentes y Skills - webpage3.0 (Frontend)

> Documentación del sistema de personalización de Claude Code para el frontend de BaldeCash.
> Fecha: 2 de Febrero 2026

---

## Tabla de Contenidos

1. [Conceptos Fundamentales](#1-conceptos-fundamentales)
2. [Estructura de Archivos](#2-estructura-de-archivos)
3. [Agents (Agentes)](#3-agents-agentes)
4. [Skills (Habilidades)](#4-skills-habilidades)
5. [Commands (Comandos)](#5-commands-comandos)
6. [Settings (Configuración)](#6-settings-configuración)
7. [CLAUDE.md](#7-claudemd)
8. [Cómo se Activan](#8-cómo-se-activan)
9. [Cómo Agregar Nuevos Componentes](#9-cómo-agregar-nuevos-componentes)
10. [aitmpl.com - Marketplace](#10-aitmplcom---marketplace)

---

## 1. Conceptos Fundamentales

### ¿Qué son?

Claude Code permite personalizar su comportamiento mediante archivos de configuración en el directorio `.claude/` del proyecto:

| Componente | Propósito | Ubicación |
|------------|-----------|-----------|
| **Agents** | Roles especializados (personalidad + expertise) | `.claude/agents/*.md` |
| **Skills** | Paquetes de conocimiento por dominio | `.claude/skills/*/` |
| **Commands** | Flujos de trabajo predefinidos (`/nombre`) | `.claude/commands/*.md` |
| **Settings** | Permisos y configuración | `.claude/settings.json` |
| **CLAUDE.md** | Instrucciones globales (siempre se lee) | `./CLAUDE.md` |

### Jerarquía de Carga

```
1. CLAUDE.md          → Se lee SIEMPRE al inicio
2. settings.json      → Define permisos
3. Skills             → Se cargan cuando se necesitan
4. Agents             → Se invocan explícitamente (@nombre)
5. Commands           → Se ejecutan con /nombre
```

---

## 2. Estructura de Archivos

```
webpage3.0/
├── CLAUDE.md                      # Instrucciones globales
└── .claude/
    ├── settings.json              # Permisos del proyecto
    ├── settings.local.json        # Permisos locales (no commitear)
    │
    ├── agents/                    # 7 agentes
    │   ├── cli-ui-designer.md
    │   ├── frontend-developer.md
    │   ├── nextjs-architecture-expert.md
    │   ├── react-performance-optimizer.md
    │   ├── test-generator.md
    │   ├── typescript-pro.md
    │   └── ui-ux-designer.md
    │
    ├── skills/                    # 10 skills
    │   ├── brandbook/
    │   ├── fix/
    │   ├── frontend/
    │   ├── frontend-dev-guidelines/
    │   ├── nextjs-best-practices/
    │   ├── react-best-practices/
    │   ├── react-patterns/
    │   ├── react-ui-patterns/
    │   ├── typescript-expert/
    │   └── web-performance-optimization/
    │
    ├── commands/                  # 3 comandos
    │   ├── iterar.md
    │   ├── nextjs-bundle-analyzer.md
    │   └── nextjs-component-generator.md
    │
    └── docs/                      # Documentación por versión
        ├── 0.3/
        ├── 0.4/
        ├── 0.5/
        └── 0.6/
```

---

## 3. Agents (Agentes)

### ¿Qué son?

Los **agents** son roles especializados que Claude puede asumir. Definen una personalidad, área de expertise y forma de responder.

### Agents Disponibles (7)

| Agent | Archivo | Propósito |
|-------|---------|-----------|
| **cli-ui-designer** | `cli-ui-designer.md` | Diseño de interfaces CLI/Terminal |
| **frontend-developer** | `frontend-developer.md` | Desarrollo React/Next.js general |
| **nextjs-architecture-expert** | `nextjs-architecture-expert.md` | Arquitectura App Router, SSR, ISR |
| **react-performance-optimizer** | `react-performance-optimizer.md` | Optimización de rendimiento, Core Web Vitals |
| **test-generator** | `test-generator.md` | Generación de tests unitarios y E2E |
| **typescript-pro** | `typescript-pro.md` | TypeScript avanzado, tipos estrictos |
| **ui-ux-designer** | `ui-ux-designer.md` | Diseño de experiencia de usuario |

### Estructura de un Agent

```markdown
---
name: frontend-developer
description: React/Next.js development specialist
tools: Read, Write, Edit, Bash
model: sonnet
---

You are a frontend developer specializing in React and Next.js.

## Focus Areas
- Component architecture
- State management
- Responsive design

## Approach
1. Understand requirements
2. Design component structure
3. Implement with best practices

## Output
- Clean, typed components
- Proper error handling
- Performance considerations
```

### Cómo Invocar un Agent

```bash
# Mención directa
@frontend-developer crea un componente de tarjeta de producto

# En contexto
Usando el agent ui-ux-designer, diseña el flujo de checkout
```

---

## 4. Skills (Habilidades)

### ¿Qué son?

Los **skills** son paquetes de conocimiento especializado. Claude los carga cuando detecta que los necesita o cuando se le indica explícitamente.

### Skills Disponibles (10)

| Skill | Directorio | Propósito |
|-------|------------|-----------|
| **brandbook** | `brandbook/` | Colores, tipografía, guías de marca BaldeCash |
| **fix** | `fix/` | Patrones para corrección de bugs |
| **frontend** | `frontend/` | Componentes, referencias, assets, 285 decisiones UX |
| **frontend-dev-guidelines** | `frontend-dev-guidelines/` | Guías de desarrollo frontend |
| **nextjs-best-practices** | `nextjs-best-practices/` | Mejores prácticas Next.js 14+ |
| **react-best-practices** | `react-best-practices/` | Patrones React, hooks, context |
| **react-patterns** | `react-patterns/` | State management, composition |
| **react-ui-patterns** | `react-ui-patterns/` | Patrones de UI comunes |
| **typescript-expert** | `typescript-expert/` | TypeScript avanzado, generics, utility types |
| **web-performance-optimization** | `web-performance-optimization/` | Core Web Vitals, lazy loading, caching |

### Estructura de un Skill

```
.claude/skills/brandbook/
├── SKILL.md              # Archivo principal (REQUERIDO)
├── colors.md             # Paleta de colores
├── typography.md         # Tipografía
└── components.md         # Guías de componentes
```

### Archivo SKILL.md

```markdown
---
name: brandbook
description: BaldeCash brand guidelines and visual identity
allowed-tools: Read, Glob
---

# BaldeCash Brandbook

## Colores Principales
- Primary: #4654CD
- Secondary: #...

## Tipografía
- Headings: Baloo 2
- Body: Asap

## Uso
Consultar antes de diseñar cualquier componente visual.
```

### Cómo se Activan

```bash
# Automático (Claude detecta la necesidad)
"Necesito crear un botón con los colores de la marca"
# → Claude carga brandbook automáticamente

# Explícito
"Usa el skill brandbook para revisar los colores"

# Via Command
/iterar 01 0.5
# → Carga brandbook y frontend automáticamente
```

---

## 5. Commands (Comandos)

### ¿Qué son?

Los **commands** son flujos de trabajo predefinidos que se ejecutan con `/nombre`. Pueden cargar múltiples skills y seguir pasos específicos.

### Commands Disponibles (3)

| Command | Archivo | Propósito |
|---------|---------|-----------|
| `/iterar {NUM} {VER}` | `iterar.md` | Genera componentes para una sección del prototipo |
| `/nextjs-bundle-analyzer` | `nextjs-bundle-analyzer.md` | Analiza y optimiza el tamaño del bundle |
| `/nextjs-component-generator` | `nextjs-component-generator.md` | Genera componentes Next.js con estructura estándar |

### Ejemplo: `/iterar`

```bash
/iterar 01 0.5
```

**Flujo de ejecución:**
1. Carga skills: `brandbook`, `frontend`
2. Lee `.claude/docs/0.5/CONVENTIONS.md`
3. Lee `.claude/docs/0.5/section-specs/PROMPT_01_*.md`
4. Lee `.claude/docs/0.5/section-learnings/LEARNINGS_*.md` (si existe)
5. Genera componentes aplicando las 3 capas

**Mapeo de PROMPTs:**
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

### Estructura de un Command

```markdown
/skill1 /skill2

# Nombre del Comando

**Parámetros:** `$ARGUMENTS` = `{param1} {param2}`

## Flujo de Ejecución
1. Paso 1
2. Paso 2
3. Paso 3

## Instrucciones
### Paso 1: Título
Descripción...

## Output Esperado
- Item 1
- Item 2
```

---

## 6. Settings (Configuración)

### Archivo: `.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "Edit",
      "Write",
      "Read",
      "Glob",
      "Grep",
      "Bash(npm install:*)",
      "Bash(npm run build:*)",
      "Bash(npm run dev:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(git checkout:*)",
      "Bash(npx shadcn@latest add:*)",
      "WebSearch",
      "Skill(brandbook)",
      "Skill(frontend)",
      "Skill(fix)",
      "SlashCommand(/iterar:*)",
      "SlashCommand(/fix:*)"
    ],
    "deny": []
  }
}
```

### Permisos Explicados

| Permiso | Descripción |
|---------|-------------|
| `Edit`, `Write`, `Read` | Operaciones de archivos |
| `Glob`, `Grep` | Búsqueda de archivos y contenido |
| `Bash(npm *:*)` | Comandos npm permitidos |
| `Bash(git *:*)` | Comandos git permitidos |
| `WebSearch` | Búsqueda en internet |
| `Skill(nombre)` | Skills permitidos |
| `SlashCommand(/cmd:*)` | Comandos permitidos |

### settings.local.json

Para permisos personales que NO se commitean:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test:*)"
    ]
  }
}
```

---

## 7. CLAUDE.md

### Ubicación: `./CLAUDE.md`

Se lee **SIEMPRE** al inicio de cada conversación.

### Contenido Actual

```markdown
# Instrucciones para Claude - BaldeCash Webpage 3.0

## Prototipos v0.5 - Estándares Obligatorios

**ANTES de implementar CUALQUIER código en `/src/app/prototipos/0.5/`:**

1. **LEER PRIMERO** el archivo `/.claude/docs/0.5/CONVENTIONS.md`
2. **CONSULTAR** la tabla de referencia
3. **LEER LA SECCIÓN ESPECÍFICA** del patrón
4. **SOLO ENTONCES** escribir código

### Tabla de Referencia Rápida
| Cuando se pida... | Leer sección de CONVENTIONS.md |
|-------------------|-------------------------------|
| Loading / Spinner | 8.6 Botones con Estado de Carga |
| Input / TextField | 8.7.2 TextInput |
| Select / Dropdown | 8.7.4 SelectInput |
| ...               | ...                           |

## Convenciones Generales
- **Idioma UI:** Español latino (con tildes correctas)
- **Framework:** Next.js 14+ con App Router
- **UI Library:** NextUI + Tailwind CSS
- **Iconos:** lucide-react (NO emojis en UI)
- **Animaciones:** Framer Motion
```

---

## 8. Cómo se Activan

### Flujo de Activación

```
Usuario inicia chat
        │
        ▼
┌───────────────────────┐
│ 1. Lee CLAUDE.md      │  ← Automático
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ 2. Lee settings.json  │  ← Automático
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ 3. Usuario pide algo  │
│ "Crea un botón azul"  │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ 4. Claude detecta     │
│ necesidad de skill    │  ← Carga brandbook
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ 5. Responde con       │
│ conocimiento experto  │
└───────────────────────┘
```

### Activación Explícita

```bash
# Agent
@ui-ux-designer diseña el flujo de onboarding

# Skill
Usa el skill react-patterns para implementar el contexto

# Command
/iterar 05 0.5
```

---

## 9. Cómo Agregar Nuevos Componentes

### Agregar un Agent

1. Crear `.claude/agents/mi-agent.md`:

```markdown
---
name: mi-agent
description: Descripción corta
tools: Read, Write, Edit
model: sonnet
---

You are a [rol] specializing in [área].

## Focus Areas
- Área 1
- Área 2

## Output
- Tipo de output
```

### Agregar un Skill

1. Crear directorio `.claude/skills/mi-skill/`
2. Crear `SKILL.md`:

```markdown
---
name: mi-skill
description: Descripción del conocimiento
allowed-tools: Read, Glob
---

# Mi Skill

## Recursos
| Archivo | Descripción |
|---------|-------------|
| `recurso1.md` | Descripción |
```

3. Agregar recursos adicionales (`.md`)

### Agregar un Command

1. Crear `.claude/commands/mi-comando.md`:

```markdown
/skill1 /skill2

# Mi Comando

**Parámetros:** `$ARGUMENTS`

## Flujo
1. Paso 1
2. Paso 2

## Output
- Resultado esperado
```

2. Agregar permiso en `settings.json`:

```json
"SlashCommand(/mi-comando:*)"
```

---

## 10. aitmpl.com - Marketplace

### Instalación de Componentes

```bash
cd /path/to/webpage3.0

# Agents
npx claude-code-templates@latest --agent=development-team/test-generator --yes

# Skills
npx claude-code-templates@latest --skill=web-development/react-best-practices --yes

# Commands
npx claude-code-templates@latest --command=testing/e2e-setup --yes

# Hooks
npx claude-code-templates@latest --hook=git/conventional-commits --yes
```

### Componentes Recomendados para Frontend

| Tipo | Nombre | Propósito |
|------|--------|-----------|
| Command | `testing/e2e-setup` | Configurar Playwright/Cypress |
| Command | `testing/webapp-testing` | Tests de aplicación web |
| Hook | `git/conventional-commits` | Validar formato de commits |
| Skill | `web-development/roier-seo` | Optimización SEO |

---

## Resumen

```
╔════════════════════════════════════════════════╗
║         webpage3.0 - Claude Config             ║
╠════════════════════════════════════════════════╣
║  Agents:    7  (frontend, nextjs, react, etc.) ║
║  Skills:   10  (brandbook, frontend, etc.)     ║
║  Commands:  3  (/iterar, /bundle, /component)  ║
║  Hooks:     0  (oportunidad de mejora)         ║
║  Docs:    138  archivos de specs y learnings   ║
╚════════════════════════════════════════════════╝
```

---

*Documentación generada el 2 de Febrero 2026*
