"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminUsers from '@/components/admin/AdminUsers'
import AdminCourses from '@/components/admin/AdminCourses'
import AdminOrders from '@/components/admin/AdminOrders'
import AdminSettings from '@/components/admin/AdminSettings'

type AdminSection = 'dashboard' | 'users' | 'courses' | 'orders' | 'settings'

export default function AdminPageClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/en/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/en')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'admin') {
    return null
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard locale="en" />
      case 'users':
        return <AdminUsers locale="en" />
      case 'courses':
        return <AdminCourses locale="en" />
      case 'orders':
        return <AdminOrders locale="en" />
      case 'settings':
        return <AdminSettings locale="en" />
      default:
        return <AdminDashboard locale="en" />
    }
  }

  return (
    <div className="min-h-screen bg-dark-400">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        locale="en"
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-dark-300 border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-dark-200 hover:bg-dark-100 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/70">
                {session.user.name || session.user.email}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {renderActiveSection()}
        </motion.div>
      </div>
    </div>
  )
} 