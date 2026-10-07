/**
 * Vista previa del BORRADOR de un formulario (versionamiento, BAL-4484): el
 * panel abre `/preview/{id}?preview_key=K&form_id=F&draft=1`. El modo de vista
 * previa recuerda el formulario y que es borrador, para que el wizard los pida.
 */
import React from 'react';
import { act, render } from '@testing-library/react';
import { PreviewProvider, usePreview } from '../PreviewContext';

let contexto: ReturnType<typeof usePreview> | null = null;
const Consumidor = () => {
  contexto = usePreview();
  return null;
};

describe('PreviewContext con borrador', () => {
  beforeEach(() => {
    sessionStorage.clear();
    contexto = null;
  });

  it('guarda el formulario y que es borrador', () => {
    render(<PreviewProvider><Consumidor /></PreviewProvider>);
    act(() => contexto!.setPreviewMode(6, 'K', 'prueba-formulario', { formId: 19, borrador: true }));
    expect(contexto!.formId).toBe(19);
    expect(contexto!.borrador).toBe(true);
    const guardado = JSON.parse(sessionStorage.getItem('baldecash-preview-mode') || '{}');
    expect(guardado).toMatchObject({ landingId: 6, previewKey: 'K', formId: 19, borrador: true });
  });

  it('sin opciones queda como siempre: sin formulario ni borrador', () => {
    render(<PreviewProvider><Consumidor /></PreviewProvider>);
    act(() => contexto!.setPreviewMode(6, 'K', 'prueba-formulario'));
    expect(contexto!.formId).toBeNull();
    expect(contexto!.borrador).toBe(false);
  });
});

jest.mock('next/navigation', () => ({ usePathname: () => '/prototipos/0.6/prueba-formulario/solicitar/' }));

describe('banda de vista previa del borrador', () => {
  beforeEach(() => sessionStorage.clear());

  it('dice que es el borrador y que los clientes no lo ven', async () => {
    const { PreviewBanner } = await import('../../components/PreviewBanner');
    const { findByTestId } = render(
      <PreviewProvider>
        <Consumidor />
        <PreviewBanner landingSlug="prueba-formulario" />
      </PreviewProvider>,
    );
    act(() => contexto!.setPreviewMode(6, 'K', 'prueba-formulario', { formId: 19, borrador: true }));
    expect((await findByTestId('preview-banner-texto')).textContent).toContain(
      'Estás viendo el borrador del formulario: los clientes todavía no lo ven.',
    );
  });
});
