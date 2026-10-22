/**
 * Cómo se MUESTRAN los accesorios en el modal de "Lo quiero" (BAL-4957).
 * Nada de esto cambia los datos que se guardan ni los que viajan al backend:
 * solo el texto y el orden en pantalla.
 */

import type { Accessory } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';

/** Siglas que se quedan en mayúsculas aunque el nombre se normalice. */
const SIGLAS = new Set([
  'HP', 'LG', 'IPS', 'LED', 'LCD', 'USB', 'HD', 'FHD', 'UHD', 'QHD', 'SSD', 'HDD', 'RGB', 'TWS',
  'PC', 'TV', 'HDMI', 'VGA', 'BT', 'OTG', 'SD', 'AOC', 'MSI', 'JBL', 'CA', 'DC', 'AC', 'XL', 'XS',
  'II', 'III', 'IV', 'NFC', 'GPS', 'ANC', 'MAX', 'PRO',
]);

/** Marcas con su forma escrita correcta. */
const MARCAS: Record<string, string> = {
  razer: 'Razer', samsung: 'Samsung', lenovo: 'Lenovo', apple: 'Apple', teros: 'Teros',
  logitech: 'Logitech', xiaomi: 'Xiaomi', acer: 'Acer', asus: 'Asus', dell: 'Dell',
  kaspersky: 'Kaspersky', advance: 'Advance', huawei: 'Huawei', motorola: 'Motorola',
  honor: 'Honor', sony: 'Sony', epson: 'Epson', canon: 'Canon', microsoft: 'Microsoft',
  baldecash: 'BaldeCash', halion: 'Halion', genius: 'Genius', kingston: 'Kingston',
  sandisk: 'SanDisk', hyperx: 'HyperX', redragon: 'Redragon', anker: 'Anker', ugreen: 'Ugreen',
  'tp-link': 'TP-Link', xtech: 'Xtech', klip: 'Klip', targus: 'Targus',
};

/** Palabras cortas que van en minúscula en medio del nombre. */
const MINUSCULAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'para', 'con', 'sin', 'y', 'o', 'en', 'a', 'por', 'al']);

const capitalizar = (p: string) => p.charAt(0).toLocaleUpperCase('es') + p.slice(1);

function palabra(token: string, esPrimera: boolean, marca?: string): string {
  // Modelos y medidas (PM161Q, GT53, 1VV22AL, 24") se dejan tal cual.
  if (/\d/.test(token)) return token;
  const limpio = token.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü-]/g, '');
  if (!limpio) return token;
  if (SIGLAS.has(limpio)) return token;
  const bajo = limpio.toLocaleLowerCase('es');
  const conMarca = MARCAS[bajo] ?? (marca && bajo === marca.toLocaleLowerCase('es') ? capitalizar(bajo) : undefined);
  if (conMarca) return token.replace(limpio, conMarca);
  if (esPrimera) return token.replace(limpio, capitalizar(bajo));
  if (MINUSCULAS.has(bajo)) return token.replace(limpio, bajo);
  // Dos letras sin vocal (p. ej. «TP», «BK») suelen ser siglas.
  if (limpio.length <= 2 && !/[AEIOUÁÉÍÓÚ]/i.test(limpio)) return token;
  return token.replace(limpio, bajo);
}

/**
 * Baja el grito de los nombres escritos 100% en MAYÚSCULAS («KIT DE LIMPIEZA 1»
 * → «Kit de limpieza 1», «MOUSE RAZER» → «Mouse Razer»), respetando siglas,
 * marcas y modelos. Un nombre con alguna minúscula ya lo escribió alguien con
 * criterio y se deja como está.
 */
export function nombreParaMostrar(nombre: string, marca?: string | null): string {
  const letras = nombre.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g, '');
  if (!letras || letras !== letras.toLocaleUpperCase('es')) return nombre;
  let primera = true;
  return nombre
    .split(/(\s+)/)
    .map((t) => {
      if (!t || /^\s+$/.test(t)) return t;
      const out = palabra(t, primera, marca ?? undefined);
      primera = false;
      return out;
    })
    .join('');
}

/**
 * Agrupa por categoría sin perder la prioridad del backend: las categorías
 * salen en el orden en que aparece su primer accesorio, y dentro de cada una
 * se respeta el orden original.
 */
export function ordenarPorCategoria(accesorios: Accessory[]): Accessory[] {
  const orden = new Map<string, number>();
  const clave = (a: Accessory) => a.category?.slug ?? 'otro';
  accesorios.forEach((a) => {
    if (!orden.has(clave(a))) orden.set(clave(a), orden.size);
  });
  return accesorios
    .map((a, i) => ({ a, i }))
    .sort((x, y) => orden.get(clave(x.a))! - orden.get(clave(y.a))! || x.i - y.i)
    .map((x) => x.a);
}

/** Marcas de relleno del catálogo que no dicen nada al cliente. */
const MARCAS_GENERICAS = new Set(['accesorios', 'legacy', 'generico', 'genérico', 'otro', 'otros']);

export function marcaVisible(marca?: { name: string; slug: string } | null): string | null {
  if (!marca?.name) return null;
  if (MARCAS_GENERICAS.has(marca.slug?.toLowerCase()) || MARCAS_GENERICAS.has(marca.name.toLowerCase())) return null;
  return marca.name;
}

/**
 * Hasta tres datos útiles del accesorio: primero las specs; si no hay, las
 * primeras líneas o frases de la descripción.
 */
export function datosUtiles(acc: Pick<Accessory, 'specs' | 'description'>, max = 3): string[] {
  if (acc.specs && acc.specs.length > 0) {
    return acc.specs.slice(0, max).map((s) => `${s.label}: ${s.value}`);
  }
  const texto = (acc.description || '').trim();
  if (!texto) return [];
  const lineas = texto.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const partes = lineas.length > 1 ? lineas : texto.split(/(?<=\.)\s+/).map((l) => l.trim()).filter(Boolean);
  return partes
    .slice(0, max)
    .map((p) => p.replace(/^[-•·*]\s*/, '').replace(/\.$/, ''))
    .map((p) => (p.length > 110 ? `${p.slice(0, 107).trimEnd()}…` : p));
}
