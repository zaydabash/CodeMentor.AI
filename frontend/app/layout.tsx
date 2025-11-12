import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CodeMentor.AI - Autonomous Debug Assistant',
  description: 'Upload a repo or paste a Git URL to get automated bug detection and PR drafts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

