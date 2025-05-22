import mongoose, { Schema, Document } from 'mongoose'

// Интерфейс для типизации модели пользователя
export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  image?: string;
  role: 'user' | 'admin';
  favorites: mongoose.Types.ObjectId[];
  coursesOwned: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Схема пользователя
const UserSchema = new Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { 
      type: String, 
      required: true,
      trim: true,
    },
    password: { 
      type: String,
      select: false, // Не возвращать пароль по умолчанию при запросах
    },
    image: { 
      type: String,
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'],
      default: 'user', 
    },
    favorites: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Course',
    }],
    coursesOwned: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Course',
    }],
  },
  { 
    timestamps: true, // Автоматически добавлять createdAt и updatedAt
  }
)

// Проверка существования модели для избежания повторного определения при горячей перезагрузке
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User 