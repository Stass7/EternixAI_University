import mongoose, { Schema, Document } from 'mongoose'

// Интерфейс для типизации модели активности пользователя
export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'login' | 'logout' | 'course_purchase' | 'lesson_start' | 'lesson_complete' | 'profile_update';
  details?: {
    courseId?: string;
    lessonId?: string;
    ip?: string;
    userAgent?: string;
    [key: string]: any;
  };
  timestamp: Date;
  createdAt: Date;
}

// Схема активности пользователя
const UserActivitySchema = new Schema<IUserActivity>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
    action: { 
      type: String,
      enum: ['login', 'logout', 'course_purchase', 'lesson_start', 'lesson_complete', 'profile_update'],
      required: true,
    },
    details: { 
      type: Schema.Types.Mixed,
    },
    timestamp: { 
      type: Date, 
      default: Date.now,
    },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Индексы для быстрого поиска
UserActivitySchema.index({ userId: 1, timestamp: -1 })
UserActivitySchema.index({ action: 1, timestamp: -1 })

// Проверка существования модели
const UserActivity = mongoose.models.UserActivity || mongoose.model<IUserActivity>('UserActivity', UserActivitySchema)

export default UserActivity 