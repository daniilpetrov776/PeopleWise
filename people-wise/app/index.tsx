import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import PersonCardsList from '../components/person-cards-list/person-cards-list';
import { mockCards } from '../mocks/cards';
import { Ionicons } from '@expo/vector-icons';
import AddPersonModal from '@/components/add-person-modal/add-person-modal';

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
        // overflowX: 'hidden',
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
});

const Home: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
  <View style={{ flex: 1,}}>
  <ScrollView style={containerStyle.container}>
    {/* Компонент обертка с списком карточек и сайдбаром */}
    <PersonCardsList mockCards={mockCards} />
  </ScrollView>
  <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
  </TouchableOpacity>
    {/* Модальное окно для добавления человека */}
  <AddPersonModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
  </View>
  )
}


export default Home;
