import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import dayjs from 'dayjs';
import * as Crypto from 'expo-crypto';
import * as TaskManager from 'expo-task-manager';
import {
  NotificationService,
  BirthdayNotification,
  BirthdayNotificationSettings
} from '@/types/notifications';
import { notificationsRepository } from '@/data-base/notifications-db';
import { personRepository } from '@/data-base/db';

const NOTIFICATION_CHANNEL_ID = 'birthday-reminders';
const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

// Регистрируем фоновую задачу для обработки уведомлений
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
  if (error) {
    console.error('[NOTIFICATIONS] Background task error:', error);
    return;
  }

  console.log('[NOTIFICATIONS] Background task executed:', executionInfo);
  console.log('[NOTIFICATIONS] Background task data:', data);

  // Здесь можно добавить логику обработки уведомлений в фоне
  // Например, обновление базы данных, отправка аналитики и т.д.
});

// Функция для генерации UUID
const generateUUID = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  const hex = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');

  // Форматируем как UUID v4
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
};

// Функция для конвертации секунд в читаемый формат
const formatTimeFromSeconds = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} сек`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} мин`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return `${hours} ч ${remainingMinutes} мин`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days < 7) {
    return `${days} дн ${remainingHours} ч`;
  }

  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  return `${weeks} нед ${remainingDays} дн`;
};

