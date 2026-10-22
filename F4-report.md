## Correcciones de la re-revisión

BAL-4963 · segunda ronda de correcciones sobre F4 (Paso 1 de Diseño 2).

### 1. El prefill ya no pisa un campo bloqueado por el lead (IMPORTANTE)

`DocumentNumberField.tsx:197-220` (`escribir`, dentro de `handlePrefillReady`): antes de escribir cualquier valor que trajo el lookup, si el campo destino tiene `_lead_locked_{code} === 'true'` (ver `leadLockKey` en `useLeadPrefill.ts`), `escribir` ahora no hace nada. El lead es la fuente de verdad: el lookup de un DNI distinto ya no puede dejar el nombre de OTRA persona encima del nombre que llegó bloqueado. Aplica en Diseño 1 y 2 (la guarda está antes del `if (v2)`).

Antes de esto, el "no vaciar campos bloqueados" de `limpiarCamposDelPrellenado` (que ya existía) protegía solo la mitad del problema: no limpiaba el campo bloqueado, pero `escribir` sí lo pisaba al llegar el prefill. Con la guarda nueva, ningún lado lo toca.

**Test:** `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/__tests__/paso1DatosPersonalesDiseno2.test.tsx`, describe `Re-revisión 1 · el prefill no pisa un campo bloqueado por el lead` — reproduce el caso exacto: `first_name` bloqueado por el lead → DNI A encontrado (no pisa) → "Corrige" → DNI B no encontrado → `first_name` sigue siendo el del lead. También se actualizó el test preexistente `Revisión 1 · limpiar no vacía los campos bloqueados por el lead` (ahora fija el valor real del campo bloqueado antes de montar, en vez de depender de que el prefill lo escribiera).

```
npx jest paso1DatosPersonalesDiseno2
```
```
Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
```

### 2. "Número de {tipo}" solo en el documento del titular (IMPORTANTE)

`DocumentNumberField.tsx:516-525` (`etiquetaDelTipo` / `etiqueta`): el cálculo de "Número de {tipo}" ahora exige `v2 && esDocumentoDelTitular`. El documento de un familiar (mismo componente, otro `code`) conserva la etiqueta que trae la BD (`field.label`) tal cual, sin el prefijo "Número de ...".

**Test:** mismo archivo, describe `Re-revisión 2 · "Número de {tipo}" solo en el documento del titular` — un documento de familiar (`documentTypeField` compartido con el titular) mantiene `"Documento del familiar"`, mientras el documento del titular en el mismo paso sí muestra `"Número de DNI"`.

```
npx jest paso1DatosPersonalesDiseno2
```
```
Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
```

### 3a. "No encontrado" borra `_prefill_valor_*` / `_prefill_doc_*` aunque el prefill no corriera en esta sesión

`DocumentNumberField.tsx:310-345`: se extrajo `limpiarMarcasDelPrellenado` (borra solo las marcas de contabilidad, sin tocar los campos) de `limpiarCamposDelPrellenado` (que la reusa, y además vacía los campos no bloqueados). `handleNoPrefillData` ahora llama a `limpiarMarcasDelPrellenado()` también cuando `prefilledRef.current` es `false` — es decir, cuando el prefill no corrió en esta sesión (borrador recién cargado) — en vez de no hacer nada. Así un "no encontrado" con un documento nuevo no deja las marcas de bookkeeping de un documento viejo colgadas en el borrador.

**Test:** mismo archivo, describe `Re-revisión 3a · "no encontrado" borra las marcas del prefill aunque no venga de esta sesión` — un borrador con marcas de otro documento + un `first_name` escrito a mano: tras `onNoPrefillData`, las marcas se limpian y `first_name` no se toca.

```
npx jest paso1DatosPersonalesDiseno2
```
```
Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
```

### 3b. Comentario: por qué no se borra el número si se escribe antes de elegir tipo

