'use client';

/**
 * El formulario de entrega conectado al API, por token.
 *
 * Hace el mismo recorrido que Zona Clientes —pedir los datos de la solicitud,
 * mostrarlos, registrar el envío y avisar si algo falló— pero contra los
 * endpoints públicos de ws2, que salen del token del enlace:
 *
 *   GET  /public/entrega/{token}   datos de la solicitud (equipo, dirección)
 *   POST /public/entrega/{token}   registra el envío
 *
 * El token ES la prueba de titularidad y vence: por eso los estados de enlace
 * vencido y enlace inválido son parte de la pantalla, no un error genérico.
 *
 * La pantalla en sí vive en `FormularioEntrega`, que no sabe de API: acá se
 * traduce lo que devuelve ws2 a lo que ese componente espera, y al revés.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getEntrega,
  isEntregaApiError,
  registrarEntrega,
  type EntregaDatos,
  type EntregaPayload,
} from '@/app/prototipos/0.6/services/entregaApi';
import {
  FormularioEntrega,
  type OpcionEnvio,
  type ValoresEntrega,
} from './FormularioEntrega';

/** Enlace que existió y ya no sirve: se ofrece pedir uno nuevo, no reintentar. */
const VENCIDOS = new Set(['expired', 'revoked', 'consumed', 'inactive']);

const NUM_LOGISTICA = '957 082 347';

/**
 * A donde va «Ver el estado de mi solicitud» cuando nadie dijo a donde.
 *
 * Pasa con el enlace de WhatsApp: se entra directo al formulario, fuera del
 * wizard, y no hay una confirmacion a la que volver. Antes esa pantalla
 * terminaba sin salida —la persona quedaba mirando «Tu envio quedo
 * registrado»—, asi que cae en Zona Clientes, que es el seguimiento del que
 * habla el propio texto de la pantalla.
 */
const URL_SEGUIMIENTO = 'https://zonaclientes.baldecash.com';

/**
 * Envío gratis, la única opción de este flujo.
 *
 * ws2 todavía no sirve las opciones de envío por token —en Zona Clientes vienen
 * del legacy—, así que se arma acá con la fecha que sí manda.
 *
 * El express aparecía al lado, apagado y con un «No disponible», como en Zona
 * Clientes. Acá no hay nada que elegir: la única opción es esta y viaja sola,
 * así que mostrar la otra solo agregaba un precio que nadie puede pagar.
 */
