import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NameSpace } from '../../const';
import { PersonCardType } from '../../types/cards';
import { PeopleData } from '../../types/state';
import { addPersonAction } from '../actions';

const initialState: PeopleData = {
  cards: [] as PersonCardType[],
}

export const peopleData = createSlice({
  name: NameSpace.People,
  initialState,
  reducers: {
    // addCard(state, action: PayloadAction<PersonCardType>) {
    //   state.cards = [action.payload];
    // },
  },
  extraReducers(builder) {
    builder
      .addCase(addPersonAction.fulfilled, (state, action) => {
        state.cards.push(action.payload);
      })
      .addCase(addPersonAction.rejected, (state) => {
        console.log('Error adding person');
      })
  },
})

