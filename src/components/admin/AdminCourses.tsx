"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getThumbnailFromUrl, isYouTubeUrl, extractYouTubeVideoId } from '@/utils/youtube'

interface AdminCoursesProps {
  locale: string
}

interface Course {
  _id: string
  title: { ru: string; en: string }
  description: { ru: string; en: string }
  price: number
  originalPrice: number
  discount: number
  category: string
  imageUrl: string
  published: boolean
  featured: boolean
  lessonsCount: number
  createdAt: string
  updatedAt: string
}

interface Lesson {
  id: string
  title: { ru: string; en: string }
  description?: { ru: string; en: string }
  videoUrl?: string
  duration?: number
  order: number
}

export default function AdminCourses({ locale }: AdminCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [uploading, setUploading] = useState(false)

  const translations = {
    ru: {
      title: 'Управление курсами',
      search: 'Поиск курсов...',
      filter: 'Фильтр',
      all: 'Все',
      published: 'Опубликованные',
      draft: 'Черновики',
      addCourse: 'Добавить курс',
      edit: 'Редактировать',
      delete: 'Удалить',
      lessons: 'уроков',
      status: 'Статус',
      price: 'Цена',
      created: 'Создан',
      updated: 'Обновлен',
      // Форма создания/редактирования
      courseTitle: 'Название курса',
      titleRu: 'Название (русский)',
      titleEn: 'Название (английский)',
      descriptionRu: 'Описание (русский)',
      descriptionEn: 'Описание (английский)',
      coursePrice: 'Цена',
      originalPrice: 'Первоначальная цена',
      category: 'Категория',
      selectCategory: 'Выберите категорию',
      image: 'Изображение курса',
      uploadImage: 'Загрузить изображение',
      published_label: 'Опубликован',
      featured: 'Рекомендуемый',
      lessons_management: 'Управление уроками',
      addLesson: 'Добавить урок',
      save: 'Сохранить',
      cancel: 'Отменить',
      create: 'Создать',
      loading: 'Загрузка...',
      uploading: 'Загрузка файла...',
      success: 'Успешно',
      error: 'Ошибка',
      confirmDelete: 'Вы уверены, что хотите удалить этот курс?',
      lessonTitle: 'Название урока',
      lessonDescription: 'Описание урока',
      videoUrl: 'URL видео',
      duration: 'Длительность (мин)',
      order: 'Порядок'
    },
    en: {
      title: 'Course Management',
      search: 'Search courses...',
      filter: 'Filter',
      all: 'All',
      published: 'Published',
      draft: 'Draft',
      addCourse: 'Add Course',
      edit: 'Edit',
      delete: 'Delete',
      lessons: 'lessons',
      status: 'Status',
      price: 'Price',
      created: 'Created',
      updated: 'Updated',
      // Форма создания/редактирования
      courseTitle: 'Course Title',
      titleRu: 'Title (Russian)',
      titleEn: 'Title (English)',
      descriptionRu: 'Description (Russian)',
      descriptionEn: 'Description (English)',
      coursePrice: 'Price',
      originalPrice: 'Original Price',
      category: 'Category',
      selectCategory: 'Select Category',
      image: 'Course Image',
      uploadImage: 'Upload Image',
      published_label: 'Published',
      featured: 'Featured',
      lessons_management: 'Lesson Management',
      addLesson: 'Add Lesson',
      save: 'Save',
      cancel: 'Cancel',
      create: 'Create',
      loading: 'Loading...',
      uploading: 'Uploading...',
      success: 'Success',
      error: 'Error',
      confirmDelete: 'Are you sure you want to delete this course?',
      lessonTitle: 'Lesson Title',
      lessonDescription: 'Lesson Description',
      videoUrl: 'Video URL',
      duration: 'Duration (min)',
      order: 'Order'
    }
  }

  const t = translations[locale as keyof typeof translations]

  // Состояние формы
  const [formData, setFormData] = useState({
    title: { ru: '', en: '' },
    description: { ru: '', en: '' },
    price: '',
    originalPrice: '',
    category: '',
    imageUrl: '',
    published: false,
    featured: false,
    lessons: [] as Lesson[]
  })

  const categories = [
    'programming',
    'design',
    'marketing',
    'business',
    'ai',
    'data-science',
    'other'
  ]

  useEffect(() => {
    fetchCourses()
  }, [currentPage, searchTerm, statusFilter])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'image')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCourse 
        ? `/api/admin/courses/${editingCourse._id}`
        : '/api/admin/courses'
      
      const method = editingCourse ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        setShowEditModal(false)
        setEditingCourse(null)
        resetForm()
        fetchCourses()
      }
    } catch (error) {
      console.error('Error saving course:', error)
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
          price: data.price.toString(),
          originalPrice: data.originalPrice.toString(),
          category: data.category,
          imageUrl: data.imageUrl,
          published: data.published,
          featured: data.featured,
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
    if (!confirm(t.confirmDelete)) return

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: { ru: '', en: '' },
      description: { ru: '', en: '' },
      price: '',
      originalPrice: '',
      category: '',
      imageUrl: '',
      published: false,
      featured: false,
      lessons: []
    })
  }

  // Функция для получения thumbnail из YouTube URL
  const getVideoThumbnail = (videoUrl: string): string | null => {
    if (!videoUrl || !isYouTubeUrl(videoUrl)) return null
    return getThumbnailFromUrl(videoUrl, 'hq')
  }

  // Функция для автоматического обновления изображения курса из первого урока
  const updateCourseImageFromFirstLesson = () => {
    if (formData.lessons.length > 0 && !formData.imageUrl) {
      const firstLesson = formData.lessons.sort((a, b) => a.order - b.order)[0]
      if (firstLesson.videoUrl) {
        const thumbnail = getVideoThumbnail(firstLesson.videoUrl)
        if (thumbnail) {
          setFormData(prev => ({
            ...prev,
            imageUrl: thumbnail
          }))
        }
      }
    }
  }

  // Обновленная функция добавления урока
  const addLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: { ru: '', en: '' },
      description: { ru: '', en: '' },
      videoUrl: '',
      duration: 0,
      order: formData.lessons.length + 1
    }
    
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }))
  }

  // Обновленная функция изменения урока с автоматическим thumbnail
  const updateLesson = (lessonId: string, updates: Partial<Lesson>) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, ...updates } : lesson
      )
    }))

    // Если обновляется videoUrl, автоматически обновляем изображение курса
    if (updates.videoUrl) {
      setTimeout(() => {
        updateCourseImageFromFirstLesson()
      }, 100)
    }
  }

  const removeLesson = (lessonId: string) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter(lesson => lesson.id !== lessonId)
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US')
  }

  const formatPrice = (price: number) => {
    if (locale === 'ru') {
      return `${price.toLocaleString('ru-RU')} ₽`
    }
    return `$${(price * 0.011).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">{t.title}</h1>
          <button
            onClick={() => {
              resetForm()
              setShowCreateModal(true)
            }}
            className="btn-primary px-6 py-3"
          >
            {t.addCourse}
          </button>
        </div>

        {/* Поиск и фильтры */}
        <div className="glassmorphism rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t.search}
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
                <option value="all">{t.all}</option>
                <option value="published">{t.published}</option>
                <option value="draft">{t.draft}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Таблица курсов */}
        <div className="glassmorphism rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-white/70">{t.loading}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/70 font-medium">Изображение</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.courseTitle}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.category}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.price}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.lessons}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.status}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.updated}</th>
                    <th className="text-left p-4 text-white/70 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <img
                          src={course.imageUrl || '/images/course-placeholder.jpg'}
                          alt={course.title[locale as 'ru' | 'en']}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">
                          {course.title[locale as 'ru' | 'en']}
                        </div>
                        <div className="text-white/60 text-sm mt-1">
                          {course.description[locale as 'ru' | 'en'].substring(0, 60)}...
                        </div>
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
                        <span className={`px-2 py-1 rounded text-sm ${
                          course.published 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {course.published ? t.published : t.draft}
                        </span>
                      </td>
                      <td className="p-4 text-white/70 text-sm">
                        {formatDate(course.updatedAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(course)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30"
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-sm hover:bg-red-500/30"
                          >
                            {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Пагинация */}
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

      {/* Модальное окно создания/редактирования курса */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-100 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {showCreateModal ? t.create : t.edit} {t.courseTitle.toLowerCase()}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Базовая информация о курсе */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Название на русском */}
                <div>
                  <label className="block text-white/70 mb-2">{t.titleRu}</label>
                  <input
                    type="text"
                    value={formData.title.ru}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, ru: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                {/* Название на английском */}
                <div>
                  <label className="block text-white/70 mb-2">{t.titleEn}</label>
                  <input
                    type="text"
                    value={formData.title.en}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, en: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Описания */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 mb-2">{t.descriptionRu}</label>
                  <textarea
                    value={formData.description.ru}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, ru: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500 h-24"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2">{t.descriptionEn}</label>
                  <textarea
                    value={formData.description.en}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, en: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500 h-24"
                    required
                  />
                </div>
              </div>

              {/* Цены и категория */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 mb-2">{t.originalPrice}</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2">{t.coursePrice}</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2">{t.category}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="">{t.selectCategory}</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* НОВАЯ СЕКЦИЯ ИЗОБРАЖЕНИЙ */}
              <div>
                <label className="block text-white/70 mb-2">{t.image}</label>
                
                {/* Превью изображения */}
                {formData.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={formData.imageUrl} 
                      alt="Course preview" 
                      className="w-full max-w-md h-40 object-cover rounded-lg border border-white/10"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-400 text-sm">✓ Изображение загружено</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="text-red-400 text-sm underline"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Автоматическое получение из первого урока */}
                  {formData.lessons.length > 0 && (
                    <div className="p-3 bg-dark-200 rounded-lg">
                      <p className="text-white/70 text-sm mb-2">
                        💡 Автоматически использовать thumbnail первого урока:
                      </p>
                      <button
                        type="button"
                        onClick={updateCourseImageFromFirstLesson}
                        className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                      >
                        Получить из YouTube
                      </button>
                    </div>
                  )}

                  {/* Ручная загрузка */}
                  <div>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                      id="course-image-upload"
                    />
                    <label
                      htmlFor="course-image-upload"
                      className="inline-block px-4 py-2 bg-dark-300 border border-white/10 rounded text-white cursor-pointer hover:bg-dark-200"
                    >
                      {uploading ? t.uploading : t.uploadImage}
                    </label>
                  </div>

                  {/* Ручной ввод URL */}
                  <div>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Или введите URL изображения"
                      className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Настройки публикации */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-white/20 rounded focus:ring-primary-500"
                  />
                  <span className="text-white">{t.published_label}</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-white/20 rounded focus:ring-primary-500"
                  />
                  <span className="text-white">{t.featured}</span>
                </label>
              </div>

              {/* УЛУЧШЕННОЕ УПРАВЛЕНИЕ УРОКАМИ */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{t.lessons_management}</h3>
                  <button
                    type="button"
                    onClick={addLesson}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    {t.addLesson}
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.lessons.map((lesson, index) => {
                    const thumbnail = lesson.videoUrl ? getVideoThumbnail(lesson.videoUrl) : null
                    
                    return (
                      <div key={lesson.id} className="bg-dark-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">Урок {lesson.order}</h4>
                          <button
                            type="button"
                            onClick={() => removeLesson(lesson.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Удалить
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-white/70 mb-1">{t.lessonTitle} (RU)</label>
                            <input
                              type="text"
                              value={lesson.title.ru}
                              onChange={(e) => updateLesson(lesson.id, { 
                                title: { ...lesson.title, ru: e.target.value } 
                              })}
                              className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-white/70 mb-1">{t.lessonTitle} (EN)</label>
                            <input
                              type="text"
                              value={lesson.title.en}
                              onChange={(e) => updateLesson(lesson.id, { 
                                title: { ...lesson.title, en: e.target.value } 
                              })}
                              className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                              required
                            />
                          </div>
                        </div>

                        {/* YouTube URL с превью */}
                        <div className="mb-4">
                          <label className="block text-white/70 mb-1">{t.videoUrl}</label>
                          <input
                            type="url"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => updateLesson(lesson.id, { videoUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                          
                          {/* Превью thumbnail */}
                          {thumbnail && (
                            <div className="mt-2 flex items-center gap-3">
                              <img 
                                src={thumbnail} 
                                alt="Video thumbnail" 
                                className="w-20 h-12 object-cover rounded"
                              />
                              <span className="text-green-400 text-sm">✓ YouTube thumbnail найден</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-white/70 mb-1">{t.duration}</label>
                            <input
                              type="number"
                              value={lesson.duration || ''}
                              onChange={(e) => updateLesson(lesson.id, { duration: Number(e.target.value) })}
                              className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                              placeholder="Минуты"
                            />
                          </div>

                          <div>
                            <label className="block text-white/70 mb-1">{t.order}</label>
                            <input
                              type="number"
                              value={lesson.order}
                              onChange={(e) => updateLesson(lesson.id, { order: Number(e.target.value) })}
                              className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {formData.lessons.length === 0 && (
                  <p className="text-white/50 text-center py-8">
                    Нет уроков. Нажмите "{t.addLesson}" чтобы создать первый урок.
                  </p>
                )}
              </div>

              {/* Кнопки */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  {showCreateModal ? t.create : t.save}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 