function opcionesDeEnvio(fechaEntrega: string | null): OpcionEnvio[] {
  return [
    {
      id: 'gratis',
      nombre: 'Envío gratis',
      condicion: fechaEntrega
        ? `Llega el ${fechaLarga(fechaEntrega)}.`
        : 'Envío hasta 5 días hábiles.',
      costo: 0,
    },
  ];
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** `2026-09-20` → `20 de septiembre`. Sin `new Date`: el string ya viene en
 *  hora de Lima y parsearlo lo corre un día para atrás. */
function fechaLarga(iso: string): string {
  const [, mes, dia] = iso.split('-');
  const indice = Number(mes) - 1;
  if (!dia || indice < 0 || indice > 11) return iso;
  return `${Number(dia)} de ${MESES[indice]}`;
}

type Vista =
  | { estado: 'cargando' }
  | { estado: 'listo'; datos: EntregaDatos }
  | { estado: 'sin_red' }
  | { estado: 'vencido' }
  | { estado: 'invalido' };

export interface EntregaTokenClientProps {
  token: string;
  /**
   * A dónde sigue el flujo al terminar: la confirmación de la solicitud cuando
   * se llega acá desde el cierre del KYC. Sin esto el cierre no ofrece salida
   * —es el caso del enlace por WhatsApp, donde no hay a dónde volver—.
   */
  volver?: string;
  /** Alternativa a `volver` para quien monta el componente por su cuenta. */
  onVerSolicitud?: () => void;
}

export function EntregaTokenClient({ token, volver, onVerSolicitud }: EntregaTokenClientProps) {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>({ estado: 'cargando' });
  const [enviando, setEnviando] = useState(false);
  const [errorSistema, setErrorSistema] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState(false);

  const cargar = useCallback(async () => {
    setVista({ estado: 'cargando' });
    const respuesta = await getEntrega(token);
    if (isEntregaApiError(respuesta)) {
      if (respuesta.reason === 'network') return setVista({ estado: 'sin_red' });
      if (VENCIDOS.has(respuesta.reason)) return setVista({ estado: 'vencido' });
      return setVista({ estado: 'invalido' });
    }
    setVista({ estado: 'listo', datos: respuesta });
  }, [token]);

  useEffect(() => { void cargar(); }, [cargar]);

  const registrar = async (valores: ValoresEntrega) => {
    setErrorSistema(null);
    setEnviando(true);

    const payload: EntregaPayload = {
      direccion: valores.direccion,
      calle: valores.calle,
      referencia: valores.referencia,
      // El ubigeo viaja en `distrito_id`; los nombres van por compatibilidad con
      // el despacho, que los guarda como texto.
      departamento: '',
      provincia: '',
      distrito: valores.distrito,
      distrito_id: valores.distritoId,
      es_titular: valores.esTitular,
      nombres: valores.nombres,
      nrodocumento: valores.documento,
      telefono: valores.telefono,
      parentesco: valores.parentesco,
    };

    const respuesta = await registrarEntrega(token, payload);
    setEnviando(false);

    if (isEntregaApiError(respuesta)) {
      // El enlace pudo vencer mientras la persona completaba: eso no es un
      // error del formulario, es otra pantalla.
      if (VENCIDOS.has(respuesta.reason)) return setVista({ estado: 'vencido' });
      setErrorSistema(respuesta.error);
      return;
    }
    setRegistrado(true);
  };

  if (vista.estado === 'cargando') {
    return (
      <Aviso titulo="Cargando tus datos" detalle="Un segundo, estamos buscando tu solicitud." cargando />
    );
  }
  if (vista.estado === 'sin_red') {
    return (
      <Aviso
        titulo="No pudimos conectarnos"
        detalle="Revisa tu conexión e inténtalo de nuevo."
        accion={{ texto: 'Reintentar', onClick: () => void cargar() }}
      />
    );
  }
  if (vista.estado === 'vencido') {
    return (
      <Aviso
        titulo="Este enlace ya venció"
        detalle={`Escríbenos al ${NUM_LOGISTICA} y te mandamos uno nuevo para coordinar tu entrega.`}
      />
    );
  }
  if (vista.estado === 'invalido') {
    return (
      <Aviso
        titulo="No encontramos tu formulario"
        detalle={`Revisa que hayas abierto el enlace completo. Si sigue igual, escríbenos al ${NUM_LOGISTICA}.`}
      />
    );
  }

  const { datos } = vista;

  return (
    <FormularioEntrega
      equipo={{
        nombre: datos.equipo.nombre || 'Tu equipo',
        imagen: datos.equipo.imagen,
        specs: datos.equipo.specs,
        accesorios: datos.equipo.accesorios,
        cuotaMensual: datos.equipo.cuota,
        cuotas: datos.equipo.cuotas,
        cuotaInicial: datos.equipo.inicial,
      }}
      direccionInicial={{
        direccion: datos.direccion.direccion,
        calle: datos.direccion.calle,
        referencia: datos.direccion.referencia,
        distrito: datos.direccion.distrito,
        distritoId: datos.direccion.distrito_id,
        ubicacion: [
          datos.direccion.distrito,
          datos.direccion.provincia,
          datos.direccion.departamento,
        ].filter(Boolean).join(', '),
      }}
      opcionesEnvio={opcionesDeEnvio(datos.fecha_entrega)}
      // Corregir la dirección es el motivo por el que este formulario existe:
      // Renueva y segundo financiamiento se aprueban sin ubigeo.
      permiteEditarDireccion
      enviando={enviando}
      errorSistema={errorSistema}
      listo={registrado}
      onEnviar={registrar}
      onVerSolicitud={
        onVerSolicitud ??
        (volver
          ? () => router.push(volver)
          : () => { window.location.href = URL_SEGUIMIENTO; })
      }
    />
  );
}

function Aviso({
  titulo, detalle, accion, cargando,
}: {
  titulo: string;
  detalle?: string;
  accion?: { texto: string; onClick: () => void };
  cargando?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-3 px-4 py-16 text-center">
      {cargando && (
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E4E6FF] border-t-[#4654CD]" />
      )}
      {/* Mismo azul que el título de la fase: estas pantallas centradas son el
          encabezado de lo que está pasando (cargando, enlace vencido), no un
          párrafo más. */}
      <p className="text-xl font-bold text-[#4654CD]">{titulo}</p>
      {detalle && <p className="max-w-[46ch] text-sm text-[#5F6070]">{detalle}</p>}
      {accion && (
        <button
          type="button"
          onClick={accion.onClick}
          className="mt-2 h-11 rounded-[10px] bg-[#4654CD] px-5 font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
        >
          {accion.texto}
        </button>
      )}
    </div>
  );
}

export default EntregaTokenClient;
