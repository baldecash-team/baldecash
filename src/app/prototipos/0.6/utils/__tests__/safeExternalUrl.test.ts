import { safeExternalUrl, safeFirmaUrl } from '../safeExternalUrl';

const FALLBACK = 'https://wa.me/51958823053';

describe('safeExternalUrl — con fallback explícito', () => {
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

  it('acepta un acortador como wa.link', () => {
    expect(safeExternalUrl('https://wa.link/qqmbg0', FALLBACK)).toBe('https://wa.link/qqmbg0');
  });

  it('rechaza un esquema javascript: y cae al fallback', () => {
    expect(safeExternalUrl('javascript:alert(1)', FALLBACK)).toBe(FALLBACK);
  });

  it('rechaza javascript: aunque venga con mayúsculas o espacios', () => {
    // El editor del admin puede dejar espacios; `new URL` los tolera y
    // normaliza el protocolo a minúscula, así que igual se rechaza.
    expect(safeExternalUrl('  JavaScript:alert(1)', FALLBACK)).toBe(FALLBACK);
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

describe('safeExternalUrl — sin fallback (default vacío)', () => {
  // Así lo usan HeroCta y ConvenioCta: no tienen una URL por defecto, y ya
  // tratan la cadena vacía como "no hay link" (no abren nada).
  it('devuelve cadena vacía ante un javascript:', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBe('');
  });

  it('devuelve cadena vacía cuando el campo está sin configurar', () => {
    expect(safeExternalUrl(undefined)).toBe('');
    expect(safeExternalUrl(null)).toBe('');
    expect(safeExternalUrl('')).toBe('');
  });

  it('deja pasar una URL válida tal cual', () => {
    expect(safeExternalUrl('https://wa.link/qqmbg0')).toBe('https://wa.link/qqmbg0');
  });
});

describe('safeFirmaUrl — link de firma del «Sí» (Keynua o KYC propio)', () => {
  const TOKEN = 'Abc123_-xyzXYZ0987654321abcdefghij';

  it.each([
    'https://sign.keynua.com/index.html?token=abc',
    `https://baldecash.com/kyc/${TOKEN}`,
    `https://www.baldecash.com/kyc/${TOKEN}`,
    `https://baldecash.com/prototipos/0.6/kyc/${TOKEN}`,
  ])('acepta %s', (url) => {
    expect(safeFirmaUrl(url)).toBe(url);
  });

  it.each([
    'http://sign.keynua.com/index.html?token=abc',
    'https://sign.keynua.com/index.html',
    'https://sign.keynua.com/otra?token=abc',
    'https://app.keynua.com/index.html?token=abc',
    'https://sign.keynua.com.evil.com/index.html?token=abc',
    'https://sign.keynua.com@evil.com/index.html?token=abc',
    'https://sign.keynua.com:8443/index.html?token=abc',
    `http://baldecash.com/kyc/${TOKEN}`,
    `https://evil.com/kyc/${TOKEN}`,
    `https://baldecash.com/otra/${TOKEN}`,
    'https://baldecash.com/kyc/corto',
    'javascript:alert(1)',
    '',
    null,
    undefined,
  ])('rechaza %s', (url) => {
    expect(safeFirmaUrl(url)).toBeNull();
  });
});
