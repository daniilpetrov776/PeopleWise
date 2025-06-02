import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PersonCardType } from '../../types/cards';
import DefaultUserAvatar from '../user-avatar/user-avatar';

type DisplayViewProps = Omit<PersonCardType, 'id'> & {
  photoUri: string;
};

const getDaysUntilBirthday = (birthday: string): number | null => {
  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

  // Если день рождения уже прошёл — берём следующий год
  if (
    nextBirthday.getMonth() === now.getMonth() &&
    nextBirthday.getDate() === now.getDate()
  ) {
    return 0; // сегодня
  }

  if (nextBirthday < now) {
    nextBirthday.setFullYear(currentYear + 1);
  }

  const diffTime = nextBirthday.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const declineDays = (n: number) => {
  if (n % 10 === 1 && n % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'дня';
  return 'дней';
};

const DisplayView: React.FC<DisplayViewProps> = ({ photoUri, name, birthday, description }) => {
  const daysUntilBirthday = birthday ? getDaysUntilBirthday(typeof birthday === 'string' ? birthday : birthday.toISOString()) : null;

  return (
    <>
      <View style={styles.imageContainer}>
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.image} /> : <DefaultUserAvatar />}
      </View>
      <Text style={styles.h2}>{name}</Text>
      <Text style={styles.text}>
        Дата рождения: {birthday ? new Date(birthday).toLocaleDateString() : 'Не указано'}
      </Text>
      {daysUntilBirthday === 0 ? (
        <Text style={[styles.text, styles.highlight]}>🎉 День рождения сегодня!</Text>
      ) : daysUntilBirthday !== null ? (
        <Text style={styles.text}>
          До дня рождения: {daysUntilBirthday} {declineDays(daysUntilBirthday)}
        </Text>
      ) : null}
      <Text style={styles.text}>{description}</Text>
    </>
  );
};

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
      color: '#4A4A4A'
    },
    text: {
      color: '#6D6D72',
    },
    highlight: {
    color: '#E67E22',
    fontWeight: '600',
  },
})

export default DisplayView;
