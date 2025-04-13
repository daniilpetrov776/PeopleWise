import { StyleSheet, ScrollView, View } from 'react-native';
import React from 'react';
import PersonCardsList from '../components/person-cards-list/person-cards-list';
import { mockCards } from '../mocks/cards';

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
        overflowX: 'hidden',
        backgroundColor: 'purple',
    },
})

const Home = () => (
  <ScrollView style={containerStyle.container}>
    {/* Компонент обертка с списком карточек и сайдбаром */}
    <PersonCardsList mockCards={mockCards} />
  </ScrollView>
)

export default Home;
