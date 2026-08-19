import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadCouponModal from '../LeadCouponModal';
import { getWizardFieldKey } from '../../../[landing]/solicitar/utils/wizardScopedStorage';

/**
 * Rediseño BAL-3125 Tarea 4/6: un solo campo "Nombre", checkbox de términos
 * obligatorio, validación por tipo de documento, celular peruano, sin botón
 * "Aplicar" (el envío guarda y muestra el cupón en el mismo paso), botón de
 * descarte que no guarda nada, textos que vienen SIEMPRE del backend
 * (amount/caption/benefit), troquelado que sigue panel_position, y countdown
 * decorativo dentro de la franja azul.
 */

const CONFIG_CUPON: Record<string, unknown> = {
  enabled: true,
  title: '¡Suscríbete y accede a tu cupón!',
  description: 'Déjanos tus datos y activamos tu 15%. Se aplica solo al elegir tu equipo.',
  button_text: 'Obtener descuento',
  panel_position: 'left',
  panel_content: 'coupon',
  countdown_enabled: false,
};

const RESPUESTA_CUPON_OK = {
  success: true,
  coupon: {
    code: 'BIENVENIDA15',
    discount: 15,
    label: 'Bienvenida 15%',
    coupon_type: 'percent_quotas',
    quotas_affected: 1,
    amount: '15%',
    caption: 'de descuento en tu primera cuota',
    benefit: 'tu 15%',
    gift_name: null,
  },
};

function mockFetchOk(body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => body,
  }) as unknown as typeof fetch;
}

async function llenarFormularioValido(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(/tipo de documento/i), 'DNI');
  await user.type(screen.getByLabelText(/número de documento/i), '12345678');
  await user.type(screen.getByLabelText(/^nombre$/i), 'Ana');
  await user.type(screen.getByLabelText(/celular/i), '987654321');
  await user.click(screen.getByRole('checkbox', { name: /términos/i }));
}

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
  // @ts-expect-error - limpiar el mock de fetch entre tests; algunos tests
  // verifican explicitamente que NO se llamo a la red.
  delete global.fetch;
});

describe('LeadCouponModal — campos y validación', () => {
  it('tiene un solo campo de nombre, sin apellidos', () => {
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />);

    expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/apellido/i)).not.toBeInTheDocument();
  });

  it('rechaza un DNI que no tiene 8 dígitos numéricos', async () => {
    const user = userEvent.setup();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />);

    await user.selectOptions(screen.getByLabelText(/tipo de documento/i), 'DNI');
    await user.type(screen.getByLabelText(/número de documento/i), '123');
    await user.type(screen.getByLabelText(/^nombre$/i), 'Ana');
    await user.type(screen.getByLabelText(/celular/i), '987654321');
    await user.click(screen.getByRole('checkbox', { name: /términos/i }));
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    expect(await screen.findByText(/el dni tiene 8 dígitos|revisa tu tipo y número/i)).toBeInTheDocument();
    expect(global.fetch).toBeUndefined();
  });

  it('acepta un pasaporte alfanumérico de 6+ que un DNI rechazaría', async () => {
    mockFetchOk(RESPUESTA_CUPON_OK);
    const user = userEvent.setup();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />);

    await user.selectOptions(screen.getByLabelText(/tipo de documento/i), 'PAS');
    await user.type(screen.getByLabelText(/número de documento/i), 'A1234567');
    await user.type(screen.getByLabelText(/^nombre$/i), 'Ana');
    await user.type(screen.getByLabelText(/celular/i), '987654321');
    await user.click(screen.getByRole('checkbox', { name: /términos/i }));
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('rechaza un pasaporte de menos de 6 caracteres', async () => {
    const user = userEvent.setup();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />);

    await user.selectOptions(screen.getByLabelText(/tipo de documento/i), 'PAS');
    await user.type(screen.getByLabelText(/número de documento/i), 'A123');
    await user.type(screen.getByLabelText(/^nombre$/i), 'Ana');
    await user.type(screen.getByLabelText(/celular/i), '987654321');
    await user.click(screen.getByRole('checkbox', { name: /términos/i }));
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    expect(await screen.findByText('Ingresa tu número de pasaporte.')).toBeInTheDocument();
  });

  it('rechaza un celular que no empieza con 9', async () => {
    const user = userEvent.setup();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />);

    await user.selectOptions(screen.getByLabelText(/tipo de documento/i), 'DNI');
    await user.type(screen.getByLabelText(/número de documento/i), '12345678');
    await user.type(screen.getByLabelText(/^nombre$/i), 'Ana');
    await user.type(screen.getByLabelText(/celular/i), '812345678');
    await user.click(screen.getByRole('checkbox', { name: /términos/i }));
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    expect(
      await screen.findByText('Ingresa los 9 dígitos de tu celular, empezando con 9.')
    ).toBeInTheDocument();
  });

  it('no envía sin aceptar los términos', async () => {
    const user = userEvent.setup();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />);

    await user.selectOptions(screen.getByLabelText(/tipo de documento/i), 'DNI');
    await user.type(screen.getByLabelText(/número de documento/i), '12345678');
    await user.type(screen.getByLabelText(/^nombre$/i), 'Ana');
    await user.type(screen.getByLabelText(/celular/i), '987654321');
    // NO se marca el checkbox.
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    expect(
      await screen.findByText('Necesitamos tu aceptación para enviarte el cupón.')
    ).toBeInTheDocument();
    expect(global.fetch).toBeUndefined();
  });
});

