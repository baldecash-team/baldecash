import { resolverForma } from '../formaDeLista';

const casos: Array<[string, Parameters<typeof resolverForma>[0], string]> = [
  // Sin forma elegida = exactamente como hoy
  ['select 2 sin forma', { tipo: 'select', displayMode: null, cantidad: 2, delSistema: false }, 'buttons'],
  ['select 3 sin forma', { tipo: 'select', displayMode: null, cantidad: 3, delSistema: false }, 'buttons'],
  ['select 4 sin forma', { tipo: 'select', displayMode: null, cantidad: 4, delSistema: false }, 'cards'],
  ['select 5 sin forma', { tipo: 'select', displayMode: null, cantidad: 5, delSistema: false }, 'cards'],
  ['select 6 sin forma', { tipo: 'select', displayMode: null, cantidad: 6, delSistema: false }, 'dropdown'],
  ['select 9 sin forma', { tipo: 'select', displayMode: null, cantidad: 9, delSistema: false }, 'dropdown'],
  ['select 10 sin forma', { tipo: 'select', displayMode: null, cantidad: 10, delSistema: false }, 'search'],
  ['select del sistema', { tipo: 'select', displayMode: null, cantidad: 0, delSistema: true }, 'search'],
  ['autocomplete 2 sin forma', { tipo: 'autocomplete', displayMode: null, cantidad: 2, delSistema: false }, 'search'],
  ['autocomplete del sistema', { tipo: 'autocomplete', displayMode: null, cantidad: 0, delSistema: true }, 'search'],
  // Automática = regla por cantidad, también para autocomplete
  ['autocomplete 2 auto', { tipo: 'autocomplete', displayMode: 'auto', cantidad: 2, delSistema: false }, 'buttons'],
  ['autocomplete 32 auto', { tipo: 'autocomplete', displayMode: 'auto', cantidad: 32, delSistema: false }, 'search'],
  // Elegida
  ['select 8 tarjetas', { tipo: 'select', displayMode: 'cards', cantidad: 8, delSistema: false }, 'cards'],
  ['select 3 buscador', { tipo: 'select', displayMode: 'search', cantidad: 3, delSistema: false }, 'search'],
  ['autocomplete 4 botones', { tipo: 'autocomplete', displayMode: 'buttons', cantidad: 4, delSistema: false }, 'buttons'],
  // Límites
  ['botones con 5 caen a auto', { tipo: 'select', displayMode: 'buttons', cantidad: 5, delSistema: false }, 'cards'],
  ['del sistema ignora botones', { tipo: 'select', displayMode: 'buttons', cantidad: 0, delSistema: true }, 'search'],
  // Casillas sin varias no existe: cae a la automática
  ['casillas sin varias', { tipo: 'select', displayMode: 'checkboxes', cantidad: 4, delSistema: false }, 'cards'],
  // Con varias (BAL-4354): recomendada 2–5 Casillas, 6–9 Desplegable, 10+ Buscador
  ['varias 2 sin forma', { tipo: 'select', displayMode: null, cantidad: 2, delSistema: false, varias: true }, 'checkboxes'],
  ['varias 5 auto', { tipo: 'select', displayMode: 'auto', cantidad: 5, delSistema: false, varias: true }, 'checkboxes'],
  ['varias 6 sin forma', { tipo: 'select', displayMode: null, cantidad: 6, delSistema: false, varias: true }, 'dropdown'],
  ['varias 9 sin forma', { tipo: 'select', displayMode: null, cantidad: 9, delSistema: false, varias: true }, 'dropdown'],
  ['varias 10 sin forma', { tipo: 'select', displayMode: null, cantidad: 10, delSistema: false, varias: true }, 'search'],
  ['varias autocomplete 3 sin forma', { tipo: 'autocomplete', displayMode: null, cantidad: 3, delSistema: false, varias: true }, 'checkboxes'],
  ['varias casillas elegida', { tipo: 'select', displayMode: 'checkboxes', cantidad: 12, delSistema: false, varias: true }, 'checkboxes'],
  ['varias tarjetas elegida', { tipo: 'select', displayMode: 'cards', cantidad: 4, delSistema: false, varias: true }, 'cards'],
  ['varias botones con 5 caen a auto de varias', { tipo: 'select', displayMode: 'buttons', cantidad: 5, delSistema: false, varias: true }, 'checkboxes'],
];

describe('resolverForma', () => {
  it.each(casos)('%s', (_n, entrada, esperado) => {
    expect(resolverForma(entrada)).toBe(esperado);
  });
});
