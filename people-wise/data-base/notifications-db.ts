import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase, SQLiteBindValue } from 'expo-sqlite';
import { BirthdayNotification, BirthdayNotificationSettings } from '@/types/notifications';

const NOTIFICATIONS_DB_NAME = 'notifications.db';

// Интерфейс репозитория для уведомлений
interface INotificationsRepository {
  // Уведомления
  getAllNotifications(): Promise<BirthdayNotification[]>;
  getNotificationsByPersonId(personId: string): Promise<BirthdayNotification[]>;
  createNotification(notification: BirthdayNotification): Promise<void>;
  updateNotification(notification: BirthdayNotification): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  deleteNotificationsByPersonId(personId: string): Promise<void>;

  // Настройки
  getSettings(): Promise<BirthdayNotificationSettings | null>;
  saveSettings(settings: BirthdayNotificationSettings): Promise<void>;
  resetToDefaultSettings(): Promise<void>;
}

class SQLiteNotificationsRepository implements INotificationsRepository {
  private db: SQLiteDatabase | null = null;

  public async getDB(): Promise<SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(NOTIFICATIONS_DB_NAME);
    }
    return this.db;
  }

  async getAllNotifications(): Promise<BirthdayNotification[]> {
    try {
      const db = await this.getDB();
      return await db.getAllAsync<BirthdayNotification>('SELECT * FROM birthday_notifications ORDER BY notificationDate ASC;');
    } catch (error) {
      console.error('[NOTIFICATIONS DB ERROR] getAllNotifications:', error);
      throw new Error('Failed to get all notifications');
    }
  }

  async getNotificationsByPersonId(personId: string): Promise<BirthdayNotification[]> {
    try {
      const db = await this.getDB();
      return await db.getAllAsync<BirthdayNotification>(
        'SELECT * FROM birthday_notifications WHERE personId = ? ORDER BY notificationDate ASC;',
        [personId]
      );
    } catch (error) {
      console.error('[NOTIFICATIONS DB ERROR] getNotificationsByPersonId:', error);
      throw new Error('Failed to get notifications by person id');
    }
  }

  async createNotification(notification: BirthdayNotification): Promise<void> {
    try {
      const db = await this.getDB();
      const query = `INSERT INTO birthday_notifications
                    (id, personId, personName, birthday, notificationDate, daysBefore, scheduled, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
      const params: SQLiteBindValue[] = [
        notification.id,
        notification.personId,
        notification.personName,
        notification.birthday,
        notification.notificationDate,
        notification.daysBefore,
        notification.scheduled ? 1 : 0,
        notification.createdAt,
      ];
      await db.runAsync(query, params);
    } catch (error) {
      console.error('[NOTIFICATIONS DB ERROR] createNotification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async updateNotification(notification: BirthdayNotification): Promise<void> {
    try {
      const db = await this.getDB();
      const query = `UPDATE birthday_notifications
                    SET personName = ?, birthday = ?, notificationDate = ?, daysBefore = ?, scheduled = ?
                    WHERE id = ?;`;
      const params: SQLiteBindValue[] = [
        notification.personName,
        notification.birthday,
        notification.notificationDate,
        notification.daysBefore,
        notification.scheduled ? 1 : 0,
        notification.id,
      ];
      await db.runAsync(query, params);
    } catch (error) {
      console.error('[NOTIFICATIONS DB ERROR] updateNotification:', error);
      throw new Error('Failed to update notification');
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const query = 'DELETE FROM birthday_notifications WHERE id = ?;';
      await db.runAsync(query, [id]);
    } catch (error) {
      console.error('[NOTIFICATIONS DB ERROR] deleteNotification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async deleteNotificationsByPersonId(personId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const query = 'DELETE FROM birthday_notifications WHERE personId = ?;';
      await db.runAsync(query, [personId]);
    } catch (error) {
      console.error('[NOTIFICATIONS DB ERROR] deleteNotificationsByPersonId:', error);
      throw new Error('Failed to delete notifications by person id');
    }
  }

  async getSettings(): Promise<BirthdayNotificationSettings | null> {
    try {
      const db = await this.getDB();
      const result = await db.getAllAsync<{key: string, value: string}>('SELECT * FROM notification_settings;');

      if (result.length === 0) {
        return null;
      }

      const settingsMap = new Map(result.map(row => [row.key, row.value]));

      return {
        daysBefore: JSON.parse(settingsMap.get('daysBefore') || '[30, 7, 1, 0]'),
        time: JSON.parse(settingsMap.get('time') || '{"hours": 9, "minutes": 0}'),
        enabled: settingsMap.get('enabled') === 'true',
      };
    } catch (error) {
      console.error('[NOTIFICATIONS DB ERROR] getSettings:', error);
      throw new Error('Failed to get settings');
    }
  }

  async saveSettings(settings: BirthdayNotificationSettings): Promise<void> {
    try {
      const db = await this.getDB();

      // Очищаем старые настройки
      await db.runAsync('DELETE FROM notification_settings;');

      // Сохраняем новые настройки
      const queries = [
        ['daysBefore', JSON.stringify(settings.daysBefore)],
        ['time', JSON.stringify(settings.time)],
        ['enabled', settings.enabled.toString()],
      ];

      for (const [key, value] of queries) {
        await db.runAsync(
          'INSERT INTO notification_settings (key, value) VALUES (?, ?);',
          [key, value]
        );
      }
    } catch (error) {
      console.error('[NOTIFICATIONS DB ERROR] saveSettings:', error);
      throw new Error('Failed to save settings');
    }
  }

  async resetToDefaultSettings(): Promise<void> {
    try {
      const defaultSettings: BirthdayNotificationSettings = {
        daysBefore: [30, 7, 1, 0], // За месяц, неделю, день и в день рождения
        time: { hours: 9, minutes: 0 }, // В 9:00
        enabled: true,
      };
      await this.saveSettings(defaultSettings);
      console.log('[NOTIFICATIONS DB] Settings reset to default');
    } catch (error) {
      console.error('[NOTIFICATIONS DB ERROR] resetToDefaultSettings:', error);
      throw new Error('Failed to reset settings');
    }
  }
}

// Инициализация базы данных уведомлений
export const initNotificationsDB = async (): Promise<void> => {
  const repository = new SQLiteNotificationsRepository();
  const db = await repository.getDB();

  try {
    // Создание таблицы уведомлений
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS birthday_notifications (
        id TEXT PRIMARY KEY,
        personId TEXT NOT NULL,
        personName TEXT NOT NULL,
        birthday TEXT NOT NULL,
        notificationDate TEXT NOT NULL,
        daysBefore INTEGER NOT NULL,
        scheduled INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      );
    `);

    // Создание таблицы настроек
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS notification_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Создание индексов
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_notification_person_id ON birthday_notifications(personId);');
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_notification_date ON birthday_notifications(notificationDate);');
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_notification_scheduled ON birthday_notifications(scheduled);');

    // Инициализация настроек по умолчанию, если их нет
    const settings = await repository.getSettings();
    if (!settings) {
      const defaultSettings: BirthdayNotificationSettings = {
        daysBefore: [30, 7, 1, 0], // За месяц, неделю, день и в день рождения
        time: { hours: 9, minutes: 0 }, // В 9:00
        enabled: true,
      };
      await repository.saveSettings(defaultSettings);
    }
  } catch (error) {
    console.error('[NOTIFICATIONS DB ERROR] initNotificationsDB:', error);
    throw new Error('Failed to initialize notifications database');
  }
};

// Экспорт репозитория
export const notificationsRepository = new SQLiteNotificationsRepository();

// Экспорт типов
export type { INotificationsRepository };
