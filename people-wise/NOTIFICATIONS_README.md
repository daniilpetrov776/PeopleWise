# Система уведомлений о днях рождения

## Обзор

Система уведомлений позволяет автоматически отправлять напоминания о днях рождения людей из базы данных. Уведомления работают локально на устройстве без необходимости backend-сервера.

**⚠️ Важно:** Эта система требует development build, так как использует нативные модули, которые не поддерживаются в Expo Go.

## Возможности

- ✅ Автоматические уведомления за месяц, неделю, день и в день рождения
- ✅ Настраиваемое время отправки уведомлений
- ✅ Работа в фоновом режиме и при закрытом приложении
- ✅ Автоматическое планирование при добавлении/изменении/удалении людей
- ✅ Локальное хранение настроек и запланированных уведомлений
- ✅ Поддержка Android и iOS
- ✅ Автоматическая очистка прошедших уведомлений

## Требования

- Development build (не Expo Go)
- `expo-notifications`
- `expo-crypto`
- `expo-dev-client`

## Архитектура

### Основные компоненты:

1. **`BirthdayNotificationService`** - основной сервис для управления уведомлениями
2. **`notificationsRepository`** - репозиторий для работы с базой данных уведомлений
3. **Redux slice** - управление состоянием уведомлений
4. **Middleware** - автоматическое планирование уведомлений при изменении данных

### База данных:

- `birthday_notifications` - таблица запланированных уведомлений
- `notification_settings` - таблица настроек уведомлений

## Настройки по умолчанию

```typescript
{
  daysBefore: [30, 7, 1, 0], // За месяц, неделю, день и в день рождения
  time: { hours: 9, minutes: 0 }, // В 9:00
  enabled: true
}
```

## Создание Development Build

### 1. Установка зависимостей

```bash
npx expo install expo-dev-client expo-notifications expo-crypto
```

### 2. Создание build

```bash
# Для Android
npx eas build --platform android --profile development

# Для iOS
npx eas build --platform ios --profile development
```

### 3. Установка на устройство

После создания build установите APK/IPA на ваше устройство.

## Использование

### Инициализация

Система автоматически инициализируется при запуске приложения:

```typescript
// В app.tsx
await initNotificationsDB();
dispatch(initializeNotifications());
```

### Планирование уведомлений

Уведомления автоматически планируются при:
- Добавлении нового человека с днем рождения
- Изменении дня рождения существующего человека
- Удалении человека (отмена уведомлений)

### Ручное управление

```typescript
import { birthdayNotificationService } from '@/services/birthday-notification-service';

// Планирование уведомлений для конкретного человека
await birthdayNotificationService.schedulePersonNotifications(
  personId, 
  name, 
  birthday
);

// Отмена уведомлений
await birthdayNotificationService.cancelPersonNotifications(personId);

// Обновление настроек
await birthdayNotificationService.updateSettings({
  daysBefore: [7, 1, 0],
  time: { hours: 10, minutes: 30 },
  enabled: true
});

// Очистка прошедших уведомлений
await birthdayNotificationService.cleanupPastNotifications();
```

### Redux интеграция

```typescript
import { useAppDispatch, useAppSelector } from '@/hooks/store.hooks';
import { 
  getHasNotificationPermissions,
  getNotificationSettings 
} from '@/store/notifications/selectors';
import { 
  requestNotificationPermissions,
  updateNotificationSettings 
} from '@/store/notifications/notifications';

const dispatch = useAppDispatch();
const hasPermissions = useAppSelector(getHasNotificationPermissions);
const settings = useAppSelector(getNotificationSettings);

// Запрос разрешений
dispatch(requestNotificationPermissions());

// Обновление настроек
dispatch(updateNotificationSettings(newSettings));
```

## Разрешения

### Android
- `SCHEDULE_EXACT_ALARM` - для точного планирования уведомлений
- `POST_NOTIFICATIONS` - для отправки уведомлений (Android 13+)

### iOS
- Разрешения запрашиваются автоматически через `expo-notifications`

## Тестирование

Компонент `NotificationTest` позволяет:
- Проверить статус разрешений
- Запросить разрешения на уведомления
- Отправить тестовое уведомление
- Просмотреть запланированные уведомления
- Очистить прошедшие уведомления

## Структура файлов

```
services/
  birthday-notification-service.ts    # Основной сервис
data-base/
  notifications-db.ts                 # База данных уведомлений
store/
  notifications/
    notifications.ts                  # Redux slice
    selectors.ts                     # Селекторы
  notifications-middleware.ts        # Middleware для автоматизации
hooks/
  use-notifications.ts               # Хук для работы с уведомлениями
components/
  notification-test/
    notification-test.tsx            # Компонент тестирования
types/
  notifications.ts                   # Типы для уведомлений
```

## Настройка для разработки

1. Установите зависимости:
```bash
npx expo install expo-dev-client expo-notifications expo-crypto
```

2. Добавьте в `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

3. Для Android добавьте в `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## Ограничения

- Требует development build (не работает в Expo Go)
- На iOS фоновые задачи ограничены системой
- На Android точные уведомления могут быть ограничены оптимизацией батареи
- Уведомления работают только при установленном приложении

## Отладка

Логи системы уведомлений:
- `[NOTIFICATIONS]` - основные операции
- `[NOTIFICATIONS DB ERROR]` - ошибки базы данных
- `[Notifications Middleware]` - автоматическое планирование

## Будущие улучшения

- [ ] Настройка звуков уведомлений
- [ ] Повторяющиеся уведомления
- [ ] Группировка уведомлений
- [ ] Действия в уведомлениях (открыть карточку человека)
- [ ] Экспорт/импорт настроек
- [ ] Фоновые задачи для автоматической синхронизации
