import { NameSpace } from '@/const';
import { RootState } from '../../types/state';

export const getNotificationsState = (state: RootState) => (
  state[NameSpace.Notifications]
)

export const getIsNotificationsInitialized = (state: RootState) =>
  state[NameSpace.Notifications].isInitialized;

export const getHasNotificationPermissions = (state: RootState) =>
  state[NameSpace.Notifications].hasPermissions;

export const getNotificationSettings = (state: RootState) =>
  state[NameSpace.Notifications].settings;

export const getScheduledNotifications = (state: RootState) =>
  state[NameSpace.Notifications].scheduledNotifications;

export const getNotificationsLoading = (state: RootState) =>
  state[NameSpace.Notifications].loading;

export const getNotificationsError = (state: RootState) =>
  state[NameSpace.Notifications].error;

// Селекторы для проверки состояния уведомлений
export const getNotificationsEnabled = (state: RootState) =>
  state[NameSpace.Notifications].settings?.enabled ?? false;

export const getNotificationDaysBefore = (state: RootState) =>
  state[NameSpace.Notifications].settings?.daysBefore ?? [30, 7, 1, 0];

export const getNotificationTime = (state: RootState) =>
  state[NameSpace.Notifications].settings?.time ?? { hours: 9, minutes: 0 };
