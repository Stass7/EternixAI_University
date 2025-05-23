# EternixAI University

Образовательная веб-платформа для размещения видео-уроков с современным минималистичным дизайном в темной цветовой гамме.

## Основной функционал

- Система аутентификации пользователей (регистрация, вход, восстановление пароля)
- Доступ к курсам через покупку или ввод промокода
- Личный кабинет пользователя
- Избранные и сохраненные курсы
- Поиск с фильтрами и категориями
- Административная панель для управления контентом
- Интеграция с платежной системой Stripe
- Двуязычность (русский и английский)

## Технический стек

- **Frontend**: React с TypeScript и Tailwind CSS
- **Backend**: Next.js (App Router)
- **База данных**: MongoDB + Mongoose
- **Аутентификация**: NextAuth.js
- **Платежи**: Stripe
- **Анимации**: Framer Motion
- **Хостинг**: Render
- **Хранение видео**: YouTube

## Начало работы

### Предварительные требования

- Node.js 18.x или выше
- MongoDB (локальная или облачная)
- Аккаунт на Render для деплоя

### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/eternixai-university.git
cd eternixai-university
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env.local` в корне проекта и заполните переменные окружения:
```
# Основные URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# База данных
MONGODB_URI=mongodb+srv://stanislavsk1981:1CPHQ1urihrXBbqz@clustereternixaiuniver.2z39gmp.mongodb.net/?retryWrites=true&w=majority&appName=ClusterEternixAIUniver

# Авторизация - NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth (опционально)
GITHUB_ID=
GITHUB_SECRET=

# Stripe (для платежей)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```
4. Запустите проект в режиме разработки:
```bash
npm run dev
```

5. Откройте [http://localhost:3000](http://localhost:3000) в браузере

### Создание администратора

1. Зарегистрируйтесь как обычный пользователь через интерфейс
2. Используйте MongoDB Compass или другой инструмент для изменения роли пользователя:
   ```js
   db.users.updateOne({ email: "ваш-email@example.com" }, { $set: { role: "admin" } })
   ```

## Деплой на Render

Для деплоя на Render используйте конфигурацию из файла `render.yaml`. 

Необходимо добавить в настройках проекта на Render все переменные окружения из списка в `render.yaml`.

## Структура проекта

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── ru/                 # Русская версия
│   │   ├── auth/           # Аутентификация
│   │   ├── admin/          # Админ-панель
│   │   ├── courses/        # Страницы курсов
│   │   ├── profile/        # Профиль пользователя
│   ├── en/                 # Английская версия
│   │   └── ...
├── components/             # UI компоненты
│   ├── ui/                 # Общие UI элементы
│   ├── layout/             # Компоненты макета
│   ├── auth/               # Компоненты аутентификации
│   ├── courses/            # Компоненты для курсов
│   ├── admin/              # Компоненты админ-панели
│   └── profile/            # Компоненты профиля
├── lib/                    # Библиотеки и утилиты
│   ├── db/                 # Подключение к базе данных
│   ├── auth/               # Настройки аутентификации
│   ├── stripe/             # Интеграция со Stripe
│   └── i18n/               # Локализация
├── models/                 # Mongoose модели
└── styles/                 # Глобальные стили
```

## Лицензия

[MIT](LICENSE) 
