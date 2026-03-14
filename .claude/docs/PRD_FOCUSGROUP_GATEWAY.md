# PRD: Focus Group Gateway

## 1. Resumen Ejecutivo

**Producto:** Focus Group Gateway
**Dominio:** `focusgroup.baldecash.com`
**Objetivo:** Plataforma gateway para gestionar acceso temporal y controlado a prototipos de BaldeCash durante sesiones de focus group, mediante URLs únicas con códigos de acceso y expiración automática.

**Problema que resuelve:** Actualmente no existe una forma controlada de compartir prototipos con participantes de focus groups. Se necesita que los links sean temporales, rastreables y que el subdominio sea reutilizable para múltiples proyectos y sesiones.

---

## 2. Objetivos

| Objetivo | Métrica de éxito |
|----------|-----------------|
| Acceso controlado a prototipos | 100% de accesos pasan por el gateway |
| Links temporales | Los links expiran automáticamente en la fecha configurada |
| Reutilización del subdominio | Un mismo subdominio sirve para N sesiones y N proyectos |
| Gestión simple | Crear una nueva sesión toma < 5 minutos |
| Seguridad | Los participantes no pueden acceder al sitio destino sin pasar por el gateway |

---

## 3. Usuarios

| Usuario | Rol | Necesidad |
|---------|-----|-----------|
| Equipo BaldeCash (admin) | Crea y gestiona sesiones de focus group | Crear links temporales, definir expiración, monitorear accesos |
| Participante de focus group | Accede al prototipo durante la sesión | URL simple, acceso inmediato sin registro, navegación libre en el prototipo |

---

## 4. Flujo de Usuario

### 4.1 Flujo del Participante

```
1. Recibe URL: focusgroup.baldecash.com/abc123
2. Gateway valida:
   ├─ Código existe? ──── NO ──→ Página "Link inválido"
   ├─ Código expiró? ──── SÍ ──→ Página "Sesión finalizada"
   └─ Código válido ─────────→ Redirect al prototipo con token firmado
3. Prototipo destino valida token
4. Token se guarda en sessionStorage
5. Participante navega libremente por el prototipo
```

### 4.2 Flujo del Admin

```
1. Edita el registry de sesiones (archivo JSON o dashboard)
2. Define: código, URL destino, fecha de expiración, etiqueta
3. Hace deploy (git push → Vercel auto-deploy)
4. Comparte la URL con los participantes
5. Después de la sesión: no hace nada (expira solo) o desactiva manualmente
```

---

## 5. Funcionalidades

### 5.1 MVP (v1.0)

| # | Feature | Descripción | Prioridad |
|---|---------|-------------|-----------|
| F1 | Validación de código | Validar código de acceso contra el registry | Must have |
| F2 | Expiración automática | Códigos expiran según fecha/hora configurada (timezone Lima) | Must have |
| F3 | Redirect con token | Redirect al sitio destino con token firmado en query param | Must have |
| F4 | Página de error - código inválido | UI para código inexistente | Must have |
| F5 | Página de error - sesión expirada | UI para código expirado | Must have |
| F6 | Registry en JSON | Archivo JSON con la lista de sesiones activas | Must have |
| F7 | Gate en sitio destino | Componente client-side que valida el token en el sitio destino | Must have |

### 5.2 Futuro (v2.0)

| # | Feature | Descripción | Prioridad |
|---|---------|-------------|-----------|
| F8 | Dashboard admin | UI web para gestionar sesiones sin tocar código | Nice to have |
| F9 | Analytics básico | Contador de accesos por código | Nice to have |
| F10 | Múltiples usos por código | Limitar cantidad de accesos por código | Nice to have |
| F11 | Códigos con password | Agregar capa extra de password además del código | Nice to have |
| F12 | Notificaciones | Notificar al admin cuando alguien accede | Nice to have |

---

## 6. Arquitectura Técnica

### 6.1 Stack

| Componente | Tecnología | Justificación |
|-----------|-----------|---------------|
| Framework | Next.js 14+ (App Router) | Mismo stack que el equipo ya maneja |
| Hosting | Vercel (free tier) | Deploy automático, edge functions, HTTPS gratis |
| DNS | Route 53 (CNAME → Vercel) | Ya lo usan para otros subdominios |
| Token signing | HMAC-SHA256 con secret compartido | Simple, stateless, seguro |
| Registry | JSON file en el repo | Suficiente para MVP, sin DB |

