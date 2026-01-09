# Instrucciones para Claude - BaldeCash Webpage 3.0

Este archivo contiene instrucciones que Claude debe seguir en todas las conversaciones de este proyecto.

---

## Prototipos v0.5 - Estándares Obligatorios

**ANTES de implementar CUALQUIER código en `/src/app/prototipos/0.5/`:**

1. **LEER PRIMERO** el archivo `/.claude/docs/0.5/CONVENTIONS.md`
2. **CONSULTAR** la tabla "CONSULTA OBLIGATORIA ANTES DE IMPLEMENTAR" al inicio del documento
3. **LEER LA SECCIÓN ESPECÍFICA** del patrón que se va a implementar
4. **SOLO ENTONCES** escribir código

### Tabla de Referencia Rápida

| Cuando se pida... | Leer sección de CONVENTIONS.md |
|-------------------|-------------------------------|
| Loading / Preload / Spinner | 8.6 Botones con Estado de Carga |
| Input / TextField | 8.7.2 TextInput |
| Textarea | 8.7.3 TextArea |
| Select / Dropdown | 8.7.4 SelectInput |
| File Upload / Drag & Drop | 8.7.5 FileUpload |
| Validación de formularios | 8.7.8 Validación de Estados |
| Selector con 2-3 opciones | 8.2 SegmentedControl |
| Selector con 4-5 opciones | 8.3 RadioGroup |
| Selector con 6+ opciones | 8.4 SelectInput con buscador |
| Modal de configuración | 6 Settings Modal Pattern |
| Formato de dinero/precios | 7 Formato de Moneda |
| FeedbackButton | 12.8 Feedback en Modo Clean |
| mode=clean | 12.2 Modo Clean |
| Página de preview | 2.0 Elementos Obligatorios |
| Responsive / Mobile | 8 (sección Responsive Design) |
| Fondos, efectos glow, cards | 9.3.1 Prohibición de Gradientes |
| Colores, estilos visuales | 9 Colores y Estilos |
| Toast / Notificaciones / Mensajes | 9.5 Toast Notifications |

### Regla de Oro

> **NUNCA implementar de memoria.** Siempre verificar el estándar actual en CONVENTIONS.md antes de escribir código para prototipos v0.5.

---

## Convenciones Generales del Proyecto

- **Idioma UI:** Español latino (con tildes correctas)
- **Framework:** Next.js 14+ con App Router
- **UI Library:** NextUI + Tailwind CSS
- **Iconos:** lucide-react (NO emojis en UI)
- **Animaciones:** Framer Motion
