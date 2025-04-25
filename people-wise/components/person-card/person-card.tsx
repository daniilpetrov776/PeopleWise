import React, { useRef, useState } from "react";
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, Animated, TouchableWithoutFeedback, Platform } from 'react-native';
import { PersonCardType } from '../../types/cards';
import DefaultUserAvatar from '../user-avatar/user-avatar';
import * as ImagePicker from 'expo-image-picker';
import { Shadow } from 'react-native-shadow-2';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AnimatedShadow from '../animated-shadow/animated-shadow';

  const PersonCard: React.FC<PersonCardType> = ({
    // photoPath,
    name: initialName,
    birthday: initialBirthday,
    description: initialDescription,
  }) => {
    const parsedBirthday =
    initialBirthday instanceof Date ? initialBirthday : new Date(initialBirthday);
        // Локальное состояние для данных карточки
    const [name, setName] = useState(initialName);
    const [birthday, setBirthday] = useState<Date>(parsedBirthday);
    const [description, setDescription] = useState(initialDescription);
    const [photoUri, setPhotoUri] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);

    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    // Анимация карточки (масштаб)
    const scale = useRef(new Animated.Value(1)).current;
    // Анимация кнопки "Сохранить"
    const saveButtonAnim = useRef(new Animated.Value(0)).current;
    // анимация тени
    const shadowDistance = useRef(new Animated.Value(25)).current;

    const enterEditing = () => {
      if (!isEditing) {
        setIsEditing(true);
        Animated.spring(scale, {
          toValue: 1.1,
          friction: 3,
          useNativeDriver: true,
        }).start();
        Animated.spring(saveButtonAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
        Animated.timing(shadowDistance, {
          toValue: isEditing ? 40 : 25, // увеличим тень при редактировании
          duration: 300,
          useNativeDriver: false, // нельзя использовать native driver для layout свойств
        }).start();
      }
    };

      // При нажатии на кнопку "Сохранить": анимированное исчезновение кнопки, выключение режима редактирования и возвращение масштаба
  const handleSave = () => {
    Animated.timing(saveButtonAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsEditing(false);
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
      Animated.timing(shadowDistance, {
        toValue: 25,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleConfirm = (date: Date) => {
    setBirthday(date);
    hideDatePicker();
  };

  const handleImagePicker = async () => {
    // Запрашиваем разрешения (для iOS)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Доступ к галерее не предоставлен");
      return;
    }
    // Открываем галерею
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

    // Интерполяция для анимации кнопки "Сохранить"
    const buttonTranslateY = saveButtonAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0], // При значении 0 кнопка смещена вниз на 20
    });
    const buttonOpacity = saveButtonAnim; // Прозрачность равна значению анимированного параметра


    return (

      <Shadow
      distance={25}
      offset={[0, 0]}
      startColor="rgba(200, 17, 231, 0.5)"
      containerStyle={styles.shadowContainer}
      >
        <TouchableWithoutFeedback onPress={enterEditing}>
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
              {isEditing ? (
                <>
                  <TouchableOpacity onPress={handleImagePicker} style={styles.imageContainer}>
                    {photoUri ? (
                      <Image style={styles.image} source={{ uri: photoUri }} />
                    ) : (
                      <DefaultUserAvatar />
                    )}
                    <Text style={styles.changePhotoText}>Изменить фотографию</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Введите имя"
                  />
                  {/* <TextInput
                    style={styles.input}
                    value={birthday}
                    onChangeText={setBirthday}
                    placeholder="Введите дату рождения"
                  /> */}
                  {/* Кнопка-поле для даты */}
                  <TouchableOpacity onPress={showDatePicker} style={styles.input}>
                    <Text>
                      {birthday.toLocaleDateString()} {/* отобразит локальную дату */}
                    </Text>
                  </TouchableOpacity>

                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    date={birthday}
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                  />
                  <TextInput
                    style={[styles.input, { height: 60 }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Введите описание"
                    multiline
                  />
                  {/* Animated View для кнопки "Сохранить" */}
                  <Animated.View
                    style={{
                      transform: [{ translateY: buttonTranslateY }],
                      opacity: buttonOpacity,
                    }}
                  >
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                      <Text style={styles.saveButtonText}>Сохранить</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </>
              ) : (
                <>
                  <View style={styles.imageContainer}>
                    {photoUri ? (
                      <Image style={styles.image} source={{ uri: photoUri }} />
                    ) : (
                      <DefaultUserAvatar />
                    )}
                  </View>
                  <Text style={styles.h2}>{name}</Text>
                  <Text>Дата рождения: {birthday.toLocaleDateString()}</Text>
                  <Text>{description}</Text>
                </>
              )}
            </Animated.View>
        </TouchableWithoutFeedback>
      </Shadow>
    );
  };

  const styles = StyleSheet.create ({
    card: {
      backgroundColor: 'white',
      color: 'black',
      borderRadius: 10,
      padding: 15,
      width: 280,
      marginHorizontal: 'auto',
    },
    shadowContainer: {
      alignSelf: 'center',
    },
    h2: {
      fontSize: 20,
      lineHeight:28,
      fontWeight: 700,
      marginBottom: 10,
    },
    input: {
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    imageContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 10,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
      alignSelf: 'center'
    },
    changePhotoText: {
      textAlign: 'center',
      color: 'blue',
      marginBottom: 10,
    },
    saveButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignSelf: "center",
      marginTop: 10,
    },
    saveButtonText: {
      color: "white",
      fontWeight: "700",
    },
})

  export default PersonCard;
