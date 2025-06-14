import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { checkLessonAccess } from '@/lib/course-access'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import BuyButton from '@/components/courses/BuyButton'
import BunnyVideoPlayer from '@/components/courses/BunnyVideoPlayer'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import mongoose from 'mongoose'

// Принудительное использование динамического рендеринга
export const dynamic = 'force-dynamic'

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
  isNewLesson: boolean
  files?: LessonFile[] // Файлы урока
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
  lessons: Lesson[]
  createdAt: string
  updatedAt: string
}

interface LessonPageProps {
  params: Promise<{
    courseId: string
    lessonId: string
  }>
}

// 🔥 НОВАЯ ФУНКЦИЯ - ПРЯМОЕ ОБРАЩЕНИЕ К БД ВМЕСТО API
async function getCourseData(courseId: string): Promise<Course | null> {
  try {
    // Проверяем валидность ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return null
    }

    await connectToDatabase()
    
    // Получаем курс напрямую из БД со всеми данными включая videoURL
    const course: any = await Course.findById(courseId).lean()
    
    if (!course) {
      return null
    }

    // Получаем сессию для проверки админа
    const session = await getServerSession(authOptions)
    
    // 🔥 HARDCODE ПРОВЕРКА ДЛЯ СУПЕР-АДМИНА
    const isSuperAdmin = session?.user?.email === 'stanislavsk1981@gmail.com'
    
    let isAdmin = false
    if (session?.user?.email) {
      if (isSuperAdmin) {
        isAdmin = true
        console.log('🚀 SUPER ADMIN DETECTED IN getCourseData: stanislavsk1981@gmail.com')
      } else {
        const user = await User.findOne({ email: session.user.email })
        isAdmin = user?.role === 'admin'
      }
    }

    // Логирование для отладки
    console.log('🔧 getCourseData DEBUG:')
    console.log('Course ID:', courseId)
    console.log('User email:', session?.user?.email)
    console.log('isSuperAdmin:', isSuperAdmin)
    console.log('isAdmin:', isAdmin)
    console.log('Course has lessons:', course.lessons?.length || 0)
    console.log('First lesson has bunnyVideoId:', !!course.lessons?.[0]?.bunnyVideoId)
    console.log('First lesson bunnyVideoId:', course.lessons?.[0]?.bunnyVideoId || 'EMPTY')

    // Форматируем данные курса для возврата
    return {
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      language: course.language,
      price: course.price,
      originalPrice: course.originalPrice,
      discount: course.discount,
      category: course.category,
      imageUrl: course.imageUrl,
      published: course.published,
      featured: course.featured,
      isNewCourse: course.isNewCourse,
      lessons: course.lessons || [], // 🔥 ВСЕГДА ВОЗВРАЩАЕМ ВСЕ ДАННЫЕ УРОКОВ НА СЕРВЕРЕ
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }
  } catch (error) {
    console.error('Error fetching course from DB:', error)
    return null
  }
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const course = await getCourseData(resolvedParams.courseId)
  
  if (!course) {
    return {
      title: 'Урок не найден – EternixAI University'
    }
  }
  
  const lesson = course.lessons.find(l => l.id === resolvedParams.lessonId)
  
  if (!lesson) {
    return {
      title: 'Урок не найден – EternixAI University'
    }
  }
  
  return {
    title: `${lesson.title} - ${course.title} – EternixAI University`,
    description: lesson.description || course.description
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = await params
  const course = await getCourseData(resolvedParams.courseId)
  
  if (!course) {
    notFound()
  }

  const currentLesson = course.lessons.find(l => l.id === resolvedParams.lessonId)
  
  if (!currentLesson) {
    notFound()
  }

  // Проверяем доступ к уроку
  const accessResult = await checkLessonAccess(resolvedParams.courseId, resolvedParams.lessonId)
  const session = await getServerSession(authOptions)
  const isAuthenticated = !!session?.user

  // 🔥 УЛУЧШЕННАЯ ПРОВЕРКА АДМИНИСТРАТОРА С HARDCODE
  let isAdmin = false
  if (session?.user?.email) {
    // HARDCODE проверка для супер-админа
    if (session.user.email === 'stanislavsk1981@gmail.com') {
      isAdmin = true
      console.log('🚀 SUPER ADMIN DETECTED IN PAGE: stanislavsk1981@gmail.com')
    } else {
      await connectToDatabase()
      const user = await User.findOne({ email: session.user.email })
      isAdmin = user?.role === 'admin'
    }
  }

  const sortedLessons = course.lessons.sort((a, b) => a.order - b.order)
  const currentIndex = sortedLessons.findIndex(l => l.id === resolvedParams.lessonId)
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

  const formatPrice = (price: number) => {
    return `$${price}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ДЕБАГ БЛОК ДЛЯ АДМИНИСТРАТОРОВ */}
        {isAdmin && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg text-white">
            <h4 className="font-bold text-red-400">🔧 ADMIN DEBUG INFO:</h4>
            <p>Access Result: {JSON.stringify(accessResult)}</p>
            <p>Current Lesson Bunny Video ID: {currentLesson.bunnyVideoId || 'NULL/EMPTY'}</p>
            <p>Current Lesson Legacy YouTube URL: {currentLesson.videoUrl || 'NULL/EMPTY'}</p>
            <p>User Role: {isAdmin ? 'ADMIN' : 'USER'}</p>
            <p>Has Access: {accessResult.hasAccess ? 'TRUE' : 'FALSE'}</p>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-white/60 text-sm">
            <Link href="/ru" className="hover:text-white transition-colors">
              Главная
            </Link>
            <span>/</span>
            <Link href="/ru/courses" className="hover:text-white transition-colors">
              Курсы
            </Link>
            <span>/</span>
            <Link href={`/ru/courses/${course._id}`} className="hover:text-white transition-colors">
              {course.title}
            </Link>
            <span>/</span>
            <span className="text-white">{currentLesson.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Основной контент - видео */}
          <div className="lg:col-span-3">
            {/* Видеоплеер */}
            <div className="glassmorphism rounded-xl overflow-hidden mb-8">
              {currentLesson.bunnyVideoId ? (
                <BunnyVideoPlayer
                  videoId={currentLesson.bunnyVideoId}
                  title={currentLesson.title}
                  hasAccess={accessResult.hasAccess || isAdmin}
                  courseId={course._id}
                  lessonId={currentLesson.id}
                  showPaywall={!accessResult.hasAccess && !isAdmin}
                />
              ) : (
                <div className="w-full h-96 bg-slate-800 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <div className="text-6xl mb-4">📹</div>
                    <p className="text-xl">Видео не настроено</p>
                    <p className="text-sm mt-2">
                      {isAdmin ? 
                        `ADMIN: Добавьте Bunny Video ID в админ-панели` : 
                        'Видео скоро будет доступно'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Информация об уроке */}
            <div className="glassmorphism rounded-xl p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {currentLesson.title}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-white/60 text-sm">
                      Урок {currentIndex + 1} из {sortedLessons.length}
                    </span>
                    {currentLesson.duration && (
                      <span className="text-white/60 text-sm">
                        🕒 {currentLesson.duration} минут
                      </span>
                    )}
                    {currentLesson.isNewLesson && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                        ✨ Новый урок
                      </span>
                    )}
                    {!accessResult.hasAccess && !isAdmin && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                        🔒 Требуется покупка
                      </span>
                    )}
                    {isAdmin && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                        👑 Админ доступ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(accessResult.hasAccess || isAdmin) && currentLesson.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">📋 Описание урока</h3>
                  <p className="text-white/80 leading-relaxed">
                    {currentLesson.description}
                  </p>
                </div>
              )}

              {/* Файлы урока */}
              {(accessResult.hasAccess || isAdmin) && currentLesson.files && currentLesson.files.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">📎 Материалы урока</h3>
                  <div className="space-y-3">
                    {currentLesson.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {file.mimeType.includes('pdf') ? '📄' :
                             file.mimeType.includes('word') ? '📝' :
                             file.mimeType.includes('excel') || file.mimeType.includes('spreadsheet') ? '📊' :
                             file.mimeType.includes('powerpoint') || file.mimeType.includes('presentation') ? '📋' :
                             file.mimeType.includes('image') ? '🖼️' :
                             file.mimeType.includes('zip') || file.mimeType.includes('rar') ? '📦' :
                             file.mimeType.includes('text') ? '📄' : '📎'}
                          </span>
                          <div>
                            <p className="text-white font-medium">{file.originalName}</p>
                            <p className="text-white/60 text-sm">
                              {(file.size / 1024 / 1024).toFixed(2)} МБ • {new Date(file.uploadedAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`/api/lessons/files/${file.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          📥 Скачать
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!accessResult.hasAccess && !isAdmin && (
                <div className="mb-6">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h3 className="text-yellow-400 font-semibold mb-2">💡 Содержимое урока скрыто</h3>
                    <p className="text-white/70">
                      Описание урока и дополнительные материалы будут доступны после покупки курса.
                    </p>
                  </div>
                </div>
              )}

              {/* Навигация по урокам */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                {prevLesson ? (
                  <Link
                    href={`/ru/courses/${course._id}/${prevLesson.id}`}
                    className="btn-secondary flex items-center px-4 py-2"
                  >
                    ← {prevLesson.title}
                  </Link>
                ) : (
                  <div></div>
                )}
                
                {nextLesson && (
                  <Link
                    href={`/ru/courses/${course._id}/${nextLesson.id}`}
                    className="btn-secondary flex items-center px-4 py-2"
                  >
                    {nextLesson.title} →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Боковая панель - содержание курса */}
          <div className="lg:col-span-1">
            <div className="glassmorphism rounded-xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">📚 Содержание курса</h3>
                <Link
                  href={`/ru/courses/${course._id}`}
                  className="text-primary-400 hover:text-primary-300 text-sm"
                >
                  ← Обзор курса
                </Link>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sortedLessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      lesson.id === currentLesson.id
                        ? 'bg-primary-500/20 border-primary-500/30 text-white'
                        : 'border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono opacity-60">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {(accessResult.hasAccess || isAdmin) ? (
                            <Link
                              href={`/ru/courses/${course._id}/${lesson.id}`}
                              className="block truncate hover:text-white transition-colors"
                            >
                              {lesson.title}
                            </Link>
                          ) : (
                            <span className="block truncate text-gray-400">
                              🔒 {lesson.title}
                            </span>
                          )}
                        </div>
                        {lesson.duration && (
                          <div className="text-xs opacity-60 mt-1">
                            {lesson.duration} мин
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 