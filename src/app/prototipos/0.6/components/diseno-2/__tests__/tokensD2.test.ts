/**
 * Tokens de color de Diseño 2 (BAL-5076): `src/app/d2-tokens.css`.
 *
 * 1. En CLARO nada cambia: cada token vale exactamente el color fijo que el
 *    componente tenía antes (hex del kit o color de Tailwind en oklch).
 * 2. Cada token claro tiene su par OSCURO (`[data-theme="nvidia"]`).
 * 3. En oscuro se cumple AA: 4,5:1 para texto y 3:1 para bordes de controles
 *    e íconos, contra la superficie donde se pintan.
 * 4. Los componentes del kit ya no traen los hex del kit escritos a mano.
 */
import fs from 'fs';
import path from 'path';
import { contrasteWcag } from '@/app/prototipos/0.6/utils/colorContrast';

const RAIZ = path.resolve(__dirname, '../../../../../..');
const CSS_TOKENS = fs.readFileSync(path.join(RAIZ, 'app/d2-tokens.css'), 'utf8');
const CSS_GLOBAL = fs.readFileSync(path.join(RAIZ, 'app/globals.css'), 'utf8');

function bloque(css: string, selector: string): Record<string, string> {
  const inicio = css.indexOf(`${selector} {`);
  if (inicio < 0) throw new Error(`sin bloque ${selector}`);
  const cuerpo = css.slice(css.indexOf('{', inicio) + 1, css.indexOf('\n}', inicio));
  const sinComentarios = cuerpo.replace(/\/\*[\s\S]*?\*\//g, '');
  const vars: Record<string, string> = {};
  for (const m of sinComentarios.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

const CLARO = bloque(CSS_TOKENS, ':root');
const OSCURO_CRUDO = bloque(CSS_TOKENS, '[data-theme="nvidia"]');
const NVIDIA = bloque(CSS_GLOBAL, '[data-theme="nvidia"]');

/** Resuelve `var(--surface)` & co. con los tokens de la landing oscura. */
function oscuro(token: string): string {
  const v = OSCURO_CRUDO[`--d2-${token}`];
  if (!v) throw new Error(`--d2-${token} sin valor oscuro`);
  const m = v.match(/^var\((--[\w-]+)\)$/);
  return m ? NVIDIA[m[1]] : v;
}

/** Valores de antes de BAL-5076 (los que estaban fijos en los componentes). */
const VALORES_DE_HOY: Record<string, string> = {
  fondo: '#F4F5F8', 'fondo-confirmacion': '#F7F8FC', tarjeta: '#FFFFFF', 'campo-apagado': '#F7F8FA',
  'gris-suave': 'oklch(98.5% 0 0)', gris: 'oklch(97% 0 0)', 'hover-gris': 'oklch(92.2% 0 0)',
  hover: '#E9EBF0', chip: '#EEF0F4', 'chip-numero': '#EDEFF7', 'marca-suave': '#F3F5FD', 'marca-suave-2': '#EEF0FB',
  texto: '#1E2230', 'texto-titulo': 'oklch(26.9% 0 0)', 'texto-2': '#3A4052', 'texto-gris': 'oklch(43.9% 0 0)',
  'texto-suave': '#5B6275', 'texto-seccion': 'oklch(55.6% 0 0)', 'texto-tenue': '#8A90A2',
  'icono-tenue': 'oklch(70.8% 0 0)', 'icono-vacio': 'oklch(87% 0 0)', etiqueta: '#262C66',
  borde: '#E3E6EE', 'borde-gris': 'oklch(97% 0 0)', 'borde-gris-2': 'oklch(92.2% 0 0)',
  'borde-boton': 'oklch(87% 0 0)', 'borde-casilla': 'oklch(70.8% 0 0)', 'borde-control': '#D5D9E6',
  'borde-campo': '#C9CEF0', 'borde-hito': '#C9CEDB', 'borde-tarjeta': '#AEB6EE',
  ok: '#0E8C78', 'ok-relleno': '#0E8C78', 'ok-texto': '#0B6B5C', 'ok-acento': '#0B8A6B',
  'ok-suave': '#E3F5F1', 'ok-suave-2': '#E6F7F1', 'ok-suave-3': '#E8F7F2', 'ok-suave-4': '#DDF3EC',
  'ok-suave-5': '#EAF7F2', 'ok-suave-6': '#F2FBF8', 'ok-borde': '#BFE6DA',
  'ok-claro': 'oklch(98.2% 0.018 155.826)', 'ok-claro-texto': 'oklch(52.7% 0.154 150.069)', 'progreso-ok': '#12B76A',
  error: '#C2410C', 'error-texto': '#B23C0A', 'error-suave': '#FFF1EB', 'error-borde': '#F2B79A',
  'error-rojo': 'oklch(57.7% 0.245 27.325)',
  'aviso-borde': '#F2B632', 'aviso-suave': '#FFF6D8',
  'ambar-suave': 'oklch(98.7% 0.022 95.277)', 'ambar-suave-2': 'oklch(96.2% 0.059 95.617)',
  'ambar-borde': 'oklch(92.4% 0.12 95.746)', 'ambar-borde-2': 'oklch(87.9% 0.169 91.605)',
  'ambar-icono': 'oklch(55.5% 0.163 48.998)', 'ambar-texto': 'oklch(47.3% 0.137 46.201)',
  'reac-borde': '#F5C46B', 'reac-suave': '#FFF7E6', 'reac-icono-fondo': '#FFE7B3', 'reac-icono': '#8A4B00',
  'reac-titulo': '#6B3A00', 'info-borde': '#C7CEF5', 'info-suave': '#EEF1FD', 'info-icono-fondo': '#DCE1FA',
  'info-icono': '#2F3CB0', 'info-titulo': '#232E8F',
  'boton-apagado': 'oklch(87% 0 0)', 'boton-apagado-texto': 'oklch(55.6% 0 0)',
  'prefijo-texto': 'color-mix(in srgb, var(--color-primary-text) 80%, black)',
  'cabecera-inicio': 'var(--color-primary)',
  'cabecera-texto': 'var(--color-on-primary)',
  'cabecera-medio': 'color-mix(in srgb, var(--color-primary) 85%, black)',
  'cabecera-fin': 'color-mix(in srgb, var(--color-primary) 70%, black)',
};

describe('tokens de Diseño 2 — claro igual que hoy', () => {
  it('cada token claro vale exactamente el color fijo de antes', () => {
    const claro = Object.fromEntries(
      Object.entries(CLARO).filter(([k]) => k.startsWith('--d2-')).map(([k, v]) => [k.slice(5), v]),
    );
    expect(claro).toEqual(VALORES_DE_HOY);
  });

  it('el valor oklch de los colores de Tailwind es el mismo del tema de Tailwind', () => {
    const tema = fs.readFileSync(path.join(RAIZ, '../node_modules/tailwindcss/theme.css'), 'utf8');
    const equivalencias: Record<string, string> = {
      'gris-suave': 'neutral-50', gris: 'neutral-100', 'hover-gris': 'neutral-200', 'texto-titulo': 'neutral-800',
      'texto-gris': 'neutral-600', 'texto-seccion': 'neutral-500', 'icono-tenue': 'neutral-400',
      'icono-vacio': 'neutral-300', 'borde-boton': 'neutral-300', 'borde-casilla': 'neutral-400',
      'ok-claro': 'green-50', 'ok-claro-texto': 'green-700', 'error-rojo': 'red-600',
      'ambar-suave': 'amber-50', 'ambar-suave-2': 'amber-100', 'ambar-borde': 'amber-200',
      'ambar-borde-2': 'amber-300', 'ambar-icono': 'amber-700', 'ambar-texto': 'amber-800',
      'boton-apagado': 'neutral-300', 'boton-apagado-texto': 'neutral-500',
    };
    for (const [token, color] of Object.entries(equivalencias)) {
      const m = tema.match(new RegExp(`--color-${color}:\\s*([^;]+);`));
      expect([token, CLARO[`--d2-${token}`]]).toEqual([token, m?.[1].trim()]);
    }
  });

  it('cada token claro tiene su valor oscuro', () => {
    const faltan = Object.keys(CLARO).filter((k) => !(k in OSCURO_CRUDO));
    expect(faltan).toEqual([]);
  });

  it('globals.css importa los tokens', () => {
    expect(CSS_GLOBAL).toMatch(/@import "\.\/d2-tokens\.css";/);
  });
});

/** [frente, fondo, mínimo] — fondo puede ser un token o un hex. */
type Par = [string, string, number];
const TEXTO = 4.5;
const BORDE = 3;
const PARES_OSCUROS: Par[] = [
  ['texto', 'tarjeta', TEXTO], ['texto', 'fondo', TEXTO], ['texto', 'marca-suave', TEXTO],
  ['texto-titulo', 'tarjeta', TEXTO], ['texto-2', 'tarjeta', TEXTO], ['texto-2', 'chip', TEXTO],
  ['texto-gris', 'gris', TEXTO], ['texto-suave', 'tarjeta', TEXTO], ['texto-suave', 'fondo', TEXTO],
  ['texto-suave', 'marca-suave', TEXTO], ['texto-suave', 'chip-numero', TEXTO], ['texto-seccion', 'tarjeta', TEXTO],
  ['texto-tenue', 'tarjeta', TEXTO], ['texto-tenue', 'marca-suave', TEXTO], ['etiqueta', 'tarjeta', TEXTO],
  ['ok-texto', 'ok-suave', TEXTO], ['ok-texto', 'ok-suave-4', TEXTO], ['ok-texto', 'ok-suave-6', TEXTO],
  ['ok-texto', 'tarjeta', TEXTO], ['ok-claro-texto', 'ok-claro', TEXTO], ['ok-acento', 'fondo', TEXTO],
  ['error-texto', 'tarjeta', TEXTO], ['error-texto', 'error-suave', TEXTO], ['error-rojo', 'tarjeta', TEXTO],
  ['texto', 'error-suave', TEXTO], ['texto', 'aviso-suave', TEXTO], ['texto', 'ok-suave-3', TEXTO],
  ['ambar-texto', 'ambar-suave', TEXTO], ['reac-titulo', 'reac-suave', TEXTO], ['info-titulo', 'info-suave', TEXTO],
  ['texto-2', 'reac-suave', TEXTO], ['texto-2', 'info-suave', TEXTO],
  // Bordes de controles e íconos (3:1)
  ['borde-campo', 'tarjeta', BORDE], ['borde-control', 'tarjeta', BORDE], ['borde-hito', 'tarjeta', BORDE],
  ['borde-casilla', 'tarjeta', BORDE], ['borde-boton', 'tarjeta', BORDE], ['ok', 'tarjeta', BORDE],
  ['error', 'tarjeta', BORDE], ['error', 'error-suave', BORDE], ['aviso-borde', 'aviso-suave', BORDE],
  ['ambar-icono', 'ambar-suave', BORDE], ['reac-icono', 'reac-icono-fondo', BORDE],
  ['info-icono', 'info-icono-fondo', BORDE], ['ok', 'ok-suave', BORDE],
  // Marca de la landing oscura (verde NVIDIA) como texto sobre la tarjeta.
  ['#76B900', 'tarjeta', TEXTO], ['#76B900', 'marca-suave', TEXTO],
  // Cabecera de la confirmación: texto blanco sobre el punto MÁS CLARO del
  // degradado (verde NVIDIA al 60 %, = #476F00).
  ['cabecera-texto', '#476F00', TEXTO],
];

function color(v: string): string {
  return v.startsWith('#') ? v : oscuro(v);
}

describe('tokens de Diseño 2 — contraste AA en oscuro', () => {
  it.each(PARES_OSCUROS)('%s sobre %s >= %s:1', (frente, fondo, minimo) => {
    expect(contrasteWcag(color(frente), color(fondo))).toBeGreaterThanOrEqual(minimo);
  });
});

describe('componentes del kit sin hex del kit escritos a mano', () => {
  const CARPETAS = ['components/diseno-2', 'components/lo-quiero'].map((c) =>
    path.join(RAIZ, 'app/prototipos/0.6', c),
  );
  // Ilustraciones (Baldecito, confeti, chispas): mismos colores en los dos temas.
  const ILUSTRACION = ['BaldecitoV2.tsx', 'confeti.ts', 'TransicionPaso.tsx', 'CabeceraConfirmacionV2.tsx'];
  // AvisoV2 lo reescribe BAL-5008 (variante de Diseño 1, rama aparte): se
  // pasa a tokens después de juntar las dos ramas, para no chocar.
  const PENDIENTE_BAL_5008 = ['AvisoV2.tsx'];
  const HEX_DEL_KIT = Object.values(VALORES_DE_HOY).filter((v) => v.startsWith('#') && v !== '#FFFFFF');

  function archivos(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === '__tests__' ? [] : archivos(p);
      return /\.tsx?$/.test(e.name) ? [p] : [];
    });
  }

  it('las clases usan var(--d2-*) en vez del hex', () => {
    const conHex: string[] = [];
    for (const archivo of CARPETAS.flatMap(archivos).filter((a) => !PENDIENTE_BAL_5008.includes(path.basename(a)))) {
      const texto = fs.readFileSync(archivo, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      for (const hex of HEX_DEL_KIT) {
        if (ILUSTRACION.includes(path.basename(archivo)) && /^#(0E8C78|1E2230)$/.test(hex)) continue;
        if (texto.toUpperCase().includes(`[${hex}]`) || texto.toUpperCase().includes(`'${hex}'`)) {
          conHex.push(`${path.basename(archivo)} ${hex}`);
        }
      }
    }
    expect(conHex).toEqual([]);
  });
});
