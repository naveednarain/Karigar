import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return { name: 'Karigar — Local home services', short_name: 'Karigar', description: 'Find trusted home service professionals in Hyderabad and Jamshoro.', start_url: '/en', display: 'standalone', background_color: '#f0fdf4', theme_color: '#0b3d2e', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] };
}
