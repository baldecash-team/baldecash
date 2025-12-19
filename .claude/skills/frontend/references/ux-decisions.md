# Decisiones UX/UI - BaldeCash Web 3.0

Referencia completa de las 285 preguntas respondidas, organizadas por módulo.
- **[T]** = Iterar (generar 3 versiones)
- **[F]** = Fijo (una sola implementación)

---

## Módulo A: Hero / Landing (18 preguntas)

### A.1 Brand Identity
| ID | Pregunta | Decisión |
|----|----------|----------|
| A.1 [T] | ¿Dónde ubicar el logo? | V1: Esquina superior izq, V2: Centro, V3: Izq con tagline |
| A.2 [T] | ¿Debe haber tagline junto al logo? | V1: Sin tagline, V2: "Tu laptop, tu futuro", V3: Tagline dinámico |
| A.3 [T] | ¿Qué tamaño de logo? | V1: Pequeño (h-8), V2: Mediano (h-10), V3: Grande (h-12) |

### A.2 Profile Identification
| ID | Pregunta | Decisión |
|----|----------|----------|
| A.4 [T] | ¿Cómo identificar si es estudiante? | V1: Pregunta directa, V2: Email .edu, V3: Skip silencioso |
| A.5 [T] | ¿Cuándo pedir email institucional? | V1: Inmediato, V2: Al mostrar precio, V3: Solo si hay convenio |
| A.6 [T] | ¿Mostrar beneficios de convenio antes de identificar? | V1: Ocultos, V2: Teaser, V3: Todos visibles |
| A.7 [F] | ¿Qué hacer si no hay convenio? | Mensaje empático + seguir con flujo normal |

### A.3 Institutional Banner
| ID | Pregunta | Decisión |
|----|----------|----------|
| A.8 [T] | ¿Mostrar banner de institución aliada? | V1: Banner hero, V2: Badge sutil, V3: Logo en navbar |
| A.9 [T] | ¿Personalizar colores según institución? | V1: Solo logo, V2: Colores en banner, V3: Tema completo |
| A.10 [F] | ¿Banner para no aliados? | Genérico "Estudiantes de todo el Perú" |
| A.11 [F] | ¿Banner en todas las páginas? | Solo en landing y header |

### A.4 Social Proof
| ID | Pregunta | Decisión |
|----|----------|----------|
| A.12 [T] | ¿Dónde ubicar logos de medios? | V1: Arriba del fold, V2: Al final, V3: En footer |
| A.13 [T] | ¿Mostrar número de estudiantes? | V1: "+5,000 estudiantes", V2: Contador animado, V3: No mostrar |
| A.14 [F] | ¿Mostrar testimonios en landing? | Sí, 2-3 testimonios con foto y universidad |

### A.5 Navigation
| ID | Pregunta | Decisión |
|----|----------|----------|
| A.15 [T] | ¿Estilo de navbar? | V1: Transparente, V2: Sólido, V3: Glassmorphism |
| A.16 [T] | ¿Items de navegación? | V1: Mínimo (Logo, CTA), V2: Completo, V3: Hamburger siempre |
| A.17 [F] | ¿Navbar sticky? | Sí, sticky con reducción de altura al scroll |

### A.6 Hero CTA
| ID | Pregunta | Decisión |
|----|----------|----------|
| A.18 [T] | ¿CTA principal? | V1: "Ver laptops", V2: "Calcula tu cuota", V3: "Empezar ahora" |

---

## Módulo B: Catálogo (83 preguntas)

### B.1 Layout General
| ID | Pregunta | Decisión |
|----|----------|----------|
| B.1 [F] | ¿Grid o lista? | Grid por defecto, toggle para cambiar |
| B.2 [T] | ¿Sidebar de filtros? | V1: Sidebar izq 280px, V2: Filtros horizontales, V3: Drawer móvil |
| B.3 [T] | ¿Filtros colapsables? | V1: Todos expandidos, V2: Solo activos, V3: Acordeón |
| B.4 [F] | ¿Mostrar total de productos? | Sí: "24 laptops encontradas" |

