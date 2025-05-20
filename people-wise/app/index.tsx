import { StyleSheet, ScrollView, View, TouchableOpacity, Animated } from 'react-native';
import React, { useEffect, useState } from 'react';
import PersonCardsList from '../components/person-cards-list/person-cards-list';
import { mockCards } from '../mocks/cards';
import { Ionicons } from '@expo/vector-icons';
import AddPersonModal from '@/components/add-person-modal/add-person-modal';
import { useAppDispatch, useAppSelector } from '@/hooks/store.hooks';
import { getCards } from '@/store/people-data/selectors';
import { getIsOverlayVisible } from '@/store/global-data/selectors';
import { hideOverlay, showOverlay } from '@/store/global-data/global-data';

const textStyle = StyleSheet.create({
    text: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        marginTop: 50,
    },
})

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
  }
});

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const cards = useAppSelector(getCards);

  // const [modalVisible, setModalVisible] = useState(false);
  const isOverlayVisible = useAppSelector(getIsOverlayVisible);
  const [isModalVisible, setModalVisible] = useState(false);

  const opacity = React.useRef(new Animated.Value(0)).current;
  // React.useEffect(() => {
  //     if (modalVisible) {
  //       setModalVisible(true);
  //       Animated.timing(opacity, {
  //         toValue: 1,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }).start();
  //       console.log('Modal is visible');
  //     } else {
  //       Animated.timing(opacity, {
  //         toValue: 0,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }).start(() => {
  //         setModalVisible(false)
  //       });
  //     }
  //   }, [modalVisible]);

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

  return (
  <View style={{ flex: 1, position: 'relative'}}>
    {/* оверлей */}
    <Animated.View
    pointerEvents={isOverlayVisible ? 'auto' : 'none'}
    style={[styles.overlay, { opacity }]}>
    </Animated.View>
  <ScrollView style={containerStyle.container}>
    <PersonCardsList cards={cards} />
  </ScrollView>
  <TouchableOpacity
        style={styles.addButton}
        onPress={() => { openAddPersonModal() }}
      >
        <Ionicons name="add" size={32} color="#fff" />
  </TouchableOpacity>
    {/* Модальное окно для добавления человека */}
  <AddPersonModal
        isVisible={isModalVisible}
        onClose={() => closeAddPersonModal()}
      />
  </View>
  )
}


export default Home;
