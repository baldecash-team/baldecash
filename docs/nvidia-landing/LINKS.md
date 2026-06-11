# Landing NVIDIA — Links de navegación (catálogo y detalle)

Guía para construir los links de los botones de la landing NVIDIA:
botones que van al **catálogo** y botones que van al **detalle de producto**.

---

## ⚠️ Por ahora: apuntar a `zona-gamer`, NO a `nvidia`

Los productos del catálogo vienen de la landing **zona-gamer** (nvidia aún no tiene productos propios). Por lo tanto, los links de catálogo y detalle deben apuntar a **`zona-gamer`** por ahora.

Cuando la landing nvidia tenga sus propios productos, se cambia el slug de `zona-gamer` a `nvidia` en un solo lugar.

**Patrón recomendado:** definir una constante al inicio del componente:

```typescript
// Slug de la landing de la que vienen los productos.
// Cambiar a 'nvidia' cuando tenga catálogo propio.
const PRODUCTS_LANDING = 'zona-gamer';
```

---

## Usar el helper `routes` (no construir URLs a mano)

Existe un builder centralizado en `utils/routes.ts` que ya maneja el prefijo `/prototipos/0.6` (o el que aplique en producción). **Siempre usar estos helpers** en vez de concatenar strings.

```typescript
import { routes } from '@/app/prototipos/0.6/utils/routes';
```

### Botón → Catálogo

```typescript
// Lleva al catálogo de zona-gamer
router.push(routes.catalogo(PRODUCTS_LANDING));
// → /prototipos/0.6/zona-gamer/catalogo

// Con filtros opcionales (query string)
router.push(routes.catalogo(PRODUCTS_LANDING, 'gpu=rtx-4050'));
// → /prototipos/0.6/zona-gamer/catalogo?gpu=rtx-4050
```

Como `<a>` (para soportar Ctrl/Cmd+click y middle-click):
```tsx
<a href={routes.catalogo(PRODUCTS_LANDING)}>Ver catálogo</a>
```

### Botón → Detalle de producto

El detalle se construye con el **`slug`** del producto (viene en cada producto del API del catálogo).

```typescript
// product.slug viene del endpoint /public/landing/zona-gamer/products
router.push(routes.producto(PRODUCTS_LANDING, product.slug));
// → /prototipos/0.6/zona-gamer/producto/{slug}
```

Como `<a>`:
```tsx
<a href={routes.producto(PRODUCTS_LANDING, product.slug)}>Ver detalle</a>
```

Con query (ej. plazo o color preseleccionado):
```typescript
routes.producto(PRODUCTS_LANDING, product.slug, 'term=24');
```

---

## ❌ Evitar — no hardcodear el slug ni el prefijo

```typescript
// ❌ MAL — slug hardcodeado y string a mano
router.push(`${BASE_PATH}/zona-gamer/producto/${slug}`);

// ✅ BIEN — helper + constante
router.push(routes.producto(PRODUCTS_LANDING, slug));
```

Ventaja: cuando se migre a `nvidia`, solo se cambia `PRODUCTS_LANDING = 'nvidia'` y todos los links se actualizan solos.

---

## Endpoint del catálogo (de dónde sale el `slug`)

```
GET /api/v1/public/landing/zona-gamer/products?limit=200
```

Cada producto trae:
- `slug` → para `routes.producto(...)`
- `display_name`, `thumbnail_url`, `pricing.hook.monthly_price`, `specs.*` → para mostrar la card

---

## Resumen

| Botón | Helper | Resultado |
|---|---|---|
| Ver catálogo | `routes.catalogo(PRODUCTS_LANDING)` | `/zona-gamer/catalogo` |
| Ver detalle | `routes.producto(PRODUCTS_LANDING, slug)` | `/zona-gamer/producto/{slug}` |
| Solicitar | `routes.solicitar(PRODUCTS_LANDING)` | `/zona-gamer/solicitar/` |

> Migración futura: cambiar `PRODUCTS_LANDING` de `'zona-gamer'` a `'nvidia'` en un solo lugar.
