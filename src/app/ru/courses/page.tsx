import { Metadata } from 'next'
import CoursesPageClient from './CoursesPageClient'

export const metadata: Metadata = {
  title: 'Курсы – EternixAI University',
  description: 'Список всех доступных курсов EternixAI University',
}

export default function CoursesPage() {
  return <CoursesPageClient />
} 