import { mapPlatformVersion, resolveOsVersion } from '../clientHints';

describe('mapPlatformVersion', () => {
  it('traduce la version de plataforma de Windows a la comercial', () => {
    // Chrome reporta 1..12 para Windows 10 y >= 13 para Windows 11.
    expect(mapPlatformVersion('Windows', '15.0.0')).toBe('11');
    expect(mapPlatformVersion('Windows', '13.0.0')).toBe('11');
    expect(mapPlatformVersion('Windows', '10.0.0')).toBe('10');
    expect(mapPlatformVersion('Windows', '1.0.0')).toBe('10');
  });

  it('deja Windows 7/8 como no concluyente', () => {
    expect(mapPlatformVersion('Windows', '0.3.0')).toBeUndefined();
  });

  it('devuelve la version tal cual en Android', () => {
    expect(mapPlatformVersion('Android', '16.0.0')).toBe('16.0.0');
    expect(mapPlatformVersion('Android', '15')).toBe('15');
  });

  it('ignora una version vacia', () => {
    expect(mapPlatformVersion('Android', '')).toBeUndefined();
    expect(mapPlatformVersion('Windows', '')).toBeUndefined();
  });
});

describe('resolveOsVersion', () => {
  const conUaData = (values: Record<string, string>) => ({
    platform: values.platform,
    getHighEntropyValues: jest.fn().mockResolvedValue(values),
  });

  it('prefiere los client hints sobre el user agent', async () => {
    const uaData = conUaData({ platform: 'Windows', platformVersion: '15.0.0' });
    await expect(resolveOsVersion('10', uaData)).resolves.toBe('11');
  });

  it('devuelve la version real de Android', async () => {
    const uaData = conUaData({ platform: 'Android', platformVersion: '16.0.0' });
    await expect(resolveOsVersion('10', uaData)).resolves.toBe('16.0.0');
  });

  it('cae al user agent cuando no hay client hints (Safari)', async () => {
    await expect(resolveOsVersion('18.7', undefined)).resolves.toBe('18.7');
  });

  it('cae al user agent si la consulta falla', async () => {
    const uaData = {
      platform: 'Android',
      getHighEntropyValues: jest.fn().mockRejectedValue(new Error('NotAllowed')),
    };
    await expect(resolveOsVersion('10', uaData)).resolves.toBe('10');
  });

  it('cae al user agent si el hint viene vacio', async () => {
    const uaData = conUaData({ platform: 'Windows', platformVersion: '' });
    await expect(resolveOsVersion('10', uaData)).resolves.toBe('10');
  });
});
