import React from 'react';
import { render } from '@testing-library/react';
import { conNombreEnNegrita } from '../conNombreEnNegrita';
import { etiquetaSegunVinculo } from '../textoSegunVinculo';
import { CamposV2Provider } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

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

  it('Diseño 1: el nombre va en negrita, sin color (BAL-5360)', () => {
    const { container } = render(<label>{conNombreEnNegrita(etiquetaSegunVinculo('Celular {de_tu_familiar}', 'madre'))}</label>);
    const nombre = container.querySelector('strong')!;
    expect(nombre.className).toBe('font-bold');
    expect(nombre.className).not.toContain('color-primary');
  });

  it('Diseño 2: el nombre va en el morado de marca (BAL-5360)', () => {
    const { container } = render(
      <CamposV2Provider>
        <label>{conNombreEnNegrita(etiquetaSegunVinculo('Celular {de_tu_familiar}', 'madre'))}</label>
      </CamposV2Provider>,
    );
    const nombre = container.querySelector('strong')!;
    expect(nombre.textContent).toBe('tu mamá');
    expect(nombre.className).toContain('font-bold');
    expect(nombre.className).toContain('text-[var(--color-primary-text)]');
    expect(container.querySelector('label')!.textContent).toBe('Celular de tu mamá');
  });
});
