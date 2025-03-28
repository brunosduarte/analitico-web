import type { Metadata, Viewport } from 'next'
import './globals.css'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Providers } from '@/providers'

// Metadados padrão da aplicação
export const metadata: Metadata = {
  title: {
    template: '%s | PnT',
    default: 'PnT',
  },
  description:
    'Sistema de visualização e gestão de extratos de trabalhadores portuários',
  keywords: ['extratos', 'portuários', 'trabalhadores', 'tpa', 'análise'],
  authors: [{ name: 'PnT' }],
}

// Configuração de viewport separada (nova API do Next.js 14)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-6">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
