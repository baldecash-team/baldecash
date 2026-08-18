import { parseErrorSource } from '../errorSource';

const BUNDLE =
  'https://www.baldecash.com/_next/static/chunks/2fccd770fe1ab1d1.js?dpl=dpl_mCfAff67GCe5LzLw6osxsvmEyVcS';

describe('parseErrorSource', () => {
  it('conserva la URL completa, sin recortar por la izquierda', () => {
    const { source } = parseErrorSource(BUNDLE);
    expect(source?.startsWith('https://')).toBe(true);
  });

  it('separa el archivo y el release del bundle', () => {
    expect(parseErrorSource(BUNDLE)).toMatchObject({
      source: 'https://www.baldecash.com/_next/static/chunks/2fccd770fe1ab1d1.js',
      file: '2fccd770fe1ab1d1.js',
      release: 'dpl_mCfAff67GCe5LzLw6osxsvmEyVcS',
    });
  });

  it('si hay que recortar, recorta por la derecha', () => {
    const largo = `https://www.baldecash.com/${'x'.repeat(600)}.js`;
    const { source } = parseErrorSource(largo);
    expect(source?.startsWith('https://www.baldecash.com/')).toBe(true);
    expect(source!.length).toBeLessThanOrEqual(300);
  });

  it('sin release deja el campo fuera', () => {
    const sinDpl = 'https://www.baldecash.com/_next/static/chunks/main.js';
    const parsed = parseErrorSource(sinDpl);
    expect(parsed.source).toBe(sinDpl);
    expect(parsed.file).toBe('main.js');
    expect(parsed.release).toBeUndefined();
  });

  it('tolera un source que no es URL', () => {
    expect(parseErrorSource('<anonymous>')).toEqual({ source: '<anonymous>' });
  });

  it('sin source devuelve un objeto vacio', () => {
    expect(parseErrorSource(undefined)).toEqual({});
    expect(parseErrorSource('')).toEqual({});
  });
});
