import React from 'react';
import { Provider } from 'react-redux';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';


import { useColorScheme } from '@/hooks/useColorScheme';
import { store } from '../store/index';
import { deletePerson, getAllPersons, initDB, insertOrReplacePerson, updatePerson } from '@/data-base/db';
import { PersonCardType } from '@/types/cards';
import { useAppDispatch } from '@/hooks/store.hooks';
import { syncPersonsFromDB } from '@/store/actions';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // const [loaded] = useFonts({
  //   SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  // });

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  // if (!loaded) {
  //   return null;
  // }

    // 1. Шрифты
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 2. Спрятать SplashScreen
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

// useEffect(() => {
//   (async () => {
//     try {
//       await initDB();
//       console.log('[DB] init done');

//       const all = await getAllPersons();
//       console.log('[DB] initial persons:', all);

//       // вставляем тестовую карточку
//       const test: PersonCardType = {
//         id: 'test-1',
//         name: 'Тестовый',
//         birthday: new Date().toISOString(),
//         description: 'Проверка',
//         photoPath: '',
//       };
//       const updated: PersonCardType = {
//         id: 'dawdasddasc_234',
//         name: 'Danny',
//         birthday: new Date().toISOString(),
//         description: 'Я должен появиться в базе данных',
//         photoPath: '',
//       }
//       await insertOrReplacePerson(test);
//       console.log('[DB] inserted test');

//       const afterInsert = await getAllPersons();
//       console.log('[DB] after insert:', afterInsert);

//       await insertOrReplacePerson(updated);
//       console.log('[DB] updated test');
//       console.log('[DB] after update:', await getAllPersons());

//       // await deletePerson('test-1');
//       // console.log('[DB] deleted test');

//       const final = await getAllPersons();
//       console.log('[DB] after delete:', final);

//     } catch (e) {
//       console.error('[DB] ERROR:', e);
//     }
//   })();
// }, []);

const dispatch = store.dispatch;

useEffect(() => {
  const fetchData = async () => {
    dispatch(syncPersonsFromDB());
    console.log('[DB] sync done');
    const all = await getAllPersons();
    console.log('[DB] all persons:', all);
  };
  fetchData();
}, []);

  if (!loaded) {
    // Пока не загрузились шрифты, рендерим пустоту
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}