### 6.2 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────┐
│  focusgroup.baldecash.com (Vercel)                   │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐                │
│  │  /[code]      │    │  registry.json│               │
│  │  (Server      │───▶│              │                │
│  │   Component)  │    │  {code, url, │                │
│  │              │    │   expires,   │                │
│  │              │    │   label}     │                │
│  └──────┬───────┘    └──────────────┘                │
│         │                                            │
│         │ válido                                     │
│         ▼                                            │
│  ┌──────────────┐                                    │
│  │ Token signing │  HMAC-SHA256(code + timestamp)    │
│  │ (server-side) │                                    │
│  └──────┬───────┘                                    │
│         │                                            │
└─────────┼────────────────────────────────────────────┘
          │ redirect 302
          ▼
┌─────────────────────────────────────────────────────┐
│  demo.baldecash.com (GitHub Pages)                   │
│                                                      │
│  ┌──────────────┐                                    │
│  │  GateGuard    │  Valida token (client-side)       │
│  │  Component    │  Guarda en sessionStorage          │
│  │              │  Si inválido → "Acceso restringido"│
│  └──────────────┘                                    │
└─────────────────────────────────────────────────────┘
```

### 6.3 Estructura del Proyecto (Gateway)

```
focusgroup-gateway/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout con branding BaldeCash
│   │   ├── page.tsx                # Landing (redirect o 404)
│   │   ├── [code]/
│   │   │   └── page.tsx            # Validación + redirect (Server Component)
│   │   └── expired/
│   │       └── page.tsx            # Página "sesión expirada"
│   ├── lib/
│   │   ├── registry.ts            # Lee y valida el registry
│   │   └── token.ts               # Genera y firma tokens HMAC
│   └── data/
│       └── sessions.json          # Registry de sesiones activas
├── next.config.ts
├── package.json
└── .env.local                      # TOKEN_SECRET
```

### 6.4 Registry (sessions.json)

```json
[
  {
    "code": "abc123",
    "target": "https://demo.baldecash.com",
    "path": "/prototipos/0.6/upn",
    "expires": "2026-02-12T23:00:00-05:00",
    "label": "Focus Group - UPN Febrero 2026",
    "active": true
  },
  {
    "code": "xyz789",
    "target": "https://otro-proyecto.baldecash.com",
    "path": "/",
    "expires": "2026-03-15T18:00:00-05:00",
    "label": "Focus Group - Piloto Marzo",
    "active": true
  }
]
```

### 6.5 Flujo de Token

```
GENERACIÓN (server-side en gateway):
  payload = code + "|" + timestamp
  token = HMAC-SHA256(payload, TOKEN_SECRET)
  redirect → target + path + "?fg_token=" + token + "&fg_ts=" + timestamp

VALIDACIÓN (client-side en sitio destino):
  1. Lee fg_token y fg_ts de la URL
  2. Reconstruye: expected = HMAC-SHA256(code + "|" + fg_ts, TOKEN_SECRET)
  3. Compara expected === fg_token
  4. Verifica que fg_ts no sea mayor a 5 minutos de antigüedad
  5. Si válido → guarda en sessionStorage, limpia URL
  6. Si inválido → muestra "Acceso restringido"
```

> **Nota:** Como el sitio destino es estático (GitHub Pages), la validación del token es client-side. El secret se expone en el bundle del cliente. Esto es aceptable para focus groups (no protege data sensible), pero no para producción con datos reales.

### 6.6 Alternativa simplificada de token

Si la exposición del secret es una preocupación, se puede usar un esquema más simple:

```
GENERACIÓN:
  token = randomUUID() (generado al momento de crear la sesión)
  Se guarda en sessions.json junto al código
  redirect → target + path + "?fg_token=" + token

VALIDACIÓN:
  El sitio destino tiene una lista de tokens válidos hardcodeada
  Compara fg_token contra la lista
  Si match → sessionStorage, continuar
  Si no → bloquear
