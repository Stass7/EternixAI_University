import mongoose, { Schema, Document } from 'mongoose'

// Интерфейс для типизации настроек сайта
export interface ISiteSettings extends Document {
  siteName: string;
  siteDescription: string;
  heroImage: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  language: 'ru' | 'en';
  contactEmail: string;
  socialLinks: {
    telegram?: string;
    vk?: string;
    youtube?: string;
    github?: string;
  };
  seoSettings: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Схема настроек сайта
const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { 
      type: String, 
      required: true,
      default: 'EternixAI University',
      trim: true,
    },
    siteDescription: { 
      type: String, 
      required: true,
      default: 'Образовательная платформа с видео-уроками',
      trim: true,
    },
    heroImage: { 
      type: String, 
      default: '/images/hero-image.jpg',
    },
    logo: { 
      type: String, 
      default: '/images/logo.png',
    },
    primaryColor: { 
      type: String, 
      default: '#0ea5e9', // primary-500
    },
    secondaryColor: { 
      type: String, 
      default: '#64748b', // slate-500
    },
    language: {
      type: String,
      enum: ['ru', 'en'],
      default: 'ru',
    },
    contactEmail: {
      type: String,
      default: 'info@eternixai.university',
      trim: true,
      lowercase: true,
    },
    socialLinks: {
      telegram: String,
      vk: String,
      youtube: String,
      github: String,
    },
    seoSettings: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: String,
    }
  },
  { 
    timestamps: true,
  }
)

// Проверка существования модели
const SiteSettings = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema)

export default SiteSettings 