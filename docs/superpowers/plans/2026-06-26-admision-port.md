# Port del flujo de Admisión — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar el flujo de admisión (OTP correo + autoservicio de video) de `automatizacion-admision` (Vite/React) a baldecash (Next.js) bajo `src/app/prototipos/0.6/admision/`, con 10 mejoras de UI.

**Architecture:** Componentes `'use client'` en Tailwind puro (fieles al original, sin NextUI). Capa API pública (fetch directo a FastAPI, sin Bearer) con modo `mock|live`. Eventos por link reusando `eventsApi.sendEventsBatch`.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind, TypeScript, MediaRecorder API, XHR upload a S3 presigned.

## Global Constraints

- Idioma UI: español latino con tildes.
- Paleta: primary `#4654CD`. Tokens del original mapeados: `ink #1f2937`, `slate #6b7280`, `line #e5e7eb`, `red #ef4444`, `green #16a34a`, `tertiary #f59e0b`.
- Env: `process.env.NEXT_PUBLIC_API_URL` (default `https://api.baldecash.com/api/v1`), `process.env.NEXT_PUBLIC_ADMISSION_API_MODE` (`mock|live`, default `live`).
- No emojis en UI (lucide o SVG inline). No push (entrega local).
- Blip: `https://api.whatsapp.com/send/?phone=51959324808&text&type=phone_number&app_absent=0`.
- Código mock de prueba: `482916`.

---

## File Structure

```
src/app/prototipos/0.6/admision/
  validar-correo/[token]/page.tsx
  validacion-laboral/[token]/page.tsx
  _components/{tokens.ts,BaldeCashLogo.tsx,PhoneFrame.tsx,SuccessScreen.tsx,LinkScreens.tsx,
              OtpField.tsx,OtpScreen.tsx,VideoIntro.tsx,VideoConfirm.tsx,VideoRecorder.tsx,
              VideoFlow.tsx,ExampleModal.tsx,AdvisorButton.tsx}
  _hooks/useRecorder.ts
  _lib/{config.ts,upload.ts,videoTypes.ts,errors.ts,events.ts,api/{client.ts,types.ts,verification.ts,links.ts,mock.ts}}
src/app/prototipos/0.6/services/eventsApi.ts   # MODIFY: add admission EventType values
```

---

### Task 1: Base — tokens, config, logo SVG (#9), errores (#3)

**Files:**
- Create: `admision/_components/tokens.ts`, `admision/_components/BaldeCashLogo.tsx`, `admision/_lib/config.ts`, `admision/_lib/errors.ts`
- Test: `admision/_lib/__tests__/errors.test.ts`

**Interfaces:**
- Produces: `TOKENS` (record de hex), `<BaldeCashLogo className?/>`, `config { apiBaseUrl, apiMode }`, `friendlyError(e:{code?,reason?,message?}):string`, `attemptsCopy(used?:number):string`.

