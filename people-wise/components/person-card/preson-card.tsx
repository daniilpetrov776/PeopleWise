import React from "react";
import { StyleSheet, View, Text, Image } from 'react-native';
import { PersonCardType } from '../../types/cards';

const personCardStyle = StyleSheet.create ({
    card: {
      backgroundColor: 'white',
      color: 'black',
      borderRadius: 10,
      padding: 15,
      width: 280,
      marginHorizontal: 'auto'
    },
    h2: {
      fontSize: 20,
      lineHeight:28,
      fontWeight: 700,
    }
})


  const PersonCard: React.FC<PersonCardType> = ({
    // photoPath,
    name,
    birthday,
    description,
  }) => {
    return (
      <View style={personCardStyle.card}>
        <Image
          style={{ width: 100, height: 100 }}
          source={{ uri: 'https://example.com/image.jpg' }}
        />
        <Text style={personCardStyle.h2}>{name}</Text>
        <Text>Birthday: {birthday}</Text>
        <Text>{description}</Text>
      </View>
    );
  };
  export default PersonCard;
