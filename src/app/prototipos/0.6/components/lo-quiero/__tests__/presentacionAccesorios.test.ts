import { datosUtiles, marcaVisible, nombreParaMostrar, ordenarPorCategoria } from '../presentacionAccesorios';
import type { Accessory } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';

describe('nombreParaMostrar', () => {
  it.each([
    ['KIT DE LIMPIEZA 1', 'Kit de limpieza 1'],
    ['MOUSE RAZER', 'Mouse Razer'],
    ['TINTA HP 1VV22AL NEGRO GT53', 'Tinta HP 1VV22AL negro GT53'],
    ['TINTA HP GT52 CYAN', 'Tinta HP GT52 cyan'],
    ['MONITOR LED IPS 24" LG 24U411B', 'Monitor LED IPS 24" LG 24U411B'],
  ])('%s → %s', (entrada, salida) => {
    expect(nombreParaMostrar(entrada)).toBe(salida);
  });

  it('no toca nombres que ya tienen minúsculas', () => {
    expect(nombreParaMostrar('Travel Backpack TE9037BK')).toBe('Travel Backpack TE9037BK');
    expect(nombreParaMostrar('Mousepad Razer SPHEX V2 GAMING')).toBe('Mousepad Razer SPHEX V2 GAMING');
    expect(nombreParaMostrar('Monitor Portatil PM161Q')).toBe('Monitor Portatil PM161Q');
  });

  it('usa la marca del accesorio para capitalizarla', () => {
    expect(nombreParaMostrar('MOCHILA NOVATECH', 'Novatech')).toBe('Mochila Novatech');
  });
});

describe('ordenarPorCategoria', () => {
  const acc = (id: string, slug: string) =>
    ({ id, category: { slug, name: slug } }) as unknown as Accessory;

  it('agrupa por categoría en el orden de su primer accesorio y respeta el orden interno', () => {
    const lista = [acc('1', 'mouse'), acc('2', 'mochila'), acc('3', 'mouse'), acc('4', 'otro'), acc('5', 'mochila')];
    expect(ordenarPorCategoria(lista).map((a) => a.id)).toEqual(['1', '3', '2', '5', '4']);
  });
});

describe('marcaVisible y datosUtiles', () => {
  it('oculta marcas de relleno', () => {
    expect(marcaVisible({ name: 'Accesorios', slug: 'accesorios' })).toBeNull();
    expect(marcaVisible({ name: 'Legacy', slug: 'legacy' })).toBeNull();
    expect(marcaVisible({ name: 'Samsung', slug: 'samsung' })).toBe('Samsung');
  });

  it('prefiere specs y si no, las líneas de la descripción (máx. 3)', () => {
    expect(datosUtiles({ specs: [{ label: 'Color', value: 'Negro' }], description: 'x' })).toEqual(['Color: Negro']);
    expect(datosUtiles({ specs: [], description: 'Uno.\nDos.\nTres.\nCuatro.' })).toEqual(['Uno', 'Dos', 'Tres']);
    expect(datosUtiles({ specs: [], description: '' })).toEqual([]);
  });
});
