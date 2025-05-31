import { Metadata } from 'next'
import AdminPageClient from './AdminPageClient'

export const metadata: Metadata = {
  title: 'Админ-панель – EternixAI University',
  description: 'Панель управления платформой EternixAI University',
}

export default function AdminPage() {
  return <AdminPageClient />
} 