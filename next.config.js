/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
    // Разрешаем Base64 изображения (data URLs) для MongoDB хранения
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Поддержка data URLs для Base64 изображений из MongoDB
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https', 
        hostname: 'img.youtube.com',
      }
    ],
  },
}

module.exports = nextConfig 