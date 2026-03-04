# Plan: Reordenamiento Dinámico de Secciones en Solicitar Flow

**Fecha**: 2026-03-04
**Versión**: 1.0
**Estado**: ✅ Implementado

---

## 1. Resumen Ejecutivo

### Objetivo
Permitir reordenar las secciones `accessories`, `wizard_steps` e `insurance` desde el admin, con navegación dinámica que respete el orden configurado.

### Estado Actual
- Orden fijo: accessories → wizard_steps → insurance
- Navegación hardcodeada a `/seguros`
- Solo se puede habilitar/deshabilitar secciones

### Estado Deseado
- Orden configurable desde admin (cualquier combinación)
- Navegación dinámica basada en configuración
- Nueva ruta genérica `/complementos` (reemplaza `/seguros`)

---

## 2. Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| R1 | wizard_steps siempre habilitado | No se puede deshabilitar desde admin |
| R2 | Orden flexible | accessories e insurance pueden ir en cualquier posición |
| R3 | Múltiples antes/después | Ambas secciones pueden estar antes o después del wizard |
| R4 | Submit dinámico | El submit ocurre en la última página del flujo |
| R5 | Complementos condicional | Si no hay secciones después del wizard, submit ocurre en el wizard |

---

## 3. Escenarios de Configuración

### 3.1 Matriz de Escenarios

| # | Orden | Preview muestra | Complementos muestra | Submit en |
|---|-------|-----------------|---------------------|-----------|
| 1 | acc → wiz → ins | Accessories | Insurance | /complementos |
| 2 | ins → wiz → acc | Insurance | Accessories | /complementos |
| 3 | wiz → acc → ins | (vacío) | Acc → Ins | /complementos |
| 4 | wiz → ins → acc | (vacío) | Ins → Acc | /complementos |
| 5 | acc → ins → wiz | Acc → Ins | (vacío) | wizard |
| 6 | ins → acc → wiz | Ins → Acc | (vacío) | wizard |
| 7 | wiz only (otros disabled) | (vacío) | (vacío) | wizard |
| 8 | acc → wiz (ins disabled) | Accessories | (vacío) | wizard |
| 9 | wiz → acc (ins disabled) | (vacío) | Accessories | /complementos |
| 10 | ins → wiz (acc disabled) | Insurance | (vacío) | wizard |
| 11 | wiz → ins (acc disabled) | (vacío) | Insurance | /complementos |

### 3.2 Regla del Submit

```
SI sectionsAfterWizard.length > 0:
  → Submit ocurre en /complementos

SI sectionsAfterWizard.length === 0:
  → Submit ocurre en el último paso del wizard (resumen)
```

---

## 4. Arquitectura de Páginas

### 4.1 Estructura de URLs

| Ruta | Propósito | Renderiza |
|------|-----------|-----------|
| `/solicitar` | Preview | Secciones con `order < wizard.order` |
| `/solicitar/[stepSlug]` | Formulario | Pasos del wizard |
| `/solicitar/complementos` | Post-wizard | Secciones con `order > wizard.order` + Submit |
| `/solicitar/confirmacion` | Confirmación | Resultado de la solicitud |

### 4.2 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    PREVIEW (/solicitar)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ sectionsBeforeWizard.map(section =>                 │    │
│  │   section.type === 'accessories' ? <Accessories/>   │    │
│  │   section.type === 'insurance' ? <Insurance/>       │    │
│  │ )                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│  [Comenzar Solicitud] → /solicitar/{firstWizardStep}        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 WIZARD (/solicitar/[stepSlug])               │
│  Pasos dinámicos: paso-1 → paso-2 → ... → resumen           │
│                                                              │
│  Al finalizar resumen:                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ if (sectionsAfterWizard.length > 0)                 │    │
│  │   → navigate('/complementos')                       │    │
│  │ else                                                │    │
│  │   → submitApplication()                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
   sectionsAfterWizard > 0              sectionsAfterWizard = 0
            │                                   │
            ▼                                   ▼