### B.2 Filtros
| ID | Pregunta | Decisión |
|----|----------|----------|
| B.5 [T] | ¿Filtro de marca con logos? | V1: Solo texto, V2: Logo + texto, V3: Grid de logos |
| B.6 [F] | ¿Rango de precio como slider? | Sí, dual-slider con inputs numéricos |
| B.7 [F] | ¿Filtro por cuota mensual? | Sí, prominente (más importante que precio total) |
| B.8 [T] | ¿Filtro por uso recomendado? | V1: Chips, V2: Cards con icono, V3: Dropdown |
| B.9 [F] | ¿Filtros técnicos (RAM, SSD)? | Checkboxes agrupados con tooltips explicativos |
| B.10 [F] | ¿Mostrar conteo por opción? | Sí: "Dell (12)" |
| B.11 [F] | ¿Botón limpiar filtros? | Sí, visible cuando hay filtros activos |

### B.3 Ordenamiento
| ID | Pregunta | Decisión |
|----|----------|----------|
| B.12 [F] | ¿Opciones de ordenamiento? | Recomendados, Precio (↑↓), Cuota (↑↓), Nuevos, Populares |
| B.13 [F] | ¿Orden por defecto? | Recomendados (basado en conversión + stock) |

### B.4 Product Cards
| ID | Pregunta | Decisión |
|----|----------|----------|
| B.14 [T] | ¿Enfoque de card? | V1: Specs técnicas, V2: Beneficios/uso, V3: Híbrido |
| B.15 [T] | ¿Posición de badges? | V1: Esquina superior, V2: Arriba de imagen, V3: Ribbon |
| B.16 [F] | ¿Qué badges mostrar? | Descuento, Stock bajo, Nuevo, Popular |
| B.17 [F] | ¿Precio o cuota prominente? | **CUOTA prominente**, precio secundario |
| B.18 [F] | ¿Mostrar ahorro en monto o %? | **MONTO**: "Ahorras S/200" |
| B.19 [T] | ¿Botón favoritos? | V1: Corazón outline, V2: Corazón con fill, V3: Bookmark |
| B.20 [T] | ¿Checkbox comparar? | V1: En card, V2: Solo en hover, V3: No mostrar |
| B.21 [T] | ¿Comportamiento hover? | V1: Mostrar descripción, V2: Mostrar specs, V3: Sin cambio |
| B.22 [F] | ¿Quick view? | No en MVP, directo a página de detalle |
| B.23 [F] | ¿Nombre técnico o descriptivo? | **Descriptivo**: "Laptop Lenovo 15.6" para estudios" |

### B.5 Detalle de Producto (24 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| B.24 [F] | ¿Modal o página? | **Página nueva** |
| B.25 [T] | ¿Tabs o scroll? | V1: Tabs horizontales, V2: Acordeón, V3: Scroll con nav sticky |
| B.26 [T] | ¿Galería con zoom? | V1: Thumbnails laterales, V2: Thumbnails abajo, V3: Carousel |
| B.27 [T] | ¿Cronograma interactivo? | V1: Slider de plazo, V2: Botones de plazo, V3: Input libre |
| B.27b [T] | ¿Calculadora de cuotas? | V1: Botones de plazo + desglose visible, V2: Slider interactivo + cards resumen, V3: Compacto con tabs de plazo |
| B.28 [T] | ¿Productos similares? | V1: Carousel, V2: Grid 3 cols, V3: Panel lateral |
| B.29 [T] | ¿Organización de specs? | V1: Tabla con secciones, V2: Cards por categoría, V3: Lista acordeón |
| B.30 [T] | ¿Specs como tabla/cards/lista? | V1: Tabla, V2: Cards grid, V3: Lista con iconos |
| B.31 [T] | ¿Cuántas specs mostrar? | V1: Todas, V2: Top 15 + expandir, V3: Por relevancia |
| B.32 [T] | ¿Tooltips en specs? | V1: Icono (?), V2: Link modal, V3: Texto visible |
| B.33 [F] | ¿Diagrama de puertos? | Sí, ilustración con ubicación |
| B.34 [F] | ¿Iconos de puertos? | Sí (USB-C, HDMI, SD, etc.) |
| B.35 [T] | ¿Mostrar limitaciones? | V1: Sección "Considera que...", V2: Collapsible, V3: Tooltips |
| B.36 [F] | ¿Framing de limitaciones? | Positivo: "Optimizado para..." no "No tiene..." |
| B.37 [T] | ¿Productos competencia? | V1: Solo BaldeCash, V2: Mención texto, V3: Tabla comparativa |
| B.38 [F] | ¿Descripción larga? | Resumida con "Ver más" |
| B.39 [F] | ¿Iconos en key_features? | Sí |
| B.40 [T] | ¿Cantidad de imágenes? | V1: Todas, V2: 5 + ver más, V3: Hero + thumbnails |
| B.41 [T] | ¿Tamaño imagen hero? | V1: 60% ancho, V2: 50/50, V3: Fullwidth |
| B.42 [F] | ¿Mostrar software preinstalado? | Sí, con iconos |
| B.43 [F] | ¿Indicar Windows/FreeDOS? | Prominente con badge |
| B.44 [F] | ¿Duración de batería? | Prominente: "Hasta 8 horas" |
| B.45 [F] | ¿Carga rápida? | Sí: "Carga rápida 65W (50% en 30 min)" |
| B.46 [T] | ¿Certificaciones? | V1: Solo logos, V2: Logos + texto, V3: Cards expandibles |

