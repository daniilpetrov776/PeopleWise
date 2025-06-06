import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme, } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAppDispatch, useAppSelector } from '@/hooks/store.hooks';
import { syncPersonsFromDB } from '@/store/actions';
import { getIsDataLoading } from '@/store/people-data/selectors';
import { initDB } from '@/data-base/db';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { store } from "@/store";

const BACKGROUND_TASK_BIRTHDAY_UPDATE = 'BACKGROUND_BIRTHDAY_UPDATE';

const dispatch = store.dispatch;

TaskManager.defineTask(BACKGROUND_TASK_BIRTHDAY_UPDATE, async () => {
  try {
    await initDB();
    dispatch(syncPersonsFromDB())
    console.log('[TaskManager] фоновая задачу запущена');
  } catch (error) {
    console.log('[TaskManager] Ошибка при выполнении фоновой задачи:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
  return BackgroundTask.BackgroundTaskResult.Success;
})

const registerBackgroundTaskAsync = async () => {
  const status = await BackgroundTask.getStatusAsync();
  if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
    return;
    }

    const tasks = await TaskManager.getRegisteredTasksAsync();
    if (!tasks.some((task) => task.taskName === BACKGROUND_TASK_BIRTHDAY_UPDATE)) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_BIRTHDAY_UPDATE, {
        minimumInterval: 15 * 60, // 15 минут
      })
      console.log('Background task для пересчёта дней до дня рождения зарегистрирован');
    }
}

type Props = {
  colorScheme: 'dark' | 'light' | null;
};

dayjs.extend(customParseFormat);

export default function AppLayout({ colorScheme }: Props) {
  const dispatch = useAppDispatch();
  const isDataLoading = useAppSelector(getIsDataLoading);
  const [dbReady, setDbReady] = React.useState(false);


useEffect(() => {
    const prepareApp = async () => {
      try {
        await initDB(); // 👈 Обязательно дождаться
        console.log('[DB] Инициализация завершена');
        setDbReady(true);
        dispatch(syncPersonsFromDB()); // Только после initDB
        registerBackgroundTaskAsync(); // Регистрация фоновой задачи

        const interval = setInterval(async () => {
          const now = dayjs();
          if (now.hour() === 0 && now.minute() === 0) {
            await initDB();
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