┌───────────────────────────┐      ┌───────────────────────────┐
│ COMPLEMENTOS              │      │ Submit directo            │
│ (/solicitar/complementos) │      │ desde wizard              │
│ ┌───────────────────────┐ │      └───────────────┬───────────┘
│ │ sectionsAfterWizard   │ │                      │
│ │ .map(section => ...)  │ │                      │
│ └───────────────────────┘ │                      │
│ [Enviar Solicitud]        │                      │
└─────────────┬─────────────┘                      │
              │                                    │
              └──────────────┬─────────────────────┘
                             ▼
              ┌───────────────────────────┐
              │ CONFIRMACIÓN              │
              │ (/solicitar/confirmacion) │
              └───────────────────────────┘
```

---

## 5. Componentes

### 5.1 Nuevos Componentes (webpage3.0)

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| `AccessoriesSection.tsx` | `/components/solicitar/sections/` | Sección de accesorios extraída de solicitarClient |
| `InsuranceSection.tsx` | `/components/solicitar/sections/` | Sección de seguros extraída de segurosClient |
| `SectionRenderer.tsx` | `/components/solicitar/sections/` | Renderiza sección por tipo |
| `complementosClient.tsx` | `/solicitar/complementos/` | Cliente de página complementos |
| `page.tsx` | `/solicitar/complementos/` | Página Next.js |

### 5.2 Componentes a Modificar

| Componente | Cambio |
|------------|--------|
| `useSolicitarFlow.ts` | Agregar `sectionsBeforeWizard`, `sectionsAfterWizard`, `shouldShowComplementos` |
| `solicitarClient.tsx` | Usar `sectionsBeforeWizard` para renderizar dinámicamente |
| `StepClient.tsx` | Usar `shouldShowComplementos` para decidir navegación post-wizard |
| `SolicitarFlowSection.tsx` (admin2) | Deshabilitar toggle de wizard_steps, agregar advertencias |

### 5.3 Componentes a Eliminar

| Componente | Razón |
|------------|-------|
| `/solicitar/seguros/` (carpeta completa) | Reemplazada por `/complementos` |

---

## 6. Cambios en Hook `useSolicitarFlow`

### 6.1 Interface Actualizada

```typescript
interface UseSolicitarFlowResult {
  // Existentes
  config: SolicitarFlowConfig;
  enabledSections: SolicitarSection[];
  isEnabled: (type: SolicitarSectionType) => boolean;
  getPosition: (type: SolicitarSectionType) => number | null;
  isLoading: boolean;
  error: Error | null;

  // NUEVOS
  sectionsBeforeWizard: SolicitarSection[];
  sectionsAfterWizard: SolicitarSection[];
  shouldShowComplementos: boolean;
  wizardOrder: number;
}
```

### 6.2 Lógica Nueva

```typescript
const wizardOrder = useMemo(() => {
  const wizard = enabledSections.find(s => s.type === 'wizard_steps');
  return wizard?.order ?? 999;
}, [enabledSections]);

const sectionsBeforeWizard = useMemo(() =>
  enabledSections
    .filter(s => s.type !== 'wizard_steps' && s.order < wizardOrder)
    .sort((a, b) => a.order - b.order),
  [enabledSections, wizardOrder]
);

const sectionsAfterWizard = useMemo(() =>
  enabledSections
    .filter(s => s.type !== 'wizard_steps' && s.order > wizardOrder)
    .sort((a, b) => a.order - b.order),
  [enabledSections, wizardOrder]
);

