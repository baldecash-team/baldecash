# Imágenes de Laptops - CDN Webflow BaldeCash

Base URL: `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/`

## 10 Imágenes de Laptops (Confirmadas)

| # | Modelo | URL |
|---|--------|-----|
| 1 | HP 15 | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8af9ed1fbf48ea397396_hp15.png` |
| 2 | HP Notebook 15 | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad88ee81af5459cee11a99_hp-nb-15-ef2511la-r5-5500u-8gb-256gbssd-156-w11-612b9laabim.jpg` |
| 3 | HP Victus 15 Gaming | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad8633afc74e8146b99e4a_VICTUS-15-FA0031DX-1.jpg` |
| 4 | Dell 1505 (sin fondo) | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ebb7cd44576556a7d0a_64ad7ac27cd445765564b11b_Dell_1505-removebg-preview.png` |
| 5 | Dell 1505 | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7ac27cd445765564b11b_Dell%201505.jpg` |
| 6 | Hyundai HyBook | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad79b64b6011e52725b3a7_hyndai_hybook.png` |
| 7 | Lenovo Chromebook S330 | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad7929bd7b580e6de7247d_Lenovo%20Chromebook%20S330.jpg` |
| 8 | ASUS X515EA | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64ad78aca11478d9ed058463_laptop_asus_x515ea.jpg` |
| 9 | MacBook Gold | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/623f67d99ae6d7aa236b8447_mac-gold.png` |
| 10 | MacBook Grey | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/623f67d5dc3c331e102b1f23_mac-grey.png` |

## Banners con Laptops

| # | Nombre | URL |
|---|--------|-----|
| 11 | Banner Full Power | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/6711289a0de9fe5f6c47123b_banner%20full%20power%20cambioRecurso%2024%402x.png` |
| 12 | Banner Full Power Mobile | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/67006bf4f88db2ea541b143f_banner%20full%20power%20mobile%20octubreRecurso%2015%402x%201.png` |
| 13 | DSC02413 BannerWeb 1 | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64dcdfc753b1f84b4c4807c9_DSC02413%20-%20BannerWeb%201.png` |
| 14 | DSC02413 BannerWeb 1 (4) | `https://cdn.prod.website-files.com/62141f21700a64ab3f816206/64e36cd8e690ae7d9c67aa32_DSC02413%20-%20BannerWeb%201%20(4).png` |

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
