import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './components/Providers'
import { Navbar } from './components/Navbar'

export const metadata: Metadata = {
  title: 'Arno Game - World Cup 2026 Edition',
  description: 'ทายผลฟุตบอล World Cup 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-gray-950 text-white">
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
