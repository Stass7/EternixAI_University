/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  // Отключаем автоматическую генерацию статических страниц ошибок
  generateEtags: false,
  poweredByHeader: false,
  // Отключаем статическую оптимизацию для отладки
  output: 'standalone',
  trailingSlash: false,
}

module.exports = nextConfig 