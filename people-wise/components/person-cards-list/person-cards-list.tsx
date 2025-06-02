import React, { useRef } from "react";
import { StyleSheet, View} from 'react-native';
import { PersonCardType } from '../../types/cards';
import PersonCard, { PersonCardHandle } from '../person-card/person-card';

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
          paddingBottom: 30,
      },
  })

  const PersonCardsList: React.FC<PersonCardsListProps> = ({ cards, onDelete }) => {
    const cardRefs = useRef<Record<string, React.RefObject<PersonCardHandle>>>({});

      // Создаём ref для каждой карточки
    cards.forEach(card => {
      if (!cardRefs.current[card.id]) {
        cardRefs.current[card.id] = React.createRef<PersonCardHandle>();
      }
    });

      // Обёртка для удаления: сначала cancel, потом redux
    const handleDelete = (id: string) => {
      cardRefs.current[id]?.current?.handleCancel();
      setTimeout(() => {
        onDelete(id);
      }, 50); // Дай анимации закрытия выполниться (подбери время под leave)
    };
    return (

        <View style={cardsStyle.cards}>
          {cards.map((card: PersonCardType, index: number) => (
            < PersonCard
              ref={cardRefs.current[card.id]}
              key={card.id}
              id={card.id}
              photoPath={card.photoPath}
              name={card.name}
              birthday={card.birthday}
              description={card.description}
              onDelete={handleDelete} // Передаем функцию для открытия модалки
            />
          ))}
        </View>
    );
  };
  export default PersonCardsList;
