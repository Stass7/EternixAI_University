import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import SiteSettings from '@/models/SiteSettings'

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

const DEFAULT_LOGO = "data:image/svg+xml;base64," + btoa(`
<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0ea5e9"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" dy=".3em">
    LOGO
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

// GET - получить публичные настройки сайта (без авторизации)
export async function GET() {
  try {
    await connectToDatabase()
    
    // Получаем настройки или создаем дефолтные если их нет
    let settings = await SiteSettings.findOne()
    
    if (!settings) {
      // Создаем дефолтные настройки если их нет
      settings = await SiteSettings.create({
        siteName: 'EternixAI University',
        siteDescription: 'Образовательная платформа с видео-уроками',
        heroImage: DEFAULT_HERO_IMAGE,
        logo: DEFAULT_LOGO,
        primaryColor: '#0ea5e9',
        secondaryColor: '#64748b',
        language: 'ru',
        contactEmail: 'info@eternixai.university'
      })
    }

    // Возвращаем только публичные настройки для отображения
    return NextResponse.json({
      success: true,
      settings: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        heroImage: settings.heroImage,
        logo: settings.logo,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        language: settings.language
      }
    })
  } catch (error) {
    console.error('Public settings GET error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        // В случае ошибки возвращаем дефолтные настройки с SVG заглушками
        settings: {
          siteName: 'EternixAI University',
          siteDescription: 'Образовательная платформа с видео-уроками',
          heroImage: DEFAULT_HERO_IMAGE,
          logo: DEFAULT_LOGO,
          primaryColor: '#0ea5e9',
          secondaryColor: '#64748b',
          language: 'ru'
        }
      },
      { status: 500 }
    )
  }
} 