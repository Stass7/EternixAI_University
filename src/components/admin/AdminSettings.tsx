"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AdminSettingsProps {
  locale: string
}

interface SiteSettings {
  _id: string
  siteName: string
  siteDescription: string
  heroImage: string
  logo: string
  primaryColor: string
  secondaryColor: string
  language: 'ru' | 'en'
  contactEmail: string
  socialLinks: {
    telegram?: string
    vk?: string
    youtube?: string
    github?: string
  }
  seoSettings: {
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string
  }
  createdAt: string
  updatedAt: string
}

export default function AdminSettings({ locale }: AdminSettingsProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({ hero: false, logo: false })
  const [activeTab, setActiveTab] = useState('general')

  const translations = {
    ru: {
      title: 'Настройки сайта',
      tabs: {
        general: 'Общие',
        appearance: 'Внешний вид',
        seo: 'SEO',
        social: 'Соц. сети'
      },
      fields: {
        siteName: 'Название сайта',
        siteDescription: 'Описание сайта',
        heroImage: 'Hero-изображение',
        logo: 'Логотип',
        primaryColor: 'Основной цвет',
        secondaryColor: 'Дополнительный цвет',
        language: 'Язык по умолчанию',
        contactEmail: 'Контактный email',
        metaTitle: 'Meta заголовок',
        metaDescription: 'Meta описание',
        metaKeywords: 'Ключевые слова',
        telegram: 'Telegram',
        vk: 'VKontakte',
        youtube: 'YouTube',
        github: 'GitHub'
      },
      buttons: {
        save: 'Сохранить',
        saving: 'Сохранение...',
        upload: 'Загрузить',
        uploading: 'Загрузка...',
        preview: 'Предпросмотр'
      },
      messages: {
        saveSuccess: 'Настройки успешно сохранены!',
        uploadSuccess: 'Изображение загружено!',
        error: 'Произошла ошибка'
      }
    },
    en: {
      title: 'Site Settings',
      tabs: {
        general: 'General',
        appearance: 'Appearance',
        seo: 'SEO',
        social: 'Social Media'
      },
      fields: {
        siteName: 'Site Name',
        siteDescription: 'Site Description',
        heroImage: 'Hero Image',
        logo: 'Logo',
        primaryColor: 'Primary Color',
        secondaryColor: 'Secondary Color',
        language: 'Default Language',
        contactEmail: 'Contact Email',
        metaTitle: 'Meta Title',
        metaDescription: 'Meta Description',
        metaKeywords: 'Keywords',
        telegram: 'Telegram',
        vk: 'VKontakte',
        youtube: 'YouTube',
        github: 'GitHub'
      },
      buttons: {
        save: 'Save',
        saving: 'Saving...',
        upload: 'Upload',
        uploading: 'Uploading...',
        preview: 'Preview'
      },
      messages: {
        saveSuccess: 'Settings saved successfully!',
        uploadSuccess: 'Image uploaded!',
        error: 'An error occurred'
      }
    }
  }

  const t = translations[locale as keyof typeof translations]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (type: 'hero' | 'logo', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(prev => ({ ...prev, [type]: true }))
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'image')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => prev ? {
          ...prev,
          [type === 'hero' ? 'heroImage' : 'logo']: data.fileUrl
        } : null)
        
        // Улучшенное сообщение с информацией о хранении в MongoDB
        const sizeKB = (data.fileSize / 1024).toFixed(1)
        alert(`✅ ${t.messages.uploadSuccess}\n📁 Файл сохранен в MongoDB Atlas (${sizeKB}KB)\n💾 Изображение будет сохранено после нажатия "Save"`)
      } else {
        const errorData = await response.json()
        alert(`❌ ${t.messages.error}\n${errorData.error || 'Upload failed'}`)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(t.messages.error)
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert(t.messages.saveSuccess)
      } else {
        alert(t.messages.error)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(t.messages.error)
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (field: string, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateNestedSettings = (parent: string, field: string, value: any) => {
    setSettings(prev => {
      if (!prev) return null
      
      const updatedSettings = { ...prev }
      if (parent === 'socialLinks') {
        updatedSettings.socialLinks = { ...prev.socialLinks, [field]: value }
      } else if (parent === 'seoSettings') {
        updatedSettings.seoSettings = { ...prev.seoSettings, [field]: value }
      }
      
      return updatedSettings
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <p className="text-white/70 text-lg">{t.messages.error}</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: t.tabs.general },
    { id: 'appearance', label: t.tabs.appearance },
    { id: 'seo', label: t.tabs.seo },
    { id: 'social', label: t.tabs.social }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-8">{t.title}</h1>

        {/* Tabs */}
        <div className="glassmorphism rounded-xl p-1 mb-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="glassmorphism rounded-xl p-8">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 mb-2">{t.fields.siteName} *</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => updateSettings('siteName', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">{t.fields.contactEmail}</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSettings('contactEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-2">{t.fields.siteDescription} *</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => updateSettings('siteDescription', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 mb-2">{t.fields.language}</label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSettings('language', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Hero Image */}
              <div>
                <label className="block text-white/70 mb-2">{t.fields.heroImage}</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('hero', e)}
                    className="hidden"
                    id="heroImageUpload"
                  />
                  <label
                    htmlFor="heroImageUpload"
                    className="btn-secondary px-4 py-2 cursor-pointer"
                  >
                    {uploading.hero ? t.buttons.uploading : t.buttons.upload}
                  </label>
                  {settings.heroImage && (
                    <div className="flex items-center space-x-2">
                      <img
                        src={settings.heroImage}
                        alt="Hero preview"
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                      <span className="text-green-400 text-sm">✓ Загружено</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={settings.heroImage}
                  onChange={(e) => updateSettings('heroImage', e.target.value)}
                  placeholder="Или введите URL изображения"
                  className="mt-2 w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-white/70 mb-2">{t.fields.logo}</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logo', e)}
                    className="hidden"
                    id="logoUpload"
                  />
                  <label
                    htmlFor="logoUpload"
                    className="btn-secondary px-4 py-2 cursor-pointer"
                  >
                    {uploading.logo ? t.buttons.uploading : t.buttons.upload}
                  </label>
                  {settings.logo && (
                    <div className="flex items-center space-x-2">
                      <img
                        src={settings.logo}
                        alt="Logo preview"
                        className="w-20 h-16 object-contain rounded-lg bg-white/10"
                      />
                      <span className="text-green-400 text-sm">✓ Загружено</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={settings.logo}
                  onChange={(e) => updateSettings('logo', e.target.value)}
                  placeholder="Или введите URL логотипа"
                  className="mt-2 w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 mb-2">{t.fields.primaryColor}</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      className="w-12 h-12 rounded-lg border border-white/10"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      className="flex-1 px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">{t.fields.secondaryColor}</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings('secondaryColor', e.target.value)}
                      className="w-12 h-12 rounded-lg border border-white/10"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings('secondaryColor', e.target.value)}
                      className="flex-1 px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-white/70 mb-2">{t.fields.metaTitle}</label>
                <input
                  type="text"
                  value={settings.seoSettings.metaTitle || ''}
                  onChange={(e) => updateNestedSettings('seoSettings', 'metaTitle', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-white/70 mb-2">{t.fields.metaDescription}</label>
                <textarea
                  value={settings.seoSettings.metaDescription || ''}
                  onChange={(e) => updateNestedSettings('seoSettings', 'metaDescription', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-2">{t.fields.metaKeywords}</label>
                <input
                  type="text"
                  value={settings.seoSettings.metaKeywords || ''}
                  onChange={(e) => updateNestedSettings('seoSettings', 'metaKeywords', e.target.value)}
                  placeholder="ключевое слово, еще одно, другое"
                  className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 mb-2">{t.fields.telegram}</label>
                  <input
                    type="url"
                    value={settings.socialLinks.telegram || ''}
                    onChange={(e) => updateNestedSettings('socialLinks', 'telegram', e.target.value)}
                    placeholder="https://t.me/yourusername"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">{t.fields.vk}</label>
                  <input
                    type="url"
                    value={settings.socialLinks.vk || ''}
                    onChange={(e) => updateNestedSettings('socialLinks', 'vk', e.target.value)}
                    placeholder="https://vk.com/yourpage"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">{t.fields.youtube}</label>
                  <input
                    type="url"
                    value={settings.socialLinks.youtube || ''}
                    onChange={(e) => updateNestedSettings('socialLinks', 'youtube', e.target.value)}
                    placeholder="https://youtube.com/c/yourchannel"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 mb-2">{t.fields.github}</label>
                  <input
                    type="url"
                    value={settings.socialLinks.github || ''}
                    onChange={(e) => updateNestedSettings('socialLinks', 'github', e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-8 pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t.buttons.saving : t.buttons.save}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
} 