### B.6 Comparador (8 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| B.47 [T] | ¿Cómo acceder? | V1: Desde cards, V2: Desde detalle, V3: Ambos |
| B.48 [T] | ¿Máximo productos? | V1: 2, V2: 3, V3: 4 |
| B.49 [T] | ¿Campos en comparación? | V1: Solo principales, V2: + features + cuotas, V3: Todos + toggle |
| B.50 [T] | ¿Indicar mejor/peor? | V1: Verde/rojo, V2: Iconos, V3: Barras |
| B.51 [T] | ¿Diferencia de precio? | V1: Relativo "+S/200", V2: En cuota, V3: Ambos |
| B.52 [T] | ¿Layout comparador? | V1: Modal, V2: Página, V3: Panel lateral |
| B.53 [T] | ¿Resaltar diferencias? | V1: Highlight amarillo, V2: Toggle filtrar, V3: Animación |
| B.54 [T] | ¿Dónde agregar a comparar? | V1: Cards, V2: Detalle, V3: Ambos |

### B.7 Quiz de Ayuda (5 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| B.55 [T] | ¿Layout quiz? | V1: Modal, V2: Widget lateral, V3: Página |
| B.56 [T] | ¿Cantidad preguntas? | V1: 3, V2: 5, V3: 7 |
| B.57 [F] | ¿Estilo preguntas? | Con iconos ilustrativos |
| B.58 [T] | ¿Resultado? | V1: 1 producto, V2: Top 3, V3: Categoría + productos |
| B.59 [T] | ¿Preguntas sobre? | V1: Solo uso, V2: Solo preferencias, V3: Híbrido |

### B.8 Estado Vacío (2 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| B.60 [F] | ¿Qué mostrar sin resultados? | Ilustración + mensaje + sugerencias |
| B.61 [F] | ¿Sugerir ampliar filtros? | Sí, botones para limpiar o ampliar rango |

---

## Módulo C: Formularios / Wizard (114 preguntas)

