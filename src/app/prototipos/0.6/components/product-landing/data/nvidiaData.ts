/**
 * Landing NVIDIA — data local (estática).
 * El HOME no depende de la API para su contenido salvo la sección #catalogo
 * (laptops por GPU), que se trae con fetchCatalogData('zona-gamer').
 *
 * Assets en S3 → ver ASSETS.md. Base pública:
 */
export const NVIDIA_ASSETS = 'https://baldecash.s3.amazonaws.com/images/nvidia';

// ============================================================
// S1: Hero (#top)
// ============================================================
export const heroData = {
  headline: 'Tu carrera tiene grandes planes, tu laptop también',
  // "grandes planes" va con gradiente en el prototipo
  highlight: 'grandes planes,',
  description: 'Equipos con tarjeta GeForce RTX para diseño, ingeniería, arquitectura y más,',
  descriptionGreen: 'en cuotas accesibles y sin historial crediticio.',
  descriptionPost: 'Estudia y crea sin esperas.',
  cta: { label: 'Descubre tu GeForce RTX ideal', scrollTo: 'selector' },
  video: `${NVIDIA_ASSETS}/videos/video-baldi-rtx.mp4`,
};

// ============================================================
// S2: Quiénes somos (#baldecash)
// ============================================================
export const quienesSomos = {
  eyebrow: 'Quiénes somos',
  headline: 'Financiamos el equipo que necesitas para tu carrera',
  highlight: 'necesitas para tu carrera',
  description:
    'BaldeCash es la fintech que facilita el acceso a la tecnología profesional a más estudiantes. Elige la tarjeta GeForce RTX que tu carrera necesita (Serie 30, 40 o 50) y nosotros te ofrecemos la laptop que mejor rinde con ella, en cuotas pensadas para ti.',
  points: [
    { title: 'En cuotas', detail: 'desde S/ 129 al mes' },
    { title: 'Sin historial crediticio', detail: 'aprobación simple y rápida' },
    { title: 'Tarjeta GeForce RTX', detail: 'potencia de nivel profesional' },
  ],
  partnerLabel: 'Partner oficial de NVIDIA',
  partnerLogo: `${NVIDIA_ASSETS}/backgrounds/logo-baldecash-x-nvidia.png`,
  media: `${NVIDIA_ASSETS}/nuevo-baldi-header.png`,
};

// ============================================================
// S3: Conoce cada GeForce RTX (#que-es)
// ============================================================
export const queEsData = {
  eyebrow: 'Antes de elegir',
  headline: 'Conoce cada GeForce RTX',
  highlight: 'GeForce RTX',
  description: 'Cada serie rinde distinto. Descubre qué ofrece cada una y para qué sirve.',
  video: `${NVIDIA_ASSETS}/videos/video-tarjetas-gpu.mp4`,
  cards: [
    {
      model: '3050', name: 'GeForce RTX 3050', serie: 'Serie 30', desc: 'Serie 30 · el más accesible',
      info: 'Tu entrada al mundo RTX. Combina gráficos realistas con una inteligencia artificial que hace que todo corra más fluido, hasta el doble de rápido. Ideal para empezar a programar, diseñar y editar sin gastar de más.',
      specs: ['Arquitectura Ampere', 'Ray tracing + DLSS', 'RT 2ª gen · Tensor 3ª gen'],
    },
    {
      model: '4050', name: 'GeForce RTX 4050', serie: 'Serie 40', desc: 'Serie 40 · equilibrio',
      info: 'Una generación más nueva y eficiente: rinde más y cuida la batería. Suma una inteligencia artificial que mejora la fluidez y la nitidez de la imagen, y acelera la edición de tus videos. La opción equilibrada para diseño, fotografía y modelado donde estés.',
      specs: ['Arquitectura Ada Lovelace', 'DLSS 3 · Frame Generation', 'Codificador AV1'],
    },
    {
      model: '4060', name: 'GeForce RTX 4060', serie: 'Serie 40', desc: 'Serie 40 · equilibrio con más potencia',
      info: 'Más potencia y memoria que la 4050, con la misma eficiencia: render 3D, edición y varias tareas a la vez sin perder fluidez. Mantiene una gran duración de batería para jornadas largas de estudio.',
      specs: ['Arquitectura Ada Lovelace', 'Más núcleos que la 4050', 'DLSS 3 · AV1'],
    },
    {
      model: '4070', name: 'GeForce RTX 4070', serie: 'Serie 40', desc: 'Serie 40 · alto rendimiento',
      info: 'Lo más potente de su serie en laptop: más potencia para que el rendimiento no baje aunque la exijas. Pensada para 3D, video en 4K y simulaciones pesadas, con gráficos realistas y una inteligencia artificial que mantiene todo fluido.',
      specs: ['Arquitectura Ada Lovelace', 'Tope de la Serie 40', 'DLSS 3 · AV1'],
    },
    {
      model: '5050', name: 'GeForce RTX 5050', serie: 'Serie 50', desc: 'Serie 50 · nueva generación',
      info: 'La nueva generación de NVIDIA. Trae la versión más avanzada de su inteligencia artificial, que multiplica la fluidez y potencia la creación con IA, y una tecnología que extiende la batería hasta un 40%.',
      specs: ['Arquitectura Blackwell', 'DLSS 4 · Multi Frame Gen', 'FP4 para IA'],
    },
    {
      model: '5060', name: 'GeForce RTX 5060', serie: 'Serie 50', desc: 'Serie 50 · lo más potente',
      info: 'Lo más potente de esta selección. La última generación, con más potencia y la inteligencia artificial más avanzada de NVIDIA para máxima fluidez y mejores gráficos. Para render 3D, video en 4K y creación con IA al máximo, sin descuidar la eficiencia.',
      specs: ['Arquitectura Blackwell', 'DLSS 4 · Multi Frame Gen', 'Neural rendering · FP4'],
    },
  ],
};