const shouldShowComplementos = sectionsAfterWizard.length > 0;
```

---

## 7. Estructura de Archivos Final

```
/src/app/prototipos/0.6/
├── [landing]/
│   └── solicitar/
│       ├── solicitarClient.tsx          # MODIFICAR
│       ├── [stepSlug]/
│       │   └── StepClient.tsx           # MODIFICAR
│       ├── complementos/                 # NUEVO (reemplaza /seguros)
│       │   ├── page.tsx
│       │   └── complementosClient.tsx
│       ├── confirmacion/
│       │   └── ...
│       ├── components/
│       │   └── solicitar/
│       │       ├── sections/             # NUEVO
│       │       │   ├── AccessoriesSection.tsx
│       │       │   ├── InsuranceSection.tsx
│       │       │   ├── SectionRenderer.tsx
│       │       │   └── index.ts
│       │       └── ...
│       └── seguros/                      # ELIMINAR
│           └── ...
├── hooks/
│   └── useSolicitarFlow.ts              # MODIFICAR
└── ...
```

---

## 8. Base de Datos

### 8.1 Estado Actual

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Columna** | ✅ Existe | `landing.config` (JSON) - Migración 080 |
| **Estructura** | ✅ Suficiente | Soporta `order` (1,2,3) y `enabled` por sección |
| **Validación** | ✅ Implementada | Backend valida 3 secciones con tipos/órdenes únicos |
| **Seeders** | ✅ Existen | 4 landings con diferentes configuraciones |
| **Endpoints** | ✅ Completos | GET/PUT admin + GET público |

### 8.2 Estructura de Datos

```json
{
  "solicitar_flow": {
    "sections": [
      {"type": "accessories", "enabled": true, "order": 1},
      {"type": "wizard_steps", "enabled": true, "order": 2},
      {"type": "insurance", "enabled": true, "order": 3}
    ]
  }
}
```

### 8.3 Cambios Necesarios

| Tipo | ¿Necesario? | Razón |
|------|-------------|-------|
| **Migraciones** | ❌ No | Estructura JSON actual soporta reordenamiento |
| **Seeders** | ❌ No | Ya existen con diferentes órdenes |
| **Endpoints** | ❌ No | Ya soportan cualquier orden (1,2,3) |
| **Validación** | ⚠️ Opcional | Agregar que `wizard_steps.enabled` siempre sea `true` |

### 8.4 Validación Opcional en Backend

```python
# webservice2/app/api/routers/landings.py
# En SolicitarConfigUpdateSchema

@validator('sections')
def validate_wizard_always_enabled(cls, sections):
    wizard = next((s for s in sections if s.type == 'wizard_steps'), None)
    if wizard and not wizard.enabled:
        raise ValueError('wizard_steps cannot be disabled')
    return sections
