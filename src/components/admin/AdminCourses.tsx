"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AdminCoursesProps {
  locale: string
}

interface Course {
  _id: string
  title: string
  description: string
  language: 'ru' | 'en'
  price: number
  originalPrice: number
  discount: number
  category: string
  imageUrl: string
  published: boolean
  featured: boolean
  isNewCourse: boolean
  newUntil: string
  publishedAt: string | null
  lessonsCount: number
  createdAt: string
  updatedAt: string
  isStillNew?: boolean
}

interface Lesson {
  id: string
  title: string
  description?: string
  videoUrl?: string
  duration?: number
  order: number
}

interface Category {
  id: string
  name: string
}

export default function AdminCourses({ locale }: AdminCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [languageFilter, setLanguageFilter] = useState(locale)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Управление категориями
  const [categories, setCategories] = useState<Category[]>([
    { id: 'programming', name: 'Программирование' },
    { id: 'design', name: 'Дизайн' },
    { id: 'marketing', name: 'Маркетинг' },
    { id: 'business', name: 'Бизнес' },
    { id: 'ai', name: 'Искусственный интеллект' },
    { id: 'data-science', name: 'Наука о данных' },
    { id: 'other', name: 'Другое' }
  ])
  const [newCategoryName, setNewCategoryName] = useState('')

  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: locale as 'ru' | 'en',
    originalPrice: '',
    price: '',
    category: '',
    imageUrl: '',
    isNewCourse: true,
    newUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lessons: [] as Lesson[]
  })

  useEffect(() => {
    fetchCourses()
  }, [currentPage, searchTerm, statusFilter, languageFilter])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        language: languageFilter
      })

      const response = await fetch(`/api/admin/courses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'image')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: data.fileUrl }))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  // Валидация формы
  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Заполните название курса')
      return false
    }
    
    if (!formData.description.trim()) {
      alert('Заполните описание курса')
      return false
    }
    
    if (!formData.originalPrice) {
      alert('Укажите первоначальную цену')
      return false
    }
    
    if (!formData.category) {
      alert('Выберите категорию')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setSubmitting(true)
      
      // Подготавливаем данные
      const submitData = {
        title: formData.title,
        description: formData.description,
        language: formData.language,
        originalPrice: parseFloat(formData.originalPrice),
        price: formData.price ? parseFloat(formData.price) : parseFloat(formData.originalPrice),
        category: formData.category,
        imageUrl: formData.imageUrl || '/images/course-placeholder.jpg',
        published: false, // Создаем как черновик
        featured: false,
        isNewCourse: formData.isNewCourse,
        newUntil: formData.newUntil,
        lessons: formData.lessons
      }
      
      const url = editingCourse 
        ? `/api/admin/courses/${editingCourse._id}`
        : '/api/admin/courses'
      
      const method = editingCourse ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        alert(editingCourse ? 'Курс успешно обновлен!' : 'Курс успешно создан!')
        setShowCreateModal(false)
        setShowEditModal(false)
        setEditingCourse(null)
        resetForm()
        fetchCourses()
      } else {
        const errorData = await response.json()
        alert('Ошибка: ' + errorData.error)
      }
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Ошибка сохранения: ' + error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (course: Course) => {
    try {
      const response = await fetch(`/api/admin/courses/${course._id}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          title: data.title,
          description: data.description,
          language: data.language,
          originalPrice: data.originalPrice.toString(),
          price: data.price !== data.originalPrice ? data.price.toString() : '',
          category: data.category,
          imageUrl: data.imageUrl,
          isNewCourse: data.isNewCourse,
          newUntil: new Date(data.newUntil).toISOString().split('T')[0],
          lessons: data.lessons || []
        })
        setEditingCourse(course)
        setShowEditModal(true)
      }
    } catch (error) {
      console.error('Error loading course:', error)
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Курс успешно удален!')
        fetchCourses()
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  // Переключение публикации
  const togglePublish = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/publish`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchCourses()
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  // Переключение метки "новый"
  const toggleNew = async (courseId: string, currentIsNew: boolean) => {
    try {
      const course = courses.find(c => c._id === courseId)
      if (!course) return

      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          language: course.language,
          originalPrice: course.originalPrice,
          price: course.price,
          category: course.category,
          imageUrl: course.imageUrl,
          published: course.published,
          featured: course.featured,
          isNewCourse: !currentIsNew,
          newUntil: !currentIsNew ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          lessons: []
        })
      })

      if (response.ok) {
        alert(currentIsNew ? 'Метка "новый" удалена' : 'Курс помечен как новый')
        fetchCourses()
      }
    } catch (error) {
      console.error('Error toggling new status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      language: locale as 'ru' | 'en',
      originalPrice: '',
      price: '',
      category: '',
      imageUrl: '',
      isNewCourse: true,
      newUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lessons: []
    })
  }

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      order: formData.lessons.length + 1
    }
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }))
  }

  const updateLesson = (lessonId: string, updates: Partial<Lesson>) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map(lesson =>
        lesson.id === lessonId ? { ...lesson, ...updates } : lesson
      )
    }))
  }

  const removeLesson = (lessonId: string) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter(lesson => lesson.id !== lessonId)
    }))
  }

  // Управление категориями
  const addCategory = () => {
    if (!newCategoryName.trim()) return
    
    const newCategory: Category = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      name: newCategoryName.trim()
    }
    
    setCategories(prev => [...prev, newCategory])
    setNewCategoryName('')
  }

  const deleteCategory = (categoryId: string) => {
    if (categoryId === 'other') return
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')} ₽`
  }

  const getLanguageLabel = (lang: 'ru' | 'en') => {
    return lang === 'ru' ? '🇷🇺 Русский' : '🇺🇸 English'
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Управление курсами</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="btn-secondary px-4 py-2"
            >
              Управление категориями
            </button>
            <button
              onClick={() => {
                resetForm()
                setShowCreateModal(true)
              }}
              className="btn-primary px-6 py-3"
            >
              Добавить курс
            </button>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="glassmorphism rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск курсов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="all">Все статусы</option>
                <option value="published">Опубликованные</option>
                <option value="draft">Черновики</option>
              </select>
            </div>
            <div>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="all">Все языки</option>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Таблица курсов */}
        <div className="glassmorphism rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-white/70">Загрузка...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/70 font-medium">Изображение</th>
                    <th className="text-left p-4 text-white/70 font-medium">Название</th>
                    <th className="text-left p-4 text-white/70 font-medium">Язык</th>
                    <th className="text-left p-4 text-white/70 font-medium">Категория</th>
                    <th className="text-left p-4 text-white/70 font-medium">Цена</th>
                    <th className="text-left p-4 text-white/70 font-medium">Уроки</th>
                    <th className="text-left p-4 text-white/70 font-medium">Статус</th>
                    <th className="text-left p-4 text-white/70 font-medium">Метки</th>
                    <th className="text-left p-4 text-white/70 font-medium">Обновлен</th>
                    <th className="text-left p-4 text-white/70 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <img
                          src={course.imageUrl || '/images/course-placeholder.jpg'}
                          alt={course.title}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">
                          {course.title}
                        </div>
                        <div className="text-white/60 text-sm mt-1">
                          {course.description.substring(0, 60)}...
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white/80 text-sm">
                          {getLanguageLabel(course.language)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-sm">
                          {course.category}
                        </span>
                      </td>
                      <td className="p-4 text-white">
                        {formatPrice(course.price)}
                        {course.discount > 0 && (
                          <div className="text-white/60 text-sm line-through">
                            {formatPrice(course.originalPrice)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-white">
                        {course.lessonsCount}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            course.published 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {course.published ? 'Опубликован' : 'Черновик'}
                          </span>
                          {course.publishedAt && (
                            <span className="text-white/50 text-xs">
                              {formatDate(course.publishedAt)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-1">
                          {course.isStillNew && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                              ✨ Новый
                            </span>
                          )}
                          {course.featured && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                              🔥 Хит
                            </span>
                          )}
                          {course.isNewCourse && (
                            <span className="text-white/50 text-xs">
                              до {formatDate(course.newUntil)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-white/60 text-sm">
                        {formatDate(course.updatedAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => togglePublish(course._id)}
                            className={`px-3 py-1 rounded text-xs ${
                              course.published
                                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            }`}
                          >
                            {course.published ? 'Снять' : 'Опубликовать'}
                          </button>
                          <button
                            onClick={() => toggleNew(course._id, course.isNewCourse)}
                            className={`px-3 py-1 rounded text-xs ${
                              course.isNewCourse
                                ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            }`}
                          >
                            {course.isNewCourse ? 'Убрать NEW' : 'Пометить NEW'}
                          </button>
                          <button
                            onClick={() => handleEdit(course)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-200 text-white/70 hover:bg-dark-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Модальное окно управления категориями */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-300 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Управление категориями</h2>
            
            <div className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Название категории"
                  className="flex-1 px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={addCategory}
                  className="btn-primary px-4 py-2"
                >
                  Добавить
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between bg-dark-200 p-3 rounded">
                  <span className="text-white">{category.name}</span>
                  {category.id !== 'other' && (
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="btn-secondary px-6 py-3"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания/редактирования курса */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-300 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingCourse ? 'Редактировать курс' : 'Создать курс'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 mb-2">Название курса *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Введите название курса"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">Язык курса *</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as 'ru' | 'en' }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="ru">🇷🇺 Русский</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </div>
              </div>

              {/* Описание */}
              <div>
                <label className="block text-white/70 mb-2">Описание курса *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="Введите описание курса"
                />
              </div>

              {/* Цена и категория */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white/70 mb-2">Первоначальная цена *</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="₽"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">Цена со скидкой</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="₽ (опционально)"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">Категория *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Управление метками */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isNewCourse}
                      onChange={(e) => setFormData(prev => ({ ...prev, isNewCourse: e.target.checked }))}
                      className="w-5 h-5 text-primary-500"
                    />
                    <span className="text-white/70">Пометить как новый курс</span>
                  </label>
                </div>
                
                {formData.isNewCourse && (
                  <div>
                    <label className="block text-white/70 mb-2">Новый до даты</label>
                    <input
                      type="date"
                      value={formData.newUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, newUntil: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                )}
              </div>

              {/* Изображение */}
              <div>
                <label className="block text-white/70 mb-2">Изображение курса</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="btn-secondary px-4 py-2 cursor-pointer"
                  >
                    {uploading ? 'Загрузка...' : 'Загрузить изображение'}
                  </label>
                  {formData.imageUrl && (
                    <div className="flex items-center space-x-2">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                      <span className="text-green-400 text-sm">✓ Загружено</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Управление уроками */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Управление уроками</h3>
                  <button
                    type="button"
                    onClick={addLesson}
                    className="btn-secondary px-4 py-2"
                  >
                    Добавить урок
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="bg-dark-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Урок {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeLesson(lesson.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Удалить
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 mb-1">Название урока</label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                            placeholder="Название урока"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white/70 mb-1">Длительность (мин)</label>
                          <input
                            type="number"
                            value={lesson.duration || ''}
                            onChange={(e) => updateLesson(lesson.id, { duration: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                            placeholder="40"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-white/70 mb-1">URL видео</label>
                          <input
                            type="url"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => updateLesson(lesson.id, { videoUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-white/70 mb-1">Описание урока</label>
                          <textarea
                            value={lesson.description || ''}
                            onChange={(e) => updateLesson(lesson.id, { description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                            placeholder="Описание урока"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setEditingCourse(null)
                    resetForm()
                  }}
                  className="btn-secondary px-6 py-3"
                >
                  Отменить
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Сохранение...' : (editingCourse ? 'Сохранить' : 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 