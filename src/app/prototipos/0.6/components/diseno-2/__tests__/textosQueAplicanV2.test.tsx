/**
 * BAL-4969 (casuísticas): los textos fijos de Diseño 2 salen solo donde
 * aplican. "Envío gratis" y "te enviamos tu laptop" piden envío a domicilio
 * (formulario con dirección, no Locker Truck, no préstamo); "Día de pago"
 * pide el campo; el subtítulo del Paso 4 dice solo lo que el paso pide.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { hayEnvioADomicilio, subtituloDelPaso4, pidenDiaDePago, SUBTITULO_PASO4_COMPLETO } from '../textosQueAplicanV2';
import { PanelSolicitudV2 } from '../PanelSolicitudV2';

// El cupón del panel (BAL-5203) vive en su propio módulo; acá no hay ProductProvider.
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon', () => ({
  CouponInput: () => null,
  useCuponVisible: () => false,
  useQuitarCupon: () => jest.fn(),
}));

const conDireccion = [{ fields: [{ code: 'address', type: 'address' }] }];
const sinDireccion = [{ fields: [{ code: 'first_name', type: 'text' }] }];

describe('hayEnvioADomicilio', () => {
  it('formulario con dirección: sí', () => {
    expect(hayEnvioADomicilio({ pasos: conDireccion })).toBe(true);
  });
  it('formulario sin dirección (Family Farms y otros pelados): no', () => {
    expect(hayEnvioADomicilio({ pasos: sinDireccion })).toBe(false);
  });
  it('Locker Truck y préstamo de efectivo: nunca', () => {
    expect(hayEnvioADomicilio({ pasos: conDireccion, overlayVariant: 'lockertruck' })).toBe(false);
    expect(hayEnvioADomicilio({ pasos: conDireccion, tipoDeProducto: 'efectivo' })).toBe(false);
  });
  it('sin pasos cargados: se deja el texto de siempre', () => {
    expect(hayEnvioADomicilio({ pasos: [] })).toBe(true);
  });
});

describe('subtituloDelPaso4', () => {
  it('la descripción de la BD manda', () => {
    expect(subtituloDelPaso4({ description: 'Lo de la BD', fields: [] })).toBe('Lo de la BD');
  });
  it('con día de pago y dirección: el de Brenda', () => {
    expect(subtituloDelPaso4({ fields: [{ code: 'payment_day' }, { code: 'address', type: 'address' }] })).toBe(SUBTITULO_PASO4_COMPLETO);
  });
  it('sin ninguno de los dos: no habla de día de pago ni de dirección', () => {
    const t = subtituloDelPaso4({ fields: [{ code: 'referencia', type: 'text' }] });
    expect(t).not.toMatch(/día de pago|dirección/i);
  });
  it('solo día de pago', () => {
    expect(subtituloDelPaso4({ fields: [{ code: 'payment_day' }] })).toBe('Elige tu día de pago y envía tu solicitud.');
  });
});

describe('panel "Tu solicitud"', () => {
  const datos = {
    principal: { id: '1', name: 'Laptop', shortName: 'Laptop', image: null, paymentPlans: [], initialPercent: 0 },
    productos: [{ id: '1' }],
    mostrarImagen: false,
    nombre: 'Laptop',
    precio: (n: number) => `S/${n}`,
    total: 159,
    frecuencia: 'mensual',
    leyenda: '24 meses',
    textoPlazo: '24 meses',
    textoInicial: 'Sin inicial',
    regalos: [],
    mesPrimeraCuota: null,
    hayQueElegir: false,
    isOverQuotaLimit: false,
    maxMonthlyQuota: 600,
    appliedCoupon: null,
    cuotaEquipo: 159,
    cuotaAccesorios: 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  const envio = { texto: 'Enviar solicitud', onEnviar: jest.fn(), deshabilitado: false, ocupado: false, diaDePago: null };

  it('sin envío a domicilio no promete "Envío gratis"', () => {
    render(<PanelSolicitudV2 datos={datos} conEnvio={false} />);
    expect(screen.getByText('Registrados en la SBS')).toBeInTheDocument();
    expect(screen.queryByText(/Envío gratis/)).not.toBeInTheDocument();
  });

  it('sin el campo payment_day no muestra "Día de pago · Por elegir"', () => {
    render(<PanelSolicitudV2 datos={datos} envio={{ ...envio, conDiaDePago: false }} />);
    expect(screen.queryByText('Día de pago')).not.toBeInTheDocument();
    expect(screen.queryByText('Por elegir')).not.toBeInTheDocument();
  });

  it('con el campo, la fila sigue', () => {
    render(<PanelSolicitudV2 datos={datos} envio={{ ...envio, conDiaDePago: pidenDiaDePago([{ fields: [{ code: 'payment_day' }] }]) }} />);
    expect(screen.getByText('Por elegir')).toBeInTheDocument();
  });
});