### C.0 Estructura General (22 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| C.1 [T] | ¿Página completa o con header? | V1: Fullscreen, V2: Header minimalista, V3: Header + progress |
| C.2 [F] | ¿URLs por paso? | Sí: /solicitud/paso-1, /paso-2, etc. |
| C.3 [T] | ¿Navegación libre? | V1: Solo secuencial, V2: Libre atrás, V3: Completamente libre |
| C.4 [T] | ¿Autoguardar? | V1: Cada campo, V2: Al completar paso, V3: Botón manual |
| C.5 [T] | ¿Indicador de progreso? | V1: "Paso 2 de 5", V2: Barra %, V3: Dots con labels |
| C.6 [T] | ¿Ver nombres de pasos? | V1: Todos visibles, V2: Actual + siguiente, V3: Collapsible |
| C.7 [T] | ¿Checkmark en completados? | V1: Checkmark verde, V2: Cambio color, V3: Número tachado |
| C.8 [T] | ¿Destacar paso actual? | V1: Color primario, V2: Tamaño + color, V3: Pulse |
| C.9 [F] | ¿Click en paso para volver? | Sí |
| C.10 [T] | ¿Layout de campos? | V1: Columna centrada, V2: Dos columnas, V3: Full width |
| C.11 [T] | ¿Panel lateral? | V1: Sin panel, V2: Resumen producto, V3: Tips/ayuda |
| C.12 [T] | ¿Ilustraciones? | V1: Derecha desktop, V2: Arriba, V3: Sin ilustraciones |
| C.13 [T] | ¿Ilustraciones en móvil? | V1: Ocultar, V2: Reducir, V3: Mantener pequeñas |
| C.14 [T] | ¿Botones fijos o inline? | V1: Fixed bottom, V2: Al final, V3: Fixed móvil/inline desktop |
| C.15 [F] | ¿Estilo botón Regresar? | Link o botón ghost |
| C.16 [T] | ¿Botón guardar después? | V1: Visible siempre, V2: En menú, V3: Tras inactividad |
| C.17 [F] | ¿Continuar deshabilitado? | Sí, con tooltip explicativo |
| C.18 [T] | ¿Mensajes motivacionales? | V1: Únicos por paso, V2: Genérico positivo, V3: Sin mensajes |
| C.19 [F] | ¿Personalizar con nombre? | Sí: "¡Vas muy bien, María!" |
| C.20 [T] | ¿Micro-celebraciones? | V1: Confetti sutil, V2: Checkmark animado, V3: Sin celebración |
| C.21 [F] | ¿Tiempo estimado? | Sí: "Tiempo estimado: 5 minutos" |
| C.22 [F] | ¿Actualizar tiempo? | Sí: "Aproximadamente 2 minutos restantes" |

### C.1 Componentes de Campos (30 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| C1.1 [T] | ¿Estilo de labels? | V1: Arriba, V2: Flotante, V3: Solo placeholder |
| C1.2 [F] | ¿Placeholder? | Ejemplo de formato: "Ej: 12345678" |
| C1.3 [F] | ¿Marcar obligatorios? | Indicar "Opcional" en los no obligatorios |
| C1.4 [T] | ¿Estilo inputs? | V1: Bordes completos, V2: Línea inferior, V3: Filled |
| C1.5 [F] | ¿Color focus? | #4247d2 |
| C1.6 [F] | ¿Contador caracteres? | Sí: "45/100" |
| C1.7 [F] | ¿Formato automático? | Sí para celular y montos |
| C1.8 [F] | ¿Selects custom? | Sí, NextUI |
| C1.9 [F] | ¿Buscador en selects? | Sí para +10 opciones |
| C1.10 [F] | ¿Iconos en opciones? | Sí cuando aportan valor |
| C1.11 [F] | ¿Selects dependientes? | Loading + opciones |
| C1.12 [F] | ¿Checkboxes custom? | Sí, con #4247d2 |
| C1.13 [T] | ¿Opciones excluyentes? | V1: Radios, V2: Segmented, V3: Cards |
| C1.14 [F] | ¿Área clickeable checkbox? | Toda la fila |
| C1.15 [T] | ¿Upload archivos? | V1: Drag & drop + botón, V2: Solo botón, V3: Área clickeable |
| C1.16 [T] | ¿Preview de archivo? | V1: Thumbnail, V2: Nombre + tamaño, V3: Modal |
| C1.17 [T] | ¿Progreso upload? | V1: Barra, V2: Spinner %, V3: Solo estados |
| C1.18 [F] | ¿Icono upload? | Upload + "Arrastra tu archivo aquí" |
| C1.19 [F] | ¿Tomar foto en móvil? | Sí |
| C1.20 [F] | ¿Cuándo validar? | onBlur |
| C1.21 [T] | ¿Validar al Continuar? | V1: Errores arriba, V2: Scroll al primero, V3: Shake campos |
| C1.22 [F] | ¿Checkmark en válidos? | Sí, sutil |
| C1.23 [T] | ¿Posición error? | V1: Debajo, V2: Tooltip, V3: Resumen + inline |
| C1.24 [T] | ¿Estilo error? | V1: Borde rojo, V2: + fondo, V3: Solo mensaje |
| C1.25 [F] | ¿Mensaje técnico o amigable? | Amigable: "Este número no parece correcto" |
| C1.26 [F] | ¿Explicar cómo corregir? | Sí: "Ingresa 8 dígitos sin espacios" |
| C1.27 [F] | ¿Iconos de ayuda? | Solo en campos que generan dudas |
| C1.28 [T] | ¿Tipo de ayuda? | V1: Tooltip hover/click, V2: Texto visible, V3: Link expandible |
| C1.29 [T] | ¿Ejemplos visuales? | V1: Imagen tooltip, V2: Gallery modal, V3: Inline |
| C1.30 [F] | ¿Video tutorial? | No en MVP |

