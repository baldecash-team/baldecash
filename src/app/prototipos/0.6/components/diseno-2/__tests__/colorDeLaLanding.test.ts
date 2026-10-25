/**
 * I5 (BAL-4969, decisión del controlador): todo el kit de Diseño 2 usa el
 * color de la landing (`var(--color-primary)`, tintes con
 * `rgba(var(--color-primary-rgb), x)` y el tono oscuro mezclando negro), no el
 * morado del brandbook fijo. En una landing sin color propio la variable vale
 * #4654CD, así que se ve igual que antes.
 *
 * Única excepción: Baldecito (`BaldecitoV2.tsx`), la mascota, que va siempre
 * con los colores de la marca (BAL-4959, pedido de Emilio). Su test es
 * `BaldecitoV2.colores.test.tsx`.
 */
import fs from 'fs';
import path from 'path';

const RAIZ = path.resolve(__dirname, '..');
const MORADO_FIJO = /#4654CD|#3341B8|#E9ECFB|rgba\(70,\s*84,\s*205/i;

function archivosDelKit(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : archivosDelKit(ruta);
    if (e.name === 'BaldecitoV2.tsx') return [];
    return /\.(tsx?|css)$/.test(e.name) && !/\.test\./.test(e.name) ? [ruta] : [];
  });
}

function lineasConMoradoFijo(archivo: string): string[] {
  return fs
    .readFileSync(archivo, 'utf-8')
    .split('\n')
    .map((l, i) => ({ l, i }))
    // Los comentarios pueden nombrar el color por defecto.
    .filter(({ l }) => !/^\s*(\*|\/\/|\/\*)/.test(l) && MORADO_FIJO.test(l))
    .map(({ l, i }) => `${path.relative(RAIZ, archivo)}:${i + 1}: ${l.trim()}`);
}

describe('kit de Diseño 2: color de la landing', () => {
  it('components/diseno-2 no fija el morado del brandbook', () => {
    expect(archivosDelKit(RAIZ).flatMap(lineasConMoradoFijo)).toEqual([]);
  });

  it.each(['RadioGroup', 'ListaDeVarias', 'FieldTooltip', 'SelectInput', 'DateInput', 'FileUpload', 'AddressAutocompleteField'])(
    'las ramas v2 de %s usan la variable de la landing',
    (nombre) => {
      const archivo = path.resolve(RAIZ, '../../[landing]/solicitar/components/solicitar/fields', `${nombre}.tsx`);
      const fuente = fs.readFileSync(archivo, 'utf-8');
      expect(fuente).toContain('var(--color-primary)');
      expect(lineasConMoradoFijo(archivo)).toEqual([]);
    },
  );
});
