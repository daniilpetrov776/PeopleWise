import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme, } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAppDispatch, useAppSelector } from '@/hooks/store.hooks';
import { syncPersonsFromDB } from '@/store/actions';
import { getIsDataLoading } from '@/store/people-data/selectors';
import { initDB } from '@/data-base/db';

type Props = {
  colorScheme: 'dark' | 'light' | null;
};

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
