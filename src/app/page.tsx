import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/ru')
  return null
}