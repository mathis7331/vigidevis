import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VINTED-TURBO',
    short_name: 'VINTED-TURBO',
    description: 'Analyse de devis travaux par IA : Économisez gros !',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      {
        src: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}


