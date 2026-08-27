/**
 * El CTA fijo de movil y, sobre todo, cuando dice "Enviando...".
 *
 * REGRESION QUE PROTEGE (Emilio, 27-ago): en el resumen de una landing con
 * complementos el boton decia «Continuar» y al pulsarlo cambiaba a «Enviando»,
 * aunque todavia faltaba la pantalla de complementos. La causa: se le pasaba
 * `isSubmitting={isSubmitting || isAppSubmitting}`, juntando el flag LOCAL que
 * `handleSummarySubmit` usa solo para navegar (`StepClient.tsx:561`) con el del
 * envio real. Mentirle al usuario sobre el progreso es exactamente la confusion
 * que este componente vino a resolver.
 *
 * Ahora son dos props: `isBusy` (deshabilita, no cambia el texto) e
 * `isSubmitting` (spinner, y solo si ademas es el ultimo paso).
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MobileStickyCta } from '../MobileStickyCta';

// El CTA lee el drawer del contexto de producto; aca solo importa que exista.
const mockProduct = {
  isProductBarExpanded: false,
  getAllProducts: () => [{ id: 1 }],
};
jest.mock('../../../../context/ProductContext', () => ({
  useProduct: () => mockProduct,
}));

// Sin teclado, salvo en el test que lo pide.
let tecladoAbierto = false;
jest.mock('../../../../hooks/useTecladoVirtualAbierto', () => ({
  useTecladoVirtualAbierto: () => tecladoAbierto,
}));

beforeEach(() => {
  mockProduct.isProductBarExpanded = false;
  tecladoAbierto = false;
});

describe('MobileStickyCta — que dice el boton', () => {
  it('paso intermedio: dice «Continuar»', () => {
    render(<MobileStickyCta onPrimary={jest.fn()} isLastStep={false} />);
    expect(screen.getByText('Continuar')).toBeInTheDocument();
    expect(screen.queryByText(/Enviando/)).not.toBeInTheDocument();
  });

  it('ultimo paso: dice «Enviar Solicitud»', () => {
    render(<MobileStickyCta onPrimary={jest.fn()} isLastStep />);
    expect(screen.getByText('Enviar Solicitud')).toBeInTheDocument();
  });

  it('EL BUG: un paso intermedio ocupado NO dice «Enviando»', () => {
    // Esto es lo que pasaba al pulsar «Continuar» en el resumen de senati.
    render(
      <MobileStickyCta
        onPrimary={jest.fn()}
        isLastStep={false}
        isBusy
        submitMessage="Creando solicitud..."
      />
    );
    expect(screen.getByText('Continuar')).toBeInTheDocument();
    expect(screen.queryByText('Creando solicitud...')).not.toBeInTheDocument();
    expect(screen.queryByText(/Enviando/)).not.toBeInTheDocument();
  });

  it('y tampoco lo dice si le llega isSubmitting sin ser el ultimo paso', () => {
    // Cinturon y tirantes: aunque un call site futuro confunda las props, el
    // texto de envio no debe salir en una pantalla que no envia.
    render(
      <MobileStickyCta onPrimary={jest.fn()} isLastStep={false} isSubmitting submitMessage="Enviando..." />
    );
    expect(screen.getByText('Continuar')).toBeInTheDocument();
    expect(screen.queryByText('Enviando...')).not.toBeInTheDocument();
  });

  it('en el ultimo paso SI muestra el mensaje de envio', () => {
    render(
      <MobileStickyCta onPrimary={jest.fn()} isLastStep isSubmitting submitMessage="Creando solicitud..." />
    );
    expect(screen.getByText('Creando solicitud...')).toBeInTheDocument();
    expect(screen.queryByText('Enviar Solicitud')).not.toBeInTheDocument();
  });

  it('sin submitMessage cae a «Enviando...»', () => {
    render(<MobileStickyCta onPrimary={jest.fn()} isLastStep isSubmitting />);
    expect(screen.getByText('Enviando...')).toBeInTheDocument();
  });
});

describe('MobileStickyCta — cuando se puede pulsar', () => {
  /** El principal es el ultimo boton: el primero es «Atrás». */
  const botonPrincipal = () => {
    const bs = screen.getAllByRole('button');
    return bs[bs.length - 1];
  };

  it('isBusy deshabilita aunque el texto no cambie (evita el doble click)', () => {
    render(<MobileStickyCta onPrimary={jest.fn()} onBack={jest.fn()} isLastStep={false} isBusy />);
    expect(botonPrincipal()).toBeDisabled();
    expect(screen.getByLabelText('Atrás')).toBeDisabled();
  });

  it('sin nada en curso, habilitado', () => {
    render(<MobileStickyCta onPrimary={jest.fn()} isLastStep={false} />);
    expect(botonPrincipal()).toBeEnabled();
  });

  it('canProceed=false deshabilita', () => {
    render(<MobileStickyCta onPrimary={jest.fn()} isLastStep={false} canProceed={false} />);
    expect(botonPrincipal()).toBeDisabled();
  });
});

describe('MobileStickyCta — cuando NO se pinta', () => {
  it('con el drawer del producto expandido', () => {
    mockProduct.isProductBarExpanded = true;
    const { container } = render(<MobileStickyCta onPrimary={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('con el teclado virtual abierto', () => {
    tecladoAbierto = true;
    const { container } = render(<MobileStickyCta onPrimary={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('con `oculto` (celebracion entre pasos)', () => {
    const { container } = render(<MobileStickyCta onPrimary={jest.fn()} oculto />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sin `onBack` no pinta el boton de atras', () => {
    render(<MobileStickyCta onPrimary={jest.fn()} isLastStep={false} />);
    expect(screen.queryByLabelText('Atrás')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
