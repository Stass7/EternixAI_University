"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AdminDashboardProps {
  locale: string
}

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  totalOrders: number
  totalRevenue: number
  recentUsers: Array<{
    id: string
    name: string
    email: string
    createdAt: string
    role: string
  }>
  recentOrders: Array<{
    id: string
    userName: string
    courseName: string
    amount: number
    status: string
    createdAt: string
  }>
}

export default function AdminDashboard({ locale }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const translations = {
    ru: {
      title: 'Панель управления',
      totalUsers: 'Всего пользователей',
      totalCourses: 'Всего курсов',
      totalOrders: 'Всего заказов',
      totalRevenue: 'Общий доход',
      recentUsers: 'Новые пользователи',
      recentOrders: 'Последние заказы',
      viewAll: 'Посмотреть все',
      name: 'Имя',
      email: 'Email',
      role: 'Роль',
      date: 'Дата',
      course: 'Курс',
      amount: 'Сумма',
      status: 'Статус',
      admin: 'Админ',
      user: 'Пользователь',
      completed: 'Завершен',
      pending: 'В ожидании',
      failed: 'Ошибка',
      refunded: 'Возврат',
      loadingError: 'Ошибка загрузки данных',
      noData: 'Нет данных для отображения'
    },
    en: {
      title: 'Dashboard',
      totalUsers: 'Total Users',
      totalCourses: 'Total Courses',
      totalOrders: 'Total Orders',
      totalRevenue: 'Total Revenue',
      recentUsers: 'Recent Users',
      recentOrders: 'Recent Orders',
      viewAll: 'View All',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      date: 'Date',
      course: 'Course',
      amount: 'Amount',
      status: 'Status',
      admin: 'Admin',
      user: 'User',
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
      refunded: 'Refunded',
      loadingError: 'Error loading data',
      noData: 'No data to display'
    }
  }

  const t = translations[locale as keyof typeof translations]

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/admin/dashboard')
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Необходима авторизация')
          } else if (response.status === 403) {
            throw new Error('Недостаточно прав доступа')
          } else {
            throw new Error('Ошибка сервера')
          }
        }
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        setError(error instanceof Error ? error.message : t.loadingError)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [t.loadingError])

  const formatPrice = (price: number) => {
    if (locale === 'ru') {
      return `${price.toLocaleString('ru-RU')} ₽`
    }
    return `$${(price * 0.011).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (locale === 'ru') {
      return date.toLocaleDateString('ru-RU')
    }
    return date.toLocaleDateString('en-US')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'failed':
        return 'text-red-400'
      case 'refunded':
        return 'text-orange-400'
      default:
        return 'text-white/70'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-8">{t.title}</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glassmorphism rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{t.totalUsers}</p>
                <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glassmorphism rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{t.totalCourses}</p>
                <p className="text-2xl font-bold text-white">{stats?.totalCourses || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glassmorphism rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{t.totalOrders}</p>
                <p className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glassmorphism rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{t.totalRevenue}</p>
                <p className="text-2xl font-bold text-white">{formatPrice(stats?.totalRevenue || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glassmorphism rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{t.recentUsers}</h2>
              <button className="text-primary-400 hover:text-primary-300 text-sm">
                {t.viewAll}
              </button>
            </div>
            <div className="space-y-3">
              {stats?.recentUsers?.length ? stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-white/60 text-sm">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {user.role === 'admin' ? t.admin : t.user}
                    </span>
                    <p className="text-white/60 text-xs mt-1">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-white/60">
                  {t.noData}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glassmorphism rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{t.recentOrders}</h2>
              <button className="text-primary-400 hover:text-primary-300 text-sm">
                {t.viewAll}
              </button>
            </div>
            <div className="space-y-3">
              {stats?.recentOrders?.length ? stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{order.userName}</p>
                    <p className="text-white/60 text-sm">{order.courseName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatPrice(order.amount)}</p>
                    <div className="flex items-center justify-end space-x-2">
                      <span className={`text-xs ${getStatusColor(order.status)}`}>
                        {t[order.status as keyof typeof t] || order.status}
                      </span>
                      <span className="text-white/60 text-xs">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-white/60">
                  {t.noData}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 