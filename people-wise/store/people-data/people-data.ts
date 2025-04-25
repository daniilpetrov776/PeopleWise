import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NameSpace } from '../../const';
import { PersonCardType } from '../../types/cards';
import { PeopleData } from '../../types/state';

const initialState: PeopleData = {
  cards: [],
}

export const peopleData = createSlice({
  name: NameSpace.People,
  initialState,
  reducers: {
    addCard(state, action: PayloadAction<PersonCardType>) {
      state.cards = [action.payload];
    },
  }
})

