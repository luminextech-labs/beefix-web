import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import NotificationToastWrapper from "@/components/NotificationToastWrapper"

export const metadata: Metadata = {
  title: "Beefix - จองช่างออนไลน์",
  description: "แพลตฟอร์มจองช่างซ่อม ติดตั้ง บริการต่างๆ ได้ง่ายๆ เพียงไม่กี่คลิก",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <NotificationToastWrapper />
      </body>
    </html>
  )
}