/** URL del chip GPU por modelo (parseNvidiaModel → 'rtx-{model}.png') */
export const gpuChipUrl = (model: string) =>
  `${NVIDIA_ASSETS}/gpus/rtx-${model}.png`;

// ============================================================
// S4 + S5: Software por carrera — UNA sola lista, usada por el Selector
// (#selector) y por Rendimiento (#performance). Mismos 4 software por carrera.
// `x` = multiplicador "hasta N×" dentro de rango verificado (ver BENCHMARKS.md).
// img: '' → se muestra un placeholder con la inicial (logo pendiente de subir).
// ============================================================
/** logo de software en S3 */
const sw = (file: string) => `${NVIDIA_ASSETS}/software/${file}.png`;

export interface NvidiaApp {
  name: string;
  img: string;     // '' = placeholder (logo pendiente)
  sub: string;     // tarea corta (etiqueta de la barra)
  gain: string;    // frase corta (tile del selector)
  why: string;     // explicación (detalle del selector)
  card: string;    // GPU recomendada, ej. 'RTX 4060'
  x: number;       // multiplicador normalizado para el gráfico
  imgPos?: string; // background-position del tile (ej. 'center top') si el encuadre por defecto recorta mal
  similar?: string[]; // programas reconocibles del mismo tipo (para ubicar al estudiante)
}
export interface NvidiaCareer {
  id: string;
  label: string;
  baseline: string; // etiqueta de la barra base del gráfico
  apps: NvidiaApp[];
}

