'use client';

/**
 * Not Found Page - BaldeCash v0.6 [landing]
 * Se muestra cuando se accede a subrutas que no existen dentro de un landing
 */

import { useParams } from 'next/navigation';
import { NotFoundContent } from '../components/NotFoundContent';
import { routes } from '@/app/prototipos/0.6/utils/routes';

export default function NotFound() {
  const params = useParams();
  const landing = (params?.landing as string) || 'home';

  return <NotFoundContent homeUrl={routes.landingHome(landing)} />;
}
