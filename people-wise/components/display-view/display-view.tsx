import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PersonCardType } from '../../types/cards';
import DefaultUserAvatar from '../user-avatar/user-avatar';

type DisplayViewProps = Omit<PersonCardType, 'id'> & {
  photoUri: string;
};

const DisplayView: React.FC<DisplayViewProps> = ({ photoUri, name, birthday, description }) => (
  <>
    <View style={styles.imageContainer}>
      {photoUri ? <Image source={{ uri: photoUri }} style={styles.image} /> : <DefaultUserAvatar />}
    </View>
    <Text style={styles.h2}>{name}</Text>
    <Text>
      Дата рождения: {birthday ? new Date(birthday).toLocaleDateString() : 'Не указано'}
    </Text>
    <Text>{description}</Text>
  </>
);

const styles = StyleSheet.create({
      imageContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 10,
    },
        image: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
      alignSelf: 'center'
    },
        h2: {
      fontSize: 20,
      lineHeight:28,
      fontWeight: 700,
      marginBottom: 10,
    },
})

export default DisplayView;
