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

interface LessonFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  uploadedAt: Date
}

interface Lesson {
  id: string
  title: string
  description?: string
  videoUrl?: string // Legacy YouTube URL
  bunnyVideoId?: string // Bunny Stream Video ID
  duration?: number
  order: number
  files?: LessonFile[] // Файлы урока
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
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: boolean}>({})
  const [deletingFiles, setDeletingFiles] = useState<{[key: string]: boolean}>({})

  // Translations object for localization
  const translations = {
    ru: {
      title: 'Управление курсами',
      addCourse: 'Добавить курс',
      manageCategories: 'Управление категориями',
      searchPlaceholder: 'Поиск курсов...',
      allStatuses: 'Все статусы',
      published: 'Опубликованные',
      drafts: 'Черновики',
      allLanguages: 'Все языки',
      russian: 'Русский',
      english: 'English',
      loading: 'Загрузка...',
      image: 'Изображение',
      titleColumn: 'Название',
      language: 'Язык',
      category: 'Категория',
      price: 'Цена',
      lessons: 'Уроки',
      status: 'Статус',
      labels: 'Метки',
      updated: 'Обновлен',
      actions: 'Действия',
      unpublish: 'Снять',
      publish: 'Опубликовать',
      removeNew: 'Убрать NEW',
      markNew: 'Пометить NEW',
      edit: 'Редактировать',
      delete: 'Удалить',
      draft: 'Черновик',
      new: 'Новый',
      hot: 'Хит',
      confirmDelete: 'Вы уверены, что хотите удалить этот курс?',
      createCourse: 'Создать курс',
      editCourse: 'Редактировать курс',
      courseTitle: 'Название курса',
      courseTitlePlaceholder: 'Введите название курса',
      courseDescription: 'Описание курса',
      courseDescriptionPlaceholder: 'Введите описание курса',
      courseLanguage: 'Язык курса',
      selectCategory: 'Выберите категорию',
      originalPrice: 'Первоначальная цена',
      currentPrice: 'Текущая цена (оставьте пустым если без скидки)',
      courseImage: 'Изображение курса',
      uploadImage: 'Загрузить изображение',
      uploading: 'Загрузка...',
      markAsNew: 'Пометить как новый курс',
      newUntil: 'Новый до',
      lessonManagement: 'Управление уроками',
      addLesson: 'Добавить урок',
      lessonTitle: 'Название урока',
      lessonDescription: 'Описание урока',
      lessonVideoUrl: 'Ссылка на видео (YouTube - legacy)',
      bunnyVideoId: 'Bunny Stream Video ID',
      lessonDuration: 'Длительность (в минутах)',
      lessonFiles: 'Файлы урока',
      uploadFile: 'Загрузить файл',
      uploadingFile: 'Загрузка файла...',
      deleteFile: 'Удалить файл',
      downloadFile: 'Скачать',
      noFiles: 'Файлы не загружены',
      fileUploaded: 'Файл успешно загружен!',
      fileDeleted: 'Файл удален!',
      fileError: 'Ошибка при работе с файлом: ',
      removeLesson: 'Удалить',
      cancel: 'Отмена',
      save: 'Сохранить',
      saving: 'Сохранение...',
      addCategory: 'Добавить',
      categoryName: 'Название категории',
      fillCourseTitle: 'Заполните название курса',
      fillCourseDescription: 'Заполните описание курса',
      fillOriginalPrice: 'Укажите первоначальную цену',
      selectCategoryError: 'Выберите категорию',
      courseUpdated: 'Курс успешно обновлен!',
      courseCreated: 'Курс успешно создан!',
      errorPrefix: 'Ошибка: ',
      saveError: 'Ошибка сохранения: ',
      programming: 'Программирование',
      design: 'Дизайн',
      marketing: 'Маркетинг',
      business: 'Бизнес',
      ai: 'Искусственный интеллект',
      dataScience: 'Наука о данных',
      other: 'Другое'
    },
    en: {
      title: 'Course Management',
      addCourse: 'Add Course',
      manageCategories: 'Manage Categories',
      searchPlaceholder: 'Search courses...',
      allStatuses: 'All statuses',
      published: 'Published',
      drafts: 'Drafts',
      allLanguages: 'All languages',
      russian: 'Russian',
      english: 'English',
      loading: 'Loading...',
      image: 'Image',
      titleColumn: 'Title',
      language: 'Language',
      category: 'Category',
      price: 'Price',
      lessons: 'Lessons',
      status: 'Status',
      labels: 'Labels',
      updated: 'Updated',
      actions: 'Actions',
      unpublish: 'Unpublish',
      publish: 'Publish',
      removeNew: 'Remove NEW',
      markNew: 'Mark NEW',
      edit: 'Edit',
      delete: 'Delete',
      draft: 'Draft',
      new: 'New',
      hot: 'Hot',
      confirmDelete: 'Are you sure you want to delete this course?',
      createCourse: 'Create Course',
      editCourse: 'Edit Course',
      courseTitle: 'Course Title',
      courseTitlePlaceholder: 'Enter course title',
      courseDescription: 'Course Description',
      courseDescriptionPlaceholder: 'Enter course description',
      courseLanguage: 'Course Language',
      selectCategory: 'Select category',
      originalPrice: 'Original Price',
      currentPrice: 'Current Price (leave empty if no discount)',
      courseImage: 'Course Image',
      uploadImage: 'Upload Image',
      uploading: 'Uploading...',
      markAsNew: 'Mark as new course',
      newUntil: 'New until',
      lessonManagement: 'Lesson Management',
      addLesson: 'Add Lesson',
      lessonTitle: 'Lesson Title',
      lessonDescription: 'Lesson Description',
      lessonVideoUrl: 'Video URL (YouTube - legacy)',
      bunnyVideoId: 'Bunny Stream Video ID',
      lessonDuration: 'Duration (in minutes)',
      lessonFiles: 'Lesson Files',
      uploadFile: 'Upload File',
      uploadingFile: 'Uploading file...',
      deleteFile: 'Delete File',
      downloadFile: 'Download',
      noFiles: 'No files uploaded',
      fileUploaded: 'File uploaded successfully!',
      fileDeleted: 'File deleted!',
      fileError: 'File error: ',
      removeLesson: 'Remove',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      addCategory: 'Add',
      categoryName: 'Category Name',
      fillCourseTitle: 'Please fill in the course title',
      fillCourseDescription: 'Please fill in the course description',
      fillOriginalPrice: 'Please specify the original price',
      selectCategoryError: 'Please select a category',
      courseUpdated: 'Course updated successfully!',
      courseCreated: 'Course created successfully!',
      errorPrefix: 'Error: ',
      saveError: 'Save error: ',
      programming: 'Programming',
      design: 'Design',
      marketing: 'Marketing',
      business: 'Business',
      ai: 'Artificial Intelligence',
      dataScience: 'Data Science',
      other: 'Other'
    }
  }

  const t = translations[locale as keyof typeof translations]

  // Category management with localized names
  const getLocalizedCategories = () => [
    { id: 'programming', name: t.programming },
    { id: 'design', name: t.design },
    { id: 'marketing', name: t.marketing },
    { id: 'business', name: t.business },
    { id: 'ai', name: t.ai },
    { id: 'data-science', name: t.dataScience },
    { id: 'other', name: t.other }
  ]

  const [categories, setCategories] = useState<Category[]>(getLocalizedCategories())
  const [newCategoryName, setNewCategoryName] = useState('')

  // Form state
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

  // Update categories when locale changes
  useEffect(() => {
    setCategories(getLocalizedCategories())
  }, [locale])

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

  // Form validation
  const validateForm = () => {
    if (!formData.title.trim()) {
      alert(t.fillCourseTitle)
      return false
    }
    
    if (!formData.description.trim()) {
      alert(t.fillCourseDescription)
      return false
    }
    
    if (!formData.originalPrice) {
      alert(t.fillOriginalPrice)
      return false
    }
    
    if (!formData.category) {
      alert(t.selectCategoryError)
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
      
      // Prepare data
      const submitData = {
        title: formData.title,
        description: formData.description,
        language: formData.language,
        originalPrice: parseFloat(formData.originalPrice),
        price: formData.price ? parseFloat(formData.price) : parseFloat(formData.originalPrice),
        category: formData.category,
        imageUrl: formData.imageUrl || '/images/course-placeholder.jpg',
        published: false, // Create as draft
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
        alert(editingCourse ? t.courseUpdated : t.courseCreated)
        setShowCreateModal(false)
        setShowEditModal(false)
        setEditingCourse(null)
        resetForm()
        fetchCourses()
      } else {
        const errorData = await response.json()
        alert(t.errorPrefix + errorData.error)
      }
    } catch (error) {
      console.error('Error saving course:', error)
      alert(t.saveError + error)
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

  const togglePublish = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/publish`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  const toggleNew = async (courseId: string, currentIsNew: boolean) => {
    try {
      const newUntilDate = currentIsNew 
        ? new Date().toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      const response = await fetch(`/api/admin/courses/${courseId}/toggle-new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isNewCourse: !currentIsNew,
          newUntil: newUntilDate
        })
      })

      if (response.ok) {
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

  // Загрузка файла для урока
  const handleFileUpload = async (lessonId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editingCourse) return

    const uploadKey = `${lessonId}_${file.name}`
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }))

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('courseId', editingCourse._id)
      uploadFormData.append('lessonId', lessonId)

      const response = await fetch('/api/lessons/files/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (response.ok) {
        const result = await response.json()
        
        // Обновляем урок с новым файлом
        const currentLesson = formData.lessons.find((l: Lesson) => l.id === lessonId)
        updateLesson(lessonId, {
          files: [
            ...(currentLesson?.files || []),
            result.file
          ]
        })
        
        alert(t.fileUploaded)
      } else {
        const error = await response.json()
        alert(t.fileError + error.error)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(t.fileError + error)
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }))
      // Очищаем input
      event.target.value = ''
    }
  }

  // Удаление файла урока
  const handleFileDelete = async (lessonId: string, fileId: string) => {
    if (!confirm(t.deleteFile + '?')) return

    const deleteKey = `${lessonId}_${fileId}`
    setDeletingFiles(prev => ({ ...prev, [deleteKey]: true }))

    try {
      const response = await fetch(`/api/lessons/files/${fileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Удаляем файл из урока
        const lesson = formData.lessons.find(l => l.id === lessonId)
        if (lesson) {
          updateLesson(lessonId, {
            files: lesson.files?.filter(f => f.id !== fileId) || []
          })
        }
        
        alert(t.fileDeleted)
      } else {
        const error = await response.json()
        alert(t.fileError + error.error)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert(t.fileError + error)
    } finally {
      setDeletingFiles(prev => ({ ...prev, [deleteKey]: false }))
    }
  }

  // Форматирование размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Получение иконки файла по типу
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
    if (mimeType.includes('text')) return '📄'
    return '📎'
  }

  // Category management
  const addCategory = () => {
    if (newCategoryName.trim()) {
      setCategories(prev => [...prev, {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        name: newCategoryName
      }])
      setNewCategoryName('')
    }
  }

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US')
  }

  const formatPrice = (price: number) => {
    return `$${price}`
  }

  const getLanguageLabel = (lang: 'ru' | 'en') => {
    return lang === 'ru' ? '🇷🇺 RU' : '🇺🇸 EN'
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

        {/* Search and filters */}
        <div className="glassmorphism rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
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
                <option value="all">{t.allStatuses}</option>
                <option value="published">{t.published}</option>
                <option value="draft">{t.drafts}</option>
              </select>
            </div>
            <div>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="all">{t.allLanguages}</option>
                <option value="ru">{t.russian}</option>
                <option value="en">{t.english}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses table */}
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
                    <th className="text-left p-4 text-white/70 font-medium">{t.image}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.titleColumn}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.language}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.category}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.price}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.lessons}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.status}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.labels}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.updated}</th>
                    <th className="text-left p-4 text-white/70 font-medium">{t.actions}</th>
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
                            {course.published ? t.published : t.draft}
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
                              ✨ {t.new}
                            </span>
                          )}
                          {course.featured && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                              🔥 {t.hot}
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
                            {course.published ? t.unpublish : t.publish}
                          </button>
                          <button
                            onClick={() => toggleNew(course._id, course.isNewCourse)}
                            className={`px-3 py-1 rounded text-xs ${
                              course.isNewCourse
                                ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            }`}
                          >
                            {course.isNewCourse ? t.removeNew : t.markNew}
                          </button>
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
        </div>

        {/* Category management modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-200 p-8 rounded-xl max-w-md w-full mx-4"
            >
              <h2 className="text-2xl font-bold text-white mb-6">{t.manageCategories}</h2>
              
              {/* Add new category */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t.categoryName}
                    className="flex-1 px-3 py-2 bg-dark-300 border border-white/10 rounded text-white placeholder-white/50"
                  />
                  <button onClick={addCategory} className="btn-primary px-4 py-2">
                    {t.addCategory}
                  </button>
                </div>
              </div>

              {/* Category list */}
              <div className="space-y-2 mb-6">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 bg-dark-300 rounded">
                    <span className="text-white">{category.name}</span>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      {t.delete}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="btn-secondary px-6 py-2"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Create/Edit course modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-200 p-8 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingCourse ? t.editCourse : t.createCourse}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2">{t.courseTitle}</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t.courseTitlePlaceholder}
                      className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-white placeholder-white/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">{t.courseLanguage}</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as 'ru' | 'en' }))}
                      className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-white"
                    >
                      <option value="ru">{t.russian}</option>
                      <option value="en">{t.english}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">{t.courseDescription}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t.courseDescriptionPlaceholder}
                    rows={4}
                    className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-white placeholder-white/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white mb-2">{t.category}</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-white"
                      required
                    >
                      <option value="">{t.selectCategory}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-2">{t.originalPrice}</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-white"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">{t.currentPrice}</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-white mb-2">{t.courseImage}</label>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-white"
                    />
                    {uploading && <p className="text-blue-400">{t.uploading}</p>}
                    {formData.imageUrl && (
                      <img
                        src={formData.imageUrl}
                        alt="Course preview"
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Course labels */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isNewCourse"
                      checked={formData.isNewCourse}
                      onChange={(e) => setFormData(prev => ({ ...prev, isNewCourse: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isNewCourse" className="text-white">
                      {t.markAsNew}
                    </label>
                  </div>

                  {formData.isNewCourse && (
                    <div>
                      <label className="block text-white mb-2">{t.newUntil}</label>
                      <input
                        type="date"
                        value={formData.newUntil}
                        onChange={(e) => setFormData(prev => ({ ...prev, newUntil: e.target.value }))}
                        className="px-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Lesson management */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">{t.lessonManagement}</h3>
                  
                  <button
                    type="button"
                    onClick={addLesson}
                    className="btn-secondary px-4 py-2"
                  >
                    {t.addLesson}
                  </button>

                  <div className="space-y-4">
                    {formData.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="p-4 bg-dark-300 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder={t.lessonTitle}
                            value={lesson.title}
                            onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                            className="px-3 py-2 bg-dark-200 border border-white/10 rounded text-white placeholder-white/50"
                          />
                          <input
                            type="number"
                            placeholder={t.lessonDuration}
                            value={lesson.duration || ''}
                            onChange={(e) => updateLesson(lesson.id, { duration: parseInt(e.target.value) || 0 })}
                            className="px-3 py-2 bg-dark-200 border border-white/10 rounded text-white placeholder-white/50"
                          />
                        </div>
                        
                        <textarea
                          placeholder={t.lessonDescription}
                          value={lesson.description || ''}
                          onChange={(e) => updateLesson(lesson.id, { description: e.target.value })}
                          className="w-full mb-4 px-3 py-2 bg-dark-200 border border-white/10 rounded text-white placeholder-white/50"
                          rows={2}
                        />
                        
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder={t.bunnyVideoId}
                            value={lesson.bunnyVideoId || ''}
                            onChange={(e) => updateLesson(lesson.id, { bunnyVideoId: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded text-white placeholder-white/50"
                          />
                          <input
                            type="text"
                            placeholder={t.lessonVideoUrl}
                            value={lesson.videoUrl || ''}
                            onChange={(e) => updateLesson(lesson.id, { videoUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded text-white placeholder-white/50"
                          />
                          
                          {/* Файлы урока */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-medium">{t.lessonFiles}</h4>
                              <label className="btn-secondary px-3 py-1 text-sm cursor-pointer">
                                {t.uploadFile}
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                                  onChange={(e) => handleFileUpload(lesson.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            
                            {/* Список файлов */}
                            <div className="space-y-2">
                              {lesson.files && lesson.files.length > 0 ? (
                                lesson.files.map((file) => (
                                  <div key={file.id} className="flex items-center justify-between bg-dark-100 p-3 rounded">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-xl">{getFileIcon(file.mimeType)}</span>
                                      <div>
                                        <p className="text-white text-sm font-medium">{file.originalName}</p>
                                        <p className="text-white/60 text-xs">
                                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <a
                                        href={`/api/lessons/files/${file.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1"
                                      >
                                        {t.downloadFile}
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => handleFileDelete(lesson.id, file.id)}
                                        disabled={deletingFiles[`${lesson.id}_${file.id}`]}
                                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                                      >
                                        {deletingFiles[`${lesson.id}_${file.id}`] ? '...' : t.deleteFile}
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-white/60 text-sm italic">{t.noFiles}</p>
                              )}
                            </div>
                            
                            {/* Индикатор загрузки файла */}
                            {Object.entries(uploadingFiles).some(([key, uploading]) => 
                              key.startsWith(lesson.id) && uploading
                            ) && (
                              <div className="mt-2 text-blue-400 text-sm">
                                {t.uploadingFile}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <button
                              type="button"
                              onClick={() => removeLesson(lesson.id)}
                              className="text-red-400 hover:text-red-300 px-3 py-1"
                            >
                              {t.removeLesson}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form actions */}
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
                    className="btn-primary px-6 py-3"
                  >
                    {submitting ? t.saving : t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
} 