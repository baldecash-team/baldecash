# Landing NVIDIA — Links de navegación (catálogo y detalle)

Guía para construir los links de los botones de la landing NVIDIA:
botones que van al **catálogo** y botones que van al **detalle de producto**.

> Los links apuntan a **`zona-gamer`** porque los productos vienen de esa landing (nvidia no tiene catálogo propio).

---

## Regla principal: usar el helper `routes`, nunca armar URLs a mano

Existe un builder centralizado en `utils/routes.ts` que **lee el prefijo del `.env` automáticamente**. Esto hace que el mismo código funcione en local y en producción sin cambios:

- Local → prefijo `/prototipos/0.6`
- Prod → prefijo `''` (vacío)

```typescript
import { routes } from '@/app/prototipos/0.6/utils/routes';
```

**Nunca escribas el prefijo `/prototipos/0.6` a mano** — el helper lo pone solo según el `.env`.

---

## Botón → Catálogo

```typescript
router.push(routes.catalogo('zona-gamer'));
// local → /prototipos/0.6/zona-gamer/catalogo
// prod  → /zona-gamer/catalogo

// Con filtros opcionales:
router.push(routes.catalogo('zona-gamer', 'gpu=rtx-4050'));
```

Como `<a>` (soporta Ctrl/Cmd+click y middle-click):
```tsx
<a href={routes.catalogo('zona-gamer')}>Ver catálogo</a>
```

---

## Botón → Detalle de producto

El detalle se arma con el **`slug`** del producto (viene en cada producto del API del catálogo).

```typescript
// product.slug viene del endpoint del catálogo
router.push(routes.producto('zona-gamer', product.slug));
// local → /prototipos/0.6/zona-gamer/producto/{slug}
// prod  → /zona-gamer/producto/{slug}
```

Como `<a>`:
```tsx
<a href={routes.producto('zona-gamer', product.slug)}>Ver detalle</a>
```

Con query opcional (ej. plazo preseleccionado):
```typescript
routes.producto('zona-gamer', product.slug, 'term=24');
```

---

## ❌ Evitar

```typescript
// ❌ MAL — prefijo y URL armados a mano (se rompe en prod)
router.push(`/prototipos/0.6/zona-gamer/producto/${slug}`);

// ✅ BIEN — el helper resuelve el prefijo solo
router.push(routes.producto('zona-gamer', slug));
```

---

## Endpoint del catálogo (de dónde sale el `slug`)

```
GET /api/v1/public/landing/zona-gamer/products?limit=200
```

Cada producto trae:
- `slug` → para `routes.producto('zona-gamer', slug)`
- `display_name`, `thumbnail_url`, `pricing.hook.monthly_price`, `specs.*` → para la card

---

## Resumen

| Botón | Helper | Resultado (prod) |
|---|---|---|
| Ver catálogo | `routes.catalogo('zona-gamer')` | `/zona-gamer/catalogo` |
| Ver detalle | `routes.producto('zona-gamer', slug)` | `/zona-gamer/producto/{slug}` |
| Solicitar | `routes.solicitar('zona-gamer')` | `/zona-gamer/solicitar/` |

---

## 🖼️ Imágenes a quitar fondo (tarea para Silvana)

Estas imágenes necesitan que se les **quite el fondo** (dejarlas transparentes / sin fondo, como las demás imágenes de producto). Luego:

1. Quitar el fondo a cada imagen
2. Subirlas a una **carpeta nueva** (organizada)
3. **Pasarle el link de la carpeta a Emilio** para que las reemplace en BD

### Lista de imágenes

```
https://baldecash.s3.amazonaws.com/images/productos/laptops/hp-victus-15/lateral-derecho.jpg
https://baldecash.s3.amazonaws.com/images/productos/laptops/hp-victus-15/lateral-izquierdo.jpg
https://baldecash.s3.amazonaws.com/images/productos/laptops/hp-victus-15/trasera.jpg
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-698669dcc5b58-1770416604.png
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a1f742c86a6a-1780446252.png
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a1f55a04ab7b-1780438432.png
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a2041dd3f996-1780498909.png
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a2046e318d82-1780500195.png
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a204bcea68a7-1780501454.png
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a2054ea01bb0-1780503786.jpg
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a2050d0bace4-1780502736.png
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a2076466ef42-1780512326.webp
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a209d5f15b82-1780522335.webp
https://baldecash.s3.amazonaws.com/images/legacy/equipos/equipo-6a1f7dd80a107-1780448728.webp
```

**Total: 14 imágenes** (3 de hp-victus-15, 11 de legacy/equipos).

**Formato de salida:** PNG con transparencia (sin fondo), siguiendo el estándar de las imágenes `frontal_sin_fondo.png` del proyecto.