export const CAREERS: NvidiaCareer[] = [
  {
    id: 'arqui', label: 'Arquitectura', baseline: 'Otras tarjetas gráficas',
    apps: [
      { name: 'D5 Render', img: sw('d5-render'), sub: 'render rápido', card: 'RTX 5060', x: 3, similar: ['V-Ray', 'Enscape', 'Lumion'], gain: 'Recorridos fotorrealistas en tiempo real', why: 'La GeForce RTX 5060 acelera D5 Render con ray tracing por hardware: recorres y renderizas escenas arquitectónicas fotorrealistas en tiempo real y exportas en una fracción del tiempo.' },
      { name: 'Lumion', img: sw('lumion'), sub: 'renders realistas', card: 'RTX 5050', x: 3, similar: ['Enscape', 'Twinmotion', 'V-Ray'], gain: 'Renders fotorrealistas al instante', why: 'La GeForce RTX 5050 lleva Lumion al tiempo real: sus núcleos RTX generan recorridos y renders arquitectónicos fotorrealistas en una fracción del tiempo, para presentar tus ideas tal como las imaginas.' },
      { name: 'Enscape', img: sw('enscape'), sub: 'recorridos en vivo', card: 'RTX 4060', x: 2, similar: ['Lumion', 'Twinmotion', 'V-Ray'], gain: 'Tu modelo, en tiempo real', why: 'La GeForce RTX 4060 mueve Enscape con ray tracing en tiempo real: recorres tu proyecto con iluminación y reflejos realistas mientras editas, y con DLSS subes los FPS sin perder calidad.' },
      { name: 'Twinmotion', img: sw('twinmotion'), sub: 'luz realista', card: 'RTX 4060', x: 2, similar: ['Lumion', 'Enscape', 'V-Ray'], gain: 'Ray tracing y recorridos fluidos', why: 'La GeForce RTX 4060 activa el path tracer de Twinmotion: generas recorridos e imágenes con iluminación realista, algo que una laptop sin tarjeta gráfica dedicada no puede hacer.' },
    ],
  },
  {
    id: 'ing', label: 'Ingeniería', baseline: 'Sin tarjeta gráfica dedicada',
    apps: [
      { name: 'MATLAB', img: sw('matlab-ingenieria-matlab-datos-ia'), sub: 'cálculos rápidos', card: 'RTX 5060', x: 8, similar: ['Octave', 'Scilab', 'Mathematica'], gain: 'Cálculo matricial en la tarjeta gráfica', why: 'La GeForce RTX 5060 acelera MATLAB con gpuArray: resuelves cálculos matriciales y simulaciones masivas mucho más rápido que solo con CPU, para iterar tus análisis sin esperas.' },
      { name: 'SolidWorks Visualize', img: sw('solidworks'), sub: 'render de piezas', card: 'RTX 4060', x: 5, similar: ['KeyShot', 'V-Ray', 'Octane Render'], gain: 'Render fotorrealista por la tarjeta gráfica', why: 'La GeForce RTX 4060 acelera SolidWorks Visualize con el motor Iray: generas renders fotorrealistas de tus piezas y ensambles en una fracción del tiempo que toma la CPU.' },
      { name: 'ANSYS', img: sw('ansys'), sub: 'simulaciones', card: 'RTX 5060', x: 3, similar: ['Abaqus', 'COMSOL', 'Autodesk CFD'], gain: 'Simulaciones FEA y CFD aceleradas', why: 'La GeForce RTX 5060 acelera las simulaciones FEA y CFD de ANSYS con cómputo en la tarjeta gráfica: resuelves modelos exigentes en mucho menos tiempo, para validar tus diseños antes.' },
      { name: 'Simulink', img: sw('simulink'), sub: 'simular modelos', card: 'RTX 4060', x: 3, similar: ['LabVIEW', 'Xcos', 'Modelica'], gain: 'Simula a la velocidad de la tarjeta gráfica', why: 'La GeForce RTX 4060 acelera los modelos de Simulink aptos para cómputo paralelo: generas kernels CUDA y corres simulaciones más rápido que solo con CPU.' },
    ],
  },
  {
    id: 'datos', label: 'Ciencia de Datos / IA', baseline: 'Sin tarjeta gráfica dedicada',
    apps: [
      { name: 'RAPIDS', img: sw('rapids'), sub: 'procesar datos', card: 'RTX 5060', x: 12, similar: ['pandas', 'Polars', 'Dask'], gain: 'Tus datos, procesados en la tarjeta gráfica', why: 'La GeForce RTX 5060 acelera RAPIDS (cuDF/cuML): procesas DataFrames y entrenas modelos de machine learning clásico mucho más rápido que con pandas/scikit-learn en CPU, sin cambiar tu código.' },
      { name: 'Stable Diffusion', img: sw('stable-diffusion'), sub: 'imágenes con IA', card: 'RTX 5050', x: 12, similar: ['Midjourney', 'DALL·E', 'Leonardo AI'], gain: 'Genera imágenes con IA en segundos', why: 'La GeForce RTX 5050 genera imágenes con Stable Diffusion usando sus Núcleos Tensor: produces y ajustas resultados en segundos, para explorar muchas más ideas por sesión.' },
      { name: 'PyTorch', img: sw('pytorch'), sub: 'entrenar IA', card: 'RTX 5060', x: 9, similar: ['TensorFlow', 'Keras', 'JAX'], gain: 'Entrena tus modelos mucho más rápido', why: 'La GeForce RTX 5060 entrena tus modelos de deep learning en PyTorch con aceleración CUDA y Núcleos Tensor: completas épocas en una fracción del tiempo que toma la CPU.' },
      { name: 'TensorFlow', img: sw('tensorflow'), sub: 'entrenar IA', card: 'RTX 5060', x: 8, similar: ['PyTorch', 'Keras', 'JAX'], gain: 'Redes neuronales sin largas esperas', why: 'La GeForce RTX 5060 acelera el entrenamiento de redes neuronales en TensorFlow con CUDA y Núcleos Tensor: iteras arquitecturas y ajustas hiperparámetros sin que cada prueba te cueste el día.' },
    ],
  },
  {
    id: '3d', label: 'Diseño 3D / Animación', baseline: 'Sin tarjeta gráfica dedicada',
    apps: [
      { name: 'Blender', img: sw('blender-3d-blender-videojuegos'), sub: 'render 3D', card: 'RTX 5060', x: 10, similar: ['Maya', '3ds Max', 'Houdini'], gain: 'Render con OptiX en una fracción del tiempo', why: 'La GeForce RTX 5060 acelera Blender con el motor OptiX: renderizas escenas complejas en una fracción del tiempo que toma la CPU y previsualizas con denoising por IA en tiempo real.' },
      { name: 'Cinema 4D', img: sw('cinema-4d'), sub: 'animación 3D', card: 'RTX 5050', x: 9, similar: ['Blender', 'Houdini', 'Maya'], gain: 'Motion graphics que fluyen', why: 'La GeForce RTX 5050 acelera Cinema 4D con Redshift: renderizas motion graphics y escenas 3D en mucho menos tiempo, con un viewport fluido para iterar sin esperas.' },
      { name: '3ds Max', img: sw('3ds-max'), imgPos: 'center top', sub: 'render de escenas', card: 'RTX 4060', x: 3, similar: ['Maya', 'Blender', 'Cinema 4D'], gain: 'Render acelerado con V-Ray', why: 'La GeForce RTX 4060 acelera el render de 3ds Max con V-Ray: renderizas escenas de arquitectura y producto en menos tiempo, y escala aún más si sumas varias tarjetas.' },
      { name: 'Autodesk Maya', img: sw('autodesk-maya'), sub: 'animar y renderizar', card: 'RTX 5050', x: 3, similar: ['Blender', '3ds Max', 'Houdini'], gain: 'Preview y render con Arnold', why: 'La GeForce RTX 5050 acelera el preview y el render de Autodesk Maya con Arnold: animas y previsualizas proyectos pesados manteniendo tu ritmo.' },
    ],
  },
  {
    id: 'video', label: 'Edición de Video', baseline: 'Sin tarjeta gráfica dedicada',
    apps: [
      { name: 'DaVinci Resolve', img: sw('davinci-resolve'), sub: 'corrección de color', card: 'RTX 5060', x: 5, similar: ['Premiere Pro', 'Final Cut Pro', 'Avid'], gain: 'Color 4K e IA en tiempo real', why: 'La GeForce RTX 5060 lleva el color de DaVinci a otro nivel: corriges en 4K en tiempo real y sus Núcleos Tensor aceleran las herramientas de IA como Magic Mask, sin esperar a cada render.' },
      { name: 'Premiere', img: sw('adobe-premiere-pro'), sub: 'exportar video', card: 'RTX 4060', x: 4, similar: ['Final Cut Pro', 'DaVinci Resolve', 'Vegas Pro'], gain: 'Exporta 4K con NVENC', why: 'La GeForce RTX 4060 acelera Premiere con el codificador NVENC: exporta tus videos 4K en una fracción del tiempo y la línea de tiempo corre fluida, sin proxies ni interrupciones.' },
      { name: 'Media Encoder', img: sw('adobe-media-encoder'), sub: 'exportar video', card: 'RTX 3050', x: 4, similar: ['HandBrake', 'FFmpeg', 'Compressor'], gain: 'Exporta en tiempo récord', why: 'La GeForce RTX 3050 acelera Media Encoder con su codificador NVENC por hardware: exporta tus videos mucho más rápido que la CPU, así entregas sin esperas y sin gastar de más.' },
      { name: 'After Effects', img: sw('adobe-after-effects'), sub: 'efectos visuales', card: 'RTX 4070', x: 3, similar: ['Nuke', 'Fusion', 'Motion'], gain: 'Efectos 3D sin barra de progreso', why: 'La GeForce RTX 4070 acelera el Advanced 3D Renderer y los efectos por tarjeta gráfica de After Effects: previsualizas y renderizas composiciones 3D mucho más rápido, para iterar sin perder el hilo creativo.' },
    ],
  },
  {
    id: 'foto', label: 'Fotografía', baseline: 'Sin tarjeta gráfica dedicada',
    apps: [
      { name: 'Lightroom', img: sw('adobe-lightroom'), sub: 'quitar ruido', card: 'RTX 4050', x: 8, similar: ['Capture One', 'DxO PhotoLab', 'Luminar Neo'], gain: 'Quita ruido con IA al instante', why: 'La GeForce RTX 4050 acelera el Quitar ruido con IA de Lightroom: lo que en CPU tarda minutos, en RTX toma segundos, para procesar sesiones enteras sin esperas.' },
      { name: 'Camera Raw', img: sw('adobe-camera-raw'), sub: 'quitar ruido', card: 'RTX 4050', x: 8, similar: ['Lightroom', 'DxO PhotoLab', 'RawTherapee'], gain: 'RAW con IA, en un instante', why: 'La GeForce RTX 4050 acelera el Denoise IA de Camera Raw: revelas tus RAW y les quitas el ruido en segundos en vez de minutos, para editar tus fotos sin pausas.' },
      { name: 'Photoshop', img: sw('adobe-photoshop'), sub: 'edición con IA', card: 'RTX 4050', x: 2, similar: ['GIMP', 'Affinity Photo', 'Krita'], gain: 'Filtros con IA más ágiles', why: 'La GeForce RTX 4050 acelera los Filtros Neurales y funciones de IA de Photoshop, y con suficiente VRAM evita las ralentizaciones al usar Denoise o Generative Fill.' },
      { name: 'Capture One', img: sw('capture-one'), sub: 'revelar fotos', card: 'RTX 3050', x: 3, similar: ['Lightroom', 'DxO PhotoLab', 'Luminar Neo'], gain: 'Revela RAW con fluidez', why: 'La GeForce RTX 3050 acelera el procesado y export RAW de Capture One vía OpenCL: trabajas en tethering y revelas archivos de alta resolución sin esperas, ideal para sesiones largas.' },
    ],
  },
  {
    id: 'games', label: 'Desarrollo de Videojuegos', baseline: 'Sin tarjeta gráfica dedicada',
    apps: [
      { name: 'Substance 3D', img: sw('adobe-substance'), sub: 'crear texturas', card: 'RTX 4060', x: 9, similar: ['Quixel Mixer', 'Mari', '3D-Coat'], gain: 'Baking por la tarjeta gráfica casi instantáneo', why: 'La GeForce RTX 4060 acelera el baking de mapas (AO, thickness) de Substance 3D con ray tracing por la tarjeta gráfica: lo que tardaba minutos pasa a segundos, y previsualizas tus texturas en tiempo real.' },
      { name: 'Blender', img: sw('blender-3d-blender-videojuegos'), sub: 'modelos 3D', card: 'RTX 5060', x: 8, similar: ['Maya', '3ds Max', 'ZBrush'], gain: 'Crea tus assets 3D sin esperas', why: 'La GeForce RTX 5060 acelera Blender con OptiX: modelas, texturizas y renderizas los assets 3D de tu juego en una fracción del tiempo, listos para tu videojuego.' },
      { name: 'Unreal Engine', img: sw('unreal-engine'), sub: 'crear mundos 3D', card: 'RTX 5060', x: 6, similar: ['Unity', 'Godot', 'CryEngine'], gain: 'Lumen y Nanite en tiempo real', why: 'La GeForce RTX 5060 activa Lumen, Nanite y el ray tracing de Unreal Engine, y calcula la iluminación con Lightmass por tarjeta gráfica mucho más rápido que en CPU, sin largas esperas.' },
      { name: 'Unity', img: sw('unity'), sub: 'armar el juego', card: 'RTX 4060', x: 5, similar: ['Unreal Engine', 'Godot', 'GameMaker'], gain: 'Hornea luz e itera sin esperas', why: 'La GeForce RTX 4060 acelera el Progressive Lightmapper por tarjeta gráfica de Unity y el preview en tiempo real, para probar ideas de tu juego con total libertad.' },
    ],
  },
];

