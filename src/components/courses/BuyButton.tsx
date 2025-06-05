'use client'

import { useState } from 'react'

interface BuyButtonProps {
  courseId: string
  courseTitle: string
  price: number
  locale: string
}

export default function BuyButton({ courseId, courseTitle, price, locale }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currency, setCurrency] = useState<'usd' | 'eur'>('usd')

  const handlePurchase = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Перенаправляем на Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Purchase error:', error)
      setError(error instanceof Error ? error.message : 'Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: 'usd' | 'eur') => {
    if (currency === 'eur') {
      return `€${price}`
    }
    return `$${price}`
  }

  const translations = {
    ru: {
      buyButton: 'Купить курс за',
      loading: 'Обработка...',
      error: 'Ошибка при покупке. Попробуйте снова.',
      currency: 'Валюта:',
    },
    en: {
      buyButton: 'Buy Course for',
      loading: 'Processing...',
      error: 'Purchase failed. Please try again.',
      currency: 'Currency:',
    }
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  return (
    <div>
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}
      
      {/* Currency selector */}
      <div className="mb-4">
        <label className="block text-white/80 text-sm font-medium mb-2">
          {t.currency}
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as 'usd' | 'eur')}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
        >
          <option value="usd">USD ($)</option>
          <option value="eur">EUR (€)</option>
        </select>
      </div>
      
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t.loading}
          </div>
        ) : (
          `💎 ${t.buyButton} ${formatPrice(price, currency)}`
        )}
      </button>
    </div>
  )
} 