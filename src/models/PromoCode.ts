import mongoose, { Schema, Document } from 'mongoose'

// Интерфейс для типизации модели промокода
export interface IPromoCode extends Document {
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  courseId?: mongoose.Types.ObjectId; // если null - применяется ко всем курсам
  usedBy: mongoose.Types.ObjectId[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Схема промокода
const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountPercent: { 
      type: Number, 
      required: true,
      min: 1,
      max: 100,
    },
    maxUses: { 
      type: Number, 
      required: true,
      default: 1,
    },
    usedCount: { 
      type: Number, 
      default: 0,
    },
    expiresAt: { 
      type: Date, 
      required: true,
    },
    courseId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Course',
    },
    usedBy: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User',
    }],
    active: { 
      type: Boolean, 
      default: true,
    },
  },
  { 
    timestamps: true,
  }
)

// Проверка существования модели
const PromoCode = mongoose.models.PromoCode || mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema)

export default PromoCode 