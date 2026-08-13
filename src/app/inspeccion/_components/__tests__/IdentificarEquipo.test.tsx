import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { IdentificarEquipo, type EquipoCatalogo } from '../IdentificarEquipo';

const EQUIPO: EquipoCatalogo = {
  record_id: 'rec1',
  serial: 'F3XP92635W',
  marca: 'Apple',
  modelo: 'iPhone 13 Blanco',
  procesador: 'A15 Bionic',
  ram_gb: 4,
  almacenamiento: '128GB SSD',
  pantalla: null,
  grado: 'B',
  tipo: 'Celular',
  sku: null,
};

function props(over: Partial<React.ComponentProps<typeof IdentificarEquipo>> = {}) {
  return {
    token: 'tok',
    serial: '',
    onSerialChange: jest.fn(),
    equipo: null,
    onEquipoChange: jest.fn(),
    deshabilitado: false,
    ...over,
  };
}

/** `fetch` que no resuelve: deja la vista en su estado "cargando". */
function fetchColgado() {
  global.fetch = jest.fn(() => new Promise(() => {})) as unknown as typeof fetch;
}

describe('IdentificarEquipo', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: unknown }).fetch;
  });

  it('muestra un loader mientras consulta, en vez de una pantalla quieta', async () => {
    // El OCR va a Textract y consulta Airtable: son segundos en los que sin
    // señal el operador vuelve a apretar y dispara una segunda lectura.
    fetchColgado();
    render(<IdentificarEquipo {...props({ serial: 'F3XP92635W' })} />);

    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/leyendo el serial y buscando el equipo/i)).toBeInTheDocument();
    });
  });

  it('la ficha no convive con el loader', async () => {
    fetchColgado();
    render(<IdentificarEquipo {...props({ serial: 'X', equipo: EQUIPO })} />);

    expect(screen.getByText(/iPhone 13 Blanco/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/leyendo el serial/i)).toBeInTheDocument();
    });
    // Mostrar la ficha vieja mientras se busca otra cosa haría creer que ya
    // resolvió.
    expect(screen.queryByText(/iPhone 13 Blanco/)).not.toBeInTheDocument();
  });

  it('ofrece tomar la foto con la cámara del propio dispositivo', () => {
    // El <input capture> abre la cámara en teléfono pero el selector de
    // archivos en laptop — y el controlador ES una laptop.
    render(<IdentificarEquipo {...props()} />);
    expect(screen.getByRole('button', { name: /tomar foto del serial/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subir una imagen/i })).toBeInTheDocument();
  });

  it('si no hay permiso de cámara, lo dice y ofrece la salida', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: jest.fn().mockRejectedValue(new Error('NotAllowedError')) },
    });

    render(<IdentificarEquipo {...props()} />);
    fireEvent.click(screen.getByRole('button', { name: /tomar foto del serial/i }));

    await waitFor(() => {
      expect(screen.getByText(/no se pudo abrir la cámara/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/subí una foto/i)).toBeInTheDocument();
  });

  it('al cerrar el visor libera la cámara (la luz no queda prendida)', async () => {
    const stop = jest.fn();
    const stream = { getTracks: () => [{ stop }] };
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: jest.fn().mockResolvedValue(stream) },
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });

    render(<IdentificarEquipo {...props()} />);
    fireEvent.click(screen.getByRole('button', { name: /tomar foto del serial/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^tomar foto$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^cancelar$/i }));

    // A diferencia de la cámara de grabación, este stream vive segundos: si no
    // se libera, la luz de la webcam queda prendida y se lee como que la app
    // está grabando.
    expect(stop).toHaveBeenCalled();
  });

  it('editar el serial invalida la ficha ya confirmada', () => {
    const onEquipoChange = jest.fn();
    render(<IdentificarEquipo {...props({ serial: 'F3XP92635W', equipo: EQUIPO, onEquipoChange })} />);

    fireEvent.change(screen.getByLabelText(/serial del equipo/i), { target: { value: 'F3XP9263' } });

    // Si no, lo confirmado dejaría de corresponder al texto en pantalla y se
    // podría grabar contra el equipo equivocado.
    expect(onEquipoChange).toHaveBeenCalledWith(null);
  });
});
