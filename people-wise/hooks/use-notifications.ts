import { useEffect, useState } from 'react';
import { birthdayNotificationService } from '@/services/birthday-notification-service';
import { BirthdayNotificationSettings } from '@/types/notifications';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [settings, setSettings] = useState<BirthdayNotificationSettings | null>(null);

  // Инициализация сервиса
  const initialize = async () => {
    try {
      await birthdayNotificationService.initialize();
      setIsInitialized(true);

      // Проверяем разрешения
      const permissions = await birthdayNotificationService.checkPermissions();
      setHasPermissions(permissions);

      // Получаем настройки
      const currentSettings = await birthdayNotificationService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to initialize:', error);
    }
  };

  // Запрос разрешений
  const requestPermissions = async () => {
    try {
      const granted = await birthdayNotificationService.requestPermissions();
      setHasPermissions(granted);
      return granted;
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to request permissions:', error);
      return false;
    }
  };

  // Обновление настроек
  const updateSettings = async (newSettings: BirthdayNotificationSettings) => {
    try {
      await birthdayNotificationService.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to update settings:', error);
      throw error;
    }
  };

  // Планирование уведомлений для человека
  const schedulePersonNotifications = async (personId: string, name: string, birthday: string) => {
    try {
      await birthdayNotificationService.schedulePersonNotifications(personId, name, birthday);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to schedule notifications:', error);
      throw error;
    }
  };

  // Отмена уведомлений для человека
  const cancelPersonNotifications = async (personId: string) => {
    try {
      await birthdayNotificationService.cancelPersonNotifications(personId);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to cancel notifications:', error);
      throw error;
    }
  };

  // Обновление уведомлений для человека
  const updatePersonNotifications = async (personId: string, name: string, birthday: string) => {
    try {
      await birthdayNotificationService.updatePersonNotifications(personId, name, birthday);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to update notifications:', error);
      throw error;
    }
  };

  // Получение запланированных уведомлений
  const getScheduledNotifications = async () => {
    try {
      return await birthdayNotificationService.getScheduledNotifications();
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to get scheduled notifications:', error);
      throw error;
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return {
    isInitialized,
    hasPermissions,
    settings,
    requestPermissions,
    updateSettings,
    schedulePersonNotifications,
    cancelPersonNotifications,
    updatePersonNotifications,
    getScheduledNotifications,
  };
};
