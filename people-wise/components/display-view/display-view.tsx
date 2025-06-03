import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PersonCardType } from '../../types/cards';
import DefaultUserAvatar from '../user-avatar/user-avatar';
import dayjs from 'dayjs';

type DisplayViewProps = Omit<PersonCardType, 'id'> & {
  photoUri: string;
};

const getDaysUntilBirthday = (birthday: string): number | null => {
  const birthDate = dayjs(birthday);
  if (!birthDate.isValid()) return null;

  const now = dayjs();
  // const currentYear = now.getFullYear();
  let nextBirthday = birthDate.year(now.year());
  // const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

  // Если день рождения уже прошёл — берём следующий год
  // if (
  //   nextBirthday.getMonth() === now.getMonth() &&
  //   nextBirthday.getDate() === now.getDate()
  // ) {
  //   return 0; // сегодня
  // }

  // if (nextBirthday < now) {
  //   nextBirthday.setFullYear(currentYear + 1);
  // }

  // const diffTime = nextBirthday.getTime() - now.getTime();
  // return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (nextBirthday.isBefore(now, 'day')) {
    nextBirthday = nextBirthday.add(1, 'year');
  }

  const diff = nextBirthday.diff(now, 'day');

  return diff === 0 ? 0 : diff;
};

const declineDays = (n: number) => {
  if (n % 10 === 1 && n % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'дня';
  return 'дней';
};

const DisplayView: React.FC<DisplayViewProps> = ({ photoUri, name, birthday, description }) => {
  const birthdayDate = dayjs(birthday);
  // const daysUntilBirthday = birthday ? getDaysUntilBirthday(typeof birthday === 'string' ? birthday : birthday.toISOString()) : null;
  const daysUntilBirthday = birthdayDate.isValid() ? getDaysUntilBirthday(birthdayDate.toISOString()) : null;

  return (
    <>
      <View style={styles.imageContainer}>
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.image} /> : <DefaultUserAvatar />}
      </View>
      <Text style={styles.h2}>{name}</Text>
      <Text style={styles.text}>
        Дата рождения: {birthdayDate.isValid() ? birthdayDate.format('DD.MM.YYYY') : 'Не указано'}
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
