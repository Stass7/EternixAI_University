import { Metadata } from 'next'
import CoursesPageClient from './CoursesPageClient'

export const metadata: Metadata = {
  title: 'Courses – EternixAI University',
  description: 'List of all available courses at EternixAI University',
}

export default function CoursesPage() {
  return <CoursesPageClient />
} 