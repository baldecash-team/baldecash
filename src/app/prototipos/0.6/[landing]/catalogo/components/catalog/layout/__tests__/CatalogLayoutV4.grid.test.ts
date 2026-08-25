import { gridClassName } from '../CatalogLayoutV4';

// Se testea la función pura que decide la clase, no el layout entero:
// CatalogLayoutV4 arrastra router, contextos y hooks de datos que no aportan
// nada a esta decisión.
describe('gridClassName', () => {
  const AUTO_FILL = 'grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]';

  it('por defecto mantiene la grilla actual (una columna en móvil)', () => {
    const cls = gridClassName('default');
    expect(cls).toContain(AUTO_FILL);
    expect(cls).not.toContain('grid-cols-2');
  });

  it('sin argumento se comporta como "default"', () => {
    expect(gridClassName()).toBe(gridClassName('default'));
  });

  it('compact pone 2 columnas en móvil', () => {
    expect(gridClassName('compact')).toContain('grid-cols-2');
  });

  // En pantallas grandes la variante compacta vuelve al auto-fill: 2 columnas
  // fijas en desktop dejarían cards gigantes y huecos.
  it('compact recupera el auto-fill desde sm', () => {
    expect(gridClassName('compact')).toContain(`sm:${AUTO_FILL}`);
  });

  // Las dos variantes comparten gap y padding: lo único que cambia son las
  // columnas.
  it('ambas variantes conservan el espaciado base', () => {
    for (const cls of [gridClassName('default'), gridClassName('compact')]) {
      expect(cls).toContain('gap-4');
      expect(cls).toContain('sm:gap-6');
      expect(cls).toContain('pb-24');
    }
  });
});
