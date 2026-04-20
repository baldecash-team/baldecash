import type { MetadataRoute } from 'next';

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://baldecash.com';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function sitemap(): MetadataRoute.Sitemap {
  const prefix = `${SITE_URL}${BASE_PATH}`;

  return [
    {
      url: `${prefix}/home`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${prefix}/home/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${prefix}/home/solicitar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
