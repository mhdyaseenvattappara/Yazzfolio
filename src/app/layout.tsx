import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { PreloaderWrapper } from '@/components/layout/preloader-wrapper';
import { FirebaseClientProvider } from '@/firebase';

const siteUrl = 'https://yazzfolio.com'; // Replace with your actual domain

export const metadata: Metadata = {
  title: {
    default: 'Mhd Yaseen V | Graphic & UI/UX Designer',
    template: '%s | Mhd Yaseen V',
  },
  description:
    'Creative portfolio of Mhd Yaseen V, a high-end graphic and UI/UX designer specializing in creating compelling, futuristic visual experiences.',
  keywords: [
    'Mhd Yaseen V',
    'Graphic Designer',
    'UI/UX Designer',
    'Portfolio',
    'Visual Design',
    'Figma',
    'Adobe Creative Suite',
    'iOS 26 Design',
    'Glassmorphism'
  ],
  authors: [{ name: 'Mhd Yaseen V', url: siteUrl }],
  creator: 'Mhd Yaseen V',
  publisher: 'Mhd Yaseen V',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      {
        url: "/my-photo.jpg",
        type: "image/jpeg",
      }
    ],
    shortcut: '/my-photo.jpg',
    apple: '/my-photo.jpg',
  },
  openGraph: {
    title: 'Mhd Yaseen V | Graphic & UI/UX Designer',
    description:
      'Explore the creative portfolio of Mhd Yaseen V, showcasing premium UI/UX and graphic design projects.',
    url: siteUrl,
    siteName: 'Mhd Yaseen V Portfolio',
    images: [
      {
        url: '/my-photo.jpg',
        width: 1200,
        height: 630,
        alt: 'Mhd Yaseen V Portfolio Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mhd Yaseen V | Graphic & UI/UX Designer',
    description:
      'High-end UI/UX and graphic design portfolio by Mhd Yaseen V.',
    images: ['/my-photo.jpg'],
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
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
