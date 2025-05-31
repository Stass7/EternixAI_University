import { Metadata } from 'next'
import AdminPageClient from './AdminPageClient'

export const metadata: Metadata = {
  title: 'Admin Panel – EternixAI University',
  description: 'Management panel for EternixAI University platform',
}

export default function AdminPage() {
  return <AdminPageClient />
} 