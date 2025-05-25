/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  // Отключаем статическую генерацию для отладки
  trailingSlash: false,
  generateEtags: false,
  // Настройки для внешних пакетов
  serverExternalPackages: [],
}

module.exports = nextConfig 