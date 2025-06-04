import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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

interface CoursePageProps {
  params: Promise<{
    courseId: string
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

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const resolvedParams = await params
  const course = await getCourseData(resolvedParams.courseId)
  
  if (!course) {
    return {
      title: 'Course not found – EternixAI University'
    }
  }
  
  return {
    title: `${course.title} – EternixAI University`,
    description: course.description
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const resolvedParams = await params
  const course = await getCourseData(resolvedParams.courseId)
  
  if (!course) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return `$${(price * 0.011).toFixed(0)}`
  }

  const sortedLessons = course.lessons.sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-white/60">
            <Link href="/en" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/en/courses" className="hover:text-white transition-colors">
              Courses
            </Link>
            <span>/</span>
            <span className="text-white">{course.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Course header */}
            <div className="glassmorphism rounded-xl p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-4">
                    {course.title}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">
                      📚 {course.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      🇺🇸 English
                    </span>
                    {course.featured && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                        🔥 Hot
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative mb-6">
                <Image
                  src={course.imageUrl || '/images/course-placeholder.jpg'}
                  alt={course.title}
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {course.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{course.discount}%
                  </div>
                )}
              </div>

              <p className="text-white/80 text-lg leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Lessons list */}
            <div className="glassmorphism rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                📚 Course Content ({sortedLessons.length} lessons)
              </h2>
              
              <div className="space-y-4">
                {sortedLessons.map((lesson, index) => (
                  <div key={lesson.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-white/60 text-sm font-mono">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h3 className="text-white font-semibold">
                            {lesson.title}
                          </h3>
                          {lesson.isNewLesson && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                              New
                            </span>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-white/60 text-sm ml-8">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        {lesson.duration && (
                          <span className="text-white/60 text-sm">
                            🕒 {lesson.duration} min
                          </span>
                        )}
                        <Link
                          href={`/en/courses/${course._id}/${lesson.id}`}
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          Watch
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glassmorphism rounded-xl p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">
                  {formatPrice(course.price)}
                </div>
                {course.discount > 0 && (
                  <div className="text-white/50 line-through text-lg">
                    {formatPrice(course.originalPrice)}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-white/70">
                  <span>📚 Lessons:</span>
                  <span className="text-white font-semibold">{sortedLessons.length}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>🕒 Duration:</span>
                  <span className="text-white font-semibold">
                    {sortedLessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)} min
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>🎯 Level:</span>
                  <span className="text-white font-semibold">All levels</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>📱 Access:</span>
                  <span className="text-white font-semibold">Lifetime</span>
                </div>
              </div>

              <button className="btn-primary w-full py-3 text-lg font-semibold mb-4">
                💎 Buy Course
              </button>

              <button className="btn-secondary w-full py-2 text-sm">
                ❤️ Add to Favorites
              </button>

              {/* What's included */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-white font-semibold mb-3">✨ What's included:</h4>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span>{sortedLessons.length} video lessons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span>Instructor support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 