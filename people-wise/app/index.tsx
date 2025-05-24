import { StyleSheet, ScrollView, View, TouchableOpacity, Animated, Image, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import PersonCardsList from '../components/person-cards-list/person-cards-list';
import { Ionicons } from '@expo/vector-icons';
import AddPersonModal from '@/components/add-person-modal/add-person-modal';
import { useAppDispatch, useAppSelector } from '@/hooks/store.hooks';
import { getCards } from '@/store/people-data/selectors';
import { getIsOverlayVisible } from '@/store/global-data/selectors';
import { hideOverlay, showOverlay } from '@/store/global-data/global-data';
import { useUiDebounce } from '@/hooks/use-ui-debounce';
import { deletePersonAction } from '@/store/actions';
import { ConfirmDialog } from '@/components/confirm-dialog/confirm-dialog';

const { width, height } = Dimensions.get('window');

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const cards = useAppSelector(getCards);
  const isOverlayVisible = useAppSelector(getIsOverlayVisible);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false); // Состояние для модалки удаления
  const [cardToDelete, setCardToDelete] = useState<string | null>(null); // ID карточки для удаления
  const {isUiBlocked, handleUiDebounce} = useUiDebounce({ delay: 200 });

  const opacity = React.useRef(new Animated.Value(0)).current;
    useEffect(() => {
    Animated.timing(opacity, {
      toValue: isOverlayVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOverlayVisible]);

  const openOverlay = () => {
    dispatch(showOverlay());
  }

  const closeOverlay = () => {
    dispatch(hideOverlay());
  }

  const openAddPersonModal = () => {
    setModalVisible(true);
    openOverlay();
  }

  const closeAddPersonModal = () => {
    setModalVisible(false);
    closeOverlay();
  }

  // Функции для модалки удаления
  const openDeleteModal = (id: string) => {
    setCardToDelete(id);
    setDeleteModalVisible(true);
    openOverlay();
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setCardToDelete(null);
    closeOverlay();
  };

  const handleDelete = () => {
    if (cardToDelete) {
      dispatch(deletePersonAction(cardToDelete)); // Предполагается, что у тебя есть такое действие
      closeDeleteModal();
    }
  };

  const hintOpacity = React.useRef(new Animated.Value(cards.length === 0 ? 1 : 0)).current;

  useEffect(() => {
  Animated.timing(hintOpacity, {
    toValue: cards.length === 0 ? 1 : 0,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, [cards.length]);

  return (
  <View style={{ flex: 1, position: 'relative'}}>
    {/* подсказка */}
    <Animated.View style={{ opacity: hintOpacity, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, pointerEvents: 'none' }}>
      {(
        <>
        <Image source={require('@/assets/images/cloud.png')} style={styles.cloudImage}/>
        <Image source={require('@/assets/images/help-arrow.png')} style={styles.arrowImage}/>
        </>
      )}
    </Animated.View>
    {/* оверлей */}
    <Animated.View
    pointerEvents={isOverlayVisible ? 'auto' : 'none'}
    style={[styles.overlay, { opacity }]}>
    </Animated.View>
  <ScrollView style={containerStyle.container}>
    <PersonCardsList cards={cards} onDelete={openDeleteModal}/>
  </ScrollView>
  <TouchableOpacity
        style={styles.addButton}
        onPress={() => {openAddPersonModal(); handleUiDebounce();}}
        disabled={isUiBlocked}
      >
        <Ionicons name="add" size={32} color="#fff" />
  </TouchableOpacity>
    {/* Модальное окно для добавления человека */}
  <AddPersonModal
        isVisible={isModalVisible}
        onClose={() => {closeAddPersonModal()}}
      />
  {/* Модальное окно для удаления */}
      <ConfirmDialog
        visible={isDeleteModalVisible}
        message="Удалить карточку?"
        buttonText="Удалить"
        onCancel={closeDeleteModal}
        onConfirm={handleDelete}
      />
  </View>
  )
}

export default Home;

const containerStyle = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 1920,
        marginTop: 0,
        marginHorizontal: 'auto',
        paddingHorizontal: 20,
        overflowY: 'visible',
        backgroundColor: 'black',
    },
})

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
    pointerEvents: 'none'
  },
  cloudImage: {
    width: width * 0.9, // 80% of screen width
    height: width * 0.7, // Maintain aspect ratio (adjust based on image's original aspect ratio)
    position: 'absolute',
    top: height * 0.2, // 20% of screen height
    left: '50%',
    transform: [{ translateX: '-50%' }],
    zIndex: 10,
  },
  arrowImage: {
    width: width * 0.7, // 60% of screen width
    height: width * 2.1, // Adjust based on image's original aspect ratio
    position: 'absolute',
    top: -height * 0.1, // -10% of screen height
    left: '50%',
    transform: [{ translateX: '-50%' }],
    zIndex: 10,
  },
});
