/**
 * Búsqueda de centro de estudio en el lead form: una request por pausa de
 * tipeo, no una por tecla.
 *
 * Contexto: el 2026-09-04 una activación masiva (campus, ~1.300 req/min) pegó
 * a /public/options/study-centers letra por letra ("U", "Uc", "Ucv"...) y puso
 * Aurora en CPU 100 %. El wizard ya debounceaba; el lead form no.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LeadLeadForm } from '../LeadLeadForm';
import type { LeadFormConfig } from '../../../types/hero';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: jest.fn(), removeListener: jest.fn(),
    addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn(),
  })),
});

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const config: LeadFormConfig = {
  title_count: 0,
  title: 'Regístrate',
  description: '',
  cta_text: 'Enviar',
  fields: [
    {
      code: 'institution', label: 'Lugar de estudio', field_type: 'autocomplete',
      placeholder: '¿Dónde estudias?', is_required: true, is_visible: true, display_order: 0,
      options_source: 'study-centers', min_search_length: 3,
    },
  ],
};

function studyCenterCalls() {
  return (global.fetch as jest.Mock).mock.calls
    .map((c) => String(c[0]))
    .filter((u) => u.includes('/public/options/study-centers'));
}

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = jest.fn((url: string) => {
    if (url.includes('/public/leads/form-config')) {
      return Promise.resolve({ ok: false, json: () => Promise.resolve(null) });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ options: [{ value: 1, label: 'Universidad César Vallejo' }] }),
    });
  }) as unknown as typeof fetch;
});

afterEach(() => {
  jest.useRealTimers();
});

async function openStudyCenterSelect() {
  const { container } = render(<LeadLeadForm config={config} landingId={1} landing="ucv" studyCenters={[]} />);
  // El form muestra skeleton hasta que resuelve /form-config (mock: 404 -> usa config.fields)
  await act(async () => { await Promise.resolve(); });
  const trigger = container.querySelector('#lead-estudio [role="button"][aria-haspopup="listbox"]');
  expect(trigger).not.toBeNull();
  fireEvent.click(trigger!);
  return screen.getByPlaceholderText(/buscar/i) as HTMLInputElement;
}

describe('LeadLeadForm — búsqueda de centro de estudio', () => {
  it('tipear rápido dispara una sola request, con el término final, tras la pausa', async () => {
    const input = await openStudyCenterSelect();

    fireEvent.change(input, { target: { value: 'U' } });
    fireEvent.change(input, { target: { value: 'Uc' } });
    fireEvent.change(input, { target: { value: 'Ucv' } });
    fireEvent.change(input, { target: { value: 'Ucv ' } });
    expect(studyCenterCalls()).toHaveLength(0);

    await act(async () => { jest.advanceTimersByTime(300); });

    const calls = studyCenterCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain('search=Ucv+');
    expect(await screen.findByText('Universidad César Vallejo')).toBeInTheDocument();
  });

  it('con menos de 3 caracteres no pega al API', async () => {
    const input = await openStudyCenterSelect();

    fireEvent.change(input, { target: { value: 'U' } });
    fireEvent.change(input, { target: { value: 'Uc' } });
    await act(async () => { jest.advanceTimersByTime(500); });

    expect(studyCenterCalls()).toHaveLength(0);
  });

  it('una respuesta vieja no pisa a la nueva (se aborta la request anterior)', async () => {
    const input = await openStudyCenterSelect();

    fireEvent.change(input, { target: { value: 'Tarapoto' } });
    await act(async () => { jest.advanceTimersByTime(300); });
    const first = (global.fetch as jest.Mock).mock.calls.find((c) => String(c[0]).includes('search=Tarapoto'));
    expect(first).toBeDefined();
    const signal: AbortSignal = first![1]?.signal;
    expect(signal).toBeDefined();
    expect(signal.aborted).toBe(false);

    fireEvent.change(input, { target: { value: 'Universidad' } });
    await act(async () => { jest.advanceTimersByTime(300); });

    expect(signal.aborted).toBe(true);
    expect(studyCenterCalls()).toHaveLength(2);
  });
});
