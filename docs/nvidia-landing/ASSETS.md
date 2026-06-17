# Landing NVIDIA — Diccionario de Assets

Todos los assets están en S3 bajo el prefijo público:

```
https://baldecash.s3.amazonaws.com/images/nvidia/
```

Acceso público (200). 53 archivos: 51 PNG + 2 MP4.

**Recomendación:** definir la base como constante en `nvidiaData.ts`:
```typescript
const NVIDIA_ASSETS = 'https://baldecash.s3.amazonaws.com/images/nvidia';
// Uso: `${NVIDIA_ASSETS}/gpus/rtx-3050.png`
```

---

## 🎮 GPUs (chips) — `/gpus/`

Para la sección "La laptop ideal para cada GeForce RTX".

| Modelo | URL |
|---|---|
| RTX 3050 | `images/nvidia/gpus/rtx-3050.png` |
| RTX 4050 | `images/nvidia/gpus/rtx-4050.png` |
| RTX 4060 | `images/nvidia/gpus/rtx-4060.png` |
| RTX 4070 | `images/nvidia/gpus/rtx-4070.png` |
| RTX 5050 | `images/nvidia/gpus/rtx-5050.png` |
| RTX 5060 | `images/nvidia/gpus/rtx-5060.png` |

El nombre del archivo coincide con el output de `parseNvidiaModel()` → `rtx-{model}.png`:
```typescript
const { family, model } = parseNvidiaModel(gpu); // { family: 'RTX', model: '3050' }
const chipUrl = `${NVIDIA_ASSETS}/gpus/${family.toLowerCase()}-${model}.png`;
```

---

## 💻 Laptops — `/laptops/`

Algunos archivos agrupan varios modelos (separados por `-` donde el original tenía `_`).

| Archivo | Modelos |
|---|---|
| `acer-nitro-v15-anv15-52-57bb-acer-nitro-v15-anv15-52-778v.png` | Acer Nitro V15 (2 variantes) |
| `acer-predator-helios-neo-phn16s.png` | Acer Predator Helios Neo PHN16S |
| `asus-rog-strix-g16-g615jmr.png` | Asus ROG Strix G16 |
| `asus-tuf-fx607vjb.png` | Asus TUF FX607VJB |
| `asus-tuf-gaming-a15.png` | Asus TUF Gaming A15 |
| `asus-tuf-gaming-f16-fx608jh.png` | Asus TUF Gaming F16 FX608JH |
| `hp-victus-15-fa2029la.png` | HP Victus 15-fa2029la |
| `hp-victus-15-fb3019la-hp-victus-16-s1023dx.png` | HP Victus 15-FB3019LA + 16-S1023DX |
| `lenovo-legion-5-15irx10-lenovo-legion-pro-5-16adr10.png` | Lenovo Legion 5 + Pro 5 |
| `lenovo-loq-15ahp10.png` | Lenovo LOQ 15AHP10 |
| `lenovo-loq-15iax9.png` | Lenovo LOQ 15IAX9 |
| `lenovo-loq-15irx10.png` | Lenovo LOQ 15IRX10 |
| `lenovo-loq-15irx11.png` | Lenovo LOQ 15IRX11 |
| `msi-cyborg-15-a13ve-msi-cyborg-15-a13vfk.png` | MSI Cyborg 15 A13 (2 variantes) |
| `msi-cyborg-15-b13wekg-msi-cyborg-15-b2rwekg-msi-cyborg-15-b2rwfkg.png` | MSI Cyborg 15 B13/B2 (3 variantes) |

> **Nota:** para la sección de juegos y GPUs, las imágenes de laptops vienen del catálogo (`thumbnail_url`). Estas imágenes de `/laptops/` son para secciones estáticas de la landing donde se quiera mostrar un render específico.

---

## 🖥️ Software — `/software/`

27 logos de programas. Para la sección "Según tu carrera / Rendimiento" donde se muestra qué software corre cada GPU.

**Diseño / Video / Foto:**
`adobe-after-effects.png` · `adobe-camera-raw.png` · `adobe-lightroom.png` · `adobe-media-encoder.png` · `adobe-photoshop.png` · `adobe-premiere-pro.png` · `adobe-substance.png` · `capture-one.png` · `cinema-4d.png` · `davinci-resolve.png` · `autodesk-maya.png` · `zbrush.png`

**Arquitectura / Ingeniería:**
`autocad.png` · `autocad-ingenieria.png` · `revit.png` · `sketchup.png` · `lumion.png` · `solidworks.png` · `ansys.png` · `matlab-ingenieria-matlab-datos-ia.png`

**3D / Videojuegos:**
`blender-3d-blender-videojuegos.png` · `unreal-engine.png` · `unity.png`

**IA / Datos:**
`tensorflow.png` · `pytorch.png` · `stable-diffusion.png`

Ruta: `images/nvidia/software/{nombre}.png`

---

## 🎨 Fondos y marca — `/backgrounds/`

| Archivo | Uso |
|---|---|
| `logo-baldecash-x-nvidia.png` | Logo del navbar |
| `fondo-header.png` | Fondo del hero |
| `fondo-estrellas.png` | Fondo decorativo de secciones |
| `baldi-con-laptop-rtx.png` | Mascota Baldi con laptop |

Ruta: `images/nvidia/backgrounds/{nombre}.png`

---

## 🎥 Videos — `/videos/`

| Archivo | Uso probable |
|---|---|
| `video-baldi-rtx.mp4` | Video de Baldi (mascota) |
| `video-tarjetas-gpu.mp4` | Video de las tarjetas GPU |

Ruta: `images/nvidia/videos/{nombre}.mp4`

⚠️ **Rendimiento:** estos videos son pesados. Aplicar las reglas de `PERFORMANCE.md`:
- Hero video: `preload="auto"` + `poster`
- Videos below-fold: dentro de `LazySection`, nunca en `tier === 'base'`

---

## Resumen de carpetas

```
images/nvidia/
├── gpus/          6 chips RTX (rtx-3050.png … rtx-5060.png)
├── laptops/       15 renders de laptops
├── software/      41 logos de programas (27 + 14 nuevos del selector)
├── backgrounds/   4 fondos y marca
└── videos/        2 MP4
```

---

## 🆕 Software adicional — selector (segunda tanda)

14 imágenes nuevas para el selector de software/tecnologías, subidas también a `/software/`.

Ruta: `images/nvidia/software/{nombre}.png`

**Software de creación / render:**

| Archivo | Programa |
|---|---|
| `3ds-max.png` | Autodesk 3ds Max |
| `blender-2.png` | Blender (variante adicional) |
| `d5-render.png` | D5 Render |
| `enscape.png` | Enscape |
| `twinmotion.png` | Twinmotion |

**Ingeniería / datos:**

| Archivo | Programa |
|---|---|
| `matlab.png` | MATLAB |
| `simulink.png` | Simulink |
| `rapids.png` | NVIDIA RAPIDS |

**Tecnologías NVIDIA:**

| Archivo | Tecnología |
|---|---|
| `dlss.png` | DLSS |
| `ray-tracing-rtx.png` | Ray Tracing RTX |
| `rtx-ia.png` | RTX IA |
| `nvidia-studio.png` | NVIDIA Studio |
| `nvidia-broadcast.png` | NVIDIA Broadcast |
| `geforce-experience.png` | GeForce Experience |
