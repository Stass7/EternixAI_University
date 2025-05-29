import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Получаем IP адрес сервера
    const ipResponse = await fetch('https://api.ipify.org?format=json')
    const ipData = await ipResponse.json()
    
    return NextResponse.json({
      serverIP: ipData.ip,
      timestamp: new Date().toISOString(),
      message: 'Добавьте этот IP адрес в MongoDB Atlas Network Access'
    })
  } catch (error) {
    console.error('Error getting server IP:', error)
    return NextResponse.json(
      { error: 'Failed to get server IP' },
      { status: 500 }
    )
  }
} 