```

---

## 9. Tests

### 9.1 Estado Actual de Tests

| Proyecto | Tests Existentes | Tests Faltantes |
|----------|------------------|-----------------|
| **webservice2** | ✅ Completos (592 líneas) | Ninguno |
| | - Admin endpoints: 17 tests | |
| | - Public endpoints: 9 tests | |
| **webpage3.0** | ⚠️ Parciales | Varios |
| | - `solicitarConfig.test.ts`: 17 tests | - `useSolicitarFlow` hook (nuevas props) |
| | - `useSubmitApplication.test.ts`: 9 tests | - `AccessoriesSection` |
| | | - `InsuranceSection` |
| | | - `complementosClient` |
| **admin2** | ❌ No existen para esta feature | - `SolicitarFlowSection` |

### 9.2 Tests Requeridos para Esta Feature

| Proyecto | Componente | Prioridad | Descripción |
|----------|------------|-----------|-------------|
| **webpage3.0** | `useSolicitarFlow` | Alta | Test nuevas propiedades: `sectionsBeforeWizard`, `sectionsAfterWizard`, `shouldShowComplementos` |
| | `AccessoriesSection` | Media | Renderizado, toggle de selección |
| | `InsuranceSection` | Media | Renderizado, selección de plan |
| | `complementosClient` | Media | Renderizado dinámico, submit |
| **admin2** | `SolicitarFlowSection` | Baja | Toggle deshabilitado, advertencias |
| **webservice2** | Validación wizard | Baja | Test que wizard_steps.enabled no puede ser false |

### 9.3 Casos de Test E2E

| # | Escenario | Esperado |
|---|-----------|----------|
| T1 | acc:1, wiz:2, ins:3 | Preview: Acc, Complementos: Ins, Submit en /complementos |
| T2 | wiz:1, acc:2, ins:3 | Preview: vacío, Complementos: Acc+Ins, Submit en /complementos |
| T3 | acc:1, ins:2, wiz:3 | Preview: Acc+Ins, Complementos: no existe, Submit en wizard |
| T4 | wiz:1 (otros disabled) | Preview: vacío, Complementos: no existe, Submit en wizard |

---

## 10. Advertencias en Admin

### 10.1 Advertencias Implementar

| Escenario | Tipo | Mensaje |
|-----------|------|---------|
| Insurance antes de Wizard | ⚠️ Warning | "El usuario seleccionará seguro antes de completar sus datos. Esto puede reducir conversión." |

### 10.2 Restricciones de UI

| Restricción | Implementación |
|-------------|----------------|
| wizard_steps no se puede deshabilitar | Toggle deshabilitado + tooltip explicativo |

---

## 11. Plan de Implementación

### Fase 1: Preparación de Componentes (webpage3.0)
**Objetivo**: Extraer componentes sin romper funcionalidad existente

| # | Tarea | Archivo |
|---|-------|---------|
| 1.1 | Actualizar `useSolicitarFlow` con nuevas propiedades | `hooks/useSolicitarFlow.ts` |
| 1.2 | Crear `AccessoriesSection.tsx` (extraer de solicitarClient) | `components/solicitar/sections/` |
| 1.3 | Crear `InsuranceSection.tsx` (extraer de segurosClient) | `components/solicitar/sections/` |
| 1.4 | Crear `SectionRenderer.tsx` | `components/solicitar/sections/` |
| 1.5 | Tests para `useSolicitarFlow` (nuevas propiedades) | `__tests__/` |

### Fase 2: Nueva Página Complementos (webpage3.0)
**Objetivo**: Crear página que funcione en paralelo con /seguros

| # | Tarea | Archivo |
|---|-------|---------|
| 2.1 | Crear `page.tsx` para complementos | `complementos/page.tsx` |
| 2.2 | Crear `complementosClient.tsx` | `complementos/complementosClient.tsx` |
| 2.3 | Integrar `useSubmitApplication` | complementosClient.tsx |
| 2.4 | Testing manual de /complementos | - |

### Fase 3: Integración y Migración (webpage3.0)
**Objetivo**: Conectar todo y eliminar código obsoleto

| # | Tarea | Archivo |
|---|-------|---------|
| 3.1 | Modificar `solicitarClient.tsx` para usar sectionsBeforeWizard | solicitarClient.tsx |
| 3.2 | Modificar `StepClient.tsx` para navegación dinámica | StepClient.tsx |
| 3.3 | Eliminar carpeta `/seguros/` | seguros/ |
| 3.4 | Testing E2E de todos los flujos | - |

### Fase 4: Backend Validation (webservice2) - OPCIONAL
**Objetivo**: Enforcar que wizard_steps no se pueda deshabilitar

| # | Tarea | Archivo |
|---|-------|---------|
| 4.1 | Agregar validación wizard_steps siempre enabled | `app/api/routers/landings.py` |
| 4.2 | Test para nueva validación | `tests/api/routers/` |

### Fase 5: Admin UI (admin2)
**Objetivo**: Mejoras en admin para UX

| # | Tarea | Archivo |
|---|-------|---------|
| 5.1 | Deshabilitar toggle de wizard_steps | `SolicitarFlowSection.tsx` |
| 5.2 | Agregar advertencia: insurance antes de wizard | `SolicitarFlowSection.tsx` |
| 5.3 | Tests para SolicitarFlowSection (opcional) | - |

---

## 12. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Romper flujo existente durante migración | Alto | Fase 2 crea /complementos en paralelo con /seguros |
| Estado de accessories/insurance no persiste entre páginas | Medio | Ya usan ProductContext con localStorage |
| Performance al cargar múltiples secciones | Bajo | Componentes ya optimizados |
| Admin permite configuraciones confusas | Bajo | Advertencias informativas (Fase 5) |

---

## 13. Impacto por Proyecto

| Proyecto | Cambios de Código | Cambios BD | Tests Nuevos |
|----------|-------------------|------------|--------------|
| **webpage3.0** | ✅ Varios archivos | ❌ Ninguno | ⚠️ Recomendados (Fase 1.5) |
| **admin2** | ✅ 1 archivo (UI) | ❌ Ninguno | ⚠️ Opcionales |
| **webservice2** | ⚠️ 1 validación (opcional) | ❌ Ninguno | ⚠️ 1 test si se agrega validación |

---

## 14. Definición de "Hecho"

- [ ] Todas las configuraciones de orden funcionan correctamente (11 escenarios)
- [ ] Submit ocurre en la ubicación correcta según el flujo
- [ ] No hay referencias a `/seguros` en el código
- [ ] Tests pasan para nuevas propiedades de `useSolicitarFlow`
- [ ] Admin no permite deshabilitar wizard_steps
- [ ] Advertencia visible cuando insurance está antes de wizard
- [ ] Documentación actualizada

---

## 15. Historial de Cambios

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2026-03-04 | 1.0 | Documento inicial |
