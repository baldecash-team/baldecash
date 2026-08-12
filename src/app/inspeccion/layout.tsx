/**
 * Layout de la estación de inspección.
 *
 * Existe por una sola razón, pero importa: el sitio comercial aplica un tema
 * oscuro al `body` con `!important` (`globals.css`, `html[data-bc-theme="dark"]`),
 * y las vistas de inspección pintan solo su `<main>` — que es angosto y del
 * alto de su contenido. Resultado: el negro del body se veía por debajo del
 * contenido y a los costados, como una barra que no pertenecía a nada.
 *
 * En un kiosco eso no es solo estética. La estación se opera de pie, a un par
 * de metros, y una franja negra bajo la interfaz se lee como "algo se rompió"
 * o "falta cargar" — justo lo que no querés transmitir cuando el operador está
 * decidiendo si el equipo se grabó bien.
 *
 * `min-h-screen` + fondo explícito cubren el viewport completo pase lo que pase
 * con el tema del sitio. No se toca `globals.css`: el tema oscuro es correcto
 * para el resto de baldecash.com, y esta sección es la excepción.
 */
export default function InspeccionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
      {children}
    </div>
  );
}
