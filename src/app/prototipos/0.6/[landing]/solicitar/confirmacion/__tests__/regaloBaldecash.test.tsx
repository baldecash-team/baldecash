import React from 'react';
import { render, screen } from '@testing-library/react';
import { separarRegaloBaldecash, REGALO_BALDECASH_TEXTOS } from '../regaloBaldecash';
import { RegaloBaldecash } from '../components/received/regalo';
import { ProductSummary } from '../components/received/summary';
import type { ReceivedData } from '../types/received';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'home' }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ landingId: 1, mostrarImagenProducto: true }),
}));

const MOUSE = { name: 'Mouse inalambrico', monthly_quota: 12, is_gift: false, gift_source: null };
const MOCHILA_COMBO = { name: 'Mochila Nova', monthly_quota: 0, is_gift: true, gift_source: 'combo' as const };
const AUDIFONOS_DINET = {
  name: 'Audífonos Bluetooth',
  monthly_quota: 0,
  is_gift: true,
  gift_source: 'regalo_dinet' as const,
  image: 'https://baldecash.s3.amazonaws.com/audifonos.webp',
  thumbnail_url: 'https://baldecash.s3.amazonaws.com/audifonos-thumb.webp',
};

describe('separarRegaloBaldecash', () => {
  it('saca el regalo_dinet de la lista y lo devuelve aparte con su imagen', () => {
    const { accesorios, regalo } = separarRegaloBaldecash([MOUSE, AUDIFONOS_DINET, MOCHILA_COMBO]);
    expect(accesorios).toEqual([MOUSE, MOCHILA_COMBO]);
    expect(regalo).toEqual({ name: 'Audífonos Bluetooth', image: AUDIFONOS_DINET.image });
  });

  it('usa el thumbnail si no hay imagen, y vacío si no hay ninguna', () => {
    expect(separarRegaloBaldecash([{ ...AUDIFONOS_DINET, image: null }]).regalo?.image).toBe(
      AUDIFONOS_DINET.thumbnail_url
    );
    expect(
      separarRegaloBaldecash([{ ...AUDIFONOS_DINET, image: null, thumbnail_url: null }]).regalo?.image
    ).toBe('');
  });

  it('el regalo del combo se queda en la lista', () => {
    const lista = [MOUSE, MOCHILA_COMBO];
    const { accesorios, regalo } = separarRegaloBaldecash(lista);
    expect(accesorios).toBe(lista);
    expect(regalo).toBeNull();
  });

  it('respuesta sin los campos nuevos (backend viejo): no cambia nada', () => {
    const lista = [{ name: 'Mouse', monthly_quota: 12 }, { name: 'Mochila', monthly_quota: 0, is_gift: true }];
    const { accesorios, regalo } = separarRegaloBaldecash(lista);
    expect(accesorios).toBe(lista);
    expect(regalo).toBeNull();
  });

  it('respeta null / undefined', () => {
    expect(separarRegaloBaldecash(null)).toEqual({ accesorios: null, regalo: null });
    expect(separarRegaloBaldecash(undefined)).toEqual({ accesorios: undefined, regalo: null });
  });
});

describe('RegaloBaldecash', () => {
  it('muestra el texto, el nombre, "Gratis" y la imagen', () => {
    render(<RegaloBaldecash regalo={{ name: 'Audífonos Bluetooth', image: AUDIFONOS_DINET.image }} />);
    expect(screen.getByText(REGALO_BALDECASH_TEXTOS.titulo)).toBeInTheDocument();
    expect(screen.getByText('Audífonos Bluetooth')).toBeInTheDocument();
    expect(screen.getByText(REGALO_BALDECASH_TEXTOS.etiquetaPrecio)).toBeInTheDocument();
    expect(screen.getByAltText('Audífonos Bluetooth')).toBeInTheDocument();
  });

  it('sin imagen no rompe', () => {
    render(<RegaloBaldecash regalo={{ name: 'Audífonos', image: '' }} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Audífonos')).toBeInTheDocument();
  });
});

describe('ProductSummary con el regalo separado', () => {
  const base = {
    paymentFrequency: 'mensual',
    term: 24,
    termMonths: 24,
    products: [{ name: 'Laptop HP', image: '', monthlyQuota: 200, quantity: 1 }],
    insurances: [],
    totalMonthlyQuota: 200,
  };

  it('si el único accesorio era el regalo, no hay acordeón de Accesorios', () => {
    const { accesorios } = separarRegaloBaldecash([AUDIFONOS_DINET]);
    const data = { ...base, accessories: accesorios!.map((a) => ({ name: a.name, monthlyQuota: 0, isGift: true })) };
    render(<ProductSummary data={data as unknown as ReceivedData} />);
    expect(screen.queryByText(/Accesorios \(/)).not.toBeInTheDocument();
    expect(screen.queryByText('Audífonos Bluetooth')).not.toBeInTheDocument();
  });
});
