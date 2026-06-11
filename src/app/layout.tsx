import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Sage's Medical Glossary",
  description: 'Your comprehensive bilingual medical reference guide',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
