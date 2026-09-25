'use client';

/**
 * Formulario de entrega, el mismo que vive en Zona Clientes pero para el flujo
 * por token del front.
 *
 * Es SOLO la pantalla: no habla con ningún API. Recibe los datos ya cargados y
 * devuelve lo que la persona completó por `onEnviar`; quien lo monte decide de
 * dónde salen esos datos y a dónde van. Así el diseño se puede ver y probar
 * antes de engancharlo al flujo real.
 *
 * Dos pantallas y dos cierres, como en Zona Clientes:
 *
 *   dirección  →  envío  →  (enviando)  →  listo
 *
 * `dirección` solo aparece si la solicitud llegó sin ubigeo o si la persona
 * toca «Editar»: Renueva y segundo financiamiento se aprueban sin dirección, y
 * es acá donde la declaran.
 */

import { useCallback, useMemo, useState } from 'react';
import { GeoCascadeField } from '@/app/prototipos/0.6/components/lead/GeoCascadeField';
import { useGooglePlacesAutocomplete } from '@/app/prototipos/0.6/[landing]/solicitar/hooks/useGooglePlacesAutocomplete';
import { resolveGeoUnits } from '@/app/prototipos/0.6/services/wizardApi';
import type { ParsedAddress } from '@/app/prototipos/0.6/types/googleMaps';

/** Equipo que se va a entregar. Todo opcional salvo el nombre: la tarjeta se
 *  arma con lo que haya y no se rompe si falta el precio o la imagen. */
export interface EntregaEquipo {
  nombre: string;
  imagen?: string | null;
  cuotaMensual?: string | null;
  cuotas?: number | null;
  cuotaInicial?: string | null;
  accesorios?: string[];
  /** Características destacadas, ya formateadas por el backend. */
  specs?: Array<{ label: string; valor: string }>;
}

/** Lo que ya sabemos de la dirección. Sin `distritoId` no hay ubigeo y el
 *  formulario abre directo en la pantalla de dirección. */
export interface EntregaDireccionInicial {
  direccion?: string | null;
  calle?: string | null;
  referencia?: string | null;
  /** «Jesús María, Lima, Lima», para mostrar. La cascada la reescribe al elegir. */
  ubicacion?: string | null;
  distritoId?: string | null;
  distrito?: string | null;
}

export interface OpcionEnvio {
  id: string;
  nombre: string;
  /** «Envío hasta 5 días hábiles». */
  condicion?: string | null;
  costo: number;
  /** Se muestra «No disponible» y no se puede elegir. */
  disponible?: boolean;
}

export interface ValoresEntrega {
  direccion: string;
  calle: string;
  referencia: string;
  distritoId: string;
  distrito: string;
  esTitular: boolean;
  nombres: string;
  documento: string;
  telefono: string;
  parentesco: string;
  tipoEnvioId: string;
}

export interface FormularioEntregaProps {
  equipo: EntregaEquipo;
  direccionInicial?: EntregaDireccionInicial;
  opcionesEnvio: OpcionEnvio[];
  /** Renueva y segundo financiamiento pueden corregir la dirección; el resto no. */
  permiteEditarDireccion?: boolean;
  /** Lo maneja quien monta el componente: mientras está en true se ve el loader. */
  enviando?: boolean;
  /** Falló el registro: banner con reintento, sin perder lo completado. */
  errorSistema?: string | null;
  /** Registrado: se muestra el cierre con el resumen de lo que eligió. */
  listo?: boolean;
  onEnviar: (valores: ValoresEntrega) => void;
  /** Qué hace el botón del cierre. Sin esto no se pinta. */
  onVerSolicitud?: () => void;
  /**
   * "Volver al contrato" (gate G1 del envío anticipado): se pinta como el
   * botón secundario del cierre, al lado de "Finalizar solicitud" —igual que
   * "Atrás" junto a "Acepto el contrato" en el paso anterior—, y no como un
   * enlace suelto arriba del formulario. Sin esto no se pinta (enlace de
   * WhatsApp, que se abre fuera del wizard).
   */
  onVolver?: () => void;
}

type Campo =
  | 'direccion' | 'distrito' | 'referencia'
  | 'nombre' | 'documento' | 'tipoEnvio';

const NUM_LOGISTICA = '957 082 347';

const esDniValido = (v: string) => /^\d{8}$/.test(v.trim());
const limpio = (v?: string | null) => (v ?? '').toString().trim();

/**
 * La referencia es lo que usa el repartidor cuando la dirección no alcanza, y
 * es la causa más común de "dirección no ubicada". Por eso no basta con que
 * haya algo escrito: un "-" o un "ninguna" heredados del legacy pasaban como
 * referencia y el courier volvía sin entregar.
 */
export const REFERENCIA_MIN = 10;

