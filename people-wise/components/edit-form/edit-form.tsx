import React, { useEffect, useRef, useState } from 'react';
import { TextInput, TouchableOpacity, Text, Image, StyleSheet, Animated, View } from 'react-native';
import { PersonCardType } from '../../types/cards';
import DefaultUserAvatar from '../user-avatar/user-avatar';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useUiDebounce } from '@/hooks/use-ui-debounce';

export type EditFormProps = Omit<PersonCardType, 'id'> & {
  initialPhotoUri: string;
  pickImage: () => void;
  onSave: (updated: {
    photoUri: string;
    name: string;
    birthday: Date;
    description: string;
  }) => void;
  onCancel: () => void;
  saveStyle: {
    translateY: Animated.AnimatedInterpolation<number>;
    opacity: Animated.AnimatedInterpolation<number>;
  };
};

const EditForm: React.FC<EditFormProps> = ({
  initialPhotoUri,
  pickImage,
  name: propName,
  birthday: propBirthday,
  description: propDescription,
  onSave,
  onCancel,
  saveStyle,
}) => {
  const [photoUri, setPhotoUri] = useState(initialPhotoUri);
  const [name, setName] = useState(propName);
  const [birthday, setBirthday] = useState<Date>(
    propBirthday instanceof Date
      ? propBirthday
      : propBirthday
      ? new Date(propBirthday)
      : new Date()
  );
  const [description, setDescription] = useState(propDescription);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const {isUiBlocked, handleUiDebounce} = useUiDebounce({ delay: 200 });

  // При открытии формы и при сбросе нужно синхронизировать локальный стейт
  useEffect(() => {
    setPhotoUri(initialPhotoUri);
    setName(propName);
    setBirthday(
      propBirthday instanceof Date
        ? propBirthday
        : propBirthday
        ? new Date(propBirthday)
        : new Date()
    );
    setDescription(propDescription);
  }, [initialPhotoUri, propName, propBirthday, propDescription]);

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleDateConfirmLocal = (date: Date) => {
    setBirthday(date);
    hideDatePicker();
  };

  const handleSaveLocal = () => {
    if (isUiBlocked) return;

    // Валидация имени
    if (name.trim() === '') {
    setNameError('Введите имя');
    return;
  }
    handleUiDebounce();
    setNameError(null);
    onSave({ photoUri, name, birthday, description: description ?? '' });
  };

  return (
    <>
      <TouchableOpacity onPress={() => { pickImage(); handleUiDebounce();}} disabled={isUiBlocked} style={styles.imageContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.image} />
        ) : (
          <DefaultUserAvatar />
        )}
        <Text style={styles.changePhotoText}>Изменить фотографию</Text>
      </TouchableOpacity>

          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            placeholder={nameError ? 'Введите имя' : 'Имя'}
            placeholderTextColor={nameError ? '#FF3B30' : '#999'}
            value={name}
            onChangeText={text => {
              setName(text);
              if (text.trim() !== '') {
                setNameError(null);
              }
            }}
            editable={!isUiBlocked}
          />

      <TouchableOpacity style={styles.input} onPress={() => {showDatePicker(); handleUiDebounce();}} disabled={isUiBlocked}>
        <Text>{birthday.toLocaleDateString()}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={birthday}
        onConfirm={handleDateConfirmLocal}
        onCancel={hideDatePicker}
      />

      <TextInput
        style={[styles.input, styles.input]}
        placeholder="Введите описание"
        value={description}
        onChangeText={setDescription}
        multiline
        editable={!isUiBlocked}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => {onCancel(); handleUiDebounce();}} style={styles.cancelButton} disabled={isUiBlocked}>
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
        <Animated.View style={[styles.saveContainer, { transform: [{ translateY: saveStyle.translateY }], opacity: saveStyle.opacity }]}>
          <TouchableOpacity onPress={() => {handleSaveLocal(); handleUiDebounce()}} style={styles.saveButton} disabled={isUiBlocked}>
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
      input: {
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
      buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
      cancelButton: {
      padding: 10,
    },
      cancelButtonText: {
      color: '#333',
    },
      saveContainer: {
      marginLeft: 'auto',
      alignSelf: 'center',
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
    inputError: {
    borderColor: 'red',
    },
})

export default EditForm;
