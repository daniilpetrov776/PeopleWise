import React from "react";
import { StyleSheet, View} from 'react-native';
import { PersonCardType } from '../../types/cards';
import PersonCard from '../person-card/person-card';

  type PersonCardsListProps = {
    cards: PersonCardType[];
    onDelete: (id: string) => void
  }

  const cardsStyle = StyleSheet.create({
      cards: {
          fontSize: 20,
          color: 'white',
          textAlign: 'center',
          marginTop: 50,
          display: 'flex',
          gap: 40,
      },
      shadow: {
        marginHorizontal: 'auto',
      }
  })

  const PersonCardsList: React.FC<PersonCardsListProps> = ({ cards, onDelete }) => {
    return (

        <View style={cardsStyle.cards}>
          {cards.map((card: PersonCardType, index: number) => (
            < PersonCard
              key={index}
              id={card.id}
              photoPath={card.photoPath}
              name={card.name}
              birthday={card.birthday}
              description={card.description}
              onDelete={onDelete} // Передаем функцию для открытия модалки
            />
          ))}
        </View>
    );
  };
  export default PersonCardsList;
