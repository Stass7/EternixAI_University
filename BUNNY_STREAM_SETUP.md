# Настройка Bunny Stream для EternixAI University

## 1. Создание аккаунта Bunny.net

1. Зарегистрируйтесь на [bunny.net](https://bunny.net)
2. Активируйте аккаунт и войдите в панель управления

## 2. Создание Stream Zone

1. В панели управления перейдите в **Stream**
2. Нажмите **Create Stream Zone**
3. Заполните данные:
   - **Name**: `eternixai-university-videos`
   - **Region**: Выберите ближайший к вашим пользователям регион
   - **Storage Zone**: Создайте новую или используйте существующую

## 3. Настройка безопасности

1. В настройках Stream Zone перейдите в **Security**
2. Включите **Token Authentication**
3. Установите **Security Key** (сохраните его!)
4. Включите **Referer restriction** и добавьте ваш домен

## 4. Получение API ключей

1. Перейдите в **Account** → **API Keys**
2. Создайте новый API ключ с правами:
   - Stream API Read
   - Stream API Write
3. Сохраните API ключ

## 5. Переменные окружения

Добавьте в ваш `.env.local` файл:

```env
# Bunny Stream Configuration
BUNNY_STREAM_API_KEY=your_api_key_here
BUNNY_STREAM_LIBRARY_ID=your_library_id_here
BUNNY_STREAM_CDN_HOSTNAME=your_cdn_hostname_here
BUNNY_STREAM_PULL_ZONE=your_pull_zone_here
BUNNY_STREAM_SECURITY_KEY=your_security_key_here
```

### Где найти эти значения:

- **API_KEY**: Account → API Keys
- **LIBRARY_ID**: Stream → вашу Stream Zone → ID в URL
- **CDN_HOSTNAME**: Stream → вашу Stream Zone → CDN Hostname
- **PULL_ZONE**: Stream → вашу Stream Zone → Pull Zone
- **SECURITY_KEY**: Stream → вашу Stream Zone → Security → Security Key

## 6. Загрузка видео

### Через API (программно):

```bash
# 1. Создать видео
curl -X POST "https://video.bunnycdn.com/library/{LIBRARY_ID}/videos" \
  -H "AccessKey: {API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Урок 1: Введение"}'

# 2. Получить видео ID из ответа
# 3. Загрузить видео файл
curl -X PUT "https://video.bunnycdn.com/library/{LIBRARY_ID}/videos/{VIDEO_ID}" \
  -H "AccessKey: {API_KEY}" \
  -T "video_file.mp4"
```

### Через админ-панель:

1. В админ-панели создайте урок
2. Получите Video ID от Bunny Stream
3. Введите Video ID в поле "Bunny Stream Video ID"

## 7. Тестирование

1. Создайте тестовый курс в админ-панели
2. Добавьте урок с Bunny Video ID
3. Проверьте воспроизведение для:
   - Пользователей с доступом
   - Пользователей без доступа
   - Администраторов

## 8. Мониторинг

- Статистика просмотров: Stream Zone → Analytics
- Использование трафика: Billing → Usage
- Стоимость: ~$1 за 1000 минут просмотра

## Преимущества Bunny Stream:

✅ **Безопасность**: Токены с истечением срока действия
✅ **Скорость**: Глобальная CDN сеть
✅ **Качество**: Адаптивное качество видео
✅ **Цена**: Pay-as-you-go модель
✅ **Защита**: Domain restrictions и watermarks
✅ **Аналитика**: Детальная статистика просмотров 