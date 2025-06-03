import Link from 'next/link'
import Image from 'next/image'
import { ClientMotionWrapper } from '@/components/ui/ClientMotionWrapper'

// Принудительное использование динамического рендеринга
export const dynamic = 'force-dynamic'

// SVG заглушки как data URLs
const DEFAULT_HERO_IMAGE = "data:image/svg+xml;base64," + btoa(`
<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1e293b"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" fill="#64748b" text-anchor="middle">
    Hero Image
  </text>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" fill="#475569" text-anchor="middle">
    Upload image in admin panel
  </text>
</svg>
`)

const DEFAULT_COURSE_PLACEHOLDER = "data:image/svg+xml;base64," + btoa(`
<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#374151"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">
    Course Image
  </text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">
    Upload in admin panel
  </text>
</svg>
`)

// Интерфейсы для типизации
interface SiteSettings {
  siteName: string
  siteDescription: string
  heroImage: string
  logo: string
  primaryColor: string
  secondaryColor: string
  language: 'ru' | 'en'
}

interface Course {
  _id: string
  title: string
  description: string
  imageUrl: string
  price: number
  originalPrice: number
  discount: number
  category: string
  lessonsCount: number
  isNewCourse: boolean
}

// Функция для получения настроек сайта
async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/public/settings`, {
      cache: 'no-store', // Всегда получаем свежие настройки
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.settings
    }
  } catch (error) {
    console.error('Error fetching site settings:', error)
  }
  
  // Fallback настройки с SVG заглушками
  return {
    siteName: 'EternixAI University',
    siteDescription: 'Educational platform with video courses',
    heroImage: DEFAULT_HERO_IMAGE,
    logo: "data:image/svg+xml;base64," + btoa(`
      <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0ea5e9"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" dy=".3em">
          LOGO
        </text>
      </svg>
    `),
    primaryColor: '#0ea5e9',
    secondaryColor: '#64748b',
    language: 'en'
  }
}

// Функция для получения английских курсов
async function getEnglishCourses(): Promise<Course[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/courses?language=en&limit=3`, {
      cache: 'no-store', // Всегда получаем свежие курсы
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.courses || []
    }
  } catch (error) {
    console.error('Error fetching English courses:', error)
  }
  
  return []
}

export default async function HomePage() {
  const [settings, courses] = await Promise.all([
    getSiteSettings(),
    getEnglishCourses()
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-300 to-dark-400 z-0"></div>
        <div className="absolute inset-0 opacity-30 z-0">
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ClientMotionWrapper
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Educational Platform <span className="text-primary-500">{settings.siteName}</span>
              </h1>
              <p className="mt-6 text-xl text-white/80">
                {settings.siteDescription}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/en/courses" className="btn-primary text-center px-8 py-4 text-lg">
                  All Courses
                </Link>
                <Link href="/en/pricing" className="btn-secondary text-center px-8 py-4 text-lg">
                  Pricing
                </Link>
              </div>
            </ClientMotionWrapper>
            
            <ClientMotionWrapper
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="glassmorphism p-6 rounded-2xl"
            >
              <div className="aspect-video relative w-full rounded-lg overflow-hidden">
                <Image 
                  src={settings.heroImage} 
                  alt={`${settings.siteName} Platform`} 
                  fill
                  className="object-cover"
                />
              </div>
            </ClientMotionWrapper>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="section bg-dark-300">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <ClientMotionWrapper 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Why Choose Us
            </ClientMotionWrapper>
            <ClientMotionWrapper
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-lg text-white/70"
            >
              {settings.siteName} offers a unique approach to education with a focus on quality and results
            </ClientMotionWrapper>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality Video Lessons",
                description: "All materials are recorded by professionals with years of experience",
                icon: "📚"
              },
              {
                title: "Learning Flexibility",
                description: "Study at a convenient time and at a pace that's comfortable for you",
                icon: "⏱️"
              },
              {
                title: "Certificates",
                description: "Receive certificates for completed courses for your portfolio",
                icon: "🎓"
              }
            ].map((feature, index) => (
              <ClientMotionWrapper
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="card flex flex-col items-center text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </ClientMotionWrapper>
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Courses Section */}
      <section className="section bg-dark-400">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <ClientMotionWrapper 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Popular Courses
            </ClientMotionWrapper>
            <ClientMotionWrapper
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/en/courses" className="btn-secondary">
                All Courses
              </Link>
            </ClientMotionWrapper>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <ClientMotionWrapper
                  key={course._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="glassmorphism rounded-xl overflow-hidden"
                >
                  <div className="aspect-video relative">
                    <Image 
                      src={course.imageUrl || DEFAULT_COURSE_PLACEHOLDER} 
                      alt={course.title} 
                      fill
                      className="object-cover"
                    />
                    {course.isNewCourse && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        NEW
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-primary-500/20 text-primary-300">
                        {course.category}
                      </span>
                      <span className="text-white/60 text-sm">
                        {course.lessonsCount || 0} lessons
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-white/70 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-primary-500 font-bold">${course.price}</span>
                        {course.discount > 0 && (
                          <span className="text-white/50 line-through text-sm">${course.originalPrice}</span>
                        )}
                      </div>
                      <Link href={`/en/courses/${course._id}`} className="btn-primary text-sm">
                        Learn More
                      </Link>
                    </div>
                  </div>
                </ClientMotionWrapper>
              ))
            ) : (
              // Показываем сообщение если нет курсов
              <div className="col-span-3 text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl text-white mb-2">No English courses yet</h3>
                <p className="text-white/70">English courses will appear here once added by admin</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="section bg-dark-300">
        <div className="container-custom">
          <ClientMotionWrapper 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white text-center"
          >
            Student Testimonials
          </ClientMotionWrapper>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Alexander S.",
                role: "Developer",
                content: "The quality of the lessons exceeded all my expectations. The material is presented in a very accessible and interesting way."
              },
              {
                name: "Maria K.",
                role: "Designer",
                content: "Excellent platform! Convenient interface and quality materials. I recommend it to everyone!"
              },
              {
                name: "John P.",
                role: "Marketer",
                content: "Completed several courses, everything is top-notch. Now I apply the knowledge gained in my work."
              }
            ].map((testimonial, index) => (
              <ClientMotionWrapper
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-white font-semibold">{testimonial.name}</h3>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-white/80 italic">"{testimonial.content}"</p>
              </ClientMotionWrapper>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-primary-600 to-primary-400">
        <div className="container-custom text-center">
          <ClientMotionWrapper
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Learning Today!
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have already changed their lives with our courses
            </p>
            <Link href="/en/courses" className="btn-secondary bg-white text-primary-600 hover:bg-white/90 text-lg px-8 py-4 inline-block">
              Choose Course
            </Link>
          </ClientMotionWrapper>
        </div>
      </section>
    </div>
  )
} 