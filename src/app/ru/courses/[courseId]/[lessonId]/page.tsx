import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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

  const sortedLessons = course.lessons.sort((a, b) => a.order - b.order)
  const currentIndex = sortedLessons.findIndex(l => l.id === resolvedParams.lessonId)
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

  const videoId = extractYouTubeVideoId(currentLesson.videoUrl || '')

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
            {/* Видеоплеер */}
            <div className="glassmorphism rounded-xl overflow-hidden mb-8">
              {videoId ? (
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
                  </div>
                </div>
              </div>

              {currentLesson.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">📋 Описание урока</h3>
                  <p className="text-white/80 leading-relaxed">
                    {currentLesson.description}
                  </p>
                </div>
              )}

              {/* Навигация между уроками */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                {prevLesson ? (
                  <Link
                    href={`/ru/courses/${course._id}/${prevLesson.id}`}
                    className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
                  >
                    <span>←</span>
                    <div>
                      <div className="text-sm">Предыдущий урок</div>
                      <div className="font-semibold">{prevLesson.title}</div>
                    </div>
                  </Link>
                ) : (
                  <div></div>
                )}

                {nextLesson ? (
                  <Link
                    href={`/ru/courses/${course._id}/${nextLesson.id}`}
                    className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors text-right"
                  >
                    <div>
                      <div className="text-sm">Следующий урок</div>
                      <div className="font-semibold">{nextLesson.title}</div>
                    </div>
                    <span>→</span>
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>

          {/* Боковая панель - список уроков */}
          <div className="lg:col-span-1">
            <div className="glassmorphism rounded-xl p-6 sticky top-8">
              <h3 className="text-lg font-bold text-white mb-4">
                📚 Содержание курса
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sortedLessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    href={`/ru/courses/${course._id}/${lesson.id}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      lesson.id === currentLesson.id
                        ? 'bg-primary-500/20 border border-primary-500/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-white/60 text-xs font-mono mt-1">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium line-clamp-2 ${
                          lesson.id === currentLesson.id ? 'text-primary-300' : 'text-white'
                        }`}>
                          {lesson.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          {lesson.duration && (
                            <span className="text-xs text-white/50">
                              {lesson.duration}м
                            </span>
                          )}
                          {lesson.isNewLesson && (
                            <span className="text-xs text-green-400">
                              ✨
                            </span>
                          )}
                          {lesson.id === currentLesson.id && (
                            <span className="text-xs text-primary-400">
                              ▶️
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  href={`/ru/courses/${course._id}`}
                  className="btn-secondary w-full py-2 text-sm"
                >
                  ← Обзор курса
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 