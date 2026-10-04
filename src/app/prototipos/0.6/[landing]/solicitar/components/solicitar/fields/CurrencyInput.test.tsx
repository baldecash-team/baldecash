/**
 * BAL-4395 — CurrencyInput con el TextInput real: lo que se ve lleva coma de
 * miles; lo que sale por onChange es el número limpio.
 */
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyInput } from './CurrencyInput';

function Controlado({
  inicial = '',
  onGuardar,
  decimales,
}: {
  inicial?: string;
  onGuardar: (v: string) => void;
  decimales?: 0 | 2 | null;
}) {
  const [valor, setValor] = useState(inicial);
  return (
    <CurrencyInput
      id="monto"
      label="Monto"
      decimales={decimales}
      value={valor}
      onChange={(v) => {
        setValor(v);
        onGuardar(v);
      }}
      startContent="S/"
    />
  );
}

/**
 * Simula tipear: el navegador ya dejó el texto y el cursor donde corresponde.
 * El valor se pone con el setter nativo para que React note el cambio.
 */
const setterNativo = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
function escribir(input: HTMLInputElement, texto: string, cursor = texto.length) {
  input.focus();
  setterNativo.call(input, texto);
  input.setSelectionRange(cursor, cursor);
  fireEvent.change(input);
}

describe('CurrencyInput', () => {
  it('es un input de texto con teclado decimal (celular)', () => {
    render(<Controlado onGuardar={jest.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.getAttribute('inputmode')).toBe('decimal');
  });

  it('2500 se ve «2,500» y se guarda «2500»', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    escribir(input, '2500');
    expect(input.value).toBe('2,500');
    expect(guardar).toHaveBeenLastCalledWith('2500');
  });

  it('1234567.5 se ve «1,234,567.5» y se guarda «1234567.5»', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    escribir(input, '1234567.5');
    expect(input.value).toBe('1,234,567.5');
    expect(guardar).toHaveBeenLastCalledWith('1234567.5');
  });

  it('pegar «S/ 2,500.50» guarda «2500.50»', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    escribir(input, 'S/ 2,500.50');
    expect(input.value).toBe('2,500.50');
    expect(guardar).toHaveBeenLastCalledWith('2500.50');
  });

  it('borrar todo deja vacío', () => {
    const guardar = jest.fn();
    render(<Controlado inicial="2500" onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    escribir(input, '');
    expect(input.value).toBe('');
    expect(guardar).toHaveBeenLastCalledWith('');
  });

  it('un valor ya guardado (volver al paso / borrador) se muestra formateado', () => {
    render(<Controlado inicial="12500" onGuardar={jest.fn()} />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('12,500');
  });

  it('editar en medio no manda el cursor al final', () => {
    render(<Controlado inicial="2500" onGuardar={jest.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    // «2,500» -> el cliente teclea «1» después del «2»: «21,500» con el cursor en 2
    escribir(input, '21,500', 2);
    expect(input.value).toBe('21,500');
    expect(input.selectionStart).toBe(2);
    // otro «3» ahí mismo: «213,500», cursor tras el 3
    escribir(input, '213,500', 3);
    expect(input.value).toBe('213,500');
    expect(input.selectionStart).toBe(3);
    // un dígito más mueve la coma: «2134,500» -> «2,134,500», cursor tras el 4
    escribir(input, '2134,500', 4);
    expect(input.value).toBe('2,134,500');
    expect(input.selectionStart).toBe(5);
  });

  it('borrar la coma con retroceso borra el dígito anterior', () => {
    const guardar = jest.fn();
    render(<Controlado inicial="2500" onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Backspace' });
    escribir(input, '2500', 1); // «2,|500» sin la coma
    expect(guardar).toHaveBeenLastCalledWith('500');
    expect(input.value).toBe('500');
    expect(input.selectionStart).toBe(0);
  });

  it('flechas suben/bajan según step y respetan min/max', () => {
    const guardar = jest.fn();
    function ConPaso() {
      const [v, setV] = useState('950');
      return (
        <CurrencyInput
          id="m"
          label="M"
          value={v}
          step={100}
          min={900}
          max={1000}
          onChange={(x) => {
            setV(x);
            guardar(x);
          }}
        />
      );
    }
    render(<ConPaso />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(guardar).toHaveBeenLastCalledWith('1000');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(guardar).toHaveBeenLastCalledWith('900');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(guardar).toHaveBeenLastCalledWith('900');
  });

  it('al salir, un punto final suelto se quita del valor guardado', () => {
    const guardar = jest.fn();
    const alSalir = jest.fn();
    render(<CurrencyInput id="m" label="M" value="2500." onChange={guardar} onBlur={alSalir} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(guardar).toHaveBeenCalledWith('2500');
    expect(alSalir).toHaveBeenCalled();
  });

  it('foco y blur siguen avisando (métricas)', () => {
    const foco = jest.fn();
    const blur = jest.fn();
    render(<CurrencyInput id="m" label="M" value="2500" onChange={jest.fn()} onFocus={foco} onBlur={blur} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(foco).toHaveBeenCalledTimes(1);
    expect(blur).toHaveBeenCalledTimes(1);
  });

  // --- Revisión BAL-4395: formato peruano y teclado decimal con coma ---

  /** Tipea tecla por tecla al final, como el cliente en el celular. */
  function teclear(input: HTMLInputElement, teclas: string) {
    for (const t of teclas) {
      fireEvent.keyDown(input, { key: t });
      escribir(input, input.value + t);
    }
  }

  it.each([
    ['2.500', '2500', '2,500'],
    ['1.234.567', '1234567', '1,234,567'],
    ['2.500,50', '2500.50', '2,500.50'],
    ['S/. 2.500', '2500', '2,500'],
  ])('pegar «%s» (punto de miles) guarda «%s»', (pegado, guardado, visto) => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    escribir(input, pegado);
    expect(guardar).toHaveBeenLastCalledWith(guardado);
    expect(input.value).toBe(visto);
  });

  it('pegar «2.500» encima de un monto seleccionado entero lo reemplaza por 2500', () => {
    const guardar = jest.fn();
    render(<Controlado inicial="900" onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.paste(input, { clipboardData: { getData: () => '2.500' } });
    escribir(input, '2.500');
    expect(guardar).toHaveBeenLastCalledWith('2500');
  });

  it('teclear «2.500» no pierde el último cero: el punto era de miles', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    teclear(input, '2.500');
    expect(guardar).toHaveBeenLastCalledWith('2500');
    expect(input.value).toBe('2,500');
  });

  it('teclear «1.234.567» guarda 1234567', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    teclear(input, '1.234.567');
    expect(guardar).toHaveBeenLastCalledWith('1234567');
    expect(input.value).toBe('1,234,567');
  });

  it('teclear «2.500,50» guarda 2500.50', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    teclear(input, '2.500,50');
    expect(guardar).toHaveBeenLastCalledWith('2500.50');
    expect(input.value).toBe('2,500.50');
  });

  it('un tercer decimal tras un entero de 4+ cifras no se reinterpreta (1500.50 sigue igual)', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    teclear(input, '1500.505');
    expect(guardar).toHaveBeenLastCalledWith('1500.50');
  });

  it('teclado iOS/Android con coma decimal: «2500,5» se guarda 2500.5 (no 25005)', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    teclear(input, '2500,5');
    expect(guardar).toHaveBeenLastCalledWith('2500.5');
    expect(input.value).toBe('2,500.5');
  });

  it('el signo menos no entra (no hay montos negativos)', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    teclear(input, '-25');
    expect(guardar).toHaveBeenLastCalledWith('25');
  });

  it('ceros a la izquierda se van: «0025» guarda 25', () => {
    const guardar = jest.fn();
    render(<Controlado onGuardar={guardar} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    teclear(input, '0025');
    expect(guardar).toHaveBeenLastCalledWith('25');
  });

  // --- BAL-4400: campo «sin decimales» ---

  describe('sin decimales (decimal_places = 0)', () => {
    it('el teclado del celular es numérico, sin tecla de punto', () => {
      render(<Controlado decimales={0} onGuardar={jest.fn()} />);
      expect(screen.getByRole('textbox').getAttribute('inputmode')).toBe('numeric');
    });

    it('teclear «2500.5» no deja poner el punto y avisa en el campo', () => {
      const guardar = jest.fn();
      render(<Controlado decimales={0} onGuardar={guardar} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      teclear(input, '2500.');
      expect(input.value).toBe('2,500');
      expect(guardar).toHaveBeenLastCalledWith('2500');
      expect(screen.getByText(/soles enteros/)).toBeInTheDocument();
    });

    it('teclear la coma decimal del celular tampoco entra', () => {
      const guardar = jest.fn();
      render(<Controlado decimales={0} onGuardar={guardar} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      teclear(input, '2500,');
      expect(input.value).toBe('2,500');
      expect(guardar).toHaveBeenLastCalledWith('2500');
    });

    it('teclear «2.500» con punto de miles igual guarda 2500', () => {
      const guardar = jest.fn();
      render(<Controlado decimales={0} onGuardar={guardar} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      teclear(input, '2.500');
      expect(guardar).toHaveBeenLastCalledWith('2500');
      expect(input.value).toBe('2,500');
    });

    it('pegar «2.500,50» no redondea en silencio: deja el valor como estaba y avisa', () => {
      const guardar = jest.fn();
      render(<Controlado decimales={0} inicial="900" onGuardar={guardar} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.paste(input, { clipboardData: { getData: () => '2.500,50' } });
      escribir(input, '2.500,50');
      expect(guardar).not.toHaveBeenCalled();
      expect(input.value).toBe('900');
      expect(screen.getByText(/2\.500,50/)).toBeInTheDocument();
      expect(screen.getByText(/soles enteros/)).toBeInTheDocument();
    });

    it('pegar «S/ 2,500.00» (céntimos en cero) guarda 2500 sin aviso', () => {
      const guardar = jest.fn();
      render(<Controlado decimales={0} onGuardar={guardar} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.paste(input, { clipboardData: { getData: () => 'S/ 2,500.00' } });
      escribir(input, 'S/ 2,500.00');
      expect(guardar).toHaveBeenLastCalledWith('2500');
      expect(screen.queryByText(/soles enteros/)).not.toBeInTheDocument();
    });

    it('pegar «2.500» (punto de miles) guarda 2500', () => {
      const guardar = jest.fn();
      render(<Controlado decimales={0} onGuardar={guardar} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.paste(input, { clipboardData: { getData: () => '2.500' } });
      escribir(input, '2.500');
      expect(guardar).toHaveBeenLastCalledWith('2500');
    });

    it('el aviso se va al salir del campo', () => {
      render(<Controlado decimales={0} onGuardar={jest.fn()} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      teclear(input, '25.');
      expect(screen.getByText(/soles enteros/)).toBeInTheDocument();
      fireEvent.blur(input);
      expect(screen.queryByText(/soles enteros/)).not.toBeInTheDocument();
    });
  });

  describe('con 2 decimales o sin definir: como hoy', () => {
    it.each([[2], [null], [undefined]])('decimales=%p deja escribir 2500.50', (d) => {
      const guardar = jest.fn();
      render(<Controlado decimales={d as 0 | 2 | null | undefined} onGuardar={guardar} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.getAttribute('inputmode')).toBe('decimal');
      teclear(input, '2500.50');
      expect(guardar).toHaveBeenLastCalledWith('2500.50');
    });
  });
});
