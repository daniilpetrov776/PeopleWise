import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Provider } from "react-redux";
import AppLayout from "./app";
import React from "react";
import { store } from "@/store";


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AppLayout colorScheme={colorScheme === 'dark' || colorScheme === 'light' ? colorScheme : null} />
    </Provider>
  );
}
