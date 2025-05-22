import Link from 'next/link'

type FooterProps = {
  locale: string
}

export default function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = [
    { 
      title: locale === 'ru' ? 'О нас' : 'About',
      links: [
        { label: locale === 'ru' ? 'О платформе' : 'About platform', href: `/${locale}/about` },
        { label: locale === 'ru' ? 'Команда' : 'Team', href: `/${locale}/team` },
        { label: locale === 'ru' ? 'Контакты' : 'Contact', href: `/${locale}/contact` },
      ]
    },
    {
      title: locale === 'ru' ? 'Курсы' : 'Courses',
      links: [
        { label: locale === 'ru' ? 'Все курсы' : 'All courses', href: `/${locale}/courses` },
        { label: locale === 'ru' ? 'Тарифы' : 'Pricing', href: `/${locale}/pricing` },
        { label: locale === 'ru' ? 'Промокоды' : 'Promo codes', href: `/${locale}/promocodes` },
      ]
    },
    {
      title: locale === 'ru' ? 'Поддержка' : 'Support',
      links: [
        { label: locale === 'ru' ? 'Помощь' : 'Help', href: `/${locale}/help` },
        { label: locale === 'ru' ? 'FAQ' : 'FAQ', href: `/${locale}/faq` },
        { label: locale === 'ru' ? 'Обратная связь' : 'Feedback', href: `/${locale}/feedback` },
      ]
    }
  ]

  return (
    <footer className="bg-dark-400 border-t border-white/10">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="text-xl font-bold text-white">
              EternixAI <span className="text-primary-500">University</span>
            </Link>
            <p className="mt-4 text-white/60 text-sm">
              {locale === 'ru' 
                ? 'Образовательная платформа с видео-уроками для успешного обучения'
                : 'Educational platform with video lessons for successful learning'}
            </p>
          </div>
          
          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-medium mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/60 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            © {currentYear} EternixAI University. {locale === 'ru' ? 'Все права защищены' : 'All rights reserved'}.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href={`/${locale}/privacy`} className="text-white/60 hover:text-white text-sm transition-colors">
              {locale === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
            </Link>
            <Link href={`/${locale}/terms`} className="text-white/60 hover:text-white text-sm transition-colors">
              {locale === 'ru' ? 'Условия использования' : 'Terms of Service'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 