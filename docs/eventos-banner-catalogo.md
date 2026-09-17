# Cómo sacar la data del banner del catálogo

Guía para consultar los clics del banner. Pensada para pegarle a la BD desde
Claude Code con el MCP `db-baldemotor`.

---

## Lo básico

Todo vive en **una sola tabla**: `user_event`.

| columna | qué trae |
| -- | -- |
| `event_type` | `banner_click` o `banner_hover` |
| `properties` | JSON con los datos del banner |
| `server_ts` | cuándo llegó (para filtrar por fecha) |
| `page_url` | en qué página pasó |
| `session_id` | para contar personas, no clics |

Dentro de `properties`:

```json
{
  "landing":   "home",                          // slug de la landing
  "location":  "catalog_top",                   // dónde está el banner
  "banner_id": "1387",                          // qué banner es
  "variant":   "tira_remate",                   // el TIPO: imagen | tira_remate
  "href":      "@reacondicionados/catalogo"     // a dónde lleva
}
```

---

## Trampas que te van a morder

**1. `variant` vuelve como el texto `"null"`, no como `NULL` de SQL.**

Los clics viejos (antes de BAL-3941) no traen el dato. Al extraerlo con
`JSON_UNQUOTE` sale la cadena `"null"`, así que esto **no funciona**:

```sql
WHERE JSON_EXTRACT(properties,'$.variant') IS NOT NULL  -- ❌ no filtra nada
```

Usá esto:

```sql
WHERE JSON_UNQUOTE(JSON_EXTRACT(properties,'$.variant')) NOT IN ('null','')
```

**2. La tabla es grande.** Un `LIKE '%banner%'` sobre todo el historial tarda
minutos. **Filtrá siempre por fecha primero**:

```sql
WHERE server_ts >= CURDATE() - INTERVAL 7 DAY
```

**3. Las tablas `event_click` y `event_custom` están muertas.** Tienen datos de
prueba de marzo y nadie escribe ahí. Si buscás eventos, es `user_event`.

**4. Los datos de antes del 17-sep-2026 no tienen tipo.** Hasta ese día el
evento se guardaba sin `variant`, `banner_id` ni `href`. Todo lo anterior es
"alguien tocó un banner" y nada más.

---

## Consultas listas

### Cuántos clics por tipo de banner

```sql
SELECT
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(properties,'$.variant')),'(sin dato)') AS tipo,
  COUNT(*) AS clics
FROM user_event
WHERE event_type = 'banner_click'
  AND server_ts >= CURDATE() - INTERVAL 30 DAY
GROUP BY tipo
ORDER BY clics DESC;
```

### Clics por landing y por tipo

```sql
SELECT
  JSON_UNQUOTE(JSON_EXTRACT(properties,'$.landing')) AS landing,
  JSON_UNQUOTE(JSON_EXTRACT(properties,'$.variant')) AS tipo,
  COUNT(*) AS clics,
  COUNT(DISTINCT session_id) AS personas
FROM user_event
WHERE event_type = 'banner_click'
  AND server_ts >= CURDATE() - INTERVAL 30 DAY
GROUP BY landing, tipo
ORDER BY clics DESC;
```

`personas` importa: una misma persona puede clickear varias veces.

### A dónde manda cada banner

```sql
SELECT
  JSON_UNQUOTE(JSON_EXTRACT(properties,'$.banner_id')) AS banner,
  JSON_UNQUOTE(JSON_EXTRACT(properties,'$.href'))      AS destino,
  COUNT(*) AS clics
FROM user_event
WHERE event_type = 'banner_click'
  AND server_ts >= CURDATE() - INTERVAL 30 DAY
GROUP BY banner, destino
ORDER BY clics DESC;
```

### Clic vs hover (qué tan seguido el interés se convierte en clic)

```sql
SELECT
  JSON_UNQUOTE(JSON_EXTRACT(properties,'$.variant')) AS tipo,
  SUM(event_type = 'banner_hover') AS hovers,
  SUM(event_type = 'banner_click') AS clics,
  ROUND(100 * SUM(event_type='banner_click') / NULLIF(SUM(event_type='banner_hover'),0), 1) AS pct
FROM user_event
WHERE event_type IN ('banner_click','banner_hover')
  AND server_ts >= CURDATE() - INTERVAL 30 DAY
GROUP BY tipo;
```

**Ojo con leer esto como CTR.** No lo es: el hover no existe en celulares, así
que solo mide gente en computadora. Para CTR de verdad haría falta medir
cuántas veces se **vio** el banner, y eso hoy no se registra.

### Evolución día a día

```sql
SELECT
  DATE(server_ts) AS dia,
  JSON_UNQUOTE(JSON_EXTRACT(properties,'$.variant')) AS tipo,
  COUNT(*) AS clics
FROM user_event
WHERE event_type = 'banner_click'
  AND server_ts >= CURDATE() - INTERVAL 30 DAY
GROUP BY dia, tipo
ORDER BY dia DESC;
```

---

## Qué banner es cuál

`banner_id` es el id del componente en la tabla `home_component`. Para saber a
qué landing corresponde y cómo está configurado:

```sql
SELECT hc.id, l.name AS landing, l.slug, hc.is_visible, hc.config
FROM home_component hc
JOIN landing l ON l.id = hc.landing_id
WHERE hc.component_code = 'catalog_banner'
  AND hc.is_active = 1;
```

---

## Lo que NO se puede responder hoy

Vale saberlo antes de prometer un número:

- **Cuántas personas vieron el banner.** No se registra la impresión, solo el
  clic y el hover. Sin eso no hay CTR real.
- **Si el clic llevó a una compra.** El evento no se enlaza con la solicitud.
- **Los clics de antes del 17-sep-2026 por tipo.** No traen el dato.

---

## Pedírselo a Claude Code

El MCP `db-baldemotor` apunta a **producción**. Es de solo lectura para esto,
pero conviene ser explícito. Ejemplos de cómo pedirlo:

> Con el MCP db-baldemotor, dame los clics de banner de los últimos 30 días
> separados por tipo (`variant`) y por landing. Filtrá por `server_ts` para que
> no tarde. Ojo que `variant` puede venir como el texto "null" en los datos
> viejos.

> ¿Qué banner recibió más clics este mes? Cruzá el `banner_id` de `user_event`
> con `home_component` para decirme de qué landing es.
