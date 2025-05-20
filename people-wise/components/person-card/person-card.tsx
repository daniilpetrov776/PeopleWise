import React, { useRef, useState } from "react";
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, Animated, TouchableWithoutFeedback, Platform, Modal } from 'react-native';
import { PersonCardType } from '../../types/cards';
import DefaultUserAvatar from '../user-avatar/user-avatar';
import { Shadow } from 'react-native-shadow-2';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch } from "@/hooks/store.hooks";
import { hideOverlay, showOverlay } from "@/store/global-data/global-data";
import { useImagePicker } from "@/hooks/use-image-picker";
import { ConfirmDialog } from "../confirm-dialog/confirm-dialog";
import { useCardAnimation } from "@/hooks/use-card-animation";

  const PersonCard: React.FC<PersonCardType> = ({
    photoPath,
    name: initialName,
    birthday: initialBirthday,
    description: initialDescription,
  }) => {
    const parsedBirthday =
    typeof initialBirthday === 'string'
    ? new Date(initialBirthday)
    : initialBirthday instanceof Date
    ? initialBirthday
    : new Date()

        // Локальное состояние для данных карточки
    const [name, setName] = useState(initialName);
    const [birthday, setBirthday] = useState<Date>(parsedBirthday);
    const [description, setDescription] = useState(initialDescription);
    const [isEditing, setIsEditing] = useState(false);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const {photoUri, pickImage, reset: resetPicker} = useImagePicker(photoPath)
    const { scale, saveButtonAnim, shadowDistance, enter, leave } = useCardAnimation();

    const enterEditing = () => {
      if (!isEditing) {
        resetPicker(); // сбрасываем фото в начальное состояние
        setIsEditing(true);
        enter();
      }
    };

      // При нажатии на кнопку "Сохранить": анимированное исчезновение кнопки, выключение режима редактирования и возвращение масштаба
  const handleSave = () => {
    leave(() => {
      setIsEditing(false);
    })
  };

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleConfirm = (date: Date) => {
    setBirthday(date);
    hideDatePicker();
  };

    // Интерполяция для анимации кнопки "Сохранить"
    const buttonTranslateY = saveButtonAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0], // При значении 0 кнопка смещена вниз на 20
    });
    const buttonOpacity = saveButtonAnim; // Прозрачность равна значению анимированного параметра

    const dispatch = useAppDispatch();

    const handleCancel = () => {
      resetPicker(); // сбрасываем фото в начальное состояние
      setConfirmVisible(false);
      dispatch(hideOverlay());
    }

    const handleDelete = () => {
    // dispatch(deletePersonAction(id));
    console.log('Удаляем карточку');
    setConfirmVisible(false);
    dispatch(hideOverlay());
  };

    return (
    <>
      <Shadow
      distance={25}
      offset={[0, 0]}
      startColor="rgba(200, 17, 231, 0.5)"
      containerStyle={styles.shadowContainer}
      >
        <TouchableWithoutFeedback onPress={enterEditing}>
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
            {/* Иконка удаления */}
            <TouchableOpacity style={styles.deleteIcon} onPress={() => { setConfirmVisible(true); dispatch(showOverlay()); }}>
              <Ionicons name="trash" size={20} color="#f00" />
            </TouchableOpacity>
              {isEditing ? (
                <>
                  <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
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
                    keyboardType="default"         // ставим обычную клавиатуру
                    autoCapitalize="sentences"     // автокапитализация после точки / в начале фразы
                    autoCorrect={false}            // отключаем автокоррекцию, она порой вмешивается
                    textContentType="name"
                  />
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
                    keyboardType="default"
                    autoCapitalize="sentences"
                    autoCorrect={false}
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

      {/* Модалка подтверждения удаления */}
      <ConfirmDialog
        visible={confirmVisible}
        message="Удалить карточку?"
        buttonText="Удалить"
        onCancel={handleCancel}
        onConfirm={handleDelete}
      />
    </>
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
    deleteIcon: { position: 'absolute', top: 10, right: 10, zIndex: 5 },
})

  export default PersonCard;