### C.2 Datos Personales (13 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| C2.1 [T] | ¿Animación búsqueda DNI? | V1: Skeleton, V2: Spinner + mensaje, V3: Progress bar |
| C2.2 [T] | ¿Animación datos RENIEC? | V1: Fade in juntos, V2: Cascada, V3: Instantáneo |
| C2.3 [F] | ¿Editar datos RENIEC? | No, solo lectura |
| C2.4 [F] | ¿Mostrar fuente datos? | Sí: "Datos obtenidos de RENIEC" |
| C2.5 [F] | ¿Validar celular empieza con 9? | Sí |
| C2.6 [F] | ¿Confirmar email? | No en MVP |
| C2.7 [F] | ¿WhatsApp mismo que celular? | Sí, con checkbox para cambiar |
| C2.8 [T] | ¿Mapa con Google Places? | V1: Mapa pequeño, V2: Modal confirmación, V3: Sin mapa |
| C2.9 [T] | ¿Si no encuentra dirección? | V1: Cambiar a manual, V2: Botón manual, V3: Tooltip |
| C2.10 [F] | ¿Selects ubicación? | 3 selects dependientes (Dpto/Prov/Dist) |
| C2.11 [F] | ¿T&C visible completo? | Link a documento |
| C2.12 [F] | ¿Checkbox separado T&C y Privacy? | Uno solo para ambos |
| C2.13 [T] | ¿T&C en modal o pestaña? | V1: Modal, V2: Nueva pestaña, V3: Expandible |

### C.3 Datos Académicos (14 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| C3.1 [F] | ¿Cuándo mostrar sugerencias? | Después de 2 caracteres |
| C3.2 [F] | ¿Logo en sugerencias? | Sí + tipo (Universidad/Instituto) |
| C3.3 [F] | ¿Sin resultados? | "No encontramos tu institución. Contáctanos." |
| C3.4 [F] | ¿Destacar convenios? | Badge "Convenio" verde |
| C3.5 [F] | ¿Agrupar carreras? | Por facultad si hay muchas |
| C3.6 [F] | ¿Validar ciclo? | Máximo según carrera |
| C3.7 [F] | ¿Explicar ciclo? | Tooltip: "También conocido como semestre" |
| C3.8 [F] | ¿Dónde encontrar código alumno? | Imagen ejemplo por institución |
| C3.9 [F] | ¿Código opcional? | Sí, puede agregar después |
| C3.10 [F] | ¿Pensión rango o exacto? | Rangos predefinidos |
| C3.11 [F] | ¿Campos condicionales beca? | Sí, slide down |
| C3.12 [F] | ¿Ejemplos documentos? | Galería con ejemplos |
| C3.13 [F] | ¿Tamaño máximo archivo? | Prominente: "Máximo 5MB" |
| C3.14 [F] | ¿Error archivo grande? | Amigable con sugerencia |

### C.4 Datos Económicos (15 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| C4.1 [T] | ¿Selector fuente ingreso? | V1: Cards grandes, V2: Radios, V3: Chips |
| C4.2 [T] | ¿Descripción opciones? | V1: Visible, V2: Hover, V3: Sin descripción |
| C4.3 [F] | ¿Iconos por fuente? | Briefcase, Store, Users, Wallet |
| C4.4 [F] | ¿Animación campos condicionales? | Slide down + fade |
| C4.5 [F] | ¿Explicar por qué campos? | "Nos ayuda a evaluar tu solicitud" |
| C4.6 [F] | ¿Autocompletado empleador? | No en MVP |
| C4.7 [F] | ¿Sueldo exacto o rango? | Aproximado con ayuda |
| C4.8 [F] | ¿Explicar bruto vs neto? | Tooltip |
| C4.9 [F] | ¿Explicar RUC? | "Verificamos tu actividad más rápido" |
| C4.10 [F] | ¿Rubro texto o categorías? | Categorías predefinidas |
| C4.11 [T] | ¿Diseño sección familiar? | V1: Card diferente, V2: Título destacado, V3: Mismo estilo |
| C4.12 [F] | ¿Explicar datos familiar? | "Solo contacto si no te ubicamos" |
| C4.13 [F] | ¿Consentimiento familiar? | No en MVP |
| C4.14 [T] | ¿Posición checkbox verificación? | V1: Al final, V2: Tras cada campo, V3: Paso separado |
| C4.15 [F] | ¿Explicar verificación? | "Podemos llamar a tu empleador" |

