/**
 * I5 (BAL-4969, decisión del controlador): todo el kit de Diseño 2 usa el
 * color de la landing (`var(--color-primary)`, tintes con
 * `rgba(var(--color-primary-rgb), x)` y el tono oscuro mezclando negro), no el
 * morado del brandbook fijo. En una landing sin color propio la variable vale
 * #4654CD, así que se ve igual que antes.
 *
 * (Baldecito, la mascota que iba con los colores fijos de la marca, ya no
 * existe: BAL-5203.)
 */
import fs from 'fs';
import path from 'path';

const RAIZ = path.resolve(__dirname, '..');
const MORADO_FIJO = /#4654CD|#3341B8|#E9ECFB|rgba\(70,\s*84,\s*205/i;

function archivosDelKit(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : archivosDelKit(ruta);
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
    // AvisoV2 con `diseno={1}` (BAL-5008) copia el `Toast` de Diseño 1, que
    // no toma el color de la landing: su morado vive solo en las constantes `D1_`.
    .filter(({ l }) => !(path.basename(archivo) === 'AvisoV2.tsx' && /^\s*const D1_[A-Z_]+ = /.test(l)))
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