```

---

## 7. Páginas del Gateway

### 7.1 Página de Redirect (`/[code]`) - Código válido
- Muestra un loader breve con branding BaldeCash (< 2 segundos)
- Texto: "Preparando tu sesión..."
- Redirect automático al sitio destino

### 7.2 Página de Error - Código Inválido
- Branding BaldeCash
- Icono de error
- Título: "Link no válido"
- Subtítulo: "El link que ingresaste no existe. Verifica que sea correcto."
- Sin links de navegación (no revelar otros recursos)

### 7.3 Página de Error - Sesión Expirada
- Branding BaldeCash
- Icono de reloj/expiración
- Título: "Sesión finalizada"
- Subtítulo: "Esta sesión de focus group ya no está disponible. Gracias por tu participación."
- Sin links de navegación

### 7.4 Página Root (`/`) - Sin código
- Redirect a `baldecash.com` o mostrar página genérica de BaldeCash
- No revelar que es un gateway de focus group

---

## 8. Gate Component (Sitio Destino)

Componente `<FocusGroupGate>` que se agrega al layout del sitio destino:

```
Comportamiento:
1. Al cargar, busca fg_token en la URL
2. Si encuentra token válido → guarda en sessionStorage, limpia URL, render children
3. Si no hay token en URL → busca en sessionStorage
4. Si hay en sessionStorage → render children
5. Si no hay token en ningún lado → render página de "Acceso restringido"

Página de Acceso Restringido:
- Fondo oscuro, branding BaldeCash
- "Acceso restringido"
- "Necesitas un link de invitación para acceder a este sitio."
- Sin más información
```

---

## 9. Setup DNS (Route 53)

```
Tipo:    CNAME
Nombre:  focusgroup.baldecash.com
Valor:   cname.vercel-dns.com
TTL:     300
```

---

## 10. Configuración en Vercel

1. Crear proyecto desde GitHub repo `focusgroup-gateway`
2. Agregar custom domain: `focusgroup.baldecash.com`
3. Agregar environment variable: `TOKEN_SECRET=<random-secret>`
4. Deploy automático en cada push a `main`

---

## 11. Operaciones

### Crear nueva sesión de focus group
1. Agregar entrada a `sessions.json`
2. Commit + push → Vercel auto-deploys
3. Si el sitio destino es nuevo, agregar el `<FocusGroupGate>` al layout
4. Compartir URL: `focusgroup.baldecash.com/{code}`

### Desactivar sesión manualmente
1. Cambiar `"active": false` en `sessions.json`
2. Commit + push

### Sesión expira automáticamente
- No requiere acción. El gateway rechaza accesos después de `expires`.

---

## 12. Seguridad

| Riesgo | Mitigación |
|--------|-----------|
| Participante comparte el link | El link expira automáticamente. Acceso limitado en tiempo. |
| Brute force de códigos | Códigos alfanuméricos de 6+ caracteres. Rate limiting de Vercel. |
| Acceso directo al sitio destino (sin gateway) | `<FocusGroupGate>` bloquea acceso sin token válido |
| Token interceptado | Token tiene timestamp, válido solo por 5 minutos para redirect |
| Secret expuesto en client bundle | Aceptable para prototipos de focus group. No protege data real. |

---

## 13. Limitaciones Conocidas

1. **Validación client-side en sitio destino:** Al ser GitHub Pages (estático), la validación del token es client-side. Un usuario técnico podría bypasear el gate inspeccionando el código. Esto es aceptable para focus groups con participantes no técnicos.
2. **Registry en JSON:** No escala para cientos de sesiones simultáneas. Suficiente para el uso actual (1-5 sesiones activas).
3. **Sin analytics en MVP:** No se registra quién accedió ni cuándo. Se puede agregar en v2.0.

---

## 14. Timeline Estimado

| Fase | Entregable |
|------|-----------|
| Fase 1 | Gateway app (validación, redirect, páginas de error) |
| Fase 2 | Token signing + GateGuard component para sitio destino |
| Fase 3 | Deploy en Vercel + configuración DNS en Route 53 |
| Fase 4 | Testing end-to-end con primera sesión de focus group |
