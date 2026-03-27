/**
 * Not Found Page - BaldeCash v0.6
 * Se muestra cuando se accede a rutas que no existen
 */

import { NotFoundContent } from '../components/NotFoundContent';
import { routes } from '@/app/prototipos/0.6/utils/routes';

export default function NotFound() {
  return <NotFoundContent homeUrl={routes.home()} />;
}