- [ ] **Step 1 — tokens.ts:** exportar `export const TOKENS = { primary:'#4654CD', ink:'#1f2937', slate:'#6b7280', line:'#e5e7eb', red:'#ef4444', green:'#16a34a', tertiary:'#f59e0b', primarySoft:'#ECECFB' } as const;` Las clases Tailwind del original (`text-ink`, `bg-primary`, …) se reemplazan en cada componente por estilos arbitrarios `text-[#1f2937]`/`bg-[#4654CD]` o `style`. (Decisión: usar clases arbitrarias para no tocar `tailwind.config`.)
- [ ] **Step 2 — config.ts:** `export const config = { apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'https://api.baldecash.com/api/v1', apiMode: (process.env.NEXT_PUBLIC_ADMISSION_API_MODE ?? 'live') as 'mock'|'live' };`
- [ ] **Step 3 — BaldeCashLogo.tsx:** componente SVG vectorial de marca (wordmark "baldecash" en #4654CD + isotipo de balde simple), `viewBox` proporcional, `className` para alto. `'use client'` no necesario (puro SVG).
- [ ] **Step 4 — errors.test.ts (falla):** casos: `friendlyError({code:'network'})` → "No pudimos conectarnos…"; `friendlyError({reason:'invalid_code'})` → contiene "código"; `friendlyError({reason:'cooldown',message:'... 45s'})` → maneja cooldown; default usa `message`. `attemptsCopy(1)` contiene "3".
- [ ] **Step 5 — errors.ts:** mapa por `reason`/`code` con copy cálido (network, timeout, cooldown, invalid_code, expired, revoked, purpose_mismatch, invalid, default→message). `attemptsCopy` arma "te quedan N de 3 intentos" (#4).
- [ ] **Step 6 — run** `npx vitest run admision/_lib/__tests__/errors.test.ts` → PASS.
- [ ] **Step 7 — commit** `feat(admision): tokens, config, logo SVG y mensajes de error amigables`.

---

### Task 2: Capa API + eventos (#10)

**Files:**
- Create: `admision/_lib/api/{client.ts,types.ts,verification.ts,links.ts,mock.ts}`, `admision/_lib/events.ts`
- Modify: `src/app/prototipos/0.6/services/eventsApi.ts` (añadir EventType)
- Test: `admision/_lib/__tests__/events.test.ts`

**Interfaces:**
- Produces: `apiFetch`, `ApiResult<T>`; `types.ts` (SendEmailResp, VerifyEmailResp, EmailStatusResp, LinkValidation, UploadUrlResp, ConfirmResp, CompleteResp — `LinkValidation.context` extendido con `applicant_name?:string`); `verification.ts` (sendEmailVerification, verifyEmailCode, getEmailStatus); `links.ts` (validateLink, requestUploadUrl, confirmUpload, completeLink, sendEmailByToken, verifyEmailByToken, emailStatusByToken); `mock`; `events.ts` → `admissionEvents(token)` con `.linkOpen()`, `.stageEnter(stage)`, `.stageExit(stage)`, `.completed()`.

- [ ] **Step 1 — port client.ts/types.ts/verification.ts/links.ts/mock.ts** verbatim del source con: `import.meta.env`→`process.env`, importar `config` local. Extender `LinkValidation.context` con `applicant_name?: string` (#6). `mock.validateLink('demo-video-token')` agrega `applicant_name:'Juan'` al context.
- [ ] **Step 2 — eventsApi.ts (MODIFY):** añadir al union `EventType`: `'admission_link_open' | 'admission_stage_enter' | 'admission_stage_exit' | 'admission_completed'`.
- [ ] **Step 3 — events.test.ts (falla):** `admissionEvents('tok').stageExit('code')` produce un evento `admission_stage_exit` con `properties.token==='tok'`, `properties.stage==='code'` y `duration_ms` numérico ≥0; verifica que `stageEnter` antes de `stageExit` calcula duración.
- [ ] **Step 4 — events.ts:** factory que mantiene un mapa `stage→enterTs`; cada método arma `TrackingEvent` y llama `sendEventsBatch(token, [evt])` (token como session_id de link). Fire-and-forget. `client_ts=Date.now()`, `page_url=location.href`.
- [ ] **Step 5 — run** `npx vitest run admision/_lib/__tests__/events.test.ts` → PASS.
- [ ] **Step 6 — commit** `feat(admision): capa API pública + eventos por link/etapa`.

---

### Task 3: PhoneFrame, SuccessScreen, LinkScreens

**Files:** Create `admision/_components/{PhoneFrame.tsx,SuccessScreen.tsx,LinkScreens.tsx}`

**Interfaces:**
- Produces: `<PhoneFrame title?>`, `<SuccessScreen title message whatsapp?>`, `<LinkLoading/>`, `<LinkStatus reason consumedTitle? consumedMessage? consumedWhatsapp?>`.

- [ ] **Step 1 — PhoneFrame.tsx:** port; reemplaza `<img src=logo.png>` por `<BaldeCashLogo className="h-7 w-auto"/>` (#9). Clases de token → arbitrarias.
- [ ] **Step 2 — SuccessScreen.tsx:** port verbatim (clases → arbitrarias). Mantiene badge WhatsApp.
- [ ] **Step 3 — LinkScreens.tsx:** port `LinkLoading` + `LinkStatus` (variants por reason). Clases → arbitrarias.
- [ ] **Step 4 — verify** `npx tsc --noEmit` (sin errores nuevos en admision).
- [ ] **Step 5 — commit** `feat(admision): PhoneFrame, SuccessScreen y pantallas de link`.

---

### Task 4: OtpField + OtpScreen (mejoras #1,2,3,4,5) + ruta correo

**Files:**
- Create: `admision/_components/{OtpField.tsx,OtpScreen.tsx}`, `admision/validar-correo/[token]/page.tsx`
- Test: `admision/_components/__tests__/OtpField.test.tsx`

**Interfaces:**
- Consumes: verification/links API, `friendlyError`, `attemptsCopy`, `admissionEvents`, `PhoneFrame`, `OtpField`.
- Produces: `<OtpField length? value onChange>`, `<OtpScreen token? applicationId? initialVerified? onConfirmed?>`.

- [ ] **Step 1 — OtpField.test.tsx (falla):** escribir dígito avanza foco; paste de "123456" llena 6; backspace en vacío retrocede.
- [ ] **Step 2 — OtpField.tsx:** port verbatim (clases → arbitrarias).
- [ ] **Step 3 — run** OtpField test → PASS.
- [ ] **Step 4 — OtpScreen.tsx:** port con cambios:
  - **(#1/#2)** Eliminar estado `cta`. En modo token, `useEffect` al montar (si `!initialVerified`) llama `handleSendByToken()` y entra a `code`; mientras tanto estado `sending` con spinner. Si `cooldown`, idem (muestra code).
  - **(#3)** Todos los `setError(result.error.message)` → `setError(friendlyError(result.error))`; mensajes de "no verificado" más cálidos.
  - **(#4)** Bajo el botón Validar, mostrar `attemptsCopy()` cuando hay error de código.
  - **(#5)** Copy del estado `code`/`dni`: "tu **correo institucional** (ej: usuario@universidad.edu.pe)".
  - **(#10)** `admissionEvents(token)`: `stageEnter('email_send')` / `stageEnter('code')` / `stageExit` / `completed()` en `confirmed`.
- [ ] **Step 5 — page.tsx:** server component lee `params.token`, valida link (client wrapper). Patrón: client component `ValidarCorreoClient` que replica `ValidarCorreo.tsx` (loading/invalid/valid → OtpScreen). `consumedTitle="¡Correo confirmado!"`.
- [ ] **Step 6 — verify** `npx tsc --noEmit` + smoke mock (`/prototipos/0.6/admision/validar-correo/demo-email-token`).
- [ ] **Step 7 — commit** `feat(admision): OTP de correo con código directo, errores amigables y 3 intentos`.

---

### Task 5: useRecorder + upload + videoTypes

**Files:** Create `admision/_hooks/useRecorder.ts`, `admision/_lib/{upload.ts,videoTypes.ts}`

**Interfaces:**
- Produces: `useRecorder():UseRecorderReturn`, `uploadFile(url,file,ct,onProgress?)`, `isAllowedVideoType`, `baseContentType`, `ALLOWED_VIDEO_TYPES`.

- [ ] **Step 1 — videoTypes.ts:** port verbatim.
- [ ] **Step 2 — upload.ts:** port verbatim (XHR PUT con progreso; `mock://` → 100%).
- [ ] **Step 3 — useRecorder.ts:** port verbatim (MediaRecorder, refs, cleanup). Añadir guard `typeof window` para SSR safety en `detectRecordingSupport` (ya lo tiene).
- [ ] **Step 4 — verify** `npx tsc --noEmit`.
- [ ] **Step 5 — commit** `feat(admision): hook de grabación, upload S3 y tipos de video`.

---

### Task 6: VideoRecorder + ExampleModal (#8) + AdvisorButton (#7)

**Files:** Create `admision/_components/{ExampleModal.tsx,AdvisorButton.tsx,VideoRecorder.tsx}`

**Interfaces:**
- Consumes: `useRecorder`, `isAllowedVideoType`, `baseContentType`.
- Produces: `<AdvisorButton variant?>`, `<ExampleModal open onClose title text>`, `<VideoRecorder question exampleText index total onCaptured onError autoStart? onCameraReady?>`.

- [ ] **Step 1 — AdvisorButton.tsx (#7):** botón/anchor que abre `BLIP_ADVISOR_URL` en `_blank` (`rel="noopener"`). Texto "¿Necesitas ayuda? Habla con un asesor". Ícono chat SVG.
- [ ] **Step 2 — ExampleModal.tsx (#8):** modal accesible (overlay + card, cierre por backdrop/Esc/botón) que muestra `title` + `text` (texto guía). Sin dependencias externas.
- [ ] **Step 3 — VideoRecorder.tsx:** port; añade prop `exampleText` y, junto al header de pregunta, botón "Ver ejemplo" que abre `ExampleModal` (#8). Clases → arbitrarias.
- [ ] **Step 4 — verify** `npx tsc --noEmit`.
- [ ] **Step 5 — commit** `feat(admision): grabador de video con "ver ejemplo" y botón asesor (Blip)`.

---

### Task 7: VideoIntro + VideoConfirm + VideoFlow (#6 nombre, #7, #8, #10) + ruta laboral

**Files:** Create `admision/_components/{VideoIntro.tsx,VideoConfirm.tsx,VideoFlow.tsx}`, `admision/validacion-laboral/[token]/page.tsx`

**Interfaces:**
- Consumes: VideoRecorder, AdvisorButton, links API, uploadFile, admissionEvents, PhoneFrame.
- Produces: `<VideoFlow token documentTypeCodes applicantName? onDone?>`, `VIDEO_DONE_TITLE`, `VIDEO_DONE_MESSAGE`.

- [ ] **Step 1 — VideoConfirm.tsx + VideoIntro.tsx:** port verbatim (clases → arbitrarias). `VideoIntro` recibe opcional `applicantName` para saludo "Hola, {nombre} 👋"→ sin emoji: "Hola, {nombre}".
- [ ] **Step 2 — VideoFlow.tsx:** port con:
  - **(#6)** prop `applicantName`; cabecera personalizada con el nombre (fallback neutro). Pasa `applicantName` a `VideoIntro`.
  - **(#7)** el botón asesor del estado `capture` y `manual` usa `<AdvisorButton/>`.
  - **(#8)** define `QUESTION_EXAMPLES: string[]` (texto guía por pregunta) y pasa `exampleText={QUESTION_EXAMPLES[index]}` a `VideoRecorder`.
  - **(#10)** `admissionEvents(token)`: `linkOpen()` al montar, `stageEnter/Exit` por `state` (intro/capture/uploading/completing), `completed()` en `confirmed`.
  - Mensajes de error → `friendlyError` donde aplique (los del flujo ya son amigables; mantener).
- [ ] **Step 3 — page.tsx:** `ValidacionLaboralClient` replica `ValidacionLaboral.tsx`: valida link `video_validation`, extrae `document_type_codes` y `context.applicant_name`, render `VideoFlow`. `consumed*` = VIDEO_DONE_*.
- [ ] **Step 4 — verify** `npx tsc --noEmit` + smoke mock (`/prototipos/0.6/admision/validacion-laboral/demo-video-token`).
- [ ] **Step 5 — commit** `feat(admision): flujo de video con personalización por nombre, ejemplos y eventos`.

---

### Task 8: Verificación final

- [ ] **Step 1 — typecheck:** `npx tsc --noEmit -p tsconfig.json` → exit 0.
- [ ] **Step 2 — unit:** `npx vitest run admision/` → PASS.
- [ ] **Step 3 — build (TS pass):** `npm run build` compila el paso TypeScript sin errores nuevos en `admision/`.
- [ ] **Step 4 — commit** `chore(admision): verificación typecheck + tests del port`.

---

## Self-Review

- **Spec coverage:** OTP (T4), video (T6/T7), link states (T3), API (T2). Mejoras: #1/#2 (T4 step4), #3 (T1 errors + T4), #4 (T1 attemptsCopy + T4), #5 (T4), #6 (T2 types + T7), #7 (T6 AdvisorButton), #8 (T6 ExampleModal + T7), #9 (T1 logo + T3 PhoneFrame), #10 (T2 events + T4/T7). ✔ Todas cubiertas.
- **Placeholders:** los "texto guía" de #8 son contenido intencional configurable (no TBD de plan).
- **Type consistency:** `admissionEvents(token)` métodos consistentes T2↔T4↔T7; `LinkValidation.context.applicant_name` definido en T2, consumido en T7.
