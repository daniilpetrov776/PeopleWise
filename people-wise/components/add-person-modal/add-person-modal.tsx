import { useAppDispatch } from "@/hooks/store.hooks";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
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

type addPersonModalProps = {
    isVisible: boolean;
    onClose: () => void;
}

const AddPersonModal: React.FC<addPersonModalProps> = ({isVisible, onClose}) => {
  const dispatch = useAppDispatch()


  const [name, setName] = useState<string>('');
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [description, setDescription] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [renderModal, setRenderModal] = useState(isVisible);

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

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert('Permission to access gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleDateConfirm = (date: Date) => {
    setBirthday(date);
    hideDatePicker();
  };

  const handleCancel = () => {
    // reset form if needed
    setPhotoUri('');
    setName('');
    setBirthday(new Date());
    setDescription('');
    onClose();
  };

  const handleConfirm = () => {
    const newPerson: PersonCardType = {
      name,
      birthday,
      description,
      photoPath: photoUri,
    };
    dispatch(addPersonAction(newPerson));
    handleCancel();
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
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Новая карточка</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Ionicons name="checkmark" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
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

          <TouchableOpacity style={styles.input} onPress={showDatePicker}>
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
    // ...StyleSheet.absoluteFillObject,
    top: -60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    height: '120%',
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