// ============================================================
// S7: Equipo estrella (#estrella) — HARDCODED
// ============================================================
export const estrellaData = {
  eyebrow: 'Equipo recomendado',
  name: 'HP Victus 15-fa2029la',
  highlight: '15-fa2029la',
  lead: 'Equipada con la nueva GeForce RTX 5050, además de 24 GB de RAM y 1 TB SSD. Lista para diseñar, simular, editar, programar y mucho más, a una cuota accesible.',
  specs: [
    { value: 'RTX 5050', note: '8 GB VRAM' },
    { value: '24 GB', note: 'RAM DDR5' },
    { value: '1 TB', note: 'SSD NVMe' },
  ],
  priceLabel: 'cuota desde',
  price: 'S/ 289',
  cta: { label: 'Lo quiero', url: 'https://www.baldecash.com/home/solicitar/' },
};

// ============================================================
// S8: Beneficios (#beneficios)
// ============================================================
export const beneficiosData = {
  eyebrow: 'Más con tu GeForce RTX',
  headline: 'Funciones y beneficios adicionales',
  highlight: 'beneficios adicionales',
  description:
    'Tu laptop GeForce RTX con BaldeCash suma mucho más que velocidad: todo un ecosistema de tecnologías NVIDIA para crear, estudiar y jugar mejor.',
  cards: [
    { title: 'GeForce Experience', img: sw('geforce-experience'), desc: 'Crea y comparte videos, capturas de pantalla y transmisiones en vivo desde tu laptop. Mantén los drivers al día y optimiza tus juegos con un clic, todo desde una sola app.' },
    { title: 'NVIDIA Studio', img: sw('nvidia-studio'), desc: 'Drivers probados y optimizados para más de 100 apps creativas y de ingeniería (AutoCAD, Revit, Premiere, Blender). Tu laptop rinde estable y al máximo en los programas de tu carrera.' },
    { title: 'NVIDIA Broadcast', img: sw('nvidia-broadcast'), desc: 'Convierte tu cuarto en un estudio: elimina el ruido del micrófono, mejora tu cámara y agrega fondos virtuales en tus clases y reuniones online.' },
    { title: 'DLSS (Deep Learning Super Sampling)', img: sw('dlss'), desc: 'Inteligencia artificial que multiplica los cuadros por segundo en tu laptop. Juega y previsualiza tus proyectos con más fluidez, sin gastar de más la batería.' },
    { title: 'Ray Tracing RTX', img: sw('ray-tracing-rtx'), desc: 'Luz, sombras y reflejos calculados en tiempo real para que tus render 3D, maquetas y diseños se vean realistas y profesionales, directo desde tu laptop.' },
    { title: 'NVIDIA RTX AI', img: sw('rtx-ia'), desc: 'Acelera la IA de tus apps y corre modelos en tu laptop, como generar imágenes, quitar ruido o mejorar la resolución, sin depender de la nube.' },
  ],
};

// ============================================================
// Nav links (anchors del HOME)
// ============================================================
export const navLinks = [
  { label: 'Nosotros', sectionId: 'baldecash' },
  { label: 'Según tu carrera', sectionId: 'selector' },
  { label: 'Rendimiento', sectionId: 'performance' },
  { label: 'Recomendado', sectionId: 'estrella' },
  { label: 'Catálogo', sectionId: 'catalogo' },
  { label: 'GeForce RTX', sectionId: 'que-es' },
  { label: 'Beneficios', sectionId: 'beneficios' },
];
