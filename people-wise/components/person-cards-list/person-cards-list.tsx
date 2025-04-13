import React from "react";
import { StyleSheet, View} from 'react-native';
import { PersonCardType } from '../../types/cards';
import PersonCard from '../person-card/person-card';

  type PersonCardsListProps = {
    mockCards: PersonCardType[];
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

  const PersonCardsList: React.FC<PersonCardsListProps> = ({ mockCards }) => {
    return (

        <View style={cardsStyle.cards}>
          {mockCards.map((card: PersonCardType, index: number) => (
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
