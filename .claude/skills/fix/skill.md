# Fix & Deploy - Skill de Corrección Automatizada

Skill para corregir bugs, documentar patrones y desplegar en un solo comando.

## Uso

```
/fix [descripción del problema]
```

**Ejemplos:**
- `/fix los cards no redirigen en mobile`
- `/fix el slider de precio no muestra el valor`
- `/fix el modal se ve mal en tablet`

---

## Flujo Automatizado

### Paso 1: Diagnosticar
- Buscar archivos relacionados con el problema descrito
- Identificar el componente/página afectada
- Entender la causa raíz

### Paso 2: Corregir
- Aplicar el fix siguiendo las guías del skill `frontend`
- Respetar patrones existentes (NextUI, Tailwind, colores de marca)
- Verificar que no se rompa nada más

### Paso 3: Documentar (si aplica)
Si el fix revela un patrón nuevo o una regla que debe seguirse:
- Actualizar `.claude/skills/frontend/skill.md` con la nueva regla
- Agregar a la sección correspondiente o crear nueva si es necesario
- Incluir ejemplo de código correcto vs incorrecto

### Paso 4: Commit
Crear commit con mensaje descriptivo:
```
fix: [descripción corta del problema corregido]
```

Ejemplos de mensajes:
- `fix: Add cursor-pointer to mobile card navigation`
- `fix: Correct slider value display on price filter`
- `fix: Adjust modal positioning on tablet breakpoint`

### Paso 5: Push
- Push automático a `main`
- Si hay conflictos, hacer pull --rebase primero

---

## Reglas del Fix

### SIEMPRE
- Leer el archivo antes de editarlo
- Mantener cambios mínimos y focalizados
- Usar `cursor-pointer` en elementos clickeables
- Respetar el brandbook (colores, tipografía, sin gradientes)
- Verificar que el fix aplique a mobile-first

### NUNCA
- Hacer refactors no solicitados
- Cambiar código que funciona
- Agregar features nuevas (solo corregir el bug reportado)
- Hacer commits con cambios no relacionados al fix

---

## Detección de Archivos

Según palabras clave en el problema:

| Keyword | Buscar en |
|---------|-----------|
| card, cards | `components/catalog/cards/`, `components/*Card*` |
| modal | `components/*Modal*`, `*Settings*` |
| filtro, filter | `components/catalog/filters/` |
| hero | `hero/components/` |
| form, wizard | `solicitud/`, `steps/` |
| navbar, nav | `components/navbar/`, `components/hero/navbar/` |
| footer | `components/footer/` |
| slider | `*Slider*`, `*Range*` |
| button, botón | Buscar `<Button` en archivos relevantes |
| mobile | Revisar clases responsive (`sm:`, `md:`, `lg:`) |

---

## Actualización de Skills

### Cuándo actualizar el skill frontend:

1. **Nuevo patrón de NextUI** - Ej: "Los Select necesitan X para funcionar"
2. **Bug recurrente** - Si es la segunda vez que se corrige algo similar
3. **Regla de accesibilidad** - cursor-pointer, aria-labels, etc.
4. **Incompatibilidad descubierta** - Ej: "NextUI Image no funciona con export"

### Formato para agregar al skill:

```markdown
## [Nombre del Patrón]

### SIEMPRE/NUNCA [descripción corta]

[Explicación del problema]

```tsx
// ❌ PROHIBIDO - [por qué está mal]
[código incorrecto]

// ✅ CORRECTO - [por qué está bien]
[código correcto]
```

### Reglas:
- [regla 1]
- [regla 2]
```

---

## Ejemplo Completo

**Input:** `/fix los cards no redirigen en mobile`

**Acciones:**
1. Grep "onClick" y "onPress" en cards del catálogo
2. Encontrar que falta `cursor-pointer` o el evento no está en el wrapper correcto
3. Agregar clase/evento faltante
4. Si es patrón nuevo, documentar en skill frontend
5. `git add . && git commit -m "fix: Add click handler to mobile product cards"`
6. `git push origin main`

**Output al usuario:**
```
Corregido: Los cards ahora redirigen correctamente en mobile.
- Archivo: ProductCardV1.tsx (línea 45)
- Cambio: Agregado onClick al wrapper principal
- Commit: abc123
- Pushed to main ✓
```
