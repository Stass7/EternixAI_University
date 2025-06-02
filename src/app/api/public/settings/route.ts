import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import SiteSettings from '@/models/SiteSettings'

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
        heroImage: '/images/hero-image.jpg',
        logo: '/images/logo.png',
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
        // В случае ошибки возвращаем дефолтные настройки
        settings: {
          siteName: 'EternixAI University',
          siteDescription: 'Образовательная платформа с видео-уроками',
          heroImage: '/images/hero-image.jpg',
          logo: '/images/logo.png',
          primaryColor: '#0ea5e9',
          secondaryColor: '#64748b',
          language: 'ru'
        }
      },
      { status: 500 }
    )
  }
} 