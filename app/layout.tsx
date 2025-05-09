import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import DynamicProvider from '@/components/dynamic-provider'
import { NeverminedProvider } from '@/components/nevermined-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'X402 + Nevermined | AI Agent Economy',
  description: 'A Next.js app demonstrating the integration of X402 payment protocol with Nevermined for AI agent-to-agent interactions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DynamicProvider>
            <NeverminedProvider>
              {children}
            </NeverminedProvider>
          </DynamicProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
