import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, } from 'react-native';
import { PersonCardType } from '../../types/cards';;
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch } from "@/hooks/store.hooks";
import { hideOverlay } from "@/store/global-data/global-data";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useCardAnimation } from "@/hooks/use-card-animation";

import EditForm from "../edit-form/edit-form";
import DisplayView from "../display-view/display-view";
import { updatePersonAction } from "@/store/actions";
import { useUiDebounce } from "@/hooks/use-ui-debounce";

import Animated, {
  Layout,
  FadeIn,
  FadeOutUp,
} from 'react-native-reanimated';

import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export type PersonCardHandle = {
  handleCancel: () => void;
};

  const PersonCard = forwardRef<PersonCardHandle, PersonCardType & { onDelete: (id: string) => void }>(({
  id,
  photoPath,
  name: propName,
  birthday: propBirthday,
  description: propDescription,
  onDelete,
}, ref) => {
    const parsedBirthday = dayjs(propBirthday);

    const dispatch = useAppDispatch();
    const { animatedStyle, saveButtonStyle, enter, leave } = useCardAnimation();
    const {photoUri, pickImage, reset: resetPicker} = useImagePicker(photoPath)

    // Локальное состояние для формы
    const [name, setName] = useState(propName);
    const [birthday, setBirthday] = useState<Dayjs>(parsedBirthday);
    const [description, setDescription] = useState(propDescription);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const { isUiBlocked, handleUiDebounce } = useUiDebounce({ delay: 200 });

    useImperativeHandle(ref, () => ({
    handleCancel,
  }));

    const enterEditing = () => {
      if (!isEditing) {
        setName(propName);
        setBirthday(parsedBirthday);
        setDescription(propDescription);
        resetPicker(); // сбрасываем фото в начальное состояние
        setIsEditing(true);
        enter();
      }
    };

    const handleCancel = () => {
      resetPicker(); // сбрасываем фото в начальное состояние
      leave(() =>setIsEditing(false));
      setConfirmVisible(false);
      dispatch(hideOverlay());
    }

    const handleSave = (photoUri: string, name: string, birthday: Date, description: string) => {
      const newBirthdayDayjs = dayjs(birthday)
      leave(() => {
        setIsEditing(false);
      })
      dispatch(updatePersonAction({id, name, birthday: newBirthdayDayjs.toISOString(), description, photoPath: photoUri }));
    };

    return (
      <>
          <TouchableWithoutFeedback onPress={enterEditing}>
          <Animated.View
            layout={Layout.springify()}
            entering={FadeIn.duration(200)}
            exiting={FadeOutUp.duration(300)}
            style={[styles.card, animatedStyle]}
          >
            {/* Иконка удаления */}
            <TouchableOpacity style={styles.deleteIcon} disabled={isUiBlocked} onPress={() => {onDelete(id); handleUiDebounce();}}>
              <Ionicons name="trash" size={20} color="#f00" />
            </TouchableOpacity>
            {isEditing
              ? (
                <EditForm
                  initialPhotoUri={photoUri}
                  pickImage={pickImage}
                  name={name}
                  birthday={birthday.toDate()}
                  description={description ?? ""}
                  saveStyle={saveButtonStyle}
                  onSave={({ photoUri, name, birthday, description }) => {
                    setName(name);
                    setBirthday(dayjs(birthday));
                    setDescription(description);
                    handleSave(photoUri, name, dayjs(birthday).toDate(), description);
                  }}
                  onCancel={handleCancel}
                />
              )
              : (
                <DisplayView
                  name={propName} birthday={propBirthday} description={propDescription}
                  photoUri={photoPath || ''}
                />
              )
            }
          </Animated.View>
        </TouchableWithoutFeedback>
      </>
    )
  });

  const styles = StyleSheet.create ({
    card: {
      backgroundColor: '#FAFAF8',
      color: '#4A4A4A',
      borderRadius: 10,
      padding: 15,
      width: 280,
      marginHorizontal: 'auto',
    },
    shadowContainer: {
      alignSelf: 'center',
    },
    deleteIcon: { position: 'absolute', top: 10, right: 10, zIndex: 5 },
})

  export default PersonCard;
