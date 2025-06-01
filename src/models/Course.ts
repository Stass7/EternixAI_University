import mongoose, { Schema, Document } from 'mongoose'

// Интерфейс для типизации урока
interface ILesson {
  id: string;
  title: { ru: string; en: string };
  description?: { ru: string; en: string };
  videoUrl?: string;
  duration?: number; // в минутах
  order: number;
}

const LessonSchema = new Schema({
  id: { 
    type: String, 
    required: true,
  },
  title: { 
    ru: { type: String, required: true },
    en: { type: String, required: true }
  },
  description: {
    ru: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  videoUrl: { 
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
})

// Интерфейс для типизации модели курса
export interface ICourse extends Document {
  title: { ru: string; en: string };
  description: { ru: string; en: string };
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  lessons: ILesson[];
  published: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Схема курса
const CourseSchema = new Schema<ICourse>(
  {
    title: { 
      ru: { type: String, required: true },
      en: { type: String, required: true }
    },
    description: { 
      ru: { type: String, required: true },
      en: { type: String, required: true }
    },
    category: { 
      type: String, 
      required: true,
    },
    price: { 
      type: Number, 
      required: true,
    },
    originalPrice: { 
      type: Number, 
      required: true,
    },
    discount: { 
      type: Number,
      default: 0,
    },
    imageUrl: { 
      type: String, 
      default: '/images/course-placeholder.jpg',
    },
    lessons: [LessonSchema],
    published: { 
      type: Boolean, 
      default: false,
    },
    featured: { 
      type: Boolean, 
      default: false,
    },
  },
  { 
    timestamps: true,
  }
)

// Проверка существования модели
const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)

export default Course 