### C.5 Resumen y Confirmación (20 preguntas)
| ID | Pregunta | Decisión |
|----|----------|----------|
| C5.1 [T] | ¿Layout resumen? | V1: Scroll único, V2: Acordeón, V3: Tabs |
| C5.2 [T] | ¿Tamaño imagen producto? | V1: Grande, V2: Thumbnail, V3: Card hover |
| C5.3 [T] | ¿Datos completos o resumidos? | V1: Completos, V2: Resumidos, V3: Colapsables |
| C5.4 [T] | ¿Botón editar sección? | V1: Visible siempre, V2: Al hover, V3: Link debajo |
| C5.5 [F] | ¿Volver a resumen tras editar? | Sí |
| C5.6 [T] | ¿Formato cronograma? | V1: Tabla, V2: Timeline, V3: Lista |
| C5.7 [T] | ¿Destacar primer/último pago? | V1: Badge, V2: Color, V3: Icono |
| C5.8 [T] | ¿Exportar cronograma? | V1: PDF, V2: Email, V3: Ambos |
| C5.9 [F] | ¿Campo cupón visible? | Colapsado: "¿Tienes un cupón?" |
| C5.10 [F] | ¿Feedback cupón válido? | Checkmark + descuento + nuevo total |
| C5.11 [F] | ¿Feedback cupón inválido? | X roja + mensaje |
| C5.12 [F] | ¿Mapa entrega? | Pequeño de confirmación |
| C5.13 [T] | ¿Fecha estimada? | V1: Rango fechas, V2: Días hábiles, V3: Ambos |
| C5.14 [T] | ¿Texto botón final? | V1: "Enviar solicitud", V2: "Confirmar", V3: "Solicitar mi laptop" |
| C5.15 [F] | ¿Confirmación extra? | No, resumen es confirmación |
| C5.16 [F] | ¿Mostrar key_features? | Sí, top 3 |
| C5.17 [F] | ¿Specs en resumen? | Sí: CPU, RAM, SSD, Pantalla |
| C5.18 [F] | ¿Nombre completo o abreviado? | Completo |
| C5.19 [F] | ¿Indicar Windows/FreeDOS? | Sí |
| C5.20 [T] | ¿Mostrar garantía? | V1: Badge, V2: Texto, V3: Tooltip |

---

## Módulo D-E: Upsell (16 preguntas)

### D. Accesorios
| ID | Pregunta | Decisión |
|----|----------|----------|
| D.1 [T] | ¿Cómo introducir accesorios? | V1: "Complementa", V2: "Recomendados", V3: "También llevan" |
| D.2 [F] | ¿Indicar que son opcionales? | Sí, texto claro |
| D.3 [T] | ¿Tamaño cards? | V1: Uniforme, V2: Variable, V3: Carrusel |
| D.4 [T] | ¿Límite de accesorios? | V1: Sin límite, V2: "Máximo 3", V3: Warning total alto |
| D.5 [T] | ¿Indicar agregado? | V1: Checkmark + borde, V2: Badge, V3: Botón cambia |
| D.6 [T] | ¿Quitar accesorio? | V1: Botón X, V2: Toggle, V3: Click deseleccionar |
| D.7 [F] | ¿Total tiempo real? | Sí, con animación |
| D.8 [T] | ¿Mostrar desglose? | V1: Siempre visible, V2: Hover, V3: "Ver desglose" |

### E. Seguros
| ID | Pregunta | Decisión |
|----|----------|----------|
| E.1 [T] | ¿Framing seguros? | V1: "Protege", V2: "Tranquilidad", V3: "Seguro contra" |
| E.2 [T] | ¿Iconografía? | V1: Escudo, V2: Paraguas, V3: Candado |
| E.3 [T] | ¿Comparar planes? | V1: Cards, V2: Tabla, V3: Slider |
| E.4 [T] | ¿Destacar recomendado? | V1: Badge, V2: Card grande, V3: Preseleccionado |
| E.5 [T] | ¿Mostrar coberturas? | V1: Checks/X, V2: Tabs, V3: Hover |
| E.6 [F] | ¿Ejemplos situaciones? | Sí con ilustración |
| E.7 [T] | ¿Modal sin seguro? | V1: Persuasivo, V2: Neutral, V3: Última oferta |
| E.8 [T] | ¿Botones modal? | V1: Simétricos, V2: Destacar agregar, V3: Sin como link |

