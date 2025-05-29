"use client"

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function ProfilePageClient() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/en/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/en' })
  }

  return (
    <div className="min-h-screen bg-dark-400 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="glassmorphism rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{session.user.name || 'User'}</h1>
                  <p className="text-white/70 text-lg">{session.user.email}</p>
                  <div className="flex items-center mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-300">
                      {session.user.role === 'admin' ? 'Administrator' : 'Student'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="btn-secondary px-6 py-2"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card text-center"
            >
              <div className="text-3xl font-bold text-primary-500 mb-2">0</div>
              <div className="text-white/70">Courses Purchased</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card text-center"
            >
              <div className="text-3xl font-bold text-primary-500 mb-2">0</div>
              <div className="text-white/70">Lessons Completed</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card text-center"
            >
              <div className="text-3xl font-bold text-primary-500 mb-2">0%</div>
              <div className="text-white/70">Progress</div>
            </motion.div>
          </div>

          {/* My Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glassmorphism rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
            
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
              <p className="text-white/70 mb-6">
                You haven't purchased any courses yet. Start your learning journey now!
              </p>
              <button
                onClick={() => router.push('/en/courses')}
                className="btn-primary px-8 py-3"
              >
                Browse Courses
              </button>
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glassmorphism rounded-xl p-8 mt-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-dark-300">
                <div>
                  <h3 className="text-white font-medium">Email Notifications</h3>
                  <p className="text-white/60 text-sm">Receive notifications about new courses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-dark-300">
                <div>
                  <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                  <p className="text-white/60 text-sm">Additional account security</p>
                </div>
                <button className="btn-secondary text-sm px-4 py-2">
                  Setup
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 