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

/** `fetch` que resuelve OK con el body dado (misma forma que `/catalog/{serial}`). */
function fetchOk(body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => body,
  }) as unknown as typeof fetch;
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

  it('muestra que la clase ya tiene video y cuanto material tiene', async () => {
    fetchOk({
      encontrado: true,
      equipo: { ...EQUIPO, grado: 'A' },
      impecable: true,
      defectos: [],
      clase: { grupo_visual: 'HP 250 G10', grado: 'A', etiqueta: 'HP 250 G10 · grado A' },
      video_de_clase: {
        inspection_id: 41,
        serial: '5CD51854S5',
        fecha: '2026-08-24T11:02:00',
        videos: 2,
        fotos: 4,
      },
    });
    render(<IdentificarEquipo {...props({ serial: 'F3XP92635W' })} />);
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText(/ya tiene video/i)).toBeInTheDocument();
    expect(screen.getByText(/5CD51854S5/)).toBeInTheDocument();
    expect(screen.getByText(/2 videos/)).toBeInTheDocument();
    expect(screen.getByText(/4 fotos/)).toBeInTheDocument();
  });

  it('lista los defectos que obligan a grabar', async () => {
    fetchOk({
      encontrado: true,
      equipo: EQUIPO,
      impecable: false,
      defectos: [{ campo: 'Pantalla — Rayadura', nivel: 'Leve' }],
      clase: null,
      video_de_clase: null,
    });
    render(<IdentificarEquipo {...props({ serial: 'F3XP92635W' })} />);
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText(/hay que grabar/i)).toBeInTheDocument();
    expect(screen.getByText(/Pantalla — Rayadura/)).toBeInTheDocument();
    expect(screen.getByText(/Leve/)).toBeInTheDocument();
  });

  it('avisa cuando esta unidad va a quedar como referencia de su clase', async () => {
    fetchOk({
      encontrado: true,
      equipo: EQUIPO,
      impecable: true,
      defectos: [],
      clase: { grupo_visual: 'HP 250 G10', grado: 'A', etiqueta: 'HP 250 G10 · grado A' },
      video_de_clase: null,
    });
    render(<IdentificarEquipo {...props({ serial: 'F3XP92635W' })} />);
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText(/queda como referencia/i)).toBeInTheDocument();
  });

  it('editar el serial tras un match invalida también el video de clase confirmado', async () => {
    fetchOk({
      encontrado: true,
      equipo: EQUIPO,
      impecable: true,
      defectos: [],
      clase: { grupo_visual: 'HP 250 G10', grado: 'A', etiqueta: 'HP 250 G10 · grado A' },
      video_de_clase: {
        inspection_id: 41,
        serial: '5CD51854S5',
        fecha: '2026-08-24T11:02:00',
        videos: 2,
        fotos: 4,
      },
    });
    const onVideoDeClaseChange = jest.fn();
    render(
      <IdentificarEquipo {...props({ serial: 'F3XP92635W', equipo: EQUIPO, onVideoDeClaseChange })} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByText(/ya tiene video/i);
    onVideoDeClaseChange.mockClear();

    fireEvent.change(screen.getByLabelText(/serial del equipo/i), { target: { value: 'X' } });

    // Lo confirmado (incluido el video de clase) dejó de corresponder al
    // texto en pantalla.
    expect(onVideoDeClaseChange).toHaveBeenCalledWith(null);
    expect(screen.queryByText(/ya tiene video/i)).not.toBeInTheDocument();
  });

  it('una segunda búsqueda que falla limpia el bloque de clase de la búsqueda anterior', async () => {
    // Repro: el operador escanea, el catálogo confirma y muestra un bloque
    // (acá, "referencia de la clase"). Sin tocar el input, escanea de nuevo
    // el mismo serial (red de la estación con hipo, doble lectura del lector
    // de barras) y esta vez la consulta falla. El equipo ya se limpia en ese
    // caso (`onEquipoChange(null)` en `buscarPorSerial`) — el bloque de clase
    // tiene que limpiarse igual, porque lo confirmado ya no corresponde a lo
    // que hay en pantalla.
    const okBody = {
      encontrado: true,
      equipo: EQUIPO,
      impecable: true,
      defectos: [],
      clase: { grupo_visual: 'HP 250 G10', grado: 'A', etiqueta: 'HP 250 G10 · grado A' },
      video_de_clase: null,
    };
    const okResponse = { ok: true, json: async () => okBody };
    const failResponse = {
      ok: false,
      status: 500,
      clone() {
        return failResponse;
      },
      json: async () => ({}),
    };
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(okResponse)
      .mockResolvedValueOnce(failResponse) as unknown as typeof fetch;

    render(<IdentificarEquipo {...props({ serial: 'F3XP92635W' })} />);
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByText(/queda como referencia/i);

    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(screen.getByText(/no se pudo consultar el catálogo/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/queda como referencia/i)).not.toBeInTheDocument();
  });
});