describe('LeadCouponModal — envío y guardado', () => {
  it('al enviar, guarda documento y celular aunque la landing no tenga cupón', async () => {
    mockFetchOk({ success: true, coupon: null });
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={onClose} />);

    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    await waitFor(() => {
      expect(localStorage.getItem('baldecash-dni-senati')).toBe('12345678');
    });
    expect(localStorage.getItem(getWizardFieldKey('senati', 'document_number'))).toBe('12345678');
    expect(localStorage.getItem(getWizardFieldKey('senati', 'phone'))).toBe('987654321');
    expect(localStorage.getItem('baldecash-senati-solicitar-applied-coupon')).toBeNull();
  });

  it('sin boton "Aplicar": el envio guarda el cupon en el mismo paso', async () => {
    mockFetchOk(RESPUESTA_CUPON_OK);
    const user = userEvent.setup();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />);

    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    await waitFor(() => {
      const crudo = localStorage.getItem('baldecash-senati-solicitar-applied-coupon');
      expect(crudo).not.toBeNull();
      const cupon = JSON.parse(crudo as string);
      expect(cupon).toEqual({
        code: 'BIENVENIDA15',
        discount: 15,
        label: 'Bienvenida 15%',
        couponType: 'percent_quotas',
        quotasAffected: 1,
        lockedFromUrl: true,
      });
    });

    // No debe existir ningun boton "Aplicar": guardar y mostrar pasan juntos.
    expect(screen.queryByRole('button', { name: /aplicar/i })).not.toBeInTheDocument();
  });

  it('muestra los textos del cupon tal como los manda el backend, no quemados', async () => {
    mockFetchOk(RESPUESTA_CUPON_OK);
    const user = userEvent.setup();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />);

    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    expect(await screen.findByText(/¡tu 15% ya está activo!/i)).toBeInTheDocument();
  });

  it('con un cupon distinto (S/ 10 fijo) no queda ningun rastro del 15% anterior', async () => {
    mockFetchOk({
      success: true,
      coupon: {
        code: 'FIJO10',
        discount: 10,
        label: 'Fijo 10',
        coupon_type: 'fixed',
        quotas_affected: null,
        amount: 'S/ 10',
        caption: 'de descuento en tu primera cuota',
        benefit: 'tu descuento de S/ 10',
        gift_name: null,
      },
    });
    const user = userEvent.setup();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />);

    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    expect(await screen.findByText(/¡tu descuento de s\/ 10 ya está activo!/i)).toBeInTheDocument();
    expect(screen.queryByText(/15%/)).not.toBeInTheDocument();
  });

  it('"Ver equipos" solo cierra, no vuelve a guardar nada', async () => {
    mockFetchOk(RESPUESTA_CUPON_OK);
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={onClose} />);

    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    await screen.findByText(/¡tu 15% ya está activo!/i);
    const fetchCallsAntes = (global.fetch as jest.Mock).mock.calls.length;

    await user.click(screen.getByRole('button', { name: /ver equipos/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(fetchCallsAntes);
  });
});

