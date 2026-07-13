/**
 * Tests for SelectInput - "creatable" support
 *
 * Covers Task 7 of "institución creatable en lead form": when `creatable`
 * is set and the typed term matches no option label (case-insensitive),
 * a "Crear «X»" action appears at the foot of the dropdown and calls
 * `onCreate` with the trimmed term on click.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectInput } from './SelectInput';

const OPTIONS = [
  { value: 'ucv', label: 'Universidad César Vallejo' },
  { value: 'upc', label: 'Universidad Peruana de Ciencias Aplicadas' },
];

describe('SelectInput - creatable', () => {
  it('does not show "Crear" action when creatable is false (default)', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(
      <SelectInput
        id="institucion"
        label="Institución"
        value=""
        onChange={jest.fn()}
        options={OPTIONS}
        onCreate={onCreate}
      />
    );

    await user.click(screen.getByRole('button', { name: /selecciona una opción/i }));
    await user.type(screen.getByPlaceholderText('Buscar...'), 'Universidad Nueva');

    expect(screen.queryByText(/Crear/)).not.toBeInTheDocument();
  });

  it('shows "Crear «X»" when creatable and no option matches the typed term', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(
      <SelectInput
        id="institucion"
        label="Institución"
        value=""
        onChange={jest.fn()}
        options={[]}
        creatable
        onCreate={onCreate}
      />
    );

    await user.click(screen.getByRole('button', { name: /selecciona una opción/i }));
    await user.type(screen.getByPlaceholderText('Buscar...'), 'Universidad Nueva');

    const createButton = await screen.findByRole('button', { name: /Crear\s*«Universidad Nueva»/ });
    expect(createButton).toBeInTheDocument();

    await user.click(createButton);
    expect(onCreate).toHaveBeenCalledWith('Universidad Nueva');
  });

  it('does not show "Crear" when the typed term matches an existing option exactly (case-insensitive)', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(
      <SelectInput
        id="institucion"
        label="Institución"
        value=""
        onChange={jest.fn()}
        options={OPTIONS}
        creatable
        onCreate={onCreate}
      />
    );

    await user.click(screen.getByRole('button', { name: /selecciona una opción/i }));
    await user.type(screen.getByPlaceholderText('Buscar...'), 'universidad césar vallejo');

    expect(screen.queryByText(/Crear/)).not.toBeInTheDocument();
  });

  it('clears the search term after creating', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(
      <SelectInput
        id="institucion"
        label="Institución"
        value=""
        onChange={jest.fn()}
        options={[]}
        creatable
        onCreate={onCreate}
      />
    );

    await user.click(screen.getByRole('button', { name: /selecciona una opción/i }));
    const searchInput = screen.getByPlaceholderText('Buscar...');
    await user.type(searchInput, 'Instituto Nuevo');

    const createButton = await screen.findByRole('button', { name: /Crear\s*«Instituto Nuevo»/ });
    await user.click(createButton);

    // Dropdown closes on create (mirrors handleSelect behavior)
    expect(screen.queryByPlaceholderText('Buscar...')).not.toBeInTheDocument();
  });
});
