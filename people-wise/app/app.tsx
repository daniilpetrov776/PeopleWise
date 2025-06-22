import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme, } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAppDispatch, useAppSelector } from '@/hooks/store.hooks';
import { syncPersonsFromDB } from '@/store/actions';
import { getIsDataLoading } from '@/store/people-data/selectors';
import { initDB, personRepository } from '@/data-base/db';
import { initNotificationsDB } from '@/data-base/notifications-db';
import { initializeNotifications } from '@/store/notifications/notifications';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { store } from "@/store";

const BACKGROUND_TASK_BIRTHDAY_UPDATE = 'BACKGROUND_BIRTHDAY_UPDATE';

const dispatch = store.dispatch;

TaskManager.defineTask(BACKGROUND_TASK_BIRTHDAY_UPDATE, async () => {
  try {
    dispatch(syncPersonsFromDB())
    console.log('[TaskManager] фоновая задача запущена');
  } catch (error) {
    console.log('[TaskManager] Ошибка при выполнении фоновой задачи:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
  return BackgroundTask.BackgroundTaskResult.Success;
});

async function registerBackgroundTaskAsync() {
  try {
    await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_BIRTHDAY_UPDATE, {
      minimumInterval: 60 * 60, // 1 час
    });
  } catch (err) {
    console.log('[TaskManager] Ошибка при регистрации фоновой задачи:', err);
  }
}

dayjs.extend(customParseFormat);

type Props = {
  colorScheme: 'light' | 'dark';
};

export default function AppLayout({ colorScheme }: Props) {
  const dispatch = useAppDispatch();
  const isDataLoading = useAppSelector(getIsDataLoading);
  const [dbReady, setDbReady] = React.useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await initDB(); // Инициализация базы данных
        console.log('[DB] Инициализация завершена');

        await initNotificationsDB(); // Инициализация базы данных уведомлений
        console.log('[Notifications DB] Инициализация завершена');

        setDbReady(true);
        dispatch(syncPersonsFromDB()); // Загрузка данных из БД
        dispatch(initializeNotifications()); // Инициализация уведомлений
        registerBackgroundTaskAsync(); // Регистрация фоновой задачи

        // Проверка обновления данных каждый час
        const interval = setInterval(async () => {
          const now = dayjs();
          if (now.hour() === 0 && now.minute() === 0) {
            dispatch(syncPersonsFromDB());
          }
        }, 60000); // Проверка каждую минуту

        return () => clearInterval(interval);
      } catch (e) {
        console.error('[RootLayout] Ошибка при инициализации БД:', e);
      }
    };

    prepareApp();
  }, []);

  if (isDataLoading || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