class BirthdayNotificationService implements NotificationService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Настройка обработчика уведомлений
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          console.log('[NOTIFICATIONS] Notification handler called:', notification.request.content.title);

          // Динамически создаем сообщение на основе данных уведомления
          const data = notification.request.content.data as any;
          if (data && data.personName && data.daysBefore !== undefined) {
            const tempNotification: BirthdayNotification = {
              id: '',
              personId: data.personId || '',
              personName: data.personName,
              birthday: data.birthday || '',
              notificationDate: '',
              daysBefore: data.daysBefore,
              scheduled: false,
              createdAt: '',
            };

            const settings = await this.getSettings();
            const message = this.createNotificationMessage(tempNotification, settings);

            return {
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
              shouldShowBanner: true,
              shouldShowList: true,
              title: 'Напоминание о дне рождения',
              body: message,
            };
          }

          return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          };
        },
      });

      // Добавляем слушатели для уведомлений в фоне
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('[NOTIFICATIONS] Уведомление получено в фоне:', notification.request.content.title);
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('[NOTIFICATIONS] Пользователь нажал на уведомление:', response.notification.request.content.title);
        // Здесь можно добавить логику для навигации к конкретному человеку
        const data = response.notification.request.content.data as any;
        if (data && data.personId) {
          console.log('[NOTIFICATIONS] Переход к человеку с ID:', data.personId);
          // TODO: Добавить навигацию к человеку
        }
      });

      // Создание канала уведомлений для Android
      await this.createNotificationChannel();

      // Регистрируем фоновую задачу для обработки уведомлений
      await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

      // Автоматически запрашиваем разрешения и настройки для Android
      await this.requestOptimalPermissions();

      // Очищаем прошедшие уведомления и перепланируем их на следующий год
      await this.cleanupPastNotifications();

      this.isInitialized = true;
      console.log('[NOTIFICATIONS] Service initialized successfully with background support');
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to initialize service:', error);
      throw error;
    }
  }

  private async createNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Напоминания о днях рождения',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }
  }

  async schedulePersonNotifications(personId: string, name: string, birthday: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled) {
        console.log(`[NOTIFICATIONS DEBUG] Уведомления отключены для ${name}`);
        return;
      }

      // Отменяем старые уведомления для этого человека
      await this.cancelPersonNotifications(personId);

      const birthdayDate = dayjs(birthday);
      const currentDate = dayjs();

      console.log(`[NOTIFICATIONS DEBUG] Планирование уведомлений для ${name}:`);
      console.log(`[NOTIFICATIONS DEBUG] День рождения: ${birthdayDate.format('DD.MM.YYYY')}`);
      console.log(`[NOTIFICATIONS DEBUG] Текущая дата: ${currentDate.format('DD.MM.YYYY HH:mm:ss')}`);
      console.log(`[NOTIFICATIONS DEBUG] Настройки daysBefore: ${settings.daysBefore}`);
      console.log(`[NOTIFICATIONS DEBUG] Время уведомлений: ${settings.time.hours}:${settings.time.minutes}`);

      // Вычисляем следующий день рождения
      const nextBirthday = this.getNextBirthday(birthdayDate, currentDate);
      console.log(`[NOTIFICATIONS DEBUG] Следующий день рождения: ${nextBirthday.format('DD.MM.YYYY')}`);

      // Создаем уведомления для каждого дня из настроек
      for (let i = 0; i < settings.daysBefore.length; i++) {
        const daysBefore = settings.daysBefore[i];

        // Вычисляем дату уведомления (следующий день рождения минус количество дней)
        const notificationDate = nextBirthday.subtract(daysBefore, 'day');

        // Устанавливаем время уведомления с небольшой задержкой для каждого следующего уведомления
        // Это предотвращает конфликты между уведомлениями, планируемыми в одно время
        const baseNotificationTime = notificationDate
          .hour(settings.time.hours)
          .minute(settings.time.minutes)
          .second(0)
          .millisecond(0);

        // Добавляем небольшую задержку (i * 5 секунд) для предотвращения конфликтов
        const notificationTime = baseNotificationTime.add(i * 5, 'second');

        console.log(`[NOTIFICATIONS DEBUG] Обработка уведомления за ${daysBefore} дней (индекс ${i}):`);
        console.log(`[NOTIFICATIONS DEBUG] Дата уведомления: ${notificationDate.format('DD.MM.YYYY')}`);
        console.log(`[NOTIFICATIONS DEBUG] Базовое время уведомления: ${baseNotificationTime.format('DD.MM.YYYY HH:mm:ss')}`);
        console.log(`[NOTIFICATIONS DEBUG] Финальное время уведомления: ${notificationTime.format('DD.MM.YYYY HH:mm:ss')}`);
        console.log(`[NOTIFICATIONS DEBUG] Время уведомления после текущего? ${notificationTime.isAfter(currentDate)}`);

        // Планируем уведомления, если время еще не наступило
        if (notificationTime.isAfter(currentDate)) {
          console.log(`[NOTIFICATIONS DEBUG] Планируем уведомление на ${notificationTime.format('DD.MM.YYYY HH:mm:ss')}`);

          const notification: BirthdayNotification = {
            id: await generateUUID(),
            personId,
            personName: name,
            birthday,
            notificationDate: notificationTime.toISOString(),
            daysBefore,
            scheduled: false,
            createdAt: new Date().toISOString(),
          };

          // Сохраняем в базу данных
          await notificationsRepository.createNotification(notification);
          console.log(`[NOTIFICATIONS DEBUG] Уведомление сохранено в БД с ID: ${notification.id}`);

          // Планируем уведомление
          await this.scheduleNotification(notification);
        } else {
          console.log(`[NOTIFICATIONS DEBUG] Пропускаем уведомление за ${daysBefore} дней - время уже прошло (${notificationTime.format('HH:mm:ss')} < ${currentDate.format('HH:mm:ss')})`);
        }
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to schedule notifications for person:', error);
      throw error;
    }
  }

  // Метод для вычисления следующего дня рождения
  private getNextBirthday(birthdayDate: dayjs.Dayjs, currentDate: dayjs.Dayjs): dayjs.Dayjs {
    // Получаем месяц и день из даты дня рождения
    const birthMonth = birthdayDate.month();
    const birthDay = birthdayDate.date();

    // Создаем дату дня рождения в текущем году
    const thisYearBirthday = currentDate
      .year(currentDate.year())
      .month(birthMonth)
      .date(birthDay)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    console.log(`[NOTIFICATIONS DEBUG] getNextBirthday:`);
    console.log(`  📅 Исходная дата дня рождения: ${birthdayDate.format('DD.MM.YYYY')}`);
    console.log(`  📅 Текущая дата: ${currentDate.format('DD.MM.YYYY')}`);
    console.log(`  📅 День рождения в этом году: ${thisYearBirthday.format('DD.MM.YYYY')}`);
    console.log(`  📅 День рождения в этом году уже прошел? ${thisYearBirthday.isBefore(currentDate)}`);

    // Если день рождения в этом году уже прошел, планируем на следующий год
    if (thisYearBirthday.isBefore(currentDate)) {
      const nextYearBirthday = thisYearBirthday.add(1, 'year');
      console.log(`  📅 Планируем на следующий год: ${nextYearBirthday.format('DD.MM.YYYY')}`);
      return nextYearBirthday;
    }

    // Иначе планируем на этот год
    console.log(`  📅 Планируем на этот год: ${thisYearBirthday.format('DD.MM.YYYY')}`);
    return thisYearBirthday;
  }

  async cancelPersonNotifications(personId: string): Promise<void> {
    try {
      // Получаем все уведомления для этого человека
      const notifications = await notificationsRepository.getNotificationsByPersonId(personId);

      // Отменяем каждое уведомление
      for (const notification of notifications) {
        await this.cancelNotification(notification.id);
      }

      // Удаляем из базы данных
      await notificationsRepository.deleteNotificationsByPersonId(personId);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to cancel notifications for person:', error);
      throw error;
    }
  }

  async updatePersonNotifications(personId: string, name: string, birthday: string): Promise<void> {
    // Просто перепланируем уведомления
    await this.schedulePersonNotifications(personId, name, birthday);
  }

  async getScheduledNotifications(): Promise<BirthdayNotification[]> {
    try {
      return await notificationsRepository.getAllNotifications();
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to get scheduled notifications:', error);
      throw error;
    }
  }

  // Новый метод для получения всех запланированных уведомлений из системы
  async getAllScheduledSystemNotifications(): Promise<any[]> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`[NOTIFICATIONS] Всего запланировано в системе: ${scheduledNotifications.length}`);

      for (const notification of scheduledNotifications) {
        const trigger = notification.trigger as any;
        const triggerDate = trigger?.date ? new Date(trigger.date) : null;
        const triggerSeconds = trigger?.seconds || 0;

        console.log(`[NOTIFICATIONS] ID: ${notification.identifier}`);
        console.log(`  📝 Заголовок: ${notification.content.title}`);
        console.log(`  📄 Сообщение: ${notification.content.body}`);
        console.log(`  📅 Дата срабатывания: ${triggerDate ? triggerDate.toLocaleString() : 'N/A'}`);
        console.log(`  ⏱️  Через секунд: ${triggerSeconds}`);
        console.log(`  🔑 Данные:`, notification.content.data);
      }

      return scheduledNotifications;
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to get system scheduled notifications:', error);
      return [];
    }
  }

  async updateSettings(settings: BirthdayNotificationSettings): Promise<void> {
    try {
      await notificationsRepository.saveSettings(settings);

      // Если уведомления отключены, отменяем все запланированные
      if (!settings.enabled) {
        const notifications = await this.getScheduledNotifications();
        for (const notification of notifications) {
          await this.cancelNotification(notification.id);
        }
      } else {
        // Если включены, перепланируем все уведомления с новыми настройками
        await this.rescheduleAllNotifications();
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to update settings:', error);
      throw error;
    }
  }

  async getSettings(): Promise<BirthdayNotificationSettings> {
    try {
      const settings = await notificationsRepository.getSettings();
      if (!settings) {
        throw new Error('Settings not found');
      }
      return settings;
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to get settings:', error);
      throw error;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to check permissions:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to request permissions:', error);
      return false;
    }
  }

  private async scheduleNotification(notification: BirthdayNotification): Promise<void> {
    try {
      const notificationDate = dayjs(notification.notificationDate);
      const now = dayjs();

      // Вычисляем задержку в секундах
      const delaySeconds = Math.max(1, notificationDate.diff(now, 'second'));

      // Создаем уникальный идентификатор, включающий информацию о человеке и времени
      const uniqueIdentifier = `${notification.id}_${notification.personId}_${notification.daysBefore}`;

      // Планируем основное уведомление
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Напоминание о дне рождения',
          body: `День рождения у ${notification.personName}`, // Базовое сообщение, будет заменено в обработчике
          data: {
            personId: notification.personId,
            personName: notification.personName,
            daysBefore: notification.daysBefore,
            birthday: notification.birthday,
            notificationId: notification.id, // Добавляем ID уведомления в данные
          },
        },
        trigger: { type: 'timeInterval', seconds: delaySeconds, repeats: false } as unknown as Notifications.NotificationTriggerInput,
        identifier: uniqueIdentifier, // Используем уникальный идентификатор
      });

      // Для критически важных уведомлений (день рождения сегодня или завтра) добавляем дублирующие уведомления
      if (notification.daysBefore <= 1) {
        await this.scheduleBackupNotifications(notification, delaySeconds);
      }

      // Отмечаем как запланированное
      notification.scheduled = true;
      await notificationsRepository.updateNotification(notification);

      const timeUntilNotification = formatTimeFromSeconds(delaySeconds);
      console.log(`[NOTIFICATIONS] Запланировано уведомление для ${notification.personName}:`);
      console.log(`  📅 День рождения: ${dayjs(notification.birthday).format('DD.MM.YYYY')}`);
      console.log(`  ⏰ Уведомление: ${notificationDate.format('DD.MM.YYYY HH:mm')}`);
      console.log(`  📊 За ${notification.daysBefore} дней до дня рождения`);
      console.log(`  ⏱️  Через: ${timeUntilNotification}`);
      console.log(`  🆔 ID: ${notification.id}`);
      console.log(`  🔑 Уникальный идентификатор: ${uniqueIdentifier}`);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to schedule notification:', error);
      throw error;
    }
  }

  // Метод для планирования резервных уведомлений
  private async scheduleBackupNotifications(notification: BirthdayNotification, delaySeconds: number): Promise<void> {
    try {
      // Планируем резервное уведомление через 5 минут после основного
      const backupDelay = delaySeconds + 300; // +5 минут

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎂 Напоминание о дне рождения',
          body: `Сегодня день рождения у ${notification.personName}! Не забудьте поздравить!`,
          data: {
            personId: notification.personId,
            personName: notification.personName,
            daysBefore: notification.daysBefore,
            birthday: notification.birthday,
            notificationId: notification.id,
            isBackup: true,
          },
        },
        trigger: { type: 'timeInterval', seconds: backupDelay, repeats: false } as unknown as Notifications.NotificationTriggerInput,
        identifier: `${notification.id}_backup_${notification.personId}_${notification.daysBefore}`,
      });

      console.log(`[NOTIFICATIONS] Запланировано резервное уведомление для ${notification.personName} через ${formatTimeFromSeconds(backupDelay)}`);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to schedule backup notification:', error);
    }
  }

  private async cancelNotification(notificationId: string): Promise<void> {
    try {
      // Создаем уникальный идентификатор для отмены
      const uniqueIdentifier = `${notificationId}_*_*`;

      // Получаем все запланированные уведомления
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      // Находим и отменяем уведомления, которые начинаются с нашего ID
      for (const scheduled of scheduledNotifications) {
        if (scheduled.identifier.startsWith(notificationId + '_')) {
          await Notifications.cancelScheduledNotificationAsync(scheduled.identifier);
          console.log(`[NOTIFICATIONS] Cancelled notification: ${scheduled.identifier}`);
        }
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to cancel notification:', error);
    }
  }

  private createNotificationMessage(notification: BirthdayNotification, settings: BirthdayNotificationSettings): string {
    const { personName, daysBefore } = notification;

    if (daysBefore === 0) {
      return `Сегодня день рождения у ${personName}! 🎉`;
    } else if (daysBefore === 1) {
      return `Завтра день рождения у ${personName}! 🎂`;
    } else if (daysBefore === 7) {
      return `Через неделю день рождения у ${personName}! 📅`;
    } else if (daysBefore === 30) {
      return `Через месяц день рождения у ${personName}! 📆`;
    } else {
      // Правильное склонение для дней
      const dayWord = this.getDayWord(daysBefore);
      return `Через ${daysBefore} ${dayWord} день рождения у ${personName}! 📅`;
    }
  }

  private getDayWord(days: number): string {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'дней';
    }

    if (lastDigit === 1) {
      return 'день';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дня';
    } else {
      return 'дней';
    }
  }

  private async rescheduleAllNotifications(): Promise<void> {
    try {
      // Получаем всех людей из основной базы данных
      const people = await personRepository.getAll();

      // Перепланируем уведомления для каждого человека
      for (const person of people) {
        if (person.birthday) {
          await this.schedulePersonNotifications(
            person.id,
            person.name,
            person.birthday.toString()
          );
        }
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to reschedule all notifications:', error);
      throw error;
    }
  }

  // Метод для очистки прошедших уведомлений
  async cleanupPastNotifications(): Promise<void> {
    try {
      const notifications = await this.getScheduledNotifications();
      const currentDate = dayjs();
      const settings = await this.getSettings();

      if (!settings.enabled) {
        console.log('[NOTIFICATIONS] Уведомления отключены, пропускаем очистку');
        return;
      }

      console.log(`[NOTIFICATIONS] Проверяем ${notifications.length} уведомлений на прошедшие даты`);

      for (const notification of notifications) {
        const notificationDate = dayjs(notification.notificationDate);

        if (notificationDate.isBefore(currentDate)) {
          console.log(`[NOTIFICATIONS] Найдено прошедшее уведомление для ${notification.personName}`);

          // Отменяем старое уведомление в системе
          await this.cancelNotification(notification.id);

          // Удаляем из базы данных
          await notificationsRepository.deleteNotification(notification.id);

          // Перепланируем уведомление на следующий год
          console.log(`[NOTIFICATIONS] Перепланируем уведомление для ${notification.personName} на следующий год`);
          await this.schedulePersonNotifications(
            notification.personId,
            notification.personName,
            notification.birthday
          );
        }
      }

      console.log('[NOTIFICATIONS] Очистка прошедших уведомлений завершена');
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to cleanup past notifications:', error);
    }
  }

  private async requestOptimalPermissions(): Promise<void> {
    try {
      // Запрашиваем разрешения на уведомления
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NOTIFICATIONS] Разрешения на уведомления не предоставлены');
        return;
      }

      // Для Android показываем диалог с объяснением важности уведомлений
      if (Platform.OS === 'android') {
        // Показываем диалог только один раз (можно сохранить в AsyncStorage)
        // this.showNotificationImportanceDialog();
      }

      console.log('[NOTIFICATIONS] Все разрешения получены успешно');
    } catch (error) {
      console.error('[NOTIFICATIONS] Ошибка при запросе разрешений:', error);
    }
  }

  private showNotificationImportanceDialog(): void {
    Alert.alert(
      '🔔 Важные уведомления',
      'Для корректной работы напоминаний о днях рождения приложение может показывать уведомления даже когда оно закрыто.\n\n' +
      'Это поможет вам не пропустить важные даты!',
      [
        { text: 'Понятно', style: 'default' },
        {
          text: 'Настроить',
          onPress: () => {
            // Здесь можно добавить логику для открытия настроек приложения
            console.log('[NOTIFICATIONS] Пользователь хочет настроить уведомления');
          }
        }
      ],
      { cancelable: true }
    );
  }

  // Метод для проверки и перепланирования уведомлений при открытии приложения
  async checkAndRescheduleNotifications(): Promise<void> {
    try {
      console.log('[NOTIFICATIONS] Проверяем состояние уведомлений при открытии приложения');

      const settings = await this.getSettings();
      if (!settings.enabled) {
        console.log('[NOTIFICATIONS] Уведомления отключены, пропускаем проверку');
        return;
      }

      // Получаем все запланированные уведомления из системы
      const systemNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`[NOTIFICATIONS] Найдено ${systemNotifications.length} уведомлений в системе`);

      // Если уведомлений мало или нет, перепланируем все
      if (systemNotifications.length < 5) {
        console.log('[NOTIFICATIONS] Мало уведомлений в системе, перепланируем все');
        await this.rescheduleAllNotifications();
        return;
      }

      // Проверяем, есть ли уведомления на ближайшие дни
      const now = dayjs();
      const hasNearNotifications = systemNotifications.some(notification => {
        const trigger = notification.trigger as any;
        if (trigger?.date) {
          const notificationDate = dayjs(trigger.date);
          return notificationDate.diff(now, 'day') <= 7; // Уведомления на ближайшую неделю
        }
        return false;
      });

      if (!hasNearNotifications) {
        console.log('[NOTIFICATIONS] Нет уведомлений на ближайшие дни, перепланируем');
        await this.rescheduleAllNotifications();
      } else {
        console.log('[NOTIFICATIONS] Уведомления на ближайшие дни найдены, все в порядке');
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Ошибка при проверке уведомлений:', error);
    }
  }
}

// Экспорт единственного экземпляра сервиса
export const birthdayNotificationService = new BirthdayNotificationService();
