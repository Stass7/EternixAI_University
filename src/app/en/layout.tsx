import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'EternixAI University - Educational Platform',
  description: 'Modern educational platform with video lessons on various topics',
}

export default function EnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header locale="en" />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer locale="en" />
    </>
  )
} 