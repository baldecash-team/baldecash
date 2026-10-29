import React from 'react';
import { render } from '@testing-library/react';
import { conNombreEnNegrita } from '../conNombreEnNegrita';
import { etiquetaSegunVinculo } from '../textoSegunVinculo';

describe('conNombreEnNegrita', () => {
  it('pinta en negrita solo el nombre del familiar, en un solo span', () => {
    const { container } = render(<label className="flex gap-1.5">{conNombreEnNegrita(etiquetaSegunVinculo('Celular {de_tu_familiar}', 'madre'))}</label>);
    const label = container.querySelector('label')!;
    expect(label.children).toHaveLength(1);
    expect(label.textContent).toBe('Celular de tu mamá');
    expect(label.querySelector('strong')?.textContent).toBe('tu mamá');
  });

  it('una etiqueta sin marca sale igual, sin negrita', () => {
    const { container } = render(<label>{conNombreEnNegrita('Tipo de ingresos')}</label>);
    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent).toBe('Tipo de ingresos');
  });
});
