import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import NavBar from '@/components/layout/NavBar'
import Footer from '@/components/layout/Footer'
import BackgroundManager from '@/components/layout/BackgroundManager'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export const metadata: Metadata = {
  title: 'GameHub | Play Multiple Board & Card Games',
  description: 'A platform for playing multiple board and card games with customizable themes and multiplayer support.',
  keywords: 'chess, ludo, rummy, card games, board games, multiplayer games, online games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
        <Providers>
          <BackgroundManager />
          <NavBar />
          <div className="container mx-auto flex-grow">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
