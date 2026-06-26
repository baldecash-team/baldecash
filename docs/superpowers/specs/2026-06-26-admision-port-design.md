# Port del flujo de Admisión a baldecash (Next.js) + Mejoras de UI

> Fecha: 2026-06-26 · Origen: `D:\repos\automatizacion-admision` (Vite + React + HeroUI)
> Destino: `baldecash` `src/app/prototipos/0.6/admision/` (Next.js App Router)

## Objetivo

Portar **toda la lógica implementada** del repo de automatización de admisión —verificación
OTP de correo y autoservicio de video— a baldecash usando Next.js, e incorporar **10 mejoras de UI**
identificadas. No se hace push (entrega local).

## Alcance

**Se porta (lo que existe como código en el repo fuente):**
- **OTP de correo** (modo token vía link + modo DNI como fallback): enviar código, validar, reenviar con cooldown.
- **Autoservicio de video**: intro → 3 preguntas → grabar (MediaRecorder) o subir archivo → upload directo a S3 (presigned PUT) → confirm → complete.
- **Validación de link** y pantallas de estado (loading / inválido / expirado / revocado / consumido / éxito).

**Fuera de alcance:** F0–F5 del `spec_endpoints_admision_v2.md` (motor de decisión, filtros, upsell, etc.) — son endpoints `🔵 nuevos a construir`, no implementados como código.

## Arquitectura

### Ubicación
```
src/app/prototipos/0.6/admision/
  validar-correo/[token]/page.tsx        # server → render client OtpScreen(token)
  validacion-laboral/[token]/page.tsx    # server → render client VideoFlow(token)
  _components/
    PhoneFrame.tsx  BaldeCashLogo.tsx  OtpField.tsx  OtpScreen.tsx
    VideoFlow.tsx  VideoRecorder.tsx  VideoIntro.tsx  VideoConfirm.tsx
    LinkScreens.tsx  SuccessScreen.tsx  AdvisorButton.tsx  ExampleModal.tsx
  _hooks/useRecorder.ts
  _lib/
    api/{client,verification,links,mock,types}.ts
    config.ts  upload.ts  videoTypes.ts  errors.ts  events.ts
```

### Stack / mapeo
- Componentes `'use client'` en **Tailwind puro** (el original casi no usa HeroUI; solo `HeroUIProvider`). Sin dependencia NextUI.
- Tokens del original (`ink`, `slate`, `line`, `primary`, `red`, `green`, `tertiary`, `font-display`) → constantes/clases con la paleta de marca (**primary #4654CD**). Se definen una vez en `admision/_components/tokens` (o vía clases arbitrarias Tailwind).
- `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`. Reusar `NEXT_PUBLIC_API_URL` (`https://api.baldecash.com/api/v1`). Modo `mock|live` vía `NEXT_PUBLIC_ADMISSION_API_MODE` (default `live`; `mock` para dev, código de prueba `482916`).
- `client.ts` con `fetch` + timeout 10s + parsing de `detail.message`/`detail.reason` (idéntico al original).

### Contratos backend (públicos, sin Bearer)
- `GET  /public/links/{token}` → validación de link (`purpose`, `context.document_type_codes`, etc.)
- `POST /public/links/{token}/email/{send,verify,status}` — OTP por token
- `POST /public/email-verification/{send,verify,status}` — OTP por DNI (fallback)
- `POST /public/links/{token}/upload-url` · `/confirm` · `/complete` — video
- `PUT {upload_url}` — subida directa a S3 (XHR con progreso)
- `POST /public/events/batch` — eventos (reuso `eventsApi`)

## Las 10 mejoras de UI

1. **+2. Código directo (sin paso previo).** Al abrir el link de correo se **auto-envía** el código y se aterriza directo en el campo OTP. Se elimina el estado `cta`. El cooldown del reenvío se inicializa en silencio. (El envío no tiene costo variable → inmediato.)
3. **Errores más amigables.** Módulo `errors.ts` con mapa de mensajes cálidos por `reason`/`code` (`network`, `cooldown`, `invalid_code`, `expired`, `revoked`, etc.). Reemplaza los strings crudos del BE.
4. **Máx. 3 intentos.** Copy alineado a 3 ("te quedan N de 3 intentos"); el conteo real lo controla el BE (se muestra `attempts_used`/mensaje).
5. **Correo institucional + ejemplo.** Copy: "tu **correo institucional** (ej: usuario@universidad.edu.pe)".
6. **Validación laboral personalizada con nombre.** Se lee el nombre desde `linkValidation.context` (campo BE, ej. `applicant_name` / `first_name`); header/ilustración personalizada ("Hola, {nombre}"). Fallback neutro si el campo no viene.
7. **"Habla con un asesor" → Blip/WhatsApp.** Constante `BLIP_ADVISOR_URL = "https://api.whatsapp.com/send/?phone=51959324808&text&type=phone_number&app_absent=0"`. El botón abre el enlace en pestaña nueva. Aparece en el flujo de video (capture + manual).
8. **"Ver ejemplo" por pregunta.** Botón en cada pregunta de video que abre `ExampleModal` con **texto guía** por pregunta (placeholder editable; sin video). Contenido configurable junto a `BUSINESS_QUESTIONS`.
9. **Logo SVG.** Componente `BaldeCashLogo` (SVG vectorial de marca, generado) reemplaza el PNG `company/logo.png` en `PhoneFrame` y demás flujos.
10. **Eventos por link/etapa + tiempo.** `events.ts` envuelve `sendEventsBatch` y emite, con el **token como id de link**: `admission_link_open`, `admission_stage_enter`, `admission_stage_exit` (con `stage` + `duration_ms`), `admission_completed`. Nuevos `EventType` en `eventsApi.ts`. Fire-and-forget; nunca rompe el flujo.

## Flujo de datos

**OTP (token):** page valida link → si `email_validation` y no verificado: auto-`send` → estado `code` (campo OTP) → `verify` → `confirmed`. Reenvío con cooldown 60s (o el que indique `reason:cooldown`).

**Video:** page valida link (`video_validation`, `document_type_codes`) → `intro` → por cada pregunta: `capture` (grabar/subir) → `uploading` (PUT S3 con %) → siguiente o `completing` → `complete` → `confirmed`. Permiso de cámara se reutiliza entre clips. Fallback a subida de archivo si no hay cámara/permiso.

## Manejo de errores
- Red/timeout → mensaje amigable + permitir reintento (no se pierde el estado).
- `cooldown` → no es error: inicia contador y muestra campo de código.
- Código inválido → limpia el campo, muestra intentos restantes.
- Upload/confirm/complete fallidos → vuelve a `capture` con mensaje claro.
- Link inválido → `LinkScreens` ramifica por `reason`.

## Testing
- Unit (vitest/RTL ya en baldecash): `OtpField` (auto-avance, paste, backspace), `errors.ts` (mapa), `useRecorder` (mime/getFile), `events.ts` (forma del payload).
- Smoke manual con `mock` mode (tokens `demo-email-token`, `demo-video-token`, `demo-expired-token`, …; código `482916`).

## Dependencias / decisiones confirmadas
- #6 nombre: desde `context` del link (BE).
- #7 Blip: `https://api.whatsapp.com/send/?phone=51959324808&...`.
- #8 ejemplo: modal con texto guía (placeholder).
- #9 logo: SVG generado de BaldeCash.
- No push (entrega local).
