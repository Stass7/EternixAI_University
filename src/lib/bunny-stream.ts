import crypto from 'crypto'

// Интерфейсы для Bunny Stream
export interface BunnyVideo {
  videoId: string
  videoLibraryId: string
  title: string
  thumbnailUrl?: string
  duration?: number
  status: 'uploading' | 'processing' | 'ready' | 'error'
}

export interface BunnyStreamConfig {
  apiKey: string
  libraryId: string
  cdnHostname: string
  pullZone: string
}

// Конфигурация Bunny Stream
export const bunnyConfig: BunnyStreamConfig = {
  apiKey: process.env.BUNNY_STREAM_API_KEY || '',
  libraryId: process.env.BUNNY_STREAM_LIBRARY_ID || '',
  cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME || '',
  pullZone: process.env.BUNNY_STREAM_PULL_ZONE || ''
}

// Генерация подписанного токена для защищённого доступа
export function generateSignedToken(
  videoId: string, 
  expiresInMinutes: number = 60,
  securityKey: string = process.env.BUNNY_STREAM_SECURITY_KEY || ''
): string {
  const expires = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60)
  const hashableBase = `${securityKey}${videoId}${expires}`
  
  const hash = crypto
    .createHash('sha256')
    .update(hashableBase)
    .digest('hex')
  
  return `${hash}${expires}`
}

// Генерация защищённого URL для видео
export function generateSecureVideoUrl(
  videoId: string,
  hasAccess: boolean,
  expiresInMinutes: number = 60
): string | null {
  if (!hasAccess || !videoId) return null
  
  const token = generateSignedToken(videoId, expiresInMinutes)
  const { cdnHostname, libraryId } = bunnyConfig
  
  return `https://${cdnHostname}/${libraryId}/${videoId}/playlist.m3u8?token=${token}`
}

// Получение URL превью/постера
export function getBunnyThumbnailUrl(videoId: string): string {
  const { cdnHostname, libraryId } = bunnyConfig
  return `https://${cdnHostname}/${libraryId}/${videoId}/thumbnail.jpg`
}

// API методы для работы с Bunny Stream
export class BunnyStreamAPI {
  private apiKey: string
  private libraryId: string
  private baseUrl = 'https://video.bunnycdn.com'

  constructor(apiKey: string, libraryId: string) {
    this.apiKey = apiKey
    this.libraryId = libraryId
  }

  // Создание нового видео
  async createVideo(title: string): Promise<{ guid: string; libraryId: string }> {
    const response = await fetch(`${this.baseUrl}/library/${this.libraryId}/videos`, {
      method: 'POST',
      headers: {
        'AccessKey': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    })

    if (!response.ok) {
      throw new Error(`Failed to create video: ${response.statusText}`)
    }

    return response.json()
  }

  // Получение информации о видео
  async getVideo(videoId: string): Promise<BunnyVideo> {
    const response = await fetch(`${this.baseUrl}/library/${this.libraryId}/videos/${videoId}`, {
      headers: {
        'AccessKey': this.apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get video: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      videoId: data.guid,
      videoLibraryId: data.videoLibraryId.toString(),
      title: data.title,
      thumbnailUrl: getBunnyThumbnailUrl(data.guid),
      duration: data.length,
      status: this.mapStatus(data.status)
    }
  }

  // Удаление видео
  async deleteVideo(videoId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/library/${this.libraryId}/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'AccessKey': this.apiKey
      }
    })

    return response.ok
  }

  // Получение URL для загрузки видео
  async getUploadUrl(videoId: string): Promise<string> {
    return `${this.baseUrl}/library/${this.libraryId}/videos/${videoId}`
  }

  private mapStatus(status: number): BunnyVideo['status'] {
    switch (status) {
      case 0: return 'uploading'
      case 1: return 'processing' 
      case 2: return 'ready'
      case 3: return 'error'
      default: return 'error'
    }
  }
}

// Экспорт настроенного экземпляра API
export const bunnyStreamAPI = new BunnyStreamAPI(
  bunnyConfig.apiKey,
  bunnyConfig.libraryId
) 