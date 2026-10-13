import { render, screen } from '@testing-library/react';
import { SaludoDowngrade, esSaludoDowngrade, textoDelTope } from '../SaludoDowngrade';

/**
 * BAL-4641: la oferta de downgrade saluda como el WhatsApp que trae al cliente
 * («¡Tu financiamiento fue aprobado, {nombre}!» + la cuota aprobada). El upsell
 * y la oferta estándar NO: conservan «¡Felicitaciones…!».
 */

describe('esSaludoDowngrade', () => {
  test('solo en downgrade y con un tope que mostrar', () => {
    expect(esSaludoDowngrade('downgrade', 250)).toBe(true);
  });

  test.each(['upsell', 'standard', 'unknown', undefined, null])(
    'el caso %p conserva el saludo de siempre',
    (caso) => {
      expect(esSaludoDowngrade(caso, 250)).toBe(false);
    },
  );

  test.each([0, -5, null, undefined, Number.NaN])('sin tope (%p) no aplica', (tope) => {
    expect(esSaludoDowngrade('downgrade', tope)).toBe(false);
  });
});

describe('textoDelTope', () => {
  test.each([
    [250, '250'],
    [1250, '1250'],
    [250.5, '250.50'],
    [249.99, '249.99'],
    [250.004, '250'],
  ])('%p se muestra como %p (igual que en el WhatsApp)', (tope, texto) => {
    expect(textoDelTope(tope)).toBe(texto);
  });
});

describe('SaludoDowngrade', () => {
  test('portada: nombre, cuota aprobada e invitación a elegir del catálogo', () => {
    const { container } = render(<SaludoDowngrade nombre=" Rosa Quispe " tope={250} variante="portada" />);

    expect(container).toHaveTextContent('¡Tu financiamiento fue aprobado, Rosa Quispe!');
    expect(container).toHaveTextContent(
      'Tienes una cuota aprobada de hasta S/ 250 al mes. Elige el equipo que prefieras de tu catálogo.',
    );
    expect(container).not.toHaveTextContent('Felicitaciones');
  });

  test('complementos: mismo saludo en el h1 y la frase de esa pantalla', () => {
    const { container } = render(<SaludoDowngrade nombre="Rosa" tope={180.5} variante="complementos" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('¡Tu financiamiento fue aprobado, Rosa!');
    expect(container).toHaveTextContent(
      'Tienes una cuota aprobada de hasta S/ 180.50 al mes. Solo mostramos lo que entra en tu cuota.',
    );
  });

  test('sin nombre no deja la coma suelta', () => {
    const { container } = render(<SaludoDowngrade nombre={null} tope={250} variante="portada" />);

    expect(container).toHaveTextContent('¡Tu financiamiento fue aprobado!');
  });
});