/**
 * Plus code de Google (`R22G+RRF`): lo devuelve cuando el punto no tiene calle
 * con nombre. Es un código de ubicación, no una dirección, y en la guía del
 * courier no le dice nada al repartidor. Lo mismo unas coordenadas pegadas.
 */
const PLUS_CODE = /\b[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}\b/i;
const COORDENADAS = /-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.?\d*/;
export const esCodigoDeUbicacion = (v: string) => PLUS_CODE.test(v) || COORDENADAS.test(v);
const errorDeDireccion = (v: string): string | null => {
  if (!v.trim()) return 'Escribe tu dirección';
  if (esCodigoDeUbicacion(v)) {
    return 'Escribe el nombre de tu calle o tu Mz y Lote: el repartidor no entiende códigos como R22G+RRF';
  }
  return null;
};
const REFERENCIAS_VACIAS = new Set([
  '-', '.', 'ninguna', 'ninguno', 'no', 'na', 'n/a', 'sin referencia', 'ninguna referencia', 'x',
]);
const errorDeReferencia = (v: string): string | null => {
  const texto = v.trim();
  if (!texto || REFERENCIAS_VACIAS.has(texto.toLowerCase())) {
    return 'Escribe una referencia para el repartidor';
  }
  if (texto.length < REFERENCIA_MIN || !/[a-záéíóúñ]/i.test(texto)) {
    return 'Agrega más detalle: qué hay cerca o cómo es tu casa';
  }
  return null;
};

