import { PIEZAS, GRADOS, piezaSlug, inspectorAssetUrl, SEMINUEVOS_ASSETS } from '../data/seminuevosData';

describe('piezaSlug', () => {
  it('quita las tildes de las piezas acentuadas', () => {
    // Estos dos son los que rompen si la normalización NFD se toca.
    expect(piezaSlug('Cámara')).toBe('camara');
    expect(piezaSlug('Batería')).toBe('bateria');
  });

  it('produce un slug ASCII para las 8 piezas', () => {
    expect(PIEZAS.map(piezaSlug)).toEqual([
      'carcasa', 'mousepad', 'pantalla', 'teclado',
      'entradas', 'camara', 'bisagras', 'bateria',
    ]);
  });

  it('reemplaza los espacios por guiones', () => {
    expect(piezaSlug('Tapa Trasera')).toBe('tapa-trasera');
  });
});

describe('inspectorAssetUrl', () => {
  it('arma la URL de S3 con la pieza y el grado en minúscula', () => {
    expect(inspectorAssetUrl('Pantalla', 'B')).toBe(
      `${SEMINUEVOS_ASSETS}/inspector/pantalla-b.webp`
    );
    expect(inspectorAssetUrl('Cámara', 'C')).toBe(
      `${SEMINUEVOS_ASSETS}/inspector/camara-c.webp`
    );
  });

  it('cubre las 24 combinaciones sin colisiones', () => {
    const urls = PIEZAS.flatMap((p) => GRADOS.map((g) => inspectorAssetUrl(p, g)));
    expect(urls).toHaveLength(24);
    expect(new Set(urls).size).toBe(24);
  });
});
