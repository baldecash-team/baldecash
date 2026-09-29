import { separarDireccion } from '../separarDireccion';

describe('separarDireccion', () => {
  it.each([
    ['Av. Benavides 1238 Dpto 301', 'Av. Benavides 1238', 'Dpto 301'],
    ['Av. Los Olivos Mz A Lt 5', 'Av. Los Olivos', 'Mz A Lt 5'],
    ['Mz. B Lote 12 AAHH San Juan', 'AAHH San Juan', 'Mz B Lt 12'],
    ['Jr. Ica 123 Int. 4', 'Jr. Ica 123', 'Int 4'],
    ['Carretera Central Km 12.5', 'Carretera Central', 'Km 12.5'],
    ['Calle Las Flores 456, dpto. 201', 'Calle Las Flores 456', 'Dpto 201'],
    ['Av. Perú 300 Block C Piso 3', 'Av. Perú 300', 'Block C Piso 3'],
    ['Manzana: F2 lt 9 Urb. Santa Rosa', 'Urb. Santa Rosa', 'Mz F2 Lt 9'],
  ])('%s → vía y complemento', (texto, via, complemento) => {
    expect(separarDireccion(texto)).toEqual({ via, complemento });
  });

  it.each([
    'Av. Intihuatana 450',
    'Calle Piso de Madera 12',
    'Av. Lote la Paz 88',
    'Jr. Mzuri 20',
  ])('no parte lo que no es un complemento: %s', (texto) => {
    expect(separarDireccion(texto)).toEqual({ via: texto, complemento: '' });
  });

  it('sin nombre de vía deja todo en la vía, para no vaciar el campo obligatorio', () => {
    expect(separarDireccion('Mz A Lt 5')).toEqual({ via: 'Mz A Lt 5', complemento: '' });
  });

  it('vacío', () => {
    expect(separarDireccion(null)).toEqual({ via: '', complemento: '' });
    expect(separarDireccion('  ')).toEqual({ via: '', complemento: '' });
  });
});
