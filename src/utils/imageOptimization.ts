// Утилита для оптимизации изображений перед сохранением в MongoDB
export interface OptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

// Функция для сжатия и оптимизации изображения
export async function optimizeImage(
  file: File, 
  options: OptimizationOptions = {}
): Promise<string> {
  const {
    maxWidth = 1600,
    maxHeight = 900,
    quality = 0.8,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Вычисляем новые размеры с сохранением пропорций
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height
        
        if (width > height) {
          width = maxWidth
          height = width / aspectRatio
        } else {
          height = maxHeight
          width = height * aspectRatio
        }
      }

      // Устанавливаем размеры canvas
      canvas.width = width
      canvas.height = height

      // Рисуем оптимизированное изображение
      ctx?.drawImage(img, 0, 0, width, height)

      // Конвертируем в data URL с заданным качеством
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const dataUrl = canvas.toDataURL(mimeType, quality)

      resolve(dataUrl)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Загружаем изображение из файла
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}

// Функция для получения размера Base64 строки в KB
export function getBase64Size(dataUrl: string): number {
  // Удаляем префикс data URL
  const base64String = dataUrl.split(',')[1]
  // Вычисляем размер (Base64 увеличивает размер на ~33%)
  const sizeInBytes = (base64String.length * 3) / 4
  return Math.round(sizeInBytes / 1024)
}

// Проверка поддержки браузером Canvas API
export function isCanvasSupported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext && canvas.getContext('2d'))
  } catch {
    return false
  }
} 