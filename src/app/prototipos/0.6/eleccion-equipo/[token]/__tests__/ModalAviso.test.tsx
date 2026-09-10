/**
 * El modal reemplazó al banner porque la lista se refresca DEBAJO en el mismo
 * momento del error. Lo que se fija acá es lo que hace que un diálogo sea mejor
 * que un texto y no peor: el foco. Declarar `aria-modal` sin manejarlo le dice
 * a la tecnología asistiva que lo de atrás está inerte mientras un usuario de
 * teclado sigue tabulando por las cards.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ModalAviso from '../ModalAviso';

const base = {
  titulo: 'Esa unidad ya no está disponible',
  mensaje: 'Alguien la eligió unos segundos antes que tú.',
  textoBoton: 'Ver las disponibles',
};

describe('ModalAviso', () => {
  it('es un diálogo accesible, rotulado por su título', () => {
    render(<ModalAviso {...base} onCerrar={jest.fn()} />);
    const d = screen.getByRole('dialog');
    expect(d).toHaveAttribute('aria-modal', 'true');
    expect(d).toHaveAccessibleName(base.titulo);
    expect(d).toHaveAccessibleDescription(base.mensaje);
  });

  it('toma el foco al abrir y lo devuelve al cerrar', async () => {
    const previo = document.createElement('button');
    document.body.appendChild(previo);
    previo.focus();
    expect(document.activeElement).toBe(previo);

    const { unmount } = render(<ModalAviso {...base} onCerrar={jest.fn()} />);
    expect(document.activeElement).toBe(screen.getByRole('dialog'));

    unmount();
    expect(document.activeElement).toBe(previo);
    previo.remove();
  });

  it('bloquea el scroll de fondo mientras está abierto', () => {
    const { unmount } = render(<ModalAviso {...base} onCerrar={jest.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('cierra con Escape', async () => {
    const onCerrar = jest.fn();
    render(<ModalAviso {...base} onCerrar={onCerrar} />);
    await userEvent.keyboard('{Escape}');
    expect(onCerrar).toHaveBeenCalled();
  });

  it('cierra al tocar el fondo, pero NO al soltar afuera un clic que empezó adentro', async () => {
    const onCerrar = jest.fn();
    const { container } = render(<ModalAviso {...base} onCerrar={onCerrar} />);
    const fondo = container.firstElementChild as HTMLElement;

    // Arrastrar para seleccionar texto y soltar afuera no debe cerrar.
    await userEvent.pointer([
      { target: screen.getByRole('dialog'), keys: '[MouseLeft>]' },
      { target: fondo, keys: '[/MouseLeft]' },
    ]);
    expect(onCerrar).not.toHaveBeenCalled();

    await userEvent.click(fondo);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('ofrece la salida al catálogo cuando se la pasan', () => {
    render(
      <ModalAviso
        {...base}
        onCerrar={jest.fn()}
        enlace={{ texto: 'Ver otros equipos del catálogo', href: 'https://x/catalogo/' }}
      />,
    );
    const d = screen.getByRole('dialog');
    expect(within(d).getByRole('link', { name: /catálogo/i })).toHaveAttribute(
      'href',
      'https://x/catalogo/',
    );
  });
});
