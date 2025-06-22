export interface BirthdayNotificationSettings {
  // За сколько дней до дня рождения отправлять уведомления
  daysBefore: number[];
  // Время отправки уведомления (часы, минуты)
  time: {
    hours: number;
    minutes: number;
  };
  // Включены ли уведомления
  enabled: boolean;
}

export interface BirthdayNotification {
  id: string;
  personId: string;
  personName: string;
  birthday: string;
  notificationDate: string; // Дата когда должно прийти уведомление
  daysBefore: number; // За сколько дней до дня рождения
  scheduled: boolean; // Запланировано ли уведомление
  createdAt: string;
}

export interface NotificationService {
  // Инициализация сервиса
  initialize(): Promise<void>;

  // Планирование уведомлений для конкретного человека
  schedulePersonNotifications(personId: string, name: string, birthday: string): Promise<void>;

  // Отмена уведомлений для конкретного человека
  cancelPersonNotifications(personId: string): Promise<void>;

  // Обновление уведомлений для конкретного человека
  updatePersonNotifications(personId: string, name: string, birthday: string): Promise<void>;

  // Получение всех запланированных уведомлений
  getScheduledNotifications(): Promise<BirthdayNotification[]>;

  // Обновление настроек уведомлений
  updateSettings(settings: BirthdayNotificationSettings): Promise<void>;

  // Получение текущих настроек
  getSettings(): Promise<BirthdayNotificationSettings>;

  // Проверка разрешений на уведомления
  checkPermissions(): Promise<boolean>;

  // Запрос разрешений на уведомления
  requestPermissions(): Promise<boolean>;
}