`DocumentNumberField.tsx:470-484` (justo antes de `const loEligioLaPersona = ...`): se documentó por qué un `documentType` que pasa de `''` (nadie eligió todavía) a un valor no cuenta como "la persona cambió de tipo" — es la resolución del default o lo que trajo el borrador al montar, no un gesto de la persona — y por qué eso importa: la persona puede tipear el número de documento antes de que el combo de tipo resuelva su valor (o mientras sigue en blanco), y sin esa guarda el primer `documentType` que aparece borraría lo que ya escribió.

Sin test nuevo (es documentación de un comportamiento ya cubierto por `Revisión 6 · un documento bloqueado no se borra al cambiar de tipo` y las pruebas de "cambiar de tipo borra el número"; no hay cambio de comportamiento).

### 3c. `usePasoDelWizard.tsx:212` usa el helper `leadLockKey`

Se cambió `` formData[`_lead_locked_${CODIGO_CELULAR_TITULAR}`] `` por `formData[leadLockKey(CODIGO_CELULAR_TITULAR)]`, importando `leadLockKey` desde `../../../hooks/useLeadPrefill` (mismo patrón de import que `useSubmitApplication` en el mismo archivo).

Esto rompió 4 tests que mockeaban el módulo `useLeadPrefill` completo sin exportar `leadLockKey` (`StepClient.pasoRegular.test.tsx`, `StepClient.diseno2.test.tsx`, `StepClient.resumenListaDeVarias.test.tsx`, `StepClient.sinResumen.test.tsx`). Se corrigieron los 4 mocks para incluir `leadLockKey: (code) => \`_lead_locked_${code}\``.

```
npx jest usePasoDelWizard.sinPaso StepClient.pasoRegular StepClient.diseno2 StepClient.resumenListaDeVarias StepClient.sinResumen useLeadPrefill paso1DatosPersonalesDiseno2 DocumentNumberField.autoseteo CascadingSelectField solicitarClient
```
```
Test Suites: 13 passed, 13 total
Tests:       152 passed, 152 total
```

### 3d. Qué código usa el celular del titular en los formularios activos (BD local)

Consulta sobre `baldecash_ecs` local (`form_field`, `form_step`, `form_step_field`, con `field_type='phone'`):

| code | dónde aparece (steps activos) |
|---|---|
| `phone` | **Todos** los steps de datos personales activos: `personal_data`, `datos_personales_v2`, `datos_personales_convenio`, `datos_personales_simples`, `datos_personales_cade`, `datos_personales_paulmuller`, `datos_personales_locker_truck`, `datos_personales_no_estudiantes_oficial`, `lead_form`, `lead_form_short`, `datos_personales_a365_v2`, `datos_personales`, `datos_personales_convenio_admin_docente`, `datos_personales_matricula`, `datos_personales_titulo`, `datos_personales_con_dia_pago`, `datos_personales_pruebav2`, `personal_data_liderman`, `personal_data_zona_gamer` |
| `phone_secondary` | "Celular Alterno" del titular — un segundo teléfono, no el principal — presente en casi los mismos steps |
| `supporter_phone` | Celular del aval/apoderado, solo en steps de `datos_economicos*` |
| `student_phone` | Solo en `lead_form` (captura de lead, no el wizard de solicitud) |
| `celular_del_familiar`, `celular_del_familiar_copia` | Existen en el banco de campos (`form_field`) pero **no están enlazados a ningún step**, activo ni inactivo — banco de preguntas sin uso actual |

**Conclusión:** no hay otro código distinto de `phone` usado como celular DEL TITULAR en ningún formulario activo. `CODIGO_CELULAR_TITULAR = 'phone'` (en `datosPersonalesV2.ts`) sigue siendo correcto. No se cambió el criterio.

Nota sobre la consulta: `landing_form_step` (la tabla que debería ligar steps a landings/forms) está vacía en la BD local; la relación real que SÍ tiene datos es `form_step_field.is_active` + `form_step.is_active`, que es la que se usó arriba.
