import mongoose, { Schema, Document } from 'mongoose'

// Интерфейс для типизации модели заказа
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amount: number; // сумма в копейках/центах
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  promoCodeId?: mongoose.Types.ObjectId;
  discountAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Схема заказа
const OrderSchema = new Schema<IOrder>(
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
    stripeSessionId: { 
      type: String,
      required: true,
      unique: true,
    },
    stripePaymentIntentId: { 
      type: String,
    },
    amount: { 
      type: Number,
      required: true,
    },
    currency: { 
      type: String,
      required: true,
      default: 'rub',
    },
    status: { 
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    promoCodeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'PromoCode',
    },
    discountAmount: { 
      type: Number,
      default: 0,
    },
    refundReason: { 
      type: String,
    },
    refundedAt: { 
      type: Date,
    },
    completedAt: { 
      type: Date,
    },
  },
  { 
    timestamps: true,
  }
)

// Индексы для быстрого поиска
OrderSchema.index({ userId: 1, status: 1 })
OrderSchema.index({ courseId: 1 })
OrderSchema.index({ stripeSessionId: 1 })

// Проверка существования модели
const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

export default Order 