import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { checkLessonAccess } from '@/lib/course-access'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import BuyButton from '@/components/courses/BuyButton'

// Принудительное использование динамического рендеринга
export const dynamic = 'force-dynamic'

interface Lesson {
  id: string
  title: string
  description?: string
  videoUrl?: string
  duration?: number
  order: number
  isNewLesson: boolean
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

async function getCourseData(courseId: string): Promise<Course | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/courses/${courseId}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.course
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  
  return match && match[2].length === 11 ? match[2] : null
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

  const sortedLessons = course.lessons.sort((a, b) => a.order - b.order)
  const currentIndex = sortedLessons.findIndex(l => l.id === resolvedParams.lessonId)
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

  const videoId = extractYouTubeVideoId(currentLesson.videoUrl || '')

  const formatPrice = (price: number) => {
    return `$${price}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {/* Видеоплеер или заглушка */}
            <div className="glassmorphism rounded-xl overflow-hidden mb-8">
              {accessResult.hasAccess ? (
                // Показываем видео только если есть доступ
                videoId ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
                      title={currentLesson.title}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="w-full h-96 bg-slate-800 flex items-center justify-center">
                    <div className="text-center text-white/60">
                      <div className="text-6xl mb-4">📹</div>
                      <p className="text-xl">Видео недоступно</p>
                      <p className="text-sm mt-2">Ссылка на видео не найдена</p>
                    </div>
                  </div>
                )
              ) : (
                // Заглушка для неоплаченного курса
                <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white p-8 max-w-md">
                    <div className="text-6xl mb-6">🔒</div>
                    <h3 className="text-2xl font-bold mb-4">Купите курс, чтобы получить к нему доступ</h3>
                    <p className="text-white/70 mb-6">
                      Этот урок доступен только после покупки курса "{course.title}"
                    </p>
                    <div className="space-y-3">
                      {isAuthenticated ? (
                        <BuyButton 
                          courseId={course._id}
                          courseTitle={course.title}
                          price={course.price}
                          locale="ru"
                        />
                      ) : (
                        <Link
                          href="/ru/auth/signin"
                          className="btn-primary px-6 py-3 inline-block"
                        >
                          Войти для покупки
                        </Link>
                      )}
                      <Link
                        href={`/ru/courses/${course._id}`}
                        className="btn-secondary px-6 py-3 block"
                      >
                        ← Обзор курса
                      </Link>
                    </div>
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
                    {!accessResult.hasAccess && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                        🔒 Требуется покупка
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {accessResult.hasAccess && currentLesson.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">📋 Описание урока</h3>
                  <p className="text-white/80 leading-relaxed">
                    {currentLesson.description}
                  </p>
                </div>
              )}

              {!accessResult.hasAccess && (
                <div className="mb-6">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h3 className="text-yellow-400 font-semibold mb-2">💡 Содержимое урока скрыто</h3>
                    <p className="text-white/70">
                      Описание урока и дополнительные материалы станут доступны после покупки курса.
                    </p>
                  </div>
                </div>
              )}

              {/* Навигация между уроками */}
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
                          {accessResult.hasAccess ? (
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