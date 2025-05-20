import React from "react";
import { StyleSheet, View} from 'react-native';
import { PersonCardType } from '../../types/cards';
import PersonCard from '../person-card/person-card';

  type PersonCardsListProps = {
    cards: PersonCardType[];
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

  const PersonCardsList: React.FC<PersonCardsListProps> = ({ cards }) => {
    return (

        <View style={cardsStyle.cards}>
          {cards.map((card: PersonCardType, index: number) => (
            < PersonCard
              key={index}
              photoPath={card.photoPath}
              name={card.name}
              birthday={card.birthday}
              description={card.description}
            />
          ))}
        </View>
    );
  };
  export default PersonCardsList;
