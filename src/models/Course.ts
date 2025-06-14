import mongoose, { Schema, Document } from 'mongoose'

// Интерфейс для типизации урока
interface ILesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string; // Legacy YouTube URL (для обратной совместимости)
  bunnyVideoId?: string; // Bunny Stream Video ID
  duration?: number; // в минутах
  order: number;
  isNewLesson: boolean; // Метка "новый урок" (переименовано)
  newUntil: Date; // До какой даты считается новым
}

const LessonSchema = new Schema({
  id: { 
    type: String, 
    required: true,
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  videoUrl: { 
    type: String, 
    default: '',
  },
  bunnyVideoId: {
    type: String,
    default: '',
  },
  duration: { 
    type: Number, 
    default: 0,
  },
  order: { 
    type: Number, 
    required: true,
  },
  isNewLesson: {
    type: Boolean,
    default: true,
  },
  newUntil: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
  }
})

// Интерфейс для типизации модели курса
export interface ICourse extends Document {
  title: string;
  description: string;
  language: 'ru' | 'en'; // Язык курса
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  lessons: ILesson[];
  published: boolean; // Статус публикации
  featured: boolean; // Рекомендуемый
  isNewCourse: boolean; // Метка "новый курс" (переименовано)
  newUntil: Date; // До какой даты считается новым
  publishedAt: Date | null; // Дата публикации
  createdAt: Date;
  updatedAt: Date;
  isStillNew: boolean; // Виртуальное поле
}

// Схема курса - убираем дженерик чтобы избежать конфликтов типизации
const CourseSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true,
    },
    description: { 
      type: String, 
      required: true,
    },
    language: {
      type: String,
      enum: ['ru', 'en'],
      required: true,
      default: 'ru',
    },
    category: { 
      type: String, 
      required: true,
    },
    price: { 
      type: Number, 
      required: true,
      min: 0,
    },
    originalPrice: { 
      type: Number, 
      required: true,
      min: 0,
    },
    discount: { 
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    imageUrl: { 
      type: String, 
      default: '/images/course-placeholder.jpg',
    },
    lessons: [LessonSchema],
    published: { 
      type: Boolean, 
      default: false, // По умолчанию черновик
    },
    featured: { 
      type: Boolean, 
      default: false,
    },
    isNewCourse: {
      type: Boolean,
      default: true,
    },
    newUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
    },
    publishedAt: {
      type: Date,
      default: null,
    }
  },
  { 
    timestamps: true,
  }
)

// Middleware для автоматического обновления publishedAt при публикации
CourseSchema.pre('save', function(next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

// Виртуальное поле для проверки истечения срока "новый"
CourseSchema.virtual('isStillNew').get(function() {
  if (!this.isNewCourse || !this.newUntil) return false
  return this.newUntil > new Date()
})

// Убеждаемся что виртуальные поля включены в JSON
CourseSchema.set('toJSON', { virtuals: true })
CourseSchema.set('toObject', { virtuals: true })

// Проверка существования модели
const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)

export default Course 