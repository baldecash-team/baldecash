import { PIEZAS, GRADOS, piezaSlug, inspectorAssetUrl, SEMINUEVOS_ASSETS } from '../data/seminuevosData';

describe('piezaSlug', () => {
  it('quita las tildes de las piezas acentuadas', () => {
    // Estos dos son los que rompen si la normalización NFD se toca.
    expect(piezaSlug('Cámara')).toBe('camara');
    expect(piezaSlug('Batería')).toBe('bateria');
  });

  it('produce un slug ASCII para las piezas publicadas', () => {
    expect(PIEZAS.map(piezaSlug)).toEqual(['carcasa', 'pantalla', 'teclado']);
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

  it('cubre todas las combinaciones de pieza y grado sin colisiones', () => {
    // El total sale de las constantes, no de un número escrito a mano: lo que
    // se prueba es que no haya COLISIONES, y eso vale con 3 piezas o con 8.
    const esperadas = PIEZAS.length * GRADOS.length;
    const urls = PIEZAS.flatMap((p) => GRADOS.map((g) => inspectorAssetUrl(p, g)));
    expect(urls).toHaveLength(esperadas);
    expect(new Set(urls).size).toBe(esperadas);
  });
});
