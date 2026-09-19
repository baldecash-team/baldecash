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
import { MobileStickyCta, posicionDelCta } from '../MobileStickyCta';

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
  mockProduct.getAllProducts = () => [{ id: 1 }];
  tecladoAbierto = false;
  document.documentElement.style.removeProperty('--sticky-cta-height');
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

describe('MobileStickyCta — dónde se pega', () => {
  // Los valores exactos se prueban sobre `posicionDelCta` y no sobre el DOM
  // porque jsdom descarta `env(...)` y `calc(var(...) + env(...))`: no llegan
  // ni a `.style.bottom` ni al atributo `style`, que queda en `null`. Lo que se
  // quiere fijar es qué valor escribe el componente, no cómo lo normaliza jsdom.
  it('por defecto se apila encima de la barra de producto', () => {
    expect(posicionDelCta({ debajoDeLaBarra: false, hayBarraProducto: true })).toEqual({
      bottom: 'calc(var(--product-bar-height, 72px) + env(safe-area-inset-bottom))',
    });
  });

  it('sin barra de producto se apoya en el borde, con el safe-area de colchón', () => {
    expect(posicionDelCta({ debajoDeLaBarra: false, hayBarraProducto: false })).toEqual({
      bottom: 'env(safe-area-inset-bottom)',
    });
  });

  it('con `debajoDeLaBarra` se pega al borde inferior', () => {
    // El safe-area pasa a ser padding propio: abajo del CTA ya no hay nada.
    // Y se SUMA al `py-3` (0.75rem), no lo reemplaza: el inline pisa el padding
    // de Tailwind, y sin safe-area (casi todo Android) el boton quedaria pegado
    // al borde de la pantalla.
    expect(posicionDelCta({ debajoDeLaBarra: true, hayBarraProducto: true })).toEqual({
      bottom: '0px',
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
    });
  });

  it('sin barra de producto, `debajoDeLaBarra` no cambia nada', () => {
    expect(posicionDelCta({ debajoDeLaBarra: true, hayBarraProducto: false })).toEqual(
      posicionDelCta({ debajoDeLaBarra: true, hayBarraProducto: true })
    );
  });

  // Y el cableado: que el componente realmente use esos valores. `0px` es lo
  // único que jsdom conserva, así que sirve para distinguir los dos modos.
  it('el componente escribe la posición de abajo cuando se lo pide', () => {
    const { container } = render(<MobileStickyCta onPrimary={jest.fn()} debajoDeLaBarra />);
    const caja = container.firstElementChild as HTMLElement;
    expect(caja.style.bottom).toBe('0px');
  });

  it('y por defecto NO se pega al borde', () => {
    const { container } = render(<MobileStickyCta onPrimary={jest.fn()} />);
    const caja = container.firstElementChild as HTMLElement;
    expect(caja.style.bottom).not.toBe('0px');
  });

  // El CTA nunca lleva la clase Tailwind `bottom-0`: el CSS de las landings
  // gamer selecciona `.fixed.bottom-0` con `!important` para pintar la barra de
  // producto, y con la clase el CTA heredaría ese fondo oscuro.
  it('no usa la clase `bottom-0`, que el CSS gamer pinta de oscuro', () => {
    const { container } = render(<MobileStickyCta onPrimary={jest.fn()} debajoDeLaBarra />);
    const caja = container.firstElementChild as HTMLElement;
    expect(caja.classList.contains('bottom-0')).toBe(false);
  });
});

describe('MobileStickyCta — el alto que publica', () => {
  const alto = () => document.documentElement.style.getPropertyValue('--sticky-cta-height');

  it('publica `--sticky-cta-height` mientras está montado', () => {
    render(<MobileStickyCta onPrimary={jest.fn()} debajoDeLaBarra />);
    // En jsdom `offsetHeight` es siempre 0; lo que importa es que la publique.
    expect(alto()).toBe('0px');
  });

  it('la borra cuando no se pinta, para que la barra no quede flotando', () => {
    mockProduct.isProductBarExpanded = true;
    render(<MobileStickyCta onPrimary={jest.fn()} debajoDeLaBarra />);
    expect(alto()).toBe('');
  });

  it('la borra al desmontarse', () => {
    const { unmount } = render(<MobileStickyCta onPrimary={jest.fn()} debajoDeLaBarra />);
    unmount();
    expect(alto()).toBe('');
  });
});
