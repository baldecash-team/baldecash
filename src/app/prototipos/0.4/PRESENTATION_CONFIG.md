# Configuracion de Presentacion v0.4

Este documento detalla las versiones seleccionadas para el modo "Presentacion" del prototipo 0.4.

## Landing Page (Hero)

| Componente | Version | Notas/Personalizaciones |
|------------|---------|------------------------|
| Navbar | V6 | Incluir megamenu, cambiar texto FAQ a espanol, quitar "Solicitar ahora", solo dejar "Mi cuenta" |
| Hero Section | V2 | Actualizar foto |
| Social Proof | V1 + V3 | Combinar: arriba los convenios, abajo el testimonio |
| Como Funciona | V5 | Quitar "Empieza a estudiar", poner "Recibe tu laptop". Quitar plazos del requisito, quitar correo institucional como requisito, poner "DNI o CE" en vez de "DNI" |
| CTA | V4 | Incluir boton para llenar el quiz |
| Preguntas Frecuentes | V2 | - |
| Footer | V2 + V3 | Mix de ambas versiones |

**URL:** `/prototipos/0.4/hero/hero-preview?navbar=6&hero=2&social=1&how=5&cta=4&faq=2&footer=2&mode=clean`

---

## Catalogo

| Componente | Version | Notas/Personalizaciones |
|------------|---------|------------------------|
| Layout | V4 (desktop) / V3 (mobile) | Modificar layout de botones de categoria igual que V9 de presentacion 0.4 anterior. Incluir boton "Tienes dudas" que abra el quiz dentro de la barra de filtros |
| Filtros Tecnicos | V3 | - |
| Filtro de Marca | V3 | - |
| Tamano de Galeria | V3 | - |
| Galeria de Imagenes | V2 | - |
| Columnas Desktop | 4 | - |
| Animacion de Carga | V2 | - |
| Boton Cargar Mas | V3 | - |
| Estilo de Tags | V1 | - |
| Estilo de Card | V6 baseline | Quitar botones de plazo e inicial y specs resumidos. Seccion morada mas chica, specs tecnicos arriba similar a V1 |
| Acceso Comparador | V1 | - |
| Cantidad Productos | V3 (max 3) | - |

**URL:** `/prototipos/0.4/catalogo/catalog-preview?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=2&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1&pricingoptions=false&mode=clean`

---

## Comparador

| Componente | Version | Notas/Personalizaciones |
|------------|---------|------------------------|
| Layout | V1 | Quitar primera fila, quitar diferencia de cuotas mensual. Todo mismo ancho. Boton "mostrar diferencias" arriba |
| Acceso | V1 | Checkbox en Cards |
| Max Productos | V3 (3 productos) | - |
| Campos | V2 | Specs + Features |
| Highlight | V1 | Semantico clasico |
| Price Diff | V4 | Badge Animado |
| Diff Highlight | V5 | Subrayado Animado |
| Card Selection | V3 | Glow + Ribbon |

**URL:** `/prototipos/0.4/comparador/comparator-preview?layout=1&access=1&maxproducts=3&fields=2&highlight=1&pricediff=4&diffhighlight=5&cardstyle=3&mode=clean`

---

## Detalle de Producto

| Componente | Version | Notas/Personalizaciones |
|------------|---------|------------------------|
| Header | V3 | - |
| Galeria | V1 | - |
| Tabs | V1 | - |
| Especificaciones | V2 | - |
| Calculadora/Pricing | V4 | - |
| Cronograma | V2 | Quitar acumulado. Anadir modal para ver pago total, TEA, TCEA, comisiones, TyC. Anadir boton descarga PDF |
| Productos Similares | V2 | CTA: "Ahorra S/x /mes", "Mejora tu procesador", "Mejora tu almacenamiento" |
| Limitaciones | V6 | Quitar barra de progreso y checkbox, solo descriptivo |
| Certificaciones | V1 | - |

**URL:** `/prototipos/0.4/producto/detail-preview?infoHeader=3&gallery=1&tabs=1&specs=2&pricing=4&cronograma=2&similar=2&limitations=6&certifications=1&mode=clean`

---

## Quiz de Ayuda

| Componente | Version | Notas/Personalizaciones |
|------------|---------|------------------------|
| Layout Desktop | V5 | Quitar barra de progreso de arriba con los pasos |
| Layout Mobile | V4 | Bottom sheet |

**URL:** `/prototipos/0.4/quiz/quiz-preview?layout=5&mode=clean`

---

## Estados Vacios

| Componente | Version | Notas/Personalizaciones |
|------------|---------|------------------------|
| Ilustracion | V5 | - |
| Acciones | V6 | - |

**URL:** `/prototipos/0.4/catalogo/empty-preview?illustration=5&actions=6&mode=clean`

---

## Wizard de Solicitud

| Componente | Version | Notas/Personalizaciones |
|------------|---------|------------------------|
| Input + Label | V4 | - |
| Opciones | V2 | Para campos con mas de 4 opciones, usar dropdown select con buscador de v0.3 |
| Upload | V3 | Incluir boton de tomar foto |

**URL:** `/prototipos/0.4/wizard-solicitud/wizard-preview?input=4&options=2&progress=1&navigation=1&mode=clean`

---

## Resultado: Aprobado

| Componente | Version | Notas/Personalizaciones |
|------------|---------|------------------------|
| Elementos de Celebracion | V1 | - |
| Intensidad Confetti | V1 | - |
| Sonido Celebracion | V2 | - |
| Resumen de Producto | V1 | - |
| Tiempo Estimado | V3 | - |
| Compartir en Redes | V6 | Con elementos de redes de V2 |
| Referidos | V1 | - |

**Nota:** Crear version adicional para "Solicitud recibida" que no diga al cliente que ha sido aprobado sino que su solicitud sera evaluada en 24h.

**URL:** `/prototipos/0.4/resultado/aprobado-preview?celebration=1&confetti=1&sound=2&summary=1&time=3&share=6&referrals=1&mode=clean`

---

## Convenios

| Componente | Version | Notas/Personalizaciones |
|------------|---------|------------------------|
| Navbar | V3 | Con boton y texto CTA de V4 |
| Hero | V2 | Quitar logos de ambas empresas, solo figuran en navbar |
| Beneficios | V1 | - |
| Testimonios | V1 | - |
| Preguntas Frecuentes | V2 | - |
| CTA | V6 | - |
| Footer | V2 + V3 | Repetir BaldeCash pero anadir logo del convenio |

**URL:** `/prototipos/0.4/convenio/convenio-preview?navbar=3&hero=2&benefits=1&testimonials=1&faq=2&cta=6&footer=2&mode=clean`

---

## Upsell (Modulo Nuevo)

Crear modulo aparte con:
- Mensaje tipo "Los estudiantes tambien llevan..."
- Secciones separadas para:
  - Accesorios
  - Seguros
  - Garantias extendidas
- Botones de skip
- Interfaz amigable

**URL:** `/prototipos/0.4/upsell/upsell-preview?mode=clean`

---

## Notas Adicionales

- Las URLs con `mode=clean` ocultan los controles de configuracion
- Las personalizaciones detalladas requieren modificaciones a los componentes (no implementadas aun)
- El switch en la pagina de inicio `/prototipos/0.4` permite alternar entre modo Presentacion y modo Configuracion