export function FormularioEntrega({
  equipo,
  direccionInicial,
  opcionesEnvio,
  permiteEditarDireccion = false,
  enviando = false,
  errorSistema = null,
  listo = false,
  onEnviar,
  onVerSolicitud,
  onVolver,
}: FormularioEntregaProps) {
  const inicial = direccionInicial ?? {};
  const sinUbigeo = !limpio(inicial.distritoId) || !limpio(inicial.direccion);

  // Sin ubigeo se entra por la pantalla de dirección: es lo único que traba el
  // envío, y pedirlo después de confirmar el resto sería hacerla volver.
  const [editandoDireccion, setEditandoDireccion] = useState(sinUbigeo);
  const [mostrarAccesorios, setMostrarAccesorios] = useState(false);
  const [errores, setErrores] = useState<Set<Campo>>(new Set());

  const [direccion, setDireccion] = useState(limpio(inicial.direccion));
  const [calle, setCalle] = useState(limpio(inicial.calle));
  const [referencia, setReferencia] = useState(limpio(inicial.referencia));
  const [distritoId, setDistritoId] = useState(limpio(inicial.distritoId));
  const [distrito, setDistrito] = useState(limpio(inicial.distrito));
  const [ubicacion, setUbicacion] = useState(limpio(inicial.ubicacion) || limpio(inicial.distrito));

  // Google Maps sobre el campo de direccion: el mismo hook que usa el
  // formulario de solicitud, para que el comportamiento sea el de siempre.
  // Ref por estado y no `useRef`: el campo de direccion se monta recien al
  // entrar a editar, y el hook de Google engancha en un efecto que depende de
  // la IDENTIDAD del ref. Con un `useRef` estable ese efecto ya habia corrido
  // con el input todavia sin montar, y el autocompletado nunca aparecia.
  const [googleSinCalle, setGoogleSinCalle] = useState(false);
  const [nodoDireccion, setNodoDireccion] = useState<HTMLInputElement | null>(null);
  const inputDireccion = useMemo(() => ({ current: nodoDireccion }), [nodoDireccion]);
  const [preset, setPreset] = useState<{ departmentId?: string; provinceId?: string }>({});

  const alElegirLugar = useCallback(async (lugar: ParsedAddress) => {
    // La calle y el numero, no la direccion entera: el distrito, la provincia y
    // el departamento son los selects de abajo, y repetirlos en el renglon de
    // la calle es lo que despues llega impreso en la guia del courier.
    const calleYNumero = [lugar.street, lugar.number].filter(Boolean).join(' ').trim();
    // Sin calle, Google cae a un plus code ("R22G+RRF, Villa El Salvador"): se
    // deja el campo vacío para que la escriba, y el distrito igual se resuelve.
    const sinCalle = !calleYNumero && esCodigoDeUbicacion(lugar.formattedAddress || '');
    setGoogleSinCalle(sinCalle);
    setDireccion(sinCalle ? '' : (calleYNumero || lugar.formattedAddress));
    if (!sinCalle) limpiaError('direccion');

    if (!lugar.department && !lugar.province && !lugar.district) return;

    // Google devuelve nombres; el ubigeo son ids. Los resuelve el backend, que
    // es el que conoce el catalogo (y sus acentos).
    const geo = await resolveGeoUnits({
      department: lugar.department || '',
      province: lugar.province || undefined,
      district: lugar.district || undefined,
    });
    if (!geo) return;

    setPreset({
      departmentId: geo.department ? String(geo.department.id) : undefined,
      provinceId: geo.province ? String(geo.province.id) : undefined,
    });
    if (geo.district) {
      setDistritoId(String(geo.district.id));
      setDistrito(geo.district.label);
      limpiaError('distrito');
    }
    setUbicacion([
      geo.district?.label, geo.province?.label, geo.department?.label,
    ].filter(Boolean).join(', '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fail-safe: si Google no carga —sin key, sin red, bloqueado— el campo sigue
  // siendo un input de texto y el formulario se completa a mano.
  useGooglePlacesAutocomplete({
    inputRef: inputDireccion,
    countryRestriction: 'pe',
    onPlaceSelected: alElegirLugar,
  });

  const [esTitular, setEsTitular] = useState(true);
  const [nombres, setNombres] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [parentesco, setParentesco] = useState('');

  // Lo que la persona puede efectivamente elegir. Una opcion marcada como no
  // disponible no es una opcion: ocupa lugar y no lleva a ninguna parte.
  const elegibles = useMemo(
    () => opcionesEnvio.filter((o) => o.disponible !== false),
    [opcionesEnvio],
  );
  /**
   * Con una sola opcion no hay eleccion que hacer: el envio se muestra como
   * dato y viaja solo. El selector aparece recien cuando hay dos caminos
   * posibles —hoy no los hay: el envio de este flujo es gratis y siempre—.
   */
  const unicaOpcion = elegibles.length === 1 ? elegibles[0] : null;
  const [tipoEnvioId, setTipoEnvioId] = useState(unicaOpcion ? unicaOpcion.id : '');

  const marca = (campo: Campo) => errores.has(campo);
  const limpiaError = (campo: Campo) =>
    setErrores((previos) => {
      if (!previos.has(campo)) return previos;
      const siguiente = new Set(previos);
      siguiente.delete(campo);
      return siguiente;
    });

  /** Confirmar dirección: marca TODO lo que falta de una vez, no el primero. */
  const confirmarDireccion = () => {
    const faltan = new Set<Campo>();
    if (errorDeDireccion(direccion)) faltan.add('direccion');
    if (!distritoId) faltan.add('distrito');
    if (errorDeReferencia(referencia)) faltan.add('referencia');
    setErrores(faltan);
    if (faltan.size) return;
    setEditandoDireccion(false);
  };

  const finalizar = () => {
    const faltan = new Set<Campo>();
    if (errorDeDireccion(direccion)) faltan.add('direccion');
    if (!distritoId) faltan.add('distrito');
    if (errorDeReferencia(referencia)) faltan.add('referencia');
    if (!esTitular) {
      if (!nombres.trim()) faltan.add('nombre');
      if (!esDniValido(documento)) faltan.add('documento');
    }
    if (!tipoEnvioId) faltan.add('tipoEnvio');
    setErrores(faltan);

    // Si lo que falta es de la dirección, se vuelve a esa pantalla: marcada en
    // rojo detrás de un botón «Editar» no se ve.
    if (faltan.has('direccion') || faltan.has('distrito')) {
      setEditandoDireccion(true);
      return;
    }
    if (faltan.size) return;

    onEnviar({
      direccion: direccion.trim(),
      calle: calle.trim(),
      referencia: referencia.trim(),
      distritoId,
      distrito,
      esTitular,
      nombres: esTitular ? '' : nombres.trim(),
      documento: esTitular ? '' : documento.trim(),
      telefono: esTitular ? '' : telefono.trim(),
      parentesco: esTitular ? '' : parentesco.trim(),
      tipoEnvioId,
    });
  };

  const envioElegido = opcionesEnvio.find((o) => o.id === tipoEnvioId);

  if (listo) {
    return (
      <Cierre
        direccion={[direccion, calle].filter(Boolean).join(', ')}
        ubicacion={ubicacion}
        referencia={referencia}
        recibe={esTitular ? 'Tú' : nombres}
        envio={envioElegido}
        onVerSolicitud={onVerSolicitud}
      />
    );
  }

  if (enviando) {
    return (
      <div
        className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-3 py-16 text-center"
        role="status"
        aria-live="polite"
      >
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E4E6FF] border-t-[#4654CD]" />
        <p className="text-xl font-bold text-[#4654CD]">Estamos registrando tu envío</p>
        <p className="text-sm text-[#5F6070]">Tarda solo unos segundos. No cierres esta ventana.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[600px] text-[15px] leading-normal text-[#222226] md:max-w-[620px]">
      {editandoDireccion && !sinUbigeo && (
        <button
          type="button"
          onClick={() => setEditandoDireccion(false)}
          className="mb-3 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#4654CD] transition-colors hover:bg-[#ECECFB] cursor-pointer"
        >
          <svg viewBox="0 0 7 12" fill="none" aria-hidden="true" className="h-3 w-2">
            <path d="M6 11L1 6L6 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver
        </button>
      )}

      {/* El único título de la fase: va en el azul de la marca y con una regla
          debajo, para que se lea como el encabezado de lo que sigue y no como
          una línea más de texto entre las tarjetas. */}
      <header className="mb-5 border-b border-[#E3E4EC] pb-3">
        <h2 className="text-[22px] font-bold leading-snug text-[#4654CD]">
          {editandoDireccion ? '¿A dónde enviamos tu equipo?' : 'Confirma tu envío'}
        </h2>
        <p className="mt-1 text-sm text-[#5F6070]">
          {editandoDireccion
            ? 'Escribe la dirección donde quieres recibirlo.'
            : 'Revisa que todo esté bien antes de finalizar.'}
        </p>
      </header>

      <TarjetaEquipo
        equipo={equipo}
        abierto={mostrarAccesorios}
        onToggle={() => setMostrarAccesorios((v) => !v)}
      />

      {editandoDireccion ? (
        <div className="mt-4 flex flex-col gap-4">
          <aside className="flex gap-2.5 text-sm leading-snug text-[#5F6070]">
            <IconoInfo />
            <p>
              Solo enviamos a domicilios (no a centros de trabajo o de estudio). Escribe la
              misma dirección que figura en tu recibo de servicios: te lo pediremos más adelante.
            </p>
          </aside>

          <Campo
            id="entrega-direccion"
            label="Dirección"
            requerido
            ayuda={googleSinCalle
              ? 'Google ubicó tu zona, pero no tu calle. Escríbela a mano (ej: Calle Los Pinos o Mz B Lt 4).'
              : 'Empieza a escribir y elige tu dirección de la lista.'}
            error={marca('direccion') ? errorDeDireccion(direccion) : null}
            icono={<IconoPin />}
          >
            <input
              id="entrega-direccion"
              ref={setNodoDireccion}
              className={inputClase(marca('direccion') && !!errorDeDireccion(direccion), true)}
              type="text"
              autoComplete="off"
              placeholder="Escribe y elige tu dirección (ej: Av. Benavides 1238)"
              value={direccion}
              onChange={(e) => { setDireccion(e.target.value); setGoogleSinCalle(false); limpiaError('direccion'); }}
            />
          </Campo>

          <Campo id="entrega-calle" label="N°, Dpto, Mz, Lote o Km" opcional>
            <input
              id="entrega-calle"
              className={inputClase(false)}
              type="text"
              placeholder="Ej: Dpto 301 / Mz A Lt 5"
              value={calle}
              onChange={(e) => setCalle(e.target.value)}
            />
          </Campo>

          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <GeoCascadeField
                value={distritoId}
                districtLabel={distrito}
                preset={preset}
                hideErrorText
                // `error` es el texto; con `hideErrorText` solo pinta los tres
                // campos en rojo y el mensaje lo ponemos una vez, abajo.
                error={marca('distrito') && !distritoId ? 'Elige tu distrito' : undefined}
                onChange={(id, label) => {
                  setDistritoId(id);
                  setDistrito(label ?? '');
                  setUbicacion(label ?? '');
                  if (id) limpiaError('distrito');
                }}
              />
            </div>
            {marca('distrito') && !distritoId && <TextoError>Elige tu distrito</TextoError>}
          </div>

          <Campo
            id="entrega-referencia"
            label="Referencia"
            requerido
            ayuda="Ayuda al repartidor a ubicar tu casa."
            error={marca('referencia') ? errorDeReferencia(referencia) : null}
          >
            <input
              id="entrega-referencia"
              className={inputClase(marca('referencia') && !!errorDeReferencia(referencia))}
              type="text"
              maxLength={250}
              placeholder="Ej: frente al parque, casa de rejas negras"
              value={referencia}
              onChange={(e) => { setReferencia(e.target.value); limpiaError('referencia'); }}
            />
          </Campo>

          <div className="mt-2">
            {errores.size > 0 && (
              <Alerta>Faltan datos para enviar tu equipo. Revisa los campos marcados.</Alerta>
            )}
            <button type="button" onClick={confirmarDireccion} className={botonPrimario}>
              Confirmar dirección
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          <section className="flex gap-3 rounded-[14px] border border-[#E3E4EC] bg-[#F7F7FB] p-3.5" aria-label="Dirección de entrega">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#4654CD] text-white" aria-hidden="true">
              <IconoCasa />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#4654CD]">Dirección de entrega</p>
              <p className="font-semibold leading-snug text-[#222226]">
                {[direccion, calle].filter(Boolean).join(', ')}
              </p>
              {ubicacion && <p className="text-[#5F6070]">{ubicacion}</p>}
            </div>
            {permiteEditarDireccion && (
              <button
                type="button"
                onClick={() => setEditandoDireccion(true)}
                className="-mr-1.5 -mt-1 h-fit rounded-md px-1.5 py-1 text-sm font-semibold text-[#4654CD] transition-colors hover:bg-[#E4E6FF] cursor-pointer"
              >
                Editar
              </button>
            )}
          </section>

          {/* Siempre a la vista, aunque venga precargada: la que heredamos puede
              ser un "-" o estar vieja, y es lo que lee el repartidor. */}
          <Campo
            id="entrega-referencia-2"
            label="Referencia de la dirección"
            requerido
            ayuda="Ayuda al repartidor a ubicar tu casa."
            error={marca('referencia') ? errorDeReferencia(referencia) : null}
          >
            <input
              id="entrega-referencia-2"
              className={inputClase(marca('referencia') && !!errorDeReferencia(referencia))}
              type="text"
              maxLength={250}
              placeholder="Ej: frente al parque, casa de rejas negras"
              value={referencia}
              onChange={(e) => { setReferencia(e.target.value); limpiaError('referencia'); }}
            />
          </Campo>

          <fieldset className="border-0 p-0">
            <legend className="mb-2.5 text-[15px] font-semibold text-[#222226]">
              ¿Quién recibe el pedido?
            </legend>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Eleccion
                nombre="entrega-recibe"
                seleccionada={esTitular}
                onSelect={() => setEsTitular(true)}
                etiqueta="Yo lo recibiré"
              />
              <Eleccion
                nombre="entrega-recibe"
                seleccionada={!esTitular}
                onSelect={() => setEsTitular(false)}
                etiqueta="Otra persona"
              />
            </div>

            {!esTitular && (
              <div className="mt-3 flex flex-col gap-4 rounded-xl bg-[#F7F7FB] p-3.5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Campo
                    id="entrega-quien-nombre"
                    label="Nombre completo"
                    requerido
                    error={marca('nombre') && !nombres.trim() ? 'Escribe el nombre de quien recibe' : null}
                  >
                    <input
                      id="entrega-quien-nombre"
                      className={inputClase(marca('nombre') && !nombres.trim())}
                      type="text"
                      maxLength={250}
                      placeholder="Ej: María Torres"
                      value={nombres}
                      onChange={(e) => { setNombres(e.target.value); limpiaError('nombre'); }}
                    />
                  </Campo>
                  <Campo
                    id="entrega-quien-dni"
                    label="DNI"
                    requerido
                    error={marca('documento') && !esDniValido(documento) ? 'El DNI tiene 8 números' : null}
                  >
                    <input
                      id="entrega-quien-dni"
                      className={inputClase(marca('documento') && !esDniValido(documento))}
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="8 dígitos"
                      value={documento}
                      onChange={(e) => {
                        setDocumento(e.target.value.replace(/\D/g, ''));
                        limpiaError('documento');
                      }}
                    />
                  </Campo>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Campo id="entrega-quien-tel" label="Teléfono" opcional>
                    <input
                      id="entrega-quien-tel"
                      className={inputClase(false)}
                      type="text"
                      inputMode="tel"
                      maxLength={15}
                      placeholder="Ej: 987654321"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </Campo>
                  <Campo id="entrega-quien-parentesco" label="Parentesco" opcional>
                    <input
                      id="entrega-quien-parentesco"
                      className={inputClase(false)}
                      type="text"
                      maxLength={50}
                      placeholder="Ej: madre, hermano"
                      value={parentesco}
                      onChange={(e) => setParentesco(e.target.value)}
                    />
                  </Campo>
                </div>
              </div>
            )}
          </fieldset>

          {unicaOpcion ? (
            <section aria-label="Envío">
              <h3 className="mb-2.5 text-[15px] font-semibold text-[#222226]">Envío</h3>
              <div
                data-testid="entrega-envio-unico"
                className="flex items-start gap-3 rounded-xl border-[1.5px] border-[#E3E4EC] bg-[#F7F7FB] p-3.5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{unicaOpcion.nombre}</span>
                  {unicaOpcion.condicion && (
                    <span className="mt-0.5 block text-[13px] font-normal text-[#5F6070]">
                      {unicaOpcion.condicion}
                    </span>
                  )}
                </span>
                <span
                  className={[
                    'whitespace-nowrap font-bold',
                    unicaOpcion.costo === 0 ? 'text-[#1E7F50]' : 'text-[#222226]',
                  ].join(' ')}
                >
                  {unicaOpcion.costo === 0 ? 'Gratis' : `S/ ${unicaOpcion.costo.toFixed(2)}`}
                </span>
              </div>
            </section>
          ) : (
          <fieldset className="border-0 p-0">
            <legend className="mb-2.5 text-[15px] font-semibold text-[#222226]">Tipo de envío</legend>
            <div className="flex flex-col gap-2.5">
              {opcionesEnvio.map((opcion) => {
                const noDisponible = opcion.disponible === false;
                const elegida = opcion.id === tipoEnvioId;
                return (
                  <label
                    key={opcion.id}
                    aria-disabled={noDisponible ? 'true' : 'false'}
                    className={[
                      'flex items-start gap-3 rounded-xl border-[1.5px] p-3.5 transition-colors',
                      noDisponible
                        ? 'cursor-not-allowed border-[#E3E4EC] bg-[#F7F7FB] opacity-70'
                        : 'cursor-pointer',
                      elegida && !noDisponible
                        ? 'border-[#4654CD] bg-white ring-1 ring-[#4654CD]'
                        : !noDisponible
                          ? 'border-[#C9CBD8] hover:border-[#AEB0C2]'
                          : '',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="entrega-tipo"
                      className="mt-0.5 h-[18px] w-[18px] flex-none accent-[#4654CD]"
                      value={opcion.id}
                      checked={elegida}
                      disabled={noDisponible}
                      onChange={() => { setTipoEnvioId(opcion.id); limpiaError('tipoEnvio'); }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 font-semibold">
                        {opcion.nombre}
                        {noDisponible && (
                          <span className="rounded-full bg-[#E6E6EC] px-2 py-0.5 text-[11px] font-semibold text-[#5F6070]">
                            No disponible
                          </span>
                        )}
                      </span>
                      {opcion.condicion && (
                        <span className="mt-0.5 block text-[13px] font-normal text-[#5F6070]">
                          {opcion.condicion}
                        </span>
                      )}
                    </span>
                    <span
                      className={[
                        'whitespace-nowrap font-bold',
                        opcion.costo === 0 ? 'text-[#1E7F50]' : 'text-[#222226]',
                      ].join(' ')}
                    >
                      {opcion.costo === 0 ? 'Gratis' : `S/ ${opcion.costo.toFixed(2)}`}
                    </span>
                  </label>
                );
              })}
            </div>
            {marca('tipoEnvio') && !tipoEnvioId && <TextoError>Elige un tipo de envío</TextoError>}
          </fieldset>
          )}

          <div className="mt-2 flex flex-col gap-2">
            {errores.size > 0 && (
              <Alerta>
                {!esTitular && (errores.has('nombre') || errores.has('documento'))
                  ? 'Completa los datos de quien recibe el pedido.'
                  : 'Faltan datos para enviar tu equipo. Revisa los campos marcados.'}
              </Alerta>
            )}
            {errorSistema && (
              <Alerta>
                <strong className="block font-semibold">No pudimos registrar tu envío</strong>
                {errorSistema}
                <br />
                <button
                  type="button"
                  onClick={finalizar}
                  className="mt-1.5 font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Reintentar
                </button>
              </Alerta>
            )}
            {/* En el teléfono uno encima del otro: la acción principal arriba
                y "Volver al contrato" debajo (`flex-col-reverse` lo deja primero
                en el DOM). Desde `sm`, la fila de siempre. */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {onVolver && (
                <button type="button" onClick={onVolver} className={botonSecundario}>
                  Volver al contrato
                </button>
              )}
              <button type="button" onClick={finalizar} className={botonPrimario}>
                Finalizar solicitud
              </button>
            </div>
            <p className="text-center text-[13px] text-[#8A8B99]">
              ¿Dudas con la entrega? Escríbenos al {NUM_LOGISTICA}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── piezas ───────────────────────────── */

const botonPrimario =
  'h-12 w-full rounded-[10px] bg-[#4654CD] font-semibold text-white transition-opacity hover:opacity-90 '
  + 'disabled:cursor-not-allowed disabled:bg-[#C4C6EE] cursor-pointer';

const botonSecundario =
  'h-12 w-full rounded-[10px] border border-[#4654CD] font-semibold text-[#4654CD] '
  + 'transition-colors hover:bg-[#ECECFB] cursor-pointer';

function inputClase(conError: boolean, conIcono = false) {
  return [
    'h-[46px] w-full rounded-[10px] border-[1.5px] bg-white text-[15px] text-[#222226] outline-none',
    'transition-colors placeholder:text-[#8A8B99]',
    conIcono ? 'pl-10 pr-3.5' : 'px-3.5',
    conError
      ? 'border-[#C4371E] focus:ring-[3px] focus:ring-[#F6CFC7]'
      : 'border-[#C9CBD8] hover:border-[#AEB0C2] focus:border-[#4654CD] focus:ring-[3px] focus:ring-[#E4E6FF]',
  ].join(' ');
}

/**
 * Los nombres del catalogo son de ficha tecnica y en un chip ocupan mas que el
 * dato: "Tamaño de Pantalla 8.7 pulgadas" empuja al resto a otra linea. Se
 * acortan solo los conocidos; lo que no este en la lista se muestra tal cual.
 */
const ETIQUETAS_CORTAS: Record<string, string> = {
  'Memoria RAM': 'RAM',
  'Tamaño de Pantalla': 'Pantalla',
  'Resolución de Pantalla': 'Resolución',
  'Tipo de Almacenamiento': 'Disco',
  'Sistema Operativo': 'SO',
  'Capacidad de Batería': 'Batería',
};

function etiquetaCorta(label: string): string {
  return ETIQUETAS_CORTAS[label] ?? label;
}

function TarjetaEquipo({
  equipo, abierto, onToggle,
}: { equipo: EntregaEquipo; abierto: boolean; onToggle: () => void }) {
  const accesorios = equipo.accesorios ?? [];
  return (
    <section className="flex gap-3.5 rounded-2xl border border-[#E3E4EC] bg-white p-3.5" aria-label="Equipo solicitado">
      <div className="grid h-24 w-24 flex-none place-items-center rounded-xl bg-[#F4F4F8] p-1">
        {equipo.imagen
          ? <img src={equipo.imagen} alt="" className="h-full w-full rounded-xl object-contain" />
          : <IconoCaja />}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold leading-snug text-[#222226]">{equipo.nombre}</h3>

        {/* El precio y el plazo son una sola frase: "39.00 al mes, 24 cuotas,
            sin cuota inicial". Separados en dos renglones se leian como dos
            datos sueltos, y con las specs en el medio ni siquiera quedaban
            juntos. */}
        {(equipo.cuotaMensual || equipo.cuotas != null) && (
          <p className="text-[13px] leading-snug text-[#5F6070]">
            {equipo.cuotaMensual && (
              <>
                <strong className="text-[15px] font-bold text-[#222226]">S/ {equipo.cuotaMensual}</strong>
                {' al mes'}
              </>
            )}
            {equipo.cuotaMensual && equipo.cuotas != null && ' · '}
            {equipo.cuotas != null && (
              <>
                {equipo.cuotas} cuotas,{' '}
                {equipo.cuotaInicial ? `inicial S/ ${equipo.cuotaInicial}` : 'sin cuota inicial'}
              </>
            )}
          </p>
        )}

        {/* Las caracteristicas, como chips: cada una entera en su linea propia
            —el nombre y el valor no se separan— y las que no entran pasan a la
            siguiente. En lista, "Tamaño de Pantalla:" y "8.7 pulgadas" caian en
            renglones distintos y habia que leer de a saltos. */}
        {equipo.specs && equipo.specs.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {equipo.specs.map((s) => (
              <li
                key={s.label}
                className="whitespace-nowrap rounded-full bg-[#F4F4F8] px-2.5 py-1 text-[12px] text-[#5F6070]"
                title={`${s.label}: ${s.valor}`}
              >
                <span className="text-[#8A8B99]">{etiquetaCorta(s.label)}</span>{' '}
                <span className="font-semibold text-[#222226]">{s.valor}</span>
              </li>
            ))}
          </ul>
        )}
        {accesorios.length > 0 && (
          <div className="mt-1.5">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={abierto}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4654CD] cursor-pointer"
            >
              <svg
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
                className={['h-2.5 w-2.5 transition-transform', abierto ? 'rotate-90' : ''].join(' ')}
              >
                <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {accesorios.length} {accesorios.length > 1 ? 'accesorios incluidos' : 'accesorio incluido'}
            </button>
            {abierto && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {accesorios.map((a) => (
                  <li key={a} className="rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-semibold text-[#4654CD]">
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Campo({
  id, label, requerido, opcional, ayuda, error, icono, children,
}: {
  id: string;
  label: string;
  requerido?: boolean;
  opcional?: boolean;
  ayuda?: string;
  error?: string | null;
  icono?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-[#222226]">
        {label}{' '}
        {requerido && <span aria-hidden="true" className="text-[#C4371E]">*</span>}
        {opcional && <span className="font-normal text-[#8A8B99]">(opcional)</span>}
      </label>
      {icono ? (
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8B99]">
            {icono}
          </span>
          {children}
        </div>
      ) : children}
      {!error && ayuda && <p className="mt-1.5 text-[13px] text-[#5F6070]">{ayuda}</p>}
      {error && <TextoError>{error}</TextoError>}
    </div>
  );
}

function Eleccion({
  nombre, seleccionada, onSelect, etiqueta,
}: { nombre: string; seleccionada: boolean; onSelect: () => void; etiqueta: string }) {
  return (
    <label
      className={[
        'flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] p-3 transition-colors',
        seleccionada
          ? 'border-[#4654CD] bg-white ring-1 ring-[#4654CD]'
          : 'border-[#C9CBD8] bg-white hover:border-[#AEB0C2]',
      ].join(' ')}
    >
      <input
        type="radio"
        name={nombre}
        className="h-[18px] w-[18px] flex-none accent-[#4654CD]"
        checked={seleccionada}
        onChange={onSelect}
      />
      <span className="font-medium">{etiqueta}</span>
    </label>
  );
}

function TextoError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium leading-snug text-[#C4371E]">
      <IconoAlerta />
      <span>{children}</span>
    </p>
  );
}

function Alerta({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="flex gap-2.5 rounded-[10px] bg-[#FDEDEA] p-3 text-sm leading-snug text-[#A82D16]">
      <span className="mt-0.5 flex-none text-[#C4371E]"><IconoAlerta grande /></span>
      <p>{children}</p>
    </div>
  );
}

function Cierre({
  direccion, ubicacion, referencia, recibe, envio, onVerSolicitud,
}: {
  direccion: string;
  ubicacion: string;
  referencia: string;
  recibe: string;
  envio?: OpcionEnvio;
  onVerSolicitud?: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[600px] text-[15px] text-[#222226]">
      <header className="mb-5 flex flex-col items-center gap-3 rounded-2xl bg-[#4654CD] px-5 py-7 text-center text-white">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 3 3 5-6" />
          </svg>
        </span>
        <div>
          <h1 className="text-[22px] font-bold leading-tight">Tu envío quedó registrado</h1>
          <p className="mt-1 text-sm text-white/85">Ya podemos preparar tu equipo.</p>
        </div>
      </header>

      <section className="flex flex-col gap-3.5 rounded-[14px] border border-[#E3E4EC] bg-[#F7F7FB] p-4" aria-label="Resumen del envío">
        <div className="flex gap-3">
          <span className="mt-0.5 flex-none text-[#4654CD]" aria-hidden="true"><IconoCasa /></span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#8A8B99]">Lo enviamos a</p>
            <p className="font-semibold leading-snug">{direccion}</p>
            {ubicacion && <p className="text-sm text-[#5F6070]">{ubicacion}</p>}
            {referencia && <p className="text-sm text-[#5F6070]">Ref.: {referencia}</p>}
          </div>
        </div>
        <div className="flex gap-3 border-t border-white pt-3.5">
          <span className="mt-0.5 flex-none text-[#4654CD]" aria-hidden="true"><IconoCaja pequeno /></span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#8A8B99]">Recibe</p>
            <p className="font-semibold leading-snug">{recibe}</p>
            {envio && (
              <p className="text-sm text-[#5F6070]">
                {envio.nombre}
                {envio.condicion ? ` · ${envio.condicion}` : ''}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-5">
        <p className="mb-2.5 font-semibold text-[#4654CD]">Qué sigue</p>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-[#5F6070]">
          <li>Te escribimos por <strong className="font-semibold text-[#222226]">WhatsApp</strong> con tu número de seguimiento y el courier asignado.</li>
          <li>El courier se comunica contigo antes de llegar. Ten a mano tu <strong className="font-semibold text-[#222226]">DNI</strong> para recibir el equipo.</li>
          <li>Puedes ver cada avance en <strong className="font-semibold text-[#222226]">Sigue tu solicitud</strong>.</li>
        </ol>
      </div>

      {onVerSolicitud && (
        <button type="button" onClick={onVerSolicitud} className={`${botonPrimario} mt-6`}>
          Ver el estado de mi solicitud
        </button>
      )}
      <p className="mt-3 text-center text-[13px] text-[#8A8B99]">
        ¿Dudas con la entrega? Escríbenos al {NUM_LOGISTICA}.
      </p>
    </div>
  );
}

/* ───────────────────────────── íconos ───────────────────────────── */

function IconoPin() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M8 14.5s4.5-4.2 4.5-8A4.5 4.5 0 0 0 3.5 6.5c0 3.8 4.5 8 4.5 8z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconoCasa() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

function IconoCaja({ pequeno }: { pequeno?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={pequeno ? 'h-5 w-5' : 'h-8 w-8 text-[#8A8B99]'}
    >
      <path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5z" />
      <path d="M3 8.5 12 13l9-4.5M12 13v7" />
    </svg>
  );
}

function IconoInfo() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mt-0.5 h-[18px] w-[18px] flex-none text-[#8A8B99]">
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="6.3" r="1" fill="currentColor" />
    </svg>
  );
}

function IconoAlerta({ grande }: { grande?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={grande ? 'h-[18px] w-[18px]' : 'mt-0.5 h-3.5 w-3.5 flex-none'}
    >
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="13.8" r="1" fill="currentColor" />
    </svg>
  );
}

export default FormularioEntrega;
