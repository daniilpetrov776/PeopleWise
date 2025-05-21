import { useAppDispatch } from "@/hooks/store.hooks";
import { useRef, useState } from "react";
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

type addPersonModalProps = {
    isVisible: boolean;
    onClose: () => void;
}

const DEBOUNCE_DELAY = 200;

const AddPersonModal: React.FC<addPersonModalProps> = ({isVisible, onClose}) => {
  const dispatch = useAppDispatch()

  const [name, setName] = useState<string>('');
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [description, setDescription] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [renderModal, setRenderModal] = useState(isVisible);
  const {photoUri, pickImage, reset: resetPicker} = useImagePicker()

  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitRef = useRef(0);
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      setIsSubmitting(false); // сброс при открытии
      lastSubmitRef.current = 0;
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
    setBirthday(date);
    hideDatePicker();
  };

  const handleCancel = () => {
    resetPicker();
    setName('');
    setBirthday(new Date());
    setDescription('');
    onClose();
  };

  const handleConfirm = () => {
    if (isSubmitting) return;
    const now = Date.now();
    if (now - lastSubmitRef.current < DEBOUNCE_DELAY) return;
    lastSubmitRef.current = now;
    setIsSubmitting(true);

    const newPerson: Omit<PersonCardType, 'id'> = {
      name,
      birthday: birthday.toISOString(),
      description,
      photoPath: photoUri,
    };
    dispatch(addPersonAction(newPerson));

    // reset after debounce
    setTimeout(() => {
      handleCancel();
    }, DEBOUNCE_DELAY);
  };

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
            <TouchableOpacity onPress={handleCancel} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Новая карточка</Text>
            <TouchableOpacity onPress={handleConfirm} disabled={isSubmitting}>
              <Ionicons name="checkmark" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.imageContainer} onPress={pickImage} disabled={isSubmitting}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.image} />
            ) : (
              <DefaultUserAvatar />
            )}
            <Text style={styles.changeText}>Выбрать фото</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Имя"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity style={styles.input} onPress={showDatePicker} disabled={isSubmitting}>
            <Text>{birthday.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={birthday}
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
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
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
});

export default AddPersonModal;
