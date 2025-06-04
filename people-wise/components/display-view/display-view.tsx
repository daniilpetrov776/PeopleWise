import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PersonCardType } from '../../types/cards';
import DefaultUserAvatar from '../user-avatar/user-avatar';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import { declineDays, declineYears, computeNextBirthday } from './display-view.helpers';

dayjs.locale('ru');

type DisplayViewProps = Omit<PersonCardType, 'id'> & {
  photoUri: string;
};

const DisplayView: React.FC<DisplayViewProps> = ({ photoUri, name, birthday, description }) => {
  // Вычисляем дни до следующего ДР, саму дату next и оригинальную дату birthDate
  const { days, next, birthDate } = computeNextBirthday(birthday ? String(birthday) : '');
  const weekdayAbbrev = next ? next.format('dd') : '';

   // Вычисляем, сколько лет исполнится: разница годов next и birthDate
  let upcomingAge: number | null = null;
  if (next && birthDate) {
    const rawDiff = next.year() - birthDate.year();
    upcomingAge = rawDiff > 0 ? rawDiff : 1;
  }

  let upcomingStyle = styles.text;
  if (days !== null && days > 0) {
    if (days <= 7) {
      upcomingStyle = styles.redHighlight;
    } else if (days <= 30) {
      upcomingStyle = styles.yellowHighlight;
    }
  }

  return (
    <>
      <View style={styles.imageContainer}>
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.image} /> : <DefaultUserAvatar />}
      </View>
      <Text style={styles.h2}>{name}</Text>
      <Text style={styles.text}>
        Дата рождения: {dayjs(birthday).isValid() ? dayjs(birthday).format('DD.MM.YYYY') : 'Не указано'}
      </Text>
      {days === 0 ? (
        <Text style={[styles.text, styles.highlight]}>🎉 День рождения сегодня!</Text>
      ) : days !== null ? (
        <Text style={upcomingStyle}>
          До дня рождения: {days} {declineDays(days)} ({weekdayAbbrev})
        </Text>
      ) : null}
      <Text style={styles.text}>
        Исполнится {upcomingAge}{' '}{upcomingAge !== null ? declineYears(upcomingAge) : ''}
      </Text>
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
      // Если осталось меньше недели – красное
    redHighlight: {
      color: '#f00',
      fontWeight: '600',
    },
    // Если осталось меньше месяца – желтое (например, #F1C40F)
    yellowHighlight: {
      color: '#A34D67',
      fontWeight: '600',
    },
})

export default DisplayView;
