/**
 * Verificación final (BAL-4969): la lista de «Carrera» quedaba bajo el campo
 * siguiente. El campo que aparece por dependencia entra con `.d2-pop`, y una
 * animación con `fill-mode: both` se queda "llenando" `transform`/`opacity`:
 * eso crea un contexto de apilamiento que encierra el `z-50` de la lista.
 *
 * Las entradas de Diseño 2 que envuelven campos terminan en el estado natural,
 * así que van con `backwards`: al terminar no dejan nada aplicado.
 */
import fs from 'fs';
import path from 'path';

const css = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');

function reglaDe(clase: string): string {
  const m = css.match(new RegExp(String.raw`\.${clase}\s*\{([^}]*)\}`));
  if (!m) throw new Error(`No está la regla .${clase}`);
  return m[1];
}

describe('Entradas de Diseño 2 que envuelven campos con listas desplegables', () => {
  it.each(['d2-pop', 'd2-pop-lento', 'd2-aparece', 'd2-fundido', 'd2-saludo'])(
    '.%s no se queda aplicada al terminar (backwards, no both/forwards)',
    (clase) => {
      const regla = reglaDe(clase);
      expect(regla).toMatch(/animation:[^;]*\bbackwards\b/);
      expect(regla).not.toMatch(/\bboth\b|\bforwards\b/);
    },
  );
});
