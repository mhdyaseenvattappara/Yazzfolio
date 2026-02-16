import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mhd Yaseen V | Graphic & UI/UX Designer',
    short_name: 'Yazzfolio',
    description: 'The creative portfolio and design archive of Mhd Yaseen V.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/my-photo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: '/my-photo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable',
      }
    ],
  }
}
