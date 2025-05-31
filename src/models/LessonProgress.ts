import mongoose, { Schema, Document } from 'mongoose'

// Интерфейс для типизации модели прогресса урока
export interface ILessonProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId: string; // ID урока внутри курса
  completed: boolean;
  watchTime: number; // время просмотра в секундах
  completedAt?: Date;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Схема прогресса урока
const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
    courseId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Course',
      required: true,
    },
    lessonId: { 
      type: String,
      required: true,
    },
    completed: { 
      type: Boolean, 
      default: false,
    },
    watchTime: { 
      type: Number, 
      default: 0,
    },
    completedAt: { 
      type: Date,
    },
    lastWatchedAt: { 
      type: Date, 
      default: Date.now,
    },
  },
  { 
    timestamps: true,
  }
)

// Составной индекс для уникальности записи прогресса
LessonProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true })

// Проверка существования модели
const LessonProgress = mongoose.models.LessonProgress || mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema)

export default LessonProgress 