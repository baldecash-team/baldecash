# Zona Gamer — Sección "¿Qué juegan nuestros gamers?"

Documentación para conectar la sección de juegos del index de Zona Gamer con productos reales del catálogo, distribuidos con un algoritmo balanceado.

## Archivos

| Documento | Contenido |
|---|---|
| [CONTEXT.md](./CONTEXT.md) | Estado actual del componente, qué cambiar, qué se mantiene |
| [ALGORITHM.md](./ALGORITHM.md) | Algoritmo de distribución de productos entre juegos (con código listo) |

## Resumen en 30 segundos

**Hoy:** la sección `GamerGamesRanking.tsx` tiene las laptops **hardcodeadas** dentro de cada juego.

**Objetivo:**
1. Reemplazar las laptops hardcodeadas por **productos reales del catálogo** (endpoint `/public/landing/zona-gamer/products`)
2. Distribuirlos entre los 5 juegos con un **algoritmo balanceado** — ninguno con todas, ninguno vacío

**Se mantiene hardcoded:** los juegos en sí (nombre, género, %, ícono, color).
**Pasa a dinámico:** las laptops que se muestran en cada juego.

**Componente:** `src/app/prototipos/0.6/components/zona-gamer/GamerGamesRanking.tsx`
