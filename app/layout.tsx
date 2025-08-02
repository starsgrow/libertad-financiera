import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import GoogleAuthProvider, { GoogleAuthScreen } from '@/components/GoogleAuthProvider'
import InstallPWA from '@/components/InstallPWA'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Libertad Financiera',
  description: 'Controla tus finanzas personales',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Libertad Financiera" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Libertad Financiera" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <GoogleAuthProvider>
          <div className="min-h-screen bg-gray-50">
            <GoogleAuthScreen />
            <Navigation />
            <main className="pb-20">
              {children}
            </main>
            <InstallPWA />
          </div>
        </GoogleAuthProvider>
      </body>
    </html>
  )
} 