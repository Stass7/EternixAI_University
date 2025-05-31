"use client"

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface UserStats {
  coursesPurchased: number
  coursesInFavorites: number
  totalLessons: number
  completedLessons: number
  overallProgress: number
  totalWatchTimeHours: number
  courses: Array<{
    _id: string
    title: { [key: string]: string }
    totalLessons: number
    completedLessons: number
    progress: number
    lastStudied: string | null
  }>
}

export default function ProfilePageClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/ru/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchUserStats()
    }
  }, [session])

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

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
    await signOut({ callbackUrl: '/ru' })
  }

  const formatLastStudied = (dateString: string | null) => {
    if (!dateString) return 'Не изучался'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дней назад`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`
    return date.toLocaleDateString('ru-RU')
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
                  <h1 className="text-3xl font-bold text-white">{session.user.name || 'Пользователь'}</h1>
                  <p className="text-white/70 text-lg">{session.user.email}</p>
                  <div className="flex items-center mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-300">
                      {session.user.role === 'admin' ? 'Администратор' : 'Студент'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="btn-secondary px-6 py-2"
              >
                Выйти
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card text-center"
            >
              <div className="text-3xl font-bold text-primary-500 mb-2">
                {statsLoading ? '...' : userStats?.coursesPurchased || 0}
              </div>
              <div className="text-white/70">Курсов куплено</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card text-center"
            >
              <div className="text-3xl font-bold text-primary-500 mb-2">
                {statsLoading ? '...' : userStats?.completedLessons || 0}
              </div>
              <div className="text-white/70">Уроков пройдено</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card text-center"
            >
              <div className="text-3xl font-bold text-primary-500 mb-2">
                {statsLoading ? '...' : `${userStats?.overallProgress || 0}%`}
              </div>
              <div className="text-white/70">Прогресс</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card text-center"
            >
              <div className="text-3xl font-bold text-primary-500 mb-2">
                {statsLoading ? '...' : `${userStats?.totalWatchTimeHours || 0}ч`}
              </div>
              <div className="text-white/70">Времени изучения</div>
            </motion.div>
          </div>

          {/* My Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glassmorphism rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Мои курсы</h2>
            
            {statsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-white/70 mt-4">Загрузка курсов...</p>
              </div>
            ) : userStats?.courses && userStats.courses.length > 0 ? (
              <div className="space-y-4">
                {userStats.courses.map((course) => (
                  <div key={course._id} className="bg-dark-300 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {course.title.ru || course.title.en || 'Unnamed Course'}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {course.completedLessons} из {course.totalLessons} уроков завершено
                        </p>
                        <p className="text-white/60 text-sm">
                          Последнее изучение: {formatLastStudied(course.lastStudied)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-500 mb-1">
                          {course.progress}%
                        </div>
                        <div className="w-24 h-2 bg-dark-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => router.push(`/ru/courses/${course._id}`)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        Продолжить обучение
                      </button>
                      <button
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        Подробнее
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-white mb-2">Пока нет курсов</h3>
                <p className="text-white/70 mb-6">
                  Вы еще не приобрели ни одного курса. Начните свое обучение прямо сейчас!
                </p>
                <button
                  onClick={() => router.push('/ru/courses')}
                  className="btn-primary px-8 py-3"
                >
                  Просмотреть курсы
                </button>
              </div>
            )}
          </motion.div>

          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glassmorphism rounded-xl p-8 mt-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Настройки аккаунта</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-dark-300">
                <div>
                  <h3 className="text-white font-medium">Email уведомления</h3>
                  <p className="text-white/60 text-sm">Получать уведомления о новых курсах</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-dark-300">
                <div>
                  <h3 className="text-white font-medium">Двухфакторная аутентификация</h3>
                  <p className="text-white/60 text-sm">Дополнительная защита аккаунта</p>
                </div>
                <button className="btn-secondary text-sm px-4 py-2">
                  Настроить
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 