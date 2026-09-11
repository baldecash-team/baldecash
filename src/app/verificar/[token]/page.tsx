/**
 * Verificación de una aceptación electrónica — ruta pública raíz.
 * Ruta: /verificar/[token]  (es la que va impresa en el QR de la constancia)
 *
 * Se resuelve en el servidor a propósito: el QR lo escanea alguien con el
 * contrato en la mano, muchas veces desde un teléfono prestado o con mala
 * señal, y la respuesta tiene que llegar pintada. Sin JS de por medio tampoco
 * hay estado intermedio en el que la página diga "cargando" para siempre.
 */
import { VerificacionResultado } from './VerificacionResultado';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Verificar constancia | BaldeCash',
  // No se indexa: cada URL es la constancia de una persona.
  robots: { index: false, follow: false },
};

export interface Verificacion {
  valido: boolean;
  motivo?: 'sin_aceptar' | 'reemplazado';
  nombre?: string;
  operacion?: string;
  aceptado_at?: string;
  algoritmo?: string;
  hash?: string;
  declaracion?: string;
  declaracion_version?: number;
}

export default async function VerificarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let datos: Verificacion | null = null;
  let noExiste = false;
  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/verificar/${encodeURIComponent(token)}`, {
      cache: 'no-store',
    });
    if (r.status === 404) noExiste = true;
    else if (r.ok) datos = await r.json();
  } catch {
    // Se cae al mismo cartel que un token inválido: decir "error de red" no le
    // sirve a nadie que tenga el papel delante.
  }

  // El documento en sí, servido por ws2 con el MISMO token: quien tiene este
  // enlace ya tiene acceso al contrato —es el que le llegó por correo y por
  // WhatsApp—, así que no agrega exposición. Cada visita firma el S3 de nuevo
  // con su propia expiración, y por eso el link se arma y no se guarda.
  const documentoUrl = `${API_BASE_URL}/public/kyc/documento/${encodeURIComponent(token)}`;

  return (
    <VerificacionResultado datos={datos} noExiste={noExiste} documentoUrl={documentoUrl} />
  );
}
