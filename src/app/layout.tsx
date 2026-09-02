import type { Metadata, Viewport } from "next"

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
    <html lang="ru" className="dark h-full">
      <body className="min-h-full">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
