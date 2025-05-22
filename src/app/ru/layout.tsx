import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'EternixAI University - Образовательная платформа',
  description: 'Современная образовательная платформа с видео-уроками по различным темам',
}

export default function RuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header locale="ru" />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer locale="ru" />
    </>
  )
} 