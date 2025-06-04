import { useAppDispatch } from "@/hooks/store.hooks";
import { useState } from "react";
import { PersonCardType } from "@/types/cards";
import { addPersonAction } from "@/store/actions";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import React from "react";
import { Ionicons } from '@expo/vector-icons';
import DefaultUserAvatar from "../user-avatar/user-avatar";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useImagePicker } from "@/hooks/use-image-picker";
import { useUiDebounce } from "@/hooks/use-ui-debounce";
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

type addPersonModalProps = {
    isVisible: boolean;
    onClose: () => void;
}

const AddPersonModal: React.FC<addPersonModalProps> = ({isVisible, onClose}) => {
  const dispatch = useAppDispatch()

  const [name, setName] = useState<string>('');
  const [birthday, setBirthday] = useState<Dayjs>(dayjs());
  const [description, setDescription] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [renderModal, setRenderModal] = useState(isVisible);
  const [nameError, setNameError] = useState<string | null>(null);
  const {photoUri, pickImage, reset: resetPicker} = useImagePicker()

  const {isUiBlocked, handleUiDebounce} = useUiDebounce({ delay: 200 });
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      setRenderModal(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setRenderModal(false)
      });
    }
  }, [isVisible]);

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const handleDateConfirm = (date: Date) => {
    setBirthday(dayjs(date));
    hideDatePicker();
  };

  const handleCancel = () => {
    if (isUiBlocked) return;
    handleUiDebounce();
    resetPicker();
    setName('');
    setBirthday(dayjs());
    setDescription('');
    setNameError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (isUiBlocked) return;
    if (name.trim() === '') {
      setNameError('Ввежите имя');
      return;
    }
    handleUiDebounce();
    setNameError(null);
    const newPerson: Omit<PersonCardType, 'id'> = {
      name,
      birthday: birthday.toISOString(),
      description,
      photoPath: photoUri,
    };
    dispatch(addPersonAction(newPerson));
    // Закрываем модалку с небольшой задержкой для UX
    setTimeout(() => {
      handleCancel();
    }, 200);
  }

  return (
    <Modal
      visible={renderModal}
      animationType="none"
      transparent
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} disabled={isUiBlocked}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Новая карточка</Text>
            <TouchableOpacity onPress={handleConfirm} disabled={isUiBlocked}>
              <Ionicons name="checkmark" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.imageContainer} onPress={pickImage} disabled={isUiBlocked}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.image} />
            ) : (
              <DefaultUserAvatar />
            )}
            <Text style={styles.changeText}>Выбрать фото</Text>
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
          />

          <TouchableOpacity style={styles.input} onPress={showDatePicker} disabled={isUiBlocked}>
            <Text>{birthday.format('DD.MM.YYYY')}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={birthday.toDate()}
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Описание"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changeText: {
    marginTop: 8,
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: 'red',
  },
});

export default AddPersonModal;
