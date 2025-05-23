import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NameSpace } from '../../const';
import { PersonCardType } from '../../types/cards';
import { PeopleData } from '../../types/state';
import { addPersonAction, deletePersonAction, syncPersonsFromDB, updatePersonAction } from '../actions';

const initialState: PeopleData = {
  cards: [] as PersonCardType[],
  isDataLoading: true,
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
      .addCase(updatePersonAction.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.cards.findIndex(card => card.id === updated.id);
        if (index !== -1) {
          state.cards[index] = updated;
      }
      })
      .addCase(updatePersonAction.rejected, () => {
        console.error('Error updating person');
      })
      .addCase(deletePersonAction.fulfilled, (state, action) => {
        state.cards = state.cards.filter(card => card.id !== action.payload);
      })
      .addCase(deletePersonAction.rejected, () => {
        console.error('Error deleting person');
      })
      .addCase(syncPersonsFromDB.fulfilled, (state, action) => {
        state.cards = action.payload;
        state.isDataLoading = false;
      })
      .addCase(syncPersonsFromDB.pending, (state) => {
        state.isDataLoading = true;
      })
      .addCase(syncPersonsFromDB.rejected, (state) => {
        state.isDataLoading = false;
        console.error('Error syncing persons from DB');
      })
  },
})

