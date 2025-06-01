"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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

interface Category {
  id: string
  name: string
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
      createCourse: 'Создать курс',
      editCourse: 'Редактировать курс',
      courseTitle: 'Название курса',
      titleRu: 'Название (русский)',
      titleEn: 'Название (английский)',
      descriptionRu: 'Описание (русский)',
      descriptionEn: 'Описание (английский)',
      currentPrice: 'Цена',
      originalPrice: 'Первоначальная цена',
      category: 'Категория',
      selectCategory: 'Выберите категорию',
      manageCategories: 'Управление категориями',
      addCategory: 'Добавить категорию',
      deleteCategory: 'Удалить категорию',
      image: 'Изображение курса',
      uploadImage: 'Загрузить изображение',
      lessons_management: 'Управление уроками',
      addLesson: 'Добавить урок',
      save: 'Сохранить',
      cancel: 'Отменить',
      create: 'Создать',
      loading: 'Загрузка...',
      uploading: 'Загрузка файла...',
      submitting: 'Сохранение...',
      success: 'Успешно',
      error: 'Ошибка',
      confirmDelete: 'Вы уверены, что хотите удалить этот курс?',
      lessonTitle: 'Название урока',
      lessonDescription: 'Описание урока',
      videoUrl: 'URL видео',
      duration: 'Длительность (мин)',
      order: 'Порядок',
      fillLanguage: 'Заполните хотя бы один язык',
      priceRequired: 'Укажите первоначальную цену',
      categoryRequired: 'Выберите категорию',
      courseCreated: 'Курс успешно создан!',
      courseUpdated: 'Курс успешно обновлен!',
      courseDeleted: 'Курс успешно удален!'
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
      createCourse: 'Create Course',
      editCourse: 'Edit Course',
      courseTitle: 'Course Title',
      titleRu: 'Title (Russian)',
      titleEn: 'Title (English)',
      descriptionRu: 'Description (Russian)',
      descriptionEn: 'Description (English)',
      currentPrice: 'Current Price',
      originalPrice: 'Original Price',
      category: 'Category',
      selectCategory: 'Select Category',
      manageCategories: 'Manage Categories',
      addCategory: 'Add Category',
      deleteCategory: 'Delete Category',
      image: 'Course Image',
      uploadImage: 'Upload Image',
      lessons_management: 'Lesson Management',
      addLesson: 'Add Lesson',
      save: 'Save',
      cancel: 'Cancel',
      create: 'Create',
      loading: 'Loading...',
      uploading: 'Uploading...',
      submitting: 'Saving...',
      success: 'Success',
      error: 'Error',
      confirmDelete: 'Are you sure you want to delete this course?',
      lessonTitle: 'Lesson Title',
      lessonDescription: 'Lesson Description',
      videoUrl: 'Video URL',
      duration: 'Duration (min)',
      order: 'Order',
      fillLanguage: 'Fill in at least one language',
      priceRequired: 'Please specify original price',
      categoryRequired: 'Please select a category',
      courseCreated: 'Course created successfully!',
      courseUpdated: 'Course updated successfully!',
      courseDeleted: 'Course deleted successfully!'
    }
  }

  const t = translations[locale as keyof typeof translations]

  // Состояние формы
  const [formData, setFormData] = useState({
    title: { ru: '', en: '' },
    description: { ru: '', en: '' },
    originalPrice: '', // Основная цена (обязательная)
    price: '', // Цена со скидкой (опциональная)
    category: '',
    imageUrl: '',
    lessons: [] as Lesson[]
  })

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
    // Проверяем что заполнен хотя бы один язык для названия и описания
    const hasTitle = formData.title.ru.trim() || formData.title.en.trim()
    const hasDescription = formData.description.ru.trim() || formData.description.en.trim()
    
    if (!hasTitle) {
      alert(t.fillLanguage + ' для названия')
      return false
    }
    
    if (!hasDescription) {
      alert(t.fillLanguage + ' для описания')
      return false
    }
    
    if (!formData.originalPrice) {
      alert(t.priceRequired)
      return false
    }
    
    if (!formData.category) {
      alert(t.categoryRequired)
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
        originalPrice: parseFloat(formData.originalPrice),
        price: formData.price ? parseFloat(formData.price) : parseFloat(formData.originalPrice),
        category: formData.category,
        imageUrl: formData.imageUrl || '/images/course-placeholder.jpg',
        published: true, // Автоматически публикуем
        featured: false,
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
        alert(editingCourse ? t.courseUpdated : t.courseCreated)
        setShowCreateModal(false)
        setShowEditModal(false)
        setEditingCourse(null)
        resetForm()
        fetchCourses()
      } else {
        const errorData = await response.json()
        alert(t.error + ': ' + errorData.error)
      }
    } catch (error) {
      console.error('Error saving course:', error)
      alert(t.error + ': ' + error)
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
          originalPrice: data.originalPrice.toString(),
          price: data.price !== data.originalPrice ? data.price.toString() : '',
          category: data.category,
          imageUrl: data.imageUrl,
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
        alert(t.courseDeleted)
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
      originalPrice: '',
      price: '',
      category: '',
      imageUrl: '',
      lessons: []
    })
  }

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
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
    if (categoryId === 'other') return // Не позволяем удалить "Другое"
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
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
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="btn-secondary px-4 py-2"
            >
              {t.manageCategories}
            </button>
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
                        <span className={`px-2 py-1 rounded text-xs ${
                          course.published 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {course.published ? t.published : t.draft}
                        </span>
                      </td>
                      <td className="p-4 text-white/60 text-sm">
                        {formatDate(course.updatedAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(course)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
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
            <h2 className="text-2xl font-bold text-white mb-6">{t.manageCategories}</h2>
            
            {/* Добавление категории */}
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
                  {t.addCategory}
                </button>
              </div>
            </div>
            
            {/* Список категорий */}
            <div className="space-y-2 mb-6">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between bg-dark-200 p-3 rounded">
                  <span className="text-white">{category.name}</span>
                  {category.id !== 'other' && (
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      {t.deleteCategory}
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
                {t.cancel}
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
              {editingCourse ? t.editCourse : t.createCourse}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 mb-2">{t.titleRu} *</label>
                  <input
                    type="text"
                    value={formData.title.ru}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, ru: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Обязательно только если есть русское видео"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">{t.titleEn} *</label>
                  <input
                    type="text"
                    value={formData.title.en}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, en: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Обязательно только если есть английское видео"
                  />
                </div>
              </div>

              {/* Описания */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 mb-2">{t.descriptionRu} *</label>
                  <textarea
                    value={formData.description.ru}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, ru: e.target.value }
                    }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Обязательно только если есть русское видео"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">{t.descriptionEn} *</label>
                  <textarea
                    value={formData.description.en}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, en: e.target.value }
                    }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Обязательно только если есть английское видео"
                  />
                </div>
              </div>

              {/* Цена и категория */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white/70 mb-2">{t.originalPrice} *</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Обязательное поле"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">{t.currentPrice}</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Цена со скидкой (опционально)"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">{t.category} *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="">{t.selectCategory}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Изображение */}
              <div>
                <label className="block text-white/70 mb-2">{t.image}</label>
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
                    {uploading ? t.uploading : t.uploadImage}
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
                  <h3 className="text-xl font-semibold text-white">{t.lessons_management}</h3>
                  <button
                    type="button"
                    onClick={addLesson}
                    className="btn-secondary px-4 py-2"
                  >
                    {t.addLesson}
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
                          <label className="block text-white/70 mb-1">{t.lessonTitle} (RU)</label>
                          <input
                            type="text"
                            value={lesson.title.ru}
                            onChange={(e) => updateLesson(lesson.id, {
                              title: { ...lesson.title, ru: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
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
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white/70 mb-1">{t.videoUrl}</label>
                          <input
                            type="url"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => updateLesson(lesson.id, { videoUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white/70 mb-1">{t.duration}</label>
                          <input
                            type="number"
                            value={lesson.duration || ''}
                            onChange={(e) => updateLesson(lesson.id, { duration: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-dark-300 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500"
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
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? t.submitting : (editingCourse ? t.save : t.create)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 