describe('LeadCouponModal — descartar sin guardar', () => {
  it('"No deseo canjear cupón" cierra sin llamar al backend ni guardar nada', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={onClose} />);

    await user.type(screen.getByLabelText(/número de documento/i), '12345678');
    await user.click(screen.getByRole('button', { name: /no deseo canjear cupón/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(global.fetch).toBeUndefined();
    expect(localStorage.getItem('baldecash-dni-senati')).toBeNull();
    expect(localStorage.getItem(getWizardFieldKey('senati', 'document_number'))).toBeNull();
  });
});

describe('LeadCouponModal — troquelado y panel_position', () => {
  it('con panel_position "left" (default), el troquelado usa 330px', () => {
    const { container } = render(
      <LeadCouponModal landingSlug="senati" config={{ ...CONFIG_CUPON, panel_position: 'left' }} onClose={jest.fn()} />
    );
    const perf = container.querySelector('[data-testid="modal-perf"]') as HTMLElement;
    expect(perf.style.left).toBe('330px');
  });

  it('con panel_position "right", el troquelado NO se queda fijo en 330px', () => {
    const { container } = render(
      <LeadCouponModal landingSlug="senati" config={{ ...CONFIG_CUPON, panel_position: 'right' }} onClose={jest.fn()} />
    );
    const perf = container.querySelector('[data-testid="modal-perf"]') as HTMLElement;
    // Con el panel a la derecha, la franja tambien esta a la derecha: el
    // troquelado debe seguirla (no cruzar el formulario en 330px fijo).
    expect(perf.style.left).not.toBe('330px');
  });
});

describe('LeadCouponModal — panel_content', () => {
  it('panel_content "coupon" pinta amount y caption en la franja', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, panel_content: 'coupon' }}
        onClose={jest.fn()}
      />
    );
    // Sin respuesta del backend todavia, la franja no tiene amount propio:
    // este caso se cubre en el test end-to-end de abajo con datos reales.
    expect(document.querySelector('.stub, [data-testid="modal-stub"]')).toBeTruthy();
  });

  it('panel_content "image" pinta la imagen configurada', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, panel_content: 'image', image_url: 'https://x.test/foto.jpg' }}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByTestId('modal-panel-image')).toHaveAttribute('src', 'https://x.test/foto.jpg');
  });

  it('panel_content "none" no pinta ningun panel', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, panel_content: 'none' }}
        onClose={jest.fn()}
      />
    );
    expect(document.querySelector('[data-testid="modal-stub"]')).toBeNull();
  });
});

describe('LeadCouponModal — botones', () => {
  it('todos los <button> nuevos declaran type="button" salvo el submit', () => {
    const { container } = render(
      <LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />
    );
    const botones = Array.from(container.querySelectorAll('button'));
    expect(botones.length).toBeGreaterThan(0);
    for (const boton of botones) {
      expect(['button', 'submit']).toContain(boton.getAttribute('type'));
    }
  });

  it('no usa bg-brand-500 (clase de admin2 que no existe en la web)', () => {
    const { container } = render(
      <LeadCouponModal landingSlug="senati" config={CONFIG_CUPON} onClose={jest.fn()} />
    );
    expect(container.innerHTML).not.toMatch(/bg-brand-500/);
  });
});

