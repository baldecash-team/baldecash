# El selector de plazo muestra el plazo total y las armadas

> Fecha: 2026-08-08
> Repo: `baldecash` — rama `feat/selector-plazo-total`
> Alcance: solo la etiqueta. Nada cambia hacia el backend.

## El problema

En el perfil del cosechador de Family Farms la inicial puede pagarse de una vez,
en 2 armadas o en 4. **Las armadas se descuentan del plazo**, no lo extienden:

```
cuotas de financiamiento = plazo_total − armadas
```

El backend manda una opción por celda de `lvp_term_price`, y para el cosechador
son seis:

| `term` (cuotas) | armadas | plazo total |
|---|---|---|
| 6 | 4 | 10 |
| 8 | 2 | 10 |
| 10 | 1 | 10 |
| 13 | 4 | 17 |
| 15 | 2 | 17 |
| 17 | 1 | 17 |

El selector listaba los `term` crudos —«6, 8, 10, 13, 15, 17 semanas»— así que
quien elegía «13 semanas» no veía que estaba eligiendo pagar la inicial en cuatro
partes, y tampoco veía que su plan dura lo mismo que el de «17 semanas».

## Qué se hace

El selector sigue ofreciendo **las seis opciones**, pero el número que muestra es
el plazo **total** y al lado va la modalidad de inicial:

```
Plazo   [ 17 semanas · 4 armadas   v ]
        ┌──────────────────────────────┐
        │ 10 semanas · 1 pago          │
        │ 10 semanas · 2 armadas       │
        │ 10 semanas · 4 armadas       │
        │ 17 semanas · 1 pago          │
        │ 17 semanas · 2 armadas       │
        │ 17 semanas · 4 armadas    ✓  │
        └──────────────────────────────┘
```

Elegir el plazo y elegir cómo se paga la inicial son la misma decisión, porque en
el pricing son la misma celda. Un selector aparte para la modalidad ofrecería
combinaciones que no existen.

### Esto reemplaza al agrupado por total

El commit `22652cdb` hacía que `getAvailableTerms` agrupara por plazo total, y las
seis celdas colapsaban a dos opciones («10 semanas» y «17 semanas»). Con las seis
de vuelta ese agrupado sobra:

- `getAvailableTerms` vuelve a devolver el `term` crudo.
- `updateAllProductsToTerm` recupera su `find(pl => pl.term === term)`. La
  heurística de «conservar la modalidad de inicial que la persona ya tenía»
  existía solo para desempatar dos planes con el mismo total; sin agrupado no hay
  empate que desempatar.

**Por qué el `term` crudo alcanza como identidad:** los seis `term` son distintos
entre sí, y `paymentPlans` ya está indexado por `term` en el front —dos celdas con
el mismo `term` colapsarían en un solo plan antes de llegar acá—. Es la invariante
que el código ya asumía antes de `22652cdb`.

## El gate: sin slug, sin landing id

El sufijo se agrega **solo si el producto tiene alguna opción con
`initialInstallments > 1`**.

Para todo el resto del catálogo hay una sola modalidad y es el pago único, así que
el rótulo queda idéntico al de hoy: «24 meses», «48 semanas». La transformación es
la identidad. No hace falta preguntar por la landing, y si mañana otra landing
carga celdas con armadas, funciona sin tocar nada.

> Al 2026-08-08 la única landing con armadas en producción es
> `family-farms-baldecash-c` (id 212).

## Componentes

### `producto/pricing/etiquetaDePlazo.ts` (nuevo, puro)

Deriva de los `paymentPlans` el rótulo de cada `term`:

| función | qué devuelve |
|---|---|
| `plazoTotalDelPlan(plan)` | `cuotas + armadas`, o `term` si no hay armadas |
| `hayArmadas(plans)` | si algún plan tiene `initialInstallments > 1` |
| `etiquetasDePlazo(plans, frequency)` | `Map<term, string>`, vacío si no hay armadas |
| `ordenarTerms(plans, terms)` | total ascendente; a igual total, de menos a más armadas |

`etiquetasDePlazo` devuelve un mapa **vacío** cuando no hay armadas, en vez de
uno con los rótulos de siempre. Así el consumidor no tiene que saber si el mapa
está «completo»: si no hay entrada para un `term`, se cae al rótulo por defecto,
que es el camino que recorre todo el catálogo.

### `TermSelect` — un prop opcional

```ts
/** Rótulo por term. Sin entrada para un term, se usa `${term} ${unidad}`. */
labels?: Map<number, string>;
```

Sin el prop se comporta exactamente como hoy. No se toca `getTermUnit`, que ya
resuelve semana/quincena/mes.

### Los tres lugares donde vive el selector

- `solicitar/solicitarClient.tsx:427` — la barra «Producto seleccionado».
- `solicitar/components/solicitar/product/SelectedProductBar.tsx:327` — expandida.
- `solicitar/components/solicitar/product/SelectedProductBar.tsx:382` — colapsada.

Los tres arman las etiquetas del producto primario y las pasan al selector.

**Cuando los plazos no están unificados** (`needsTermUnification`) o las
frecuencias son mixtas, el selector trabaja en meses normalizados y no se le pasan
etiquetas: un carrito mixto no tiene una modalidad de inicial que mostrar.

## Fuera de alcance

- **El selector del detalle de producto** (`PricingCalculator`). El commit
  `1295e8ed` dejó `modalidadInicial.ts` listo pero sin cablear, porque el estado de
  esa pantalla gira alrededor de `term` y reordenarla es otro cambio.
- **`GamerSolicitarClient`**, que tiene su propio markup y no usa celdas con
  armadas.

## Qué viaja al backend

Nada cambia. Al elegir «17 semanas · 4 armadas» se sigue mandando `term = 13`:
las cuotas de financiamiento. Las armadas las arma legacy a partir de
`armadas_inicial`, resuelto contra la celda de pricing.

## Testing

En este orden, porque el primero es el que autoriza a tocar algo compartido:

1. **Un producto sin armadas produce el rótulo de hoy.** `etiquetasDePlazo`
   devuelve un mapa vacío y el selector muestra «24 meses».
2. Las seis celdas reales del cosechador producen los seis rótulos de arriba.
3. El orden es 10·1, 10·2, 10·4, 17·1, 17·2, 17·4.
4. Un producto con una sola modalidad y esa modalidad con armadas igual muestra el
   sufijo — no se depende de que haya varias para que se vea.
5. `updateAllProductsToTerm(13)` resuelve el plan de 13 cuotas, no el de 17.
6. La unidad sigue a la frecuencia: «17 semanas · 4 armadas» en semanal, y el
   catálogo mensual no se ve afectado.
