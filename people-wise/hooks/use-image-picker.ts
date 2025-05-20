import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export function useImagePicker(initialUri: string = '') {
  const [photoUri, setPhotoUri] = useState<string>(initialUri);

  const pickImage = useCallback(async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Доступ к галерее не предоставлен');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  // сбрасываем либо в начальный URI, либо в пустую строку
  const reset = useCallback(() => {
    setPhotoUri(initialUri);
  }, [initialUri]);

  return { photoUri, pickImage, reset };
}
