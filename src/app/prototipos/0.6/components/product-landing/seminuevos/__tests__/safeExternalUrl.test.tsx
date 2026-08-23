import { safeExternalUrl } from '../safeExternalUrl';

const FALLBACK = 'https://wa.me/51958823053';

describe('safeExternalUrl', () => {
  it('acepta una URL https válida', () => {
    expect(safeExternalUrl('https://wa.me/51999999999', FALLBACK)).toBe(
      'https://wa.me/51999999999'
    );
  });

  it('acepta una URL http válida', () => {
    expect(safeExternalUrl('http://wa.me/51999999999', FALLBACK)).toBe(
      'http://wa.me/51999999999'
    );
  });

  it('rechaza un esquema javascript: y cae al fallback', () => {
    expect(safeExternalUrl('javascript:alert(1)', FALLBACK)).toBe(FALLBACK);
  });

  it('rechaza un esquema data: y cae al fallback', () => {
    expect(safeExternalUrl('data:text/html,<script>alert(1)</script>', FALLBACK)).toBe(
      FALLBACK
    );
  });

  it('rechaza un esquema vbscript: y cae al fallback', () => {
    expect(safeExternalUrl('vbscript:msgbox(1)', FALLBACK)).toBe(FALLBACK);
  });

  it('cae al fallback con string vacío', () => {
    expect(safeExternalUrl('', FALLBACK)).toBe(FALLBACK);
  });

  it('cae al fallback con undefined', () => {
    expect(safeExternalUrl(undefined, FALLBACK)).toBe(FALLBACK);
  });

  it('cae al fallback con null', () => {
    expect(safeExternalUrl(null, FALLBACK)).toBe(FALLBACK);
  });

  it('cae al fallback con un valor que no parsea como URL', () => {
    expect(safeExternalUrl('no es una url', FALLBACK)).toBe(FALLBACK);
  });

  it('cae al fallback con una ruta relativa sin esquema', () => {
    expect(safeExternalUrl('/ruta/relativa', FALLBACK)).toBe(FALLBACK);
  });
});
