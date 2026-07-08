# Ralph Loop — Rediseño flujo de oferta (BAL-2183)

> Cómo usar (cuando lo apruebes):
> `/ralph-loop "PEGA_EL_PROMPT_DE_ABAJO" --max-iterations 30 --completion-promise "COMPLETE"`
> Una fase por loop (o el flujo completo si prefieres un solo loop largo).
> Reglas de oro: criterios de "listo" concretos · pruebas incluidas · nunca BD de prod en el loop.

---

## PROMPT (revisar antes de correr)

```
OBJETIVO
Rediseñar visualmente el flujo de oferta condicional (Caso 4 downgrade / Caso 5 upsell) en el frontend público, según los mocks de Claude Design. Son 3 pantallas: index de oferta, accesorios/seguros, y confirmación. LA FUNCIONALIDAD NO CAMBIA — solo el aspecto visual. El backend NO se toca.

CONTEXTO
- Proyecto: baldecash (frontend público, Next.js 16 + React 19 + Tailwind 4).
- Rama: feat/rediseno-flujo-oferta (ya creada). Trabajar SOLO ahí.
- Zona: src/app/prototipos/0.6/oferta/[token]/ (index, accesorios, confirmación, catálogo DE LA OFERTA).
- Spec: docs/superpowers/specs/2026-07-08-rediseno-flujo-oferta-design.md
- Plan detallado (13 tasks, 3 fases): docs/superpowers/plans/2026-07-08-rediseno-flujo-oferta.md
- Backend local: ws2 en un puerto propio (código de main, tiene BAL-2180). Frontend apunta ahí vía NEXT_PUBLIC_API_URL.

REQUISITOS (qué debe hacer)
1. FASE 1 — Index: pantalla scrolleable sin tabs. Header logo bicolor + "Hola [nombre]" + badge "Aprobada" + monto héroe (S/X/mes) + copy cálido + chip prueba social.
   - Caso 4 (downgrade): aviso ámbar empático + card verde "APROBADO PARA TI" (equipo recomendado del nodo) + "Ver otros equipos".
   - Caso 5 (upsell): card destacada del equipo mejor + "Continuar con mi equipo" (siempre visible) + "Ver catálogo".
   - QUITAR del catálogo de oferta: botón "¿Necesitas ayuda?" y modal/tour "eres nuevo" (useOfferTour).
2. FASE 2 — Accesorios/seguros: card equipo + sección "Incluidos gratis" (combo, arriba) + "Recomendado" (primer item del API) + "Tus extras" (con quitar) + cuota sticky. Bottom sheet buscador (chips categoría + búsqueda + grid 2-col) + detalle de accesorio (foto, marca, descripción).
3. FASE 3 — Confirmación: modal preconfirmación (con "REGALO POR TU COMBO") → modal éxito "¡Listo!" → página de estado ("¡Felicidades!" + comparación equipo anterior→nuevo + "TU PEDIDO INCLUYE").

RESTRICCIONES (obligatorio respetar)
- Sistema visual EXACTO de los mocks: Baloo 2 + Asap (nueva), índigo #4F46E5, verde #22C55E/#16A34A, teal #12B3A6, lila #EEF1FF, gris #F7F8FB, verde suave #E8F8EF, ámbar #FEF3E2, bordes #E7E9F0. Cards radius 16-40px, bottom sheets, cuota sticky, mobile-first 390px.
- Español latino con tildes. Iconos lucide-react o SVG inline. NO emojis.
- NO tocar: backend (ws2), catálogo general ([landing]/catalogo/), detalle de producto.
- NO cambiar la lógica de negocio: selección (consume link, sync legacy), cálculo de cuota, combo gratis (BAL-2159/2162), recomendado del nodo (BAL-2180), confirmación WhatsApp. Solo re-presentar la UI que la dispara.
- Los datos YA existen en los endpoints (getOffer, getOfferAddonsRich con description/brand/category/coverage/isRecommended, select_equipment). NO agregar endpoints ni tocar el API.
- Correr `npx tsc --noEmit` antes de dar por terminada cada fase. NO correr `npm run build` (poca RAM).
- NO apuntar a BD de producción. Solo BD local para emitir ofertas de prueba.

CRITERIOS DE "LISTO" (cómo sabemos que está al 100%)
- [ ] FASE 1: el index Caso 4 muestra el recomendado del nodo + "ver otros" + sin ayuda/tour; Caso 5 muestra equipo mejor + "continuar con mi equipo" + catálogo. Elegir equipo desde el index sigue funcionando.
- [ ] FASE 2: accesorios muestra "incluidos gratis" (combo), recomendado (primer item), buscador con categorías + grid + detalle; la cuota sticky recalcula al agregar/quitar; el threshold "solo lo que entra en tu cuota" funciona.
- [ ] FASE 3: modal preconfirmación con regalos → éxito → página estado con comparación anterior→nuevo y "tu pedido incluye" (con gratis del combo).
- [ ] Funcionalidad idéntica: flujo completo Caso 4 y Caso 5 probado E2E en local (emitir → index → elegir → accesorios → confirmar → éxito → estado).
- [ ] TypeScript compila sin errores (npx tsc --noEmit).
- [ ] Sistema visual fiel a los mocks (colores/fuentes/formas).
- [ ] Backend, catálogo general y detalle NO tocados (git diff solo en oferta/[token]/).

FLUJO DE TRABAJO (cómo iterar)
1. Lee el plan (docs/superpowers/plans/2026-07-08-rediseno-flujo-oferta.md) y sigue las tasks en orden.
2. Por cada componente: crea el componente presentacional según el mock, conéctalo a la lógica/datos existentes (sin cambiarla).
3. Corre `npx tsc --noEmit` tras cada task.
4. Al cerrar cada fase, emite una oferta de prueba en local (Caso 4 y Caso 5) y verifica el criterio de "listo" de esa fase.
5. Si algo falla, lee el error, arréglalo, repite.
6. Solo cuando TODOS los criterios de "listo" estén ✓:
   Output <promise>COMPLETE</promise>

SI TE ATASCAS
Después de ~20 iteraciones sin completar:
- Documenta qué te bloquea (ej. un dato que el API no expone, un handler que no encaja).
- Lista qué intentaste.
- Sugiere enfoques alternativos.
- NO sigas iterando en círculos.
```

---

## Notas para Emilio (revisar antes de correr)
- **1 loop por fase** (recomendado): correr el loop 3 veces, una por fase, revisando entre cada una. Más control visual.
- **1 loop completo:** correr todo de una con `--max-iterations 40`. Más autónomo, menos checkpoints.
- Alternativa a Ralph Loop: **subagent-driven-development** (lo que venimos usando) — un subagente por task, review entre tasks. Más granular y con mi supervisión.
- **Verificación visual:** el loop verifica tsc + E2E de datos, pero la fidelidad visual al mock la confirmas tú en el navegador (o con Playwright si lo reconectas).
- Puntos menores del spec sin cerrar: valor del chip de prueba social (fijo o métrica) y cómo cargar Asap (Google Fonts vs self-host) — el loop puede asumir defaults (fijo "+5,000" y Google Fonts) o los defines antes.
