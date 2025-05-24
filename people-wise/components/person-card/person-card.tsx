import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, Animated, TouchableWithoutFeedback, } from 'react-native';
import { PersonCardType } from '../../types/cards';;
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch } from "@/hooks/store.hooks";
import { hideOverlay, showOverlay } from "@/store/global-data/global-data";
import { useImagePicker } from "@/hooks/use-image-picker";
import { ConfirmDialog } from "../confirm-dialog/confirm-dialog";
import { useCardAnimation } from "@/hooks/use-card-animation";

import EditForm from "../edit-form/edit-form";
import DisplayView from "../display-view/display-view";
import { deletePersonAction, updatePersonAction } from "@/store/actions";
import { useUiDebounce } from "@/hooks/use-ui-debounce";

  const PersonCard: React.FC<PersonCardType & { onDelete: (id: string) => void }> = ({
    id,
    photoPath,
    name: propName,
    birthday: propBirthday,
    description: propDescription,
    onDelete,
  }) => {
    const parsedBirthday =
    typeof propBirthday === 'string'
    ? new Date(propBirthday)
    : propBirthday instanceof Date
    ? propBirthday
    : new Date()

    const dispatch = useAppDispatch();
    const { scale, saveButtonAnim, shadowDistance, enter, leave } = useCardAnimation();
    const {photoUri, pickImage, reset: resetPicker} = useImagePicker(photoPath)

    // Локальное состояние для формы
    const [name, setName] = useState(propName);
    const [birthday, setBirthday] = useState<Date>(parsedBirthday);
    const [description, setDescription] = useState(propDescription);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const { isUiBlocked, handleUiDebounce } = useUiDebounce({ delay: 200 });

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
      leave(() => {
        setIsEditing(false);
      })
      dispatch(updatePersonAction({id, name, birthday: birthday.toISOString(), description, photoPath: photoUri }));
    };

    const handleDelete = () => {
    dispatch(deletePersonAction(id));
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
            <TouchableOpacity style={styles.deleteIcon} disabled={isUiBlocked} onPress={() => {onDelete(id); handleUiDebounce();}}>
              <Ionicons name="trash" size={20} color="#f00" />
            </TouchableOpacity>
            {isEditing
              ? (
                <EditForm
                  initialPhotoUri={photoUri}
                  pickImage={pickImage}
                  name={name}
                  birthday={birthday}
                  description={description ?? ""}
                  saveStyle={{ translateY: saveButtonAnim.interpolate({ inputRange:[0,1],outputRange:[20,0] }), opacity: saveButtonAnim }}
                  onSave={({ photoUri, name, birthday, description }) => {
                    setName(name);
                    setBirthday(birthday);
                    setDescription(description);
                    handleSave(photoUri, name, birthday, description);
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
        </Shadow>
      </>
    )
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
    deleteIcon: { position: 'absolute', top: 10, right: 10, zIndex: 5 },
})

  export default PersonCard;
