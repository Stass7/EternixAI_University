import mongoose, { Schema, Document } from 'mongoose'

// Интерфейс для типизации урока
interface ILesson {
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // в минутах
  order: number;
}

const LessonSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
  },
  description: { 
    type: String, 
    required: true,
  },
  videoUrl: { 
    type: String, 
    required: true,
  },
  duration: { 
    type: Number, 
    required: true,
  },
  order: { 
    type: Number, 
    required: true,
  },
})

// Интерфейс для типизации модели курса
export interface ICourse extends Document {
  title: { [key: string]: string }; // Мультиязычность: { ru: 'Название', en: 'Title' }
  slug: string;
  description: { [key: string]: string };
  category: string;
  price: number;
  discount?: number;
  coverImage: string;
  lessons: ILesson[];
  published: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Схема курса
const CourseSchema = new Schema<ICourse>(
  {
    title: { 
      type: Map,
      of: String,
      required: true,
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { 
      type: Map,
      of: String,
      required: true,
    },
    category: { 
      type: String, 
      required: true,
    },
    price: { 
      type: Number, 
      required: true,
    },
    discount: { 
      type: Number,
      default: 0,
    },
    coverImage: { 
      type: String, 
      required: true,
    },
    lessons: [LessonSchema],
    published: { 
      type: Boolean, 
      default: false,
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
  },
  { 
    timestamps: true,
  }
)

// Проверка существования модели
const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)

export default Course 