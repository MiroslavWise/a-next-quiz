import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { MedeoMono } from "medeo-font/mono"
import { MedeoPixel } from "medeo-font/pixel"
import { MedeoSans } from "medeo-font/sans"

import QueryProvider from "@/providers/query"

import "./globals.css"

export const metadata: Metadata = {
  title: "QAND",
  description: "Викторина QAND в Telegram Mini App",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`dark h-full ${MedeoSans.variable} ${MedeoMono.variable} ${MedeoPixel.variable}`}>
      <body className="min-h-full font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