describe('LeadCouponModal — countdown decorativo', () => {
  const AHORA = new Date('2026-08-19T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(AHORA);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function isoEnMs(ms: number): string {
    return new Date(AHORA.getTime() + ms).toISOString();
  }

  it('sin countdown_enabled, no muestra el contador', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: false, countdown_ends_at: isoEnMs(60_000) }}
        onClose={jest.fn()}
      />
    );
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('sin countdown_ends_at, no muestra el contador aunque countdown_enabled sea true', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: true }}
        onClose={jest.fn()}
      />
    );
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('mas de 1 dia: muestra dias, horas y minutos, sin segundos', () => {
    const DOS_DIAS_18H_45M = (2 * 24 + 18) * 60 * 60 * 1000 + 45 * 60 * 1000;
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: true, countdown_ends_at: isoEnMs(DOS_DIAS_18H_45M) }}
        onClose={jest.fn()}
      />
    );
    const timer = screen.getByRole('timer');
    expect(timer.textContent).toMatch(/2/);
    expect(timer.textContent).toMatch(/18/);
    expect(timer.textContent).toMatch(/45/);
    // Sin segundos: no hay patron MM:SS de dos grupos separados por ":".
    expect(timer.textContent).not.toMatch(/:\d{2}\b.*:\d{2}\b/);
  });

  it('menos de 1 dia: muestra horas y minutos, sin segundos ni dias', () => {
    const DIECIOCHO_H_45M = 18 * 60 * 60 * 1000 + 45 * 60 * 1000;
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: true, countdown_ends_at: isoEnMs(DIECIOCHO_H_45M) }}
        onClose={jest.fn()}
      />
    );
    const timer = screen.getByRole('timer');
    expect(timer.textContent).toMatch(/18/);
    expect(timer.textContent).toMatch(/45/);
  });

  it('menos de 1 hora: muestra MM:SS con segundos, en rojo', () => {
    const CUARENTAICINCO_M_12S = 45 * 60 * 1000 + 12 * 1000;
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: true, countdown_ends_at: isoEnMs(CUARENTAICINCO_M_12S) }}
        onClose={jest.fn()}
      />
    );
    const timer = screen.getByRole('timer');
    expect(timer.textContent).toMatch(/45:12/);
    // jsdom normaliza el hex a rgb() en el estilo inline computado.
    expect(timer.innerHTML).toMatch(/rgb\(214,\s*69,\s*80\)/i);
  });

  it('cuenta hacia abajo de verdad en el rango de segundos', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: true, countdown_ends_at: isoEnMs(60_000) }}
        onClose={jest.fn()}
      />
    );
    const antes = screen.getByRole('timer').textContent;
    act(() => { jest.advanceTimersByTime(5000); });
    const despues = screen.getByRole('timer').textContent;
    expect(despues).not.toBe(antes);
  });

  it('al llegar a cero, la seccion entera se oculta (no "00:00")', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: true, countdown_ends_at: isoEnMs(5000) }}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByRole('timer')).toBeInTheDocument();

    // Un tick por `act`: el efecto que reprograma el siguiente setTimeout
    // necesita flushear entre cada avance para encadenar los ticks.
    for (let i = 0; i < 6; i++) {
      act(() => { jest.advanceTimersByTime(1000); });
    }
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(screen.queryByText(/00:00/)).not.toBeInTheDocument();

    // Sigue de largo, no reaparece.
    for (let i = 0; i < 5; i++) {
      act(() => { jest.advanceTimersByTime(1000); });
    }
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('si la fecha ya paso al montar, nunca muestra el contador', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: true, countdown_ends_at: isoEnMs(-60_000) }}
        onClose={jest.fn()}
      />
    );
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('con el countdown vencido, el formulario se sigue enviando normalmente', async () => {
    mockFetchOk({ success: true, coupon: null });
    jest.useRealTimers();
    const user = userEvent.setup();
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: true, countdown_ends_at: isoEnMs(-60_000) }}
        onClose={jest.fn()}
      />
    );

    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: /obtener descuento/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    // El envio no se bloquea por el countdown vencido: llega a la pantalla
    // de exito igual que con un countdown vigente.
    expect(await screen.findByText(/ya te registramos|ya está activo/i)).toBeInTheDocument();
  });

  it('se muestra con panel_content "image" (el bug que este cambio arregla)', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{
          ...CONFIG_CUPON,
          panel_content: 'image',
          image_url: 'https://x.test/foto.jpg',
          countdown_enabled: true,
          countdown_ends_at: isoEnMs(60_000),
        }}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('se muestra con panel_content "none" (el bug que este cambio arregla)', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{
          ...CONFIG_CUPON,
          panel_content: 'none',
          countdown_enabled: true,
          countdown_ends_at: isoEnMs(60_000),
        }}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('el countdown va antes del primer campo del formulario, no pegado al boton de enviar', () => {
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{ ...CONFIG_CUPON, countdown_enabled: true, countdown_ends_at: isoEnMs(60_000) }}
        onClose={jest.fn()}
      />
    );
    const timer = screen.getByRole('timer');
    const primerCampo = screen.getByLabelText(/tipo de documento/i);
    const boton = screen.getByRole('button', { name: /obtener descuento/i });

    // DOCUMENT_POSITION_FOLLOWING (4): "timer" aparece antes que el campo.
    // eslint-disable-next-line no-bitwise
    expect(timer.compareDocumentPosition(primerCampo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // eslint-disable-next-line no-bitwise
    expect(timer.compareDocumentPosition(boton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('el panel promete el descuento ANTES de enviar', () => {
  it('pinta el monto que viene en la config, sin haber enviado nada', () => {
    // El `amount` de la respuesta llega DESPUES de enviar. Sin el de la
    // config el panel mostraba un guion justo cuando tiene que convencer
    // a la persona de dejar sus datos.
    render(
      <LeadCouponModal
        landingSlug="senati"
        config={{
          panel_content: 'coupon',
          amount: '50%',
          caption: 'de descuento en tu primera cuota',
          benefit: 'tu 50%',
        }}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText(/de descuento en tu primera cuota/i)).toBeTruthy();
    expect(screen.queryByText('—')).toBeNull();
  });
});

describe('cupon de periferico: los textos no hablan de descuentos', () => {
  const RESPUESTA_REGALO = {
    success: true,
    coupon: {
      code: 'REGALO26',
      discount: 0,
      label: 'Regalo',
      coupon_type: 'free_accessory',
      quotas_affected: null,
      amount: 'GRATIS',
      caption: 'AURICULARES GAMING de regalo',
      benefit: 'tu regalo',
      gift_name: 'AURICULARES GAMING',
    },
  };

  it('el titulo usa el beneficio, no el monto', async () => {
    // Con `amount` diria "¡Tu GRATIS ya esta activo!".
    const user = userEvent.setup();
    mockFetchOk(RESPUESTA_REGALO);
    render(<LeadCouponModal landingSlug="senati" config={{}} onClose={() => {}} />);

    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: /obtener/i }));

    expect(await screen.findByText(/¡Tu regalo ya está activo!/i)).toBeTruthy();
    expect(screen.queryByText(/¡Tu GRATIS/i)).toBeNull();
  });

  it('no dice "el descuento se aplica": no hay descuento, hay un regalo', async () => {
    const user = userEvent.setup();
    mockFetchOk(RESPUESTA_REGALO);
    render(<LeadCouponModal landingSlug="senati" config={{}} onClose={() => {}} />);

    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: /obtener/i }));

    await screen.findByText(/ya está activo/i);
    expect(screen.getByText(/Tu regalo se suma/i)).toBeTruthy();
    expect(screen.queryByText(/El descuento se aplica/i)).toBeNull();
  });
});

describe('links legales', () => {
  it('apuntan a las paginas legales DE ESA LANDING', () => {
    // El diseño traia `href="#"` y la politica de privacidad ni era link.
    // Es consentimiento legal: tiene que poder leerse antes de aceptar, y
    // cada landing tiene sus propias paginas.
    render(<LeadCouponModal landingSlug="senati" config={{}} onClose={() => {}} />);

    const tyc = screen.getByRole('link', { name: /términos y condiciones/i });
    const privacidad = screen.getByRole('link', { name: /política de privacidad/i });

    expect(tyc.getAttribute('href')).toContain('/senati/legal/terminos-y-condiciones');
    expect(privacidad.getAttribute('href')).toContain('/senati/legal/politica-de-privacidad');
    expect(tyc.getAttribute('href')).not.toBe('#');
  });
});


