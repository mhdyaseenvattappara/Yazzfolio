import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { PreloaderWrapper } from '@/components/layout/preloader-wrapper';
import { FirebaseClientProvider } from '@/firebase';

const siteUrl = 'https://your-domain.com'; // Replace with your actual domain

export const metadata: Metadata = {
  title: {
    default: 'Mhd Yaseen V | Graphic & UI/UX Designer',
    template: '%s | Mhd Yaseen V',
  },
  description:
    'Creative portfolio of Mhd Yaseen V, a graphic and UI/UX designer specializing in creating compelling visual experiences.',
  keywords: [
    'Mhd Yaseen V',
    'Graphic Designer',
    'UI/UX Designer',
    'Portfolio',
    'Visual Design',
    'Figma',
    'Adobe Creative Suite'
  ],
  authors: [{ name: 'Mhd Yaseen V', url: siteUrl }],
  creator: 'Mhd Yaseen V',
  publisher: 'Mhd Yaseen V',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/my-photo.jpg',
    shortcut: '/my-photo.jpg',
    apple: '/my-photo.jpg',
  },
  openGraph: {
    title: 'Mhd Yaseen V | Graphic & UI/UX Designer',
    description:
      'Explore the creative portfolio of Mhd Yaseen V, a passionate graphic and UI/UX designer.',
    url: siteUrl,
    siteName: 'Mhd Yaseen V Portfolio',
    images: [
      {
        url: '/og-image.png', // It's good practice to have an open graph image
        width: 1200,
        height: 630,
        alt: 'Mhd Yaseen V Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mhd Yaseen V | Graphic & UI/UX Designer',
    description:
      'Explore the creative portfolio of Mhd Yaseen V, a passionate graphic and UI/UX designer.',
    images: ['/og-image.png'],
    creator: '@_hey_yasii_',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Manjari:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="cosmic" enableSystem={false}>
          <FirebaseClientProvider>
            <PreloaderWrapper>
              {children}
            </PreloaderWrapper>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
