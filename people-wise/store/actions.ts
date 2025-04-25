import { createAsyncThunk } from '@reduxjs/toolkit';
import { PersonCardType } from '../types/cards';
import { ThunkExtraArg } from '.';

const Action = {
  ADD_PERSON: 'data/ADD_PERSON'
}

export const addPersonAction = createAsyncThunk<
  PersonCardType,
  PersonCardType,
  { extra: ThunkExtraArg }>(
  Action.ADD_PERSON,
  async (personCard, thunkAPI) => {
    const { logger } = thunkAPI.extra;
    logger.info('Adding person to the store...');
    return personCard;
  }
);
