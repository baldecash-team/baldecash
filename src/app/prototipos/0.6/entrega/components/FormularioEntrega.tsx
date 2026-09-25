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
 * `dirección` aparece si la solicitud llegó sin ubigeo, si la dirección guardada
 * no le sirve al repartidor (plus code, sin número) o si la persona
 * toca «Editar»: Renueva y segundo financiamiento se aprueban sin dirección, y
 * es acá donde la declaran.
 */

import { useMemo, useState } from 'react';
import { GeoCascadeField } from '@/app/prototipos/0.6/components/lead/GeoCascadeField';
import {
  PARTES_VACIAS, TIPOS_VIA, TIPOS_ZONA,
  componerDireccion, erroresDeDireccion, errorDeReferencia, esCelularValido,
  problemaDeDireccionGuardada,
  type CampoDireccion, type PartesDireccion,
} from './direccionEntrega';

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
  | CampoDireccion | 'distrito' | 'referencia'
  | 'nombre' | 'documento' | 'telefono' | 'parentesco' | 'tipoEnvio';

const NUM_LOGISTICA = '957 082 347';

const esDniValido = (v: string) => /^\d{8}$/.test(v.trim());
const limpio = (v?: string | null) => (v ?? '').toString().trim();

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
  // La dirección guardada puede estar pero no servir (un plus code, una zona
  // sin número): entonces también se entra por la pantalla de dirección.
  const problemaInicial = problemaDeDireccionGuardada(limpio(inicial.direccion));
  const sinUbigeo = !limpio(inicial.distritoId) || !limpio(inicial.direccion);
  const debeCorregir = sinUbigeo || !!problemaInicial;

  const [editandoDireccion, setEditandoDireccion] = useState(debeCorregir);
  const [mostrarAccesorios, setMostrarAccesorios] = useState(false);
  const [errores, setErrores] = useState<Set<Campo>>(new Set());
  /** Por qué se la mandó a corregir la dirección: va arriba y en rojo. */
  const [alertaDireccion, setAlertaDireccion] = useState<string | null>(
    !sinUbigeo && problemaInicial ? problemaInicial : null,
  );

  // Mientras no toque «Editar», la dirección es la guardada. Al editar se pide
  // en partes y el renglón se arma con `componerDireccion`.
  const [partes, setPartes] = useState<PartesDireccion>(PARTES_VACIAS);
  const enPartes = editandoDireccion || !!partes.forma;
  const direccion = partes.forma ? componerDireccion(partes) : limpio(inicial.direccion);
  const calle = partes.forma ? partes.interior.trim() : limpio(inicial.calle);
  const erroresPartes = erroresDeDireccion(partes);

  const [referencia, setReferencia] = useState(limpio(inicial.referencia));
  const [distritoId, setDistritoId] = useState(limpio(inicial.distritoId));
  const [distrito, setDistrito] = useState(limpio(inicial.distrito));
  const [ubicacion, setUbicacion] = useState(limpio(inicial.ubicacion) || limpio(inicial.distrito));

  const cambiaParte = (campo: keyof PartesDireccion, valor: string) => {
    setPartes((previas) => ({ ...previas, [campo]: valor }));
    if (campo !== 'interior' && campo !== 'tipoVia' && campo !== 'tipoZona') {
      limpiaError(campo as Campo);
    }
  };

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

  const faltanDeDireccion = () => {
    const faltan = new Set<Campo>();
    if (enPartes) {
      (Object.keys(erroresPartes) as CampoDireccion[]).forEach((c) => faltan.add(c));
    }
    if (!distritoId) faltan.add('distrito');
    if (errorDeReferencia(referencia)) faltan.add('referencia');
    return faltan;
  };

  /** Confirmar dirección: marca TODO lo que falta de una vez, no el primero. */
  const confirmarDireccion = () => {
    const faltan = faltanDeDireccion();
    setErrores(faltan);
    if (faltan.size) return;
    setAlertaDireccion(null);
    setEditandoDireccion(false);
  };

  const finalizar = () => {
    const faltan = faltanDeDireccion();
    if (!esTitular) {
      if (!nombres.trim()) faltan.add('nombre');
      if (!esDniValido(documento)) faltan.add('documento');
      if (!esCelularValido(telefono)) faltan.add('telefono');
      if (!parentesco.trim()) faltan.add('parentesco');
    }
    if (!tipoEnvioId) faltan.add('tipoEnvio');
    setErrores(faltan);

    // Una dirección que el repartidor no puede ubicar no se registra: se vuelve
    // a la pantalla de dirección con la alerta de por qué, en vez de dejarla
    // pasar y enterarse cuando el courier regresa con el equipo.
    const problema = enPartes ? null : problemaDeDireccionGuardada(direccion);
    if (problema || faltan.has('distrito')) {
      setAlertaDireccion(problema);
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
      telefono: esTitular ? '' : telefono.replace(/\D/g, ''),
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
      {editandoDireccion && !debeCorregir && (
        <button
          type="button"
          onClick={() => { setPartes(PARTES_VACIAS); setErrores(new Set()); setEditandoDireccion(false); }}
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

          {alertaDireccion && (
            <Alerta>
              No podemos registrar tu envío con esta dirección: {alertaDireccion}. El
              repartidor no la encontraría. Escríbela de nuevo con el formato de abajo.
            </Alerta>
          )}

          <DireccionEnPartes
            partes={partes}
            errores={erroresPartes}
            marcados={errores}
            guardada={limpio(inicial.direccion)}
            onCambio={cambiaParte}
          />

          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <GeoCascadeField
                value={distritoId}
                districtLabel={distrito}
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
              <Alerta>Corrige los campos marcados para continuar.</Alerta>
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
                  <Campo
                    id="entrega-quien-tel"
                    label="Celular"
                    requerido
                    ayuda="El repartidor la llamará al llegar."
                    error={marca('telefono') && !esCelularValido(telefono) ? 'El celular tiene 9 números y empieza con 9' : null}
                  >
                    <input
                      id="entrega-quien-tel"
                      className={inputClase(marca('telefono') && !esCelularValido(telefono))}
                      type="text"
                      inputMode="tel"
                      maxLength={11}
                      placeholder="Ej: 987654321"
                      value={telefono}
                      onChange={(e) => { setTelefono(e.target.value.replace(/[^\d ]/g, '')); limpiaError('telefono'); }}
                    />
                  </Campo>
                  <Campo
                    id="entrega-quien-parentesco"
                    label="Parentesco"
                    requerido
                    error={marca('parentesco') && !parentesco.trim() ? 'Escribe qué es tuyo (ej: madre)' : null}
                  >
                    <input
                      id="entrega-quien-parentesco"
                      className={inputClase(marca('parentesco') && !parentesco.trim())}
                      type="text"
                      maxLength={50}
                      placeholder="Ej: madre, hermano"
                      value={parentesco}
                      onChange={(e) => { setParentesco(e.target.value); limpiaError('parentesco'); }}
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
                {!esTitular && ['nombre', 'documento', 'telefono', 'parentesco'].some((c) => errores.has(c as Campo))
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

/**
 * La dirección en partes. Dos formas, porque así se ubica una casa en Perú:
 * por vía y número ("Av. Benavides 1238") o por zona, manzana y lote ("AA.HH.
 * Los Cedros Mz Z Lt 15"). Debajo se ve el renglón tal como le llegará al
 * repartidor, para que la persona lo lea antes de confirmar.
 */
function DireccionEnPartes({
  partes, errores, marcados, guardada, onCambio,
}: {
  partes: PartesDireccion;
  errores: Partial<Record<CampoDireccion, string>>;
  marcados: Set<string>;
  guardada: string;
  onCambio: (campo: keyof PartesDireccion, valor: string) => void;
}) {
  const error = (c: CampoDireccion) => (marcados.has(c) ? errores[c] ?? null : null);
  const renglon = componerDireccion(partes);
  // Hasta que escriba el nombre, el recuadro muestra un ejemplo en gris en vez
  // de un renglón a medias ("Av.").
  const empezado = (partes.forma === 'via' ? partes.nombreVia : partes.nombreZona).trim() !== '';
  const carretera = partes.tipoVia === 'Carretera';

  return (
    <fieldset className="flex flex-col gap-3 border-0 p-0">
      <legend className="mb-2.5 text-[15px] font-semibold text-[#222226]">
        ¿Cómo es tu dirección? <span className="text-[#C4371E]">*</span>
      </legend>
      {guardada && (
        <p className="-mt-1 text-[13px] text-[#8A8B99]">Tenemos registrada: «{guardada}»</p>
      )}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Eleccion
          nombre="entrega-forma"
          seleccionada={partes.forma === 'via'}
          onSelect={() => onCambio('forma', 'via')}
          etiqueta="Calle, avenida o jirón"
        />
        <Eleccion
          nombre="entrega-forma"
          seleccionada={partes.forma === 'lote'}
          onSelect={() => onCambio('forma', 'lote')}
          etiqueta="Manzana y lote"
        />
      </div>
      {error('forma') && <TextoError>{error('forma')}</TextoError>}

      {partes.forma === 'via' && (
        <>
          <Chips
            nombre="entrega-tipo-via"
            etiqueta="Tipo de vía"
            opciones={TIPOS_VIA}
            valor={partes.tipoVia}
            onElegir={(v) => onCambio('tipoVia', v)}
          />
          <div className="grid grid-cols-[1fr_104px] gap-3">
            <Campo id="entrega-nombre-via" label="Nombre de la vía" requerido error={error('nombreVia')}>
              <input
                id="entrega-nombre-via"
                className={inputClase(!!error('nombreVia'))}
                type="text"
                maxLength={120}
                placeholder="Ej: Benavides"
                value={partes.nombreVia}
                onChange={(e) => onCambio('nombreVia', e.target.value)}
              />
            </Campo>
            <Campo id="entrega-numero" label={carretera ? 'Km' : 'Número'} requerido error={error('numero')}>
              <input
                id="entrega-numero"
                className={inputClase(!!error('numero'))}
                type="text"
                inputMode={carretera ? 'decimal' : 'text'}
                maxLength={8}
                placeholder={carretera ? 'Ej: 12.5' : 'Ej: 1238'}
                value={partes.numero}
                onChange={(e) => onCambio('numero', e.target.value)}
              />
            </Campo>
          </div>
        </>
      )}

      {partes.forma === 'lote' && (
        <>
          <Chips
            nombre="entrega-tipo-zona"
            etiqueta="Tipo de zona"
            opciones={TIPOS_ZONA}
            valor={partes.tipoZona}
            onElegir={(v) => onCambio('tipoZona', v)}
          />
          <Campo id="entrega-nombre-zona" label={`Nombre de la ${partes.tipoZona === 'AA.HH.' ? 'zona' : partes.tipoZona.toLowerCase()}`} requerido error={error('nombreZona')}>
              <input
                id="entrega-nombre-zona"
                className={inputClase(!!error('nombreZona'))}
                type="text"
                maxLength={120}
                placeholder="Ej: Los Cedros 2da Etapa"
                value={partes.nombreZona}
                onChange={(e) => onCambio('nombreZona', e.target.value)}
              />
            </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo id="entrega-mz" label="Manzana" requerido error={error('mz')}>
              <input
                id="entrega-mz"
                className={inputClase(!!error('mz'))}
                type="text"
                maxLength={4}
                placeholder="Ej: Z"
                value={partes.mz}
                onChange={(e) => onCambio('mz', e.target.value)}
              />
            </Campo>
            <Campo id="entrega-lote" label="Lote" requerido error={error('lote')}>
              <input
                id="entrega-lote"
                className={inputClase(!!error('lote'))}
                type="text"
                maxLength={4}
                placeholder="Ej: 15"
                value={partes.lote}
                onChange={(e) => onCambio('lote', e.target.value)}
              />
            </Campo>
          </div>
        </>
      )}

      {partes.forma && (
        <>
          <Campo id="entrega-interior" label="Dpto, interior o piso" opcional>
            <input
              id="entrega-interior"
              className={inputClase(false)}
              type="text"
              maxLength={30}
              placeholder="Ej: Dpto 301"
              value={partes.interior}
              onChange={(e) => onCambio('interior', e.target.value)}
            />
          </Campo>
          <p className="rounded-[10px] bg-[#F7F7FB] px-3.5 py-2.5 text-[13px] text-[#5F6070]">
            {empezado ? 'Así la verá el repartidor:' : 'Ejemplo:'}{' '}
            {empezado ? (
              <span data-testid="entrega-renglon" className="font-semibold text-[#222226]">
                {[renglon, partes.interior.trim()].filter(Boolean).join(', ')}
              </span>
            ) : (
              <span className="font-semibold text-[#8A8B99]">
                {partes.forma === 'via' ? 'Av. Benavides 1238, Dpto 301' : 'AA.HH. Los Cedros Mz Z Lt 15'}
              </span>
            )}
          </p>
        </>
      )}
    </fieldset>
  );
}

/**
 * Pocas opciones cortas: van a la vista, como pastillas, en vez de esconderse
 * en un desplegable. En el celular se eligen de un toque y se ve de una qué
 * otras había. Son radios de verdad por debajo, así que el teclado y los
 * lectores de pantalla las recorren como un grupo.
 */
function Chips({
  nombre, etiqueta, opciones, valor, onElegir,
}: {
  nombre: string;
  etiqueta: string;
  opciones: readonly string[];
  valor: string;
  onElegir: (valor: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={etiqueta}>
      <p className="mb-2 text-sm font-semibold text-[#222226]">{etiqueta}</p>
      <div className="flex flex-wrap gap-2">
        {opciones.map((opcion) => {
          const activa = opcion === valor;
          return (
            <label
              key={opcion}
              className={[
                'relative inline-flex h-9 cursor-pointer select-none items-center gap-1.5 rounded-full border-[1.5px] px-3.5',
                'text-sm font-medium transition-colors',
                'has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[#E4E6FF]',
                activa
                  ? 'border-[#4654CD] bg-[#4654CD] text-white'
                  : 'border-[#C9CBD8] bg-white text-[#5F6070] hover:border-[#4654CD] hover:text-[#4654CD]',
              ].join(' ')}
            >
              <input
                type="radio"
                name={nombre}
                value={opcion}
                checked={activa}
                onChange={() => onElegir(opcion)}
                className="sr-only"
              />
              {activa && (
                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="h-3 w-3">
                  <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {opcion}
            </label>
          );
        })}
      </div>
    </div>
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
