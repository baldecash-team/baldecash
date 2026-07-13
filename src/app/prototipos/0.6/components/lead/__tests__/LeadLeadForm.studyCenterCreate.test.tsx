import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { LeadLeadForm } from '../LeadLeadForm';
import type { LeadFormConfig, StudyCenter } from '../../../types/hero';

// jsdom no implementa matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const baseConfig: LeadFormConfig = {
  title_count: 0,
  title: 'Solicita tu financiamiento',
  description: '',
  cta_text: 'Enviar registro',
};

const studyCenters: StudyCenter[] = [];

/** Solo el campo institución, con allow_create habilitado — minimiza el resto del form
 * (document_number/first_name/last_name/phone no quedan como requeridos porque no están
 * en `activeFields`, solo el checkbox de TyC fijo del form es obligatorio aparte). */
const formConfigFields = [
  {
    code: 'institution',
    label: 'Institución',
    field_type: 'autocomplete',
    options_source: 'study-centers',
    is_required: true,
    is_visible: true,
    display_order: 0,
    allow_create: true,
  },
];

function mockFetchSequence(captureResponder: (body: Record<string, unknown>) => void) {
  return jest.fn((url: string, init?: RequestInit) => {
    if (url.includes('/public/leads/form-config')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ fields: formConfigFields }),
      });
    }
    if (url.includes('/public/options/study-centers')) {
      // Nunca hay match -> siempre habilita "Crear «X»"
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ options: [] }),
      });
    }
    if (url.includes('/public/leads/capture-partial')) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      captureResponder(body);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ lead_id: 1 }),
      });
    }
    if (url.includes('/public/leads/capture')) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      captureResponder(body);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ lead_id: 42, success_message: '¡Gracias!' }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }) as unknown as typeof fetch;
}

describe('LeadLeadForm — institución creatable', () => {
  it('con institución nueva, el payload de capture lleva study_center_name y NO study_center_id', async () => {
    const bodies: Record<string, unknown>[] = [];
    global.fetch = mockFetchSequence((body) => bodies.push(body));

    render(
      <LeadLeadForm
        config={baseConfig}
        landingId={1}
        landing="test-landing"
        studyCenters={studyCenters}
      />,
    );

    // Espera a que cargue la config dinámica de campos (fieldsLoading=false)
    await waitFor(() => expect(screen.getByText('Institución')).toBeInTheDocument());

    // Abre el select y escribe un nombre inexistente
    fireEvent.click(screen.getByText('¿Dónde estudias?'));
    const searchInput = await screen.findByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'Instituto Nuevo SAC' } });

    const createButton = await screen.findByText((content) => content.includes('Crear «Instituto Nuevo SAC»'));
    fireEvent.click(createButton);

    // Feedback local: el nombre queda mostrado como "seleccionado"
    expect(screen.getByText('Instituto Nuevo SAC')).toBeInTheDocument();

    // Acepta TyC (obligatorio para poder enviar)
    const tycCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(tycCheckbox);

    // Envía
    const submitButton = screen.getByRole('button', { name: /Enviar registro/i });
    fireEvent.click(submitButton);

    await waitFor(() => expect(bodies.length).toBeGreaterThan(0));
    const captureBody = bodies.find((b) => 'study_center_name' in b || 'accepts_terms' in b);
    expect(captureBody).toBeDefined();
    expect(captureBody?.study_center_name).toBe('Instituto Nuevo SAC');
    expect(captureBody).not.toHaveProperty('study_center_id');
  });

  it('el capture-partial nunca incluye study_center_name (aunque haya institución pendiente de crear)', async () => {
    const bodies: Record<string, unknown>[] = [];
    global.fetch = mockFetchSequence((body) => bodies.push(body));

    render(
      <LeadLeadForm
        config={baseConfig}
        landingId={1}
        landing="test-landing"
        studyCenters={studyCenters}
      />,
    );

    await waitFor(() => expect(screen.getByText('Institución')).toBeInTheDocument());

    fireEvent.click(screen.getByText('¿Dónde estudias?'));
    const searchInput = await screen.findByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'Otro Instituto' } });
    const createButton = await screen.findByText((content) => content.includes('Crear «Otro Instituto»'));
    fireEvent.click(createButton);

    // Ningún body enviado hasta ahora (capture-partial solo dispara en onChange de opción
    // existente / blur de otros campos core) debe traer study_center_name.
    for (const body of bodies) {
      expect(body).not.toHaveProperty('study_center_name');
    }
  });
});
