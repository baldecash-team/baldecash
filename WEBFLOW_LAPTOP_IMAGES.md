# Imágenes de Laptops - CDN Webflow BaldeCash

Base URL: `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/`

## Imágenes Confirmadas de Laptops

### Ejemplos proporcionados
1. **HP 15**
   - URL: `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png`

2. **Mac Gold**
   - URL: `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/623f67d99ae6d7aa236b8447_mac-gold.png`

### Banners con Laptops
3. **Banner Full Power**
   - URL: `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/6711289a0de9fe5f6c47123b_banner%20full%20power%20cambioRecurso%2024%402x.png`

4. **Banner Full Power Mobile**
   - URL: `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/67006bf4f88db2ea541b143f_banner%20full%20power%20mobile%20octubreRecurso%2015%402x%201.png`

5. **DSC02413 - BannerWeb 1**
   - URL: `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64dcdfc753b1f84b4c4807c9_DSC02413%20-%20BannerWeb%201.png`

6. **DSC02413 - BannerWeb 1 (4)**
   - URL: `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64e36cd8e690ae7d9c67aa32_DSC02413%20-%20BannerWeb%201%20(4).png`

---

## Nota Importante

El CDN de Webflow (`cdn.prod.website-files.com`) no permite listar todos los archivos directamente. Para obtener las 30 imágenes de laptops, se recomienda:

1. **Acceder al panel de Webflow** → Assets → Filtrar por "laptop"
2. **Inspeccionar el sitio web en vivo** (`www.baldecash.com`) → DevTools → Network → filtrar por `png` o `jpg`
3. **Revisar el CMS de Webflow** si las laptops están en una colección

### Patrones de nombres identificados en el CDN:
- `hp15.png`, `hp-15.png`
- `mac-gold.png`, `macbook-*.png`
- `lenovo-*.png`
- `dell-*.png`
- `acer-*.png`
- `asus-*.png`

---

## Imágenes Alternativas (Unsplash - usadas en prototipos)

Si necesitas imágenes de laptops para prototipos, el proyecto ya usa estas de Unsplash:

| Marca | URL |
|-------|-----|
| MacBook | `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80` |
| Lenovo | `https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80` |
| HP | `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80` |
| ASUS | `https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80` |
| Dell | `https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80` |
| Acer | `https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=80` |

---

## Cómo extraer las imágenes del sitio Webflow

Para obtener todas las imágenes de laptops del CDN:

```javascript
// Ejecutar en DevTools del navegador en www.baldecash.com
const images = Array.from(document.querySelectorAll('img'))
  .filter(img => img.src.includes('cdn.prod.website-files.com'))
  .map(img => img.src);
console.log(images);
```

O buscar en el HTML fuente del sitio con:
```bash
curl -s https://www.baldecash.com | grep -oP 'https://cdn\.prod\.website-files\.com/[^"]+\.(png|jpg|webp)'
```
