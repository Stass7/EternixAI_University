import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import SiteSettings from '@/models/SiteSettings'

// GET - получить настройки сайта
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Получаем настройки или создаем дефолтные если их нет
    let settings = await SiteSettings.findOne()
    
    if (!settings) {
      settings = await SiteSettings.create({})
    }

    return NextResponse.json({
      success: true,
      settings: {
        _id: settings._id.toString(),
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        heroImage: settings.heroImage,
        logo: settings.logo,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        language: settings.language,
        contactEmail: settings.contactEmail,
        socialLinks: settings.socialLinks,
        seoSettings: settings.seoSettings,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - обновить настройки сайта
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      siteName,
      siteDescription,
      heroImage,
      logo,
      primaryColor,
      secondaryColor,
      language,
      contactEmail,
      socialLinks,
      seoSettings
    } = body

    // Валидация обязательных полей
    if (!siteName?.trim()) {
      return NextResponse.json(
        { error: 'Site name is required' },
        { status: 400 }
      )
    }

    if (!siteDescription?.trim()) {
      return NextResponse.json(
        { error: 'Site description is required' },
        { status: 400 }
      )
    }

    // Получаем настройки или создаем новые
    let settings = await SiteSettings.findOne()
    
    if (!settings) {
      settings = new SiteSettings()
    }

    // Обновляем настройки
    settings.siteName = siteName.trim()
    settings.siteDescription = siteDescription.trim()
    settings.heroImage = heroImage || settings.heroImage
    settings.logo = logo || settings.logo
    settings.primaryColor = primaryColor || settings.primaryColor
    settings.secondaryColor = secondaryColor || settings.secondaryColor
    settings.language = language || settings.language
    settings.contactEmail = contactEmail || settings.contactEmail
    settings.socialLinks = socialLinks || settings.socialLinks
    settings.seoSettings = seoSettings || settings.seoSettings

    await settings.save()

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        _id: settings._id.toString(),
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        heroImage: settings.heroImage,
        logo: settings.logo,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        language: settings.language,
        contactEmail: settings.contactEmail,
        socialLinks: settings.socialLinks,
        seoSettings: settings.seoSettings,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }
    })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 