import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Provider } from "react-redux";
import AppLayout from "./app";
import React from "react";
import { store } from "@/store";
import { birthdayNotificationService } from "@/services/birthday-notification-service";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();

      // Инициализируем сервис уведомлений
      birthdayNotificationService.initialize().then(() => {
        console.log('[APP] Сервис уведомлений инициализирован');
      }).catch(error => {
        console.error('[APP] Ошибка инициализации сервиса уведомлений:', error);
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AppLayout colorScheme={colorScheme === 'dark' || colorScheme === 'light' ? colorScheme : 'light'} />
    </Provider>
  );
}
