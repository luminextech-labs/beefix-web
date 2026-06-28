import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Beefix - จองช่างออนไลน์",
  description: "แพลตฟอร์มจองช่างซ่อม ติดตั้ง บริการต่างๆ ได้ง่ายๆ เพียงไม่กี่คลิก",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
