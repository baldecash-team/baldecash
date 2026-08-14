# JuicyScore — integración antifraude

Referencia: *JuicyScore APIv17 Description (v18.15.0)*.

JuicyScore evalúa riesgo de fraude a partir de señales del dispositivo y la
conexión, sin datos personales. La integración tiene dos etapas:

1. **Frontend (este repo):** el pixel `js.js` recolecta datos y emite un
   `session_id`.
2. **Backend (ws2):** llamada `GetScore` server-to-server usando ese
   `session_id`, que devuelve el score y el vector de predictores.

Este documento cubre la etapa 1 y deja escrito el contrato que necesita ws2.

---

## Configuración

Dos variables de entorno. **Sin `NEXT_PUBLIC_JUICYSCORE_API_KEY` la integración
está apagada por completo**: no se inyecta script, no se toca `window` y el
payload del submit viaja idéntico a como viajaba antes.

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_JUICYSCORE_API_KEY` | `Raw_Data_ApiKey_Token`. 28 caracteres en TEST, 24 en PROD. |
| `NEXT_PUBLIC_JUICYSCORE_HOST` | TEST `https://sandbox.jcsc.dev` · PROD `https://score.jcsc.online` |

El token se genera en <https://portal.jcsc.online> (login en `/authlogin/`),
sección **Data Auth Session**.

### El campo "Domain" del panel

Va el **origen donde se carga el pixel**, o sea el dominio que sirve esta app
Next — no el de JuicyScore ni el de nuestra API. Con esquema, sin ruta ni slash
final: `https://baldecash.com`.

JuicyScore compara ese valor contra el header `Referer` que manda el navegador;
si no coincide, responde **403 Incorrect referrer**. Cada dominio o subdominio
es una fuente distinta y necesita su propio token (hasta 10). Si se va a probar
en los previews de Vercel, ese dominio necesita un token propio.

Para rotar un token: crear el nuevo, verificar que ya esté llegando data con él,
y recién ahí borrar el viejo. Borrar llaves pide 3FA en el panel.

---

## Qué hace el frontend

**`services/juicyScore.ts`** — toda la lógica, sin React:

- `loadJuicyPixel()` inyecta `js.js?apiKey=…&sessionGen=1` una sola vez por
  documento. No usa `next/script` a propósito: `window.juicyLabConfig` tiene que
  existir antes de que `js.js` ejecute, y con dos `<Script>` el orden no está
  garantizado.
- `captureJuicySessionId(landing)` espera a que el pixel publique su API
  (sondeo, tope 5s como recomienda la doc), llama `getSessionId()` y persiste el
  resultado en `sessionStorage` bajo `baldecash-<landing>-juicy-session`.
- `markJuicyComplete()` marca el fin del formulario.
- `restartJuicySession(landing)` genera una sesión nueva después de enviar.

**`components/tracking/JuicyScorePixel.tsx`** — monta el pixel y dispara la
captura. Vive en el layout de `[landing]/solicitar`, no en el de `[landing]`:
la doc recomienda instalar el pixel donde el usuario pasa más tiempo y tipea,
y el catálogo solo agregaría sesiones que nunca llegan a solicitud.

**`useSubmitApplication`** — al enviar: `markJuicyComplete()`, lee el
`session_id` guardado y lo adjunta al payload. Tras un envío exitoso llama
`restartJuicySession`.

### Decisiones que conviene no revertir sin leer la doc

- **Sin selectores de botones.** La config de JuicyScore acepta `nextButton` /
  `completeButton` / `stopPingButton` por id o clase, pero prohíbe selectores
  compuestos, y los botones del wizard cambian por paso. La vía soportada para
  SPAs es emular el click sobre `jslabApi.manuallyComplete` (§2.1.4), que es lo
  que hace `markJuicyComplete()`.
- **`restart()` después del submit.** El wizard se resetea sin recargar la
  página, así que el pixel conserva su sesión: sin `restart()`, una segunda
  solicitud en la misma pestaña viajaría con el `session_id` de la primera.
- **Nada bloquea el envío.** Adblocker, CDN caído, `sessionStorage` deshabilitado
  en WebKit sandboxeado: todos los caminos devuelven `null` y la solicitud sale
  igual, sin el campo.
- **`Referrer-Policy: strict-origin-when-cross-origin`** declarado en
  `next.config.ts`. Es el default de los navegadores modernos, pero la doc pide
  configurarlo explícitamente porque de él depende la validación del token.

---

## Contrato con el backend (ws2)

El submit (`POST /public/form/submit`, campo `form_data` del multipart) incluye
una clave nueva **solo cuando el pixel emitió sesión**:

```json
{
  "session_uuid": "…",
  "form_data": { },
  "product_data": { },
  "juicyscore_session_id": "w.20260813…A_GS"
}
```

Con ese id, ws2 arma el `GetScore` (`POST https://api.jcsc.dev/getscore/` en
test, `https://api.jcsc.online/getscore/` en prod, header
`session: <GetScore_token>`):

| Campo | Valor |
|---|---|
| `account_id` | usuario de la cuenta |
| `client_id` | **hash** del id interno de la persona con salt — la doc pide explícitamente que no sea un identificador directo |
| `session_id` | el `juicyscore_session_id` recibido |
| `channel` | `SITE` |
| `version` | `17` |
| `time_utc3` | fecha de la solicitud en UTC+3, formato `DD.MM.YYYY HH24:MM:SS` (tolerancia ±65 min contra el reloj del servidor) |
| `referrer`, `tenor`, `ip`, `useragent`, `ph_country`, `phone`, `application_id`, `amount` | opcionales pero recomendados; `ip` va sin el último octeto |

Notas de operación: el `session_id` vive 30 días (después el GetScore devuelve
410), el rate limit es 15 req/s, y el `session_id` debe guardarse también
después de recibir la respuesta.

Fuera del alcance de este repo: la llamada `GetScore`, el hash de `client_id` y
el procesamiento del vector de respuesta.

---

## Verificación

1. Configurar `NEXT_PUBLIC_JUICYSCORE_API_KEY` con el token de test y levantar
   el wizard.
2. DevTools → Network: debe cargar `sandbox.jcsc.dev/static/js.js` con 200. Un
   **401** significa token del entorno equivocado; un **403**, dominio no
   registrado para ese token.
3. Consola: `sessionStorage.getItem('baldecash-<landing>-juicy-session')` debe
   devolver un id que empieza con `w.`.
4. Enviar una solicitud y confirmar que `juicyscore_session_id` viaja en el
   payload.

Pendiente opcional: los **Client Hints** (`accept-ch` + `permissions-policy`)
mejoran la precisión del scoring, pero tocan headers globales y la propia doc
advierte que pueden romper otras integraciones que usen los mismos headers.
