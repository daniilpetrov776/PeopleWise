import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/hooks/store.hooks';
import {
  getHasNotificationPermissions,
  getNotificationSettings,
  getScheduledNotifications
} from '@/store/notifications/selectors';
import {
  requestNotificationPermissions,
  updateNotificationSettings,
  getScheduledNotifications as getScheduledNotificationsAction,
  cleanupPastNotifications
} from '@/store/notifications/notifications';
import { addPersonAction } from '@/store/actions';
import { notificationsRepository } from '@/data-base/notifications-db';
import { birthdayNotificationService } from '@/services/birthday-notification-service';
import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

// Функция для конвертации времени в читаемый формат
const formatTimeUntilNotification = (notificationDate: string, currentTime?: dayjs.Dayjs): string => {
  const now = currentTime || dayjs();
  const notification = dayjs(notificationDate);
  const diffSeconds = notification.diff(now, 'second');

  if (diffSeconds < 0) {
    return 'Прошло';
  }

  if (diffSeconds < 60) {
    return `${diffSeconds} сек`;
  }

  const minutes = Math.floor(diffSeconds / 60);
  const remainingSeconds = diffSeconds % 60;

  if (minutes < 60) {
    // Для интервалов менее часа показываем минуты и секунды
    if (minutes < 10) {
      return `${minutes} мин ${remainingSeconds} сек`;
    }
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
  if (weeks < 4) {
    return `${weeks} нед ${remainingDays} дн`;
  }

  const months = Math.floor(weeks / 4);
  const remainingWeeks = weeks % 4;
  if (months < 12) {
    return `${months} мес ${remainingWeeks} нед`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years} г ${remainingMonths} мес`;
};

// Функция для определения стиля таймера
const getTimerStyle = (notificationDate: string, currentTime?: dayjs.Dayjs) => {
  const now = currentTime || dayjs();
  const notification = dayjs(notificationDate);
  const diffSeconds = notification.diff(now, 'second');

  if (diffSeconds < 0) {
    return { color: '#999' }; // Прошедшие уведомления - серый
  } else if (diffSeconds < 60) {
    return { color: '#ff4444', fontWeight: 'bold' as const }; // Менее минуты - красный, жирный
  } else if (diffSeconds < 300) { // Менее 5 минут
    return { color: '#ff8800', fontWeight: 'bold' as const }; // Оранжевый, жирный
  } else if (diffSeconds < 3600) { // Менее часа
    return { color: '#ffaa00' }; // Желтый
  } else {
    return { color: '#333' }; // Обычный цвет
  }
};

export const NotificationTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const hasPermissions = useAppSelector(getHasNotificationPermissions);
  const settings = useAppSelector(getNotificationSettings);
  const scheduledNotifications = useAppSelector(getScheduledNotifications);

  // Состояние для реального времени обновления таймера
  const [currentTime, setCurrentTime] = React.useState(dayjs());

  // Эффект для обновления времени каждую секунду
  React.useEffect(() => {
    // Обновляем время только если есть запланированные уведомления
    if (scheduledNotifications.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledNotifications.length]);

  const handleRequestPermissions = () => {
    dispatch(requestNotificationPermissions());
  };

  const handleAddTestPerson = () => {
    // Добавляем тестового человека с днем рождения через 2 месяца
    const testBirthday = new Date();
    testBirthday.setMonth(testBirthday.getMonth() + 2);
    testBirthday.setDate(15); // 15 число

    const testPerson = {
      id: 'test-person-' + Date.now(),
      name: 'Тестовый человек',
      birthday: testBirthday.toISOString().split('T')[0], // YYYY-MM-DD формат
      description: 'Тестовый человек для проверки уведомлений',
      photoPath: undefined,
    };

    dispatch(addPersonAction(testPerson));
  };

  const handleResetSettings = async () => {
    try {
      await notificationsRepository.resetToDefaultSettings();
      // Обновляем состояние в Redux
      const newSettings = await notificationsRepository.getSettings();
      if (newSettings) {
        dispatch(updateNotificationSettings(newSettings));
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  const handleGetScheduled = () => {
    dispatch(getScheduledNotificationsAction());
  };

  const handleCleanup = () => {
    dispatch(cleanupPastNotifications());
  };

  const handleTestQuickNotification = async () => {
    try {
      // Тестовое уведомление через 5 секунд
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Тестовое уведомление',
          body: 'Это тестовое уведомление для проверки работы системы!',
          data: {
            test: true,
            timestamp: new Date().toISOString()
          },
        },
        trigger: { type: 'timeInterval', seconds: 5, repeats: false } as any,
      });

      console.log('[TEST] Уведомление запланировано на 5 секунд');
    } catch (error) {
      console.error('[TEST] Ошибка при планировании тестового уведомления:', error);
    }
  };

  const handleTestBackgroundNotification = async () => {
    try {
      // Тестовое уведомление через 30 секунд для проверки работы в фоне
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Тест в фоне',
          body: 'Это уведомление должно прийти даже если приложение закрыто!',
          data: {
            test: true,
            background: true,
            timestamp: new Date().toISOString()
          },
        },
        trigger: { type: 'timeInterval', seconds: 30, repeats: false } as any,
      });

      console.log('[TEST] Уведомление в фоне запланировано на 30 секунд');
      console.log('[TEST] Закройте приложение и подождите 30 секунд');
    } catch (error) {
      console.error('[TEST] Ошибка при планировании уведомления в фоне:', error);
    }
  };

  const handleAddTestPersonSoon = () => {
    // Добавляем тестового человека с днем рождения через 2 минуты
    const testBirthday = new Date();
    testBirthday.setMinutes(testBirthday.getMinutes() + 2); // Через 2 минуты

    const testPerson = {
      id: 'test-person-soon-' + Date.now(),
      name: 'Тест через 2 минуты',
      birthday: testBirthday.toISOString().split('T')[0], // YYYY-MM-DD формат
      description: 'Тестовый человек для проверки уведомлений через 2 минуты',
      photoPath: undefined,
    };

    dispatch(addPersonAction(testPerson));
  };

  const handleAddTestPersonToday = () => {
    // Добавляем тестового человека с днем рождения сегодня
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // Устанавливаем время уведомления через 3 минуты от текущего времени
    const notificationTime = new Date();
    notificationTime.setMinutes(notificationTime.getMinutes() + 3);

    console.log(`[TEST] Текущее время: ${currentHour}:${currentMinute}`);
    console.log(`[TEST] Время уведомления: ${notificationTime.getHours()}:${notificationTime.getMinutes()}`);

    const testPerson = {
      id: 'test-person-today-' + Date.now(),
      name: 'Тест сегодня',
      birthday: today.toISOString().split('T')[0], // YYYY-MM-DD формат
      description: 'Тестовый человек с днем рождения сегодня',
      photoPath: undefined,
    };

    dispatch(addPersonAction(testPerson));
  };

  const handleShowDetailedScheduled = async () => {
    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('[TEST] Подробная информация о запланированных уведомлениях:');

      if (allScheduled.length === 0) {
        console.log('[TEST] Нет запланированных уведомлений в системе');
        alert('Нет запланированных уведомлений в системе');
        return;
      }

      let detailedInfo = `Всего запланировано: ${allScheduled.length}\n\n`;

      allScheduled.forEach((notification, index) => {
        const trigger = notification.trigger as any;
        const triggerDate = trigger?.date ? new Date(trigger.date) : null;
        const triggerSeconds = trigger?.seconds || 0;
        const data = notification.content.data || {};

        const timeInfo = triggerDate
          ? `📅 ${triggerDate.toLocaleString()}`
          : `⏱️ Через ${triggerSeconds} сек`;

        detailedInfo += `${index + 1}. ${notification.content.title}\n`;
        detailedInfo += `   📄 ${notification.content.body}\n`;
        detailedInfo += `   🔑 ID: ${notification.identifier}\n`;
        detailedInfo += `   ${timeInfo}\n`;

        if (Object.keys(data).length > 0) {
          detailedInfo += `   📊 Данные: ${JSON.stringify(data)}\n`;
        }
        detailedInfo += '\n';

        console.log(`[TEST] Уведомление ${index + 1}:`, {
          id: notification.identifier,
          title: notification.content.title,
          body: notification.content.body,
          triggerDate: triggerDate?.toLocaleString(),
          triggerSeconds,
          data
        });
      });

      alert(detailedInfo);
    } catch (error) {
      console.error('[TEST] Ошибка при получении подробной информации:', error);
      alert('Ошибка при получении информации');
    }
  };

  const handleCheckPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      console.log('[TEST] Permission status:', status);
      alert(`Статус разрешений: ${status}`);
    } catch (error) {
      console.error('[TEST] Error checking permissions:', error);
      alert('Ошибка при проверке разрешений');
    }
  };

  const handleCheckBatteryOptimization = () => {
    Alert.alert(
      'Проверка оптимизации батареи',
      'Для корректной работы уведомлений в фоне необходимо отключить оптимизацию батареи для приложения.\n\n' +
      'Перейдите в:\n' +
      'Настройки → Приложения → People Wise → Батарея → Оптимизация батареи → Не оптимизировать\n\n' +
      'Или найдите приложение в списке "Не оптимизированные приложения"',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Открыть настройки',
          onPress: () => {
            // Здесь можно добавить открытие настроек приложения
            console.log('[TEST] User wants to open app settings');
          }
        }
      ]
    );
  };

  const handleTestMultipleNotifications = async () => {
    try {
      console.log('[TEST] Тестирование множественных уведомлений...');

      // Планируем несколько уведомлений с небольшими интервалами
      const notifications = [
        { title: '🧪 Тест 1', body: 'Первое тестовое уведомление', delay: 10 },
        { title: '🧪 Тест 2', body: 'Второе тестовое уведомление', delay: 15 },
        { title: '🧪 Тест 3', body: 'Третье тестовое уведомление', delay: 20 },
        { title: '🧪 Тест 4', body: 'Четвертое тестовое уведомление', delay: 25 },
        { title: '🧪 Тест 5', body: 'Пятое тестовое уведомление', delay: 30 },
      ];

      for (const notification of notifications) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: {
              test: true,
              multiple: true,
              timestamp: new Date().toISOString(),
              delay: notification.delay
            },
          },
          trigger: { type: 'timeInterval', seconds: notification.delay, repeats: false } as any,
          identifier: `test-multiple-${notification.delay}-${Date.now()}`,
        });

        console.log(`[TEST] Запланировано уведомление "${notification.title}" через ${notification.delay} секунд`);
      }

      console.log('[TEST] Все тестовые уведомления запланированы!');
      console.log('[TEST] Проверьте, что все 5 уведомлений придут с интервалом в 5 секунд');
      alert('Запланировано 5 тестовых уведомлений с интервалом в 5 секунд');
    } catch (error) {
      console.error('[TEST] Ошибка при планировании множественных уведомлений:', error);
      alert('Ошибка при планировании уведомлений');
    }
  };

  const handleClearAllTestNotifications = async () => {
    try {
      console.log('[TEST] Очистка всех тестовых уведомлений...');

      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      let clearedCount = 0;

      for (const notification of allScheduled) {
        const data = notification.content.data as any;

        // Удаляем только тестовые уведомления
        if (data && (data.test || data.multiple)) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`[TEST] Отменено тестовое уведомление: ${notification.identifier}`);
          clearedCount++;
        }
      }

      console.log(`[TEST] Отменено ${clearedCount} тестовых уведомлений`);
      alert(`Отменено ${clearedCount} тестовых уведомлений`);
    } catch (error) {
      console.error('[TEST] Ошибка при очистке тестовых уведомлений:', error);
      alert('Ошибка при очистке уведомлений');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест уведомлений (Development Build)</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.title}>🧪 Тест уведомлений</Text>
        <Text style={styles.statusText}>
          Разрешения: {hasPermissions ? '✅ Предоставлены' : '❌ Не предоставлены'}
        </Text>
        <Text style={styles.statusText}>
          Текущее время: {currentTime.format('DD.MM.YYYY HH:mm:ss')}
        </Text>
        {settings && (
          <>
            <Text style={styles.statusText}>
              Уведомления: {settings.enabled ? '✅ Включены' : '❌ Отключены'}
            </Text>
            <Text style={styles.statusText}>
              Дни уведомлений: {settings.daysBefore.join(', ')}
            </Text>
            <Text style={styles.statusText}>
              Время: {settings.time.hours}:{settings.time.minutes.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.statusText}>
              Запланировано: {scheduledNotifications.length}
            </Text>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {/* Основные настройки */}
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>🔧 Основные настройки</Text>

        {!hasPermissions && (
          <TouchableOpacity style={styles.button} onPress={handleRequestPermissions}>
            <Text style={styles.buttonText}>Запросить разрешения</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleCheckPermissions}>
          <Text style={styles.buttonText}>Проверить разрешения</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCheckBatteryOptimization}>
          <Text style={styles.buttonText}>Проверить оптимизацию батареи</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAddTestPerson}>
          <Text style={styles.buttonText}>Добавить тестового человека (через 2 месяца)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAddTestPersonSoon}>
          <Text style={styles.buttonText}>Добавить тестового человека (через 2 минуты)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAddTestPersonToday}>
          <Text style={styles.buttonText}>Добавить тестового человека (сегодня)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleResetSettings}>
          <Text style={styles.buttonText}>Сбросить настройки</Text>
        </TouchableOpacity>

        {/* Управление уведомлениями */}
        <Text style={styles.sectionTitle}>📋 Управление уведомлениями</Text>

        <TouchableOpacity style={styles.button} onPress={handleGetScheduled}>
          <Text style={styles.buttonText}>Обновить список уведомлений</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleShowDetailedScheduled}>
          <Text style={styles.buttonText}>Показать подробную информацию</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCleanup}>
          <Text style={styles.buttonText}>Очистить прошедшие уведомления</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={async () => {
          try {
            await birthdayNotificationService.checkAndRescheduleNotifications();
            alert('Проверка уведомлений завершена');
          } catch (error) {
            console.error('[TEST] Ошибка при проверке уведомлений:', error);
            alert('Ошибка при проверке уведомлений');
          }
        }}>
          <Text style={styles.buttonText}>🔄 Проверить и перепланировать</Text>
        </TouchableOpacity>

        {/* Тестирование */}
        <Text style={styles.sectionTitle}>🧪 Тестирование</Text>

        <TouchableOpacity style={styles.button} onPress={handleTestQuickNotification}>
          <Text style={styles.buttonText}>Тестовое уведомление через 5 секунд</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleTestBackgroundNotification}>
          <Text style={styles.buttonText}>Тестовое уведомление в фоне (30 сек)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleTestMultipleNotifications}>
          <Text style={styles.buttonText}>Тестировать множественные уведомления</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleClearAllTestNotifications}>
          <Text style={styles.buttonText}>Очистить все тестовые уведомления</Text>
        </TouchableOpacity>
      </View>

      {scheduledNotifications.length > 0 && (
        <View style={styles.notificationsContainer}>
          <Text style={styles.subtitle}>Запланированные уведомления:</Text>
          {scheduledNotifications.map((notification) => (
            <View key={notification.id} style={styles.notificationItem}>
              <Text style={styles.notificationText}>
                <Text style={styles.personName}>{notification.personName}</Text>
              </Text>
              <Text style={styles.notificationText}>
                📅 {dayjs(notification.notificationDate).format('DD.MM.YYYY HH:mm')}
              </Text>
              <Text style={[styles.notificationText, getTimerStyle(notification.notificationDate, currentTime)]}>
                ⏱️ {formatTimeUntilNotification(notification.notificationDate, currentTime)}
              </Text>
              <Text style={styles.notificationText}>
                📊 За {notification.daysBefore} дней до дня рождения
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#4B7A9E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notificationsContainer: {
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  notificationText: {
    fontSize: 12,
  },
  personName: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#4B7A9E',
    textAlign: 'center',
  },
});