---

## Módulo F: Aprobación (13 preguntas)

| ID | Pregunta | Decisión |
|----|----------|----------|
| F.1 [T] | ¿Elementos celebración? | V1: Confetti + ilustración, V2: Solo ilustración, V3: Checkmark animado |
| F.2 [T] | ¿Intensidad confetti? | V1: Exuberante, V2: Sutil, V3: Sin confetti |
| F.3 [T] | ¿Sonido celebración? | V1: Por defecto, V2: Sin sonido, V3: Activar manual |
| F.4 [F] | ¿Tono mensaje? | Celebratorio: "¡Felicidades!" |
| F.5 [F] | ¿Personalizar con nombre? | Sí |
| F.6 [F] | ¿Mostrar # solicitud? | Sí, prominente |
| F.7 [T] | ¿Resumen producto? | V1: Card completa, V2: Solo texto, V3: Expandible |
| F.8 [F] | ¿Visualizar próximos pasos? | Timeline o checklist |
| F.9 [T] | ¿Tiempo estimado respuesta? | V1: "24-48 horas", V2: "Hoy o mañana", V3: Countdown |
| F.10 [F] | ¿Canales notificación? | "WhatsApp y correo" |
| F.11 [F] | ¿Promover cuenta Zona Estudiantes? | CTA secundario |
| F.12 [T] | ¿Compartir en redes? | V1: Prominente, V2: Link sutil, V3: No |
| F.13 [T] | ¿Pedir referidos? | V1: Prominente, V2: Sutil, V3: Otro momento |

---

## Módulo G: Rechazo (19 preguntas)

| ID | Pregunta | Decisión |
|----|----------|----------|
| G.1 [T] | ¿Colores? | V1: Neutros, V2: Cálidos, V3: Marca suavizada |
| G.2 [T] | ¿Ilustración? | V1: Persona reflexiva, V2: Camino bifurcación, V3: Sin ilustración |
| G.3 [T] | ¿Branding? | V1: Minimalista, V2: Completo, V3: Solo logo |
| G.4 [F] | ¿Palabra para rechazo? | **NUNCA "rechazado"**. Usar: "En este momento no podemos aprobar" |
| G.5 [T] | ¿Personalizar con nombre? | V1: Sí, V2: No, V3: Si mejora tono |
| G.6 [F] | ¿Agradecer tiempo? | Sí |
| G.7 [F] | ¿Dar razón? | General sin detalles específicos |
| G.8 [T] | ¿Nivel detalle? | V1: General, V2: Categoría, V3: Accionable |
| G.9 [T] | ¿Framing? | V1: "Qué puedes hacer", V2: Neutral, V3: Razones claras |
| G.10 [T] | ¿Alternativas como? | V1: Cards, V2: Lista, V3: Acordeón |
| G.11 [T] | ¿Productos alternativos? | V1: Cards imagen, V2: Lista precio, V3: Solo mención |
| G.12 [T] | ¿Calculadora enganche? | V1: Interactiva, V2: Ejemplos fijos, V3: Link |
| G.13 [F] | ¿Explicar codeudor? | Ilustración 2 personas |
| G.14 [T] | ¿Capturar email? | V1: Prominente, V2: Checkbox, V3: No pedir |
| G.15 [F] | ¿Contenido educativo? | Link a "Cómo mejorar perfil" |
| G.16 [T] | ¿Cuándo reintentar? | V1: Fecha específica, V2: "En unos meses", V3: No mencionar |
| G.17 [T] | ¿Ofrecer asesor? | V1: CTA prominente, V2: Link, V3: Solo info contacto |
| G.18 [F] | ¿Canal contacto? | WhatsApp primario |
| G.19 [T] | ¿Asesor puede ayudar? | V1: Sí explícito, V2: Neutral, V3: Sin falsas expectativas |
