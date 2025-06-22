import { Middleware } from '@reduxjs/toolkit';
import { addPersonAction, updatePersonAction, deletePersonAction } from './actions';
import { birthdayNotificationService } from '@/services/birthday-notification-service';
import { getScheduledNotifications } from './notifications/notifications';

export const notificationsMiddleware: Middleware = store => next => async action => {
  // Сначала пропускаем экшен дальше — к редьюсерам
  const result = next(action);

  try {
    // При добавлении нового человека
    if (addPersonAction.fulfilled.match(action)) {
      const person = action.payload;
      if (person.birthday) {
        console.log('[Notifications Middleware] Scheduling notifications for new person:', person.name);
        await birthdayNotificationService.schedulePersonNotifications(
          person.id,
          person.name,
          person.birthday.toString()
        );
        // Обновляем список уведомлений в Redux
        await store.dispatch(getScheduledNotifications() as any);
      }
    }

    // При обновлении человека
    if (updatePersonAction.fulfilled.match(action)) {
      const person = action.payload;
      if (person.birthday) {
        console.log('[Notifications Middleware] Updating notifications for person:', person.name);
        await birthdayNotificationService.updatePersonNotifications(
          person.id,
          person.name,
          person.birthday.toString()
        );
      } else {
        // Если день рождения удален, отменяем уведомления
        console.log('[Notifications Middleware] Cancelling notifications for person:', person.name);
        await birthdayNotificationService.cancelPersonNotifications(person.id);
      }
      // Обновляем список уведомлений в Redux
      await store.dispatch(getScheduledNotifications() as any);
    }

    // При удалении человека
    if (deletePersonAction.fulfilled.match(action)) {
      const personId = action.payload;
      console.log('[Notifications Middleware] Cancelling notifications for deleted person:', personId);
      await birthdayNotificationService.cancelPersonNotifications(personId);
      // Обновляем список уведомлений в Redux
      await store.dispatch(getScheduledNotifications() as any);
    }
  } catch (error) {
    console.error('[Notifications Middleware ERROR] Failed to handle notification:', error);
  }

  return result;
};
