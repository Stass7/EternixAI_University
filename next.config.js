/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  // Отключаем статическую генерацию для отладки
  trailingSlash: false,
  generateEtags: false,
  // Принудительно отключаем статическую генерацию для проблемных страниц
  experimental: {
    forceSwcTransforms: true,
  },
  // Отключаем генерацию статических ошибочных страниц
  output: 'standalone',
}

module.exports = nextConfig 