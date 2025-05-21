import { createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { PersonCardType } from '../types/cards';
import { ThunkExtraArg } from '.';

const Action = {
  ADD_PERSON: 'data/ADD_PERSON',
  UPDATE_PERSON: 'data/UPDATE_PERSON',
  DELETE_PERSON: 'data/DELETE_PERSON',
}

export const addPersonAction = createAsyncThunk<
  PersonCardType,
  Omit<PersonCardType, 'id'>,
  { extra: ThunkExtraArg }>(
  Action.ADD_PERSON,
  async (personCard, thunkAPI) => {
    const { logger } = thunkAPI.extra;
    logger.info('Adding person to the store...');
    return {
      ...personCard,
      id: nanoid(),
    };
  }
);

export const updatePersonAction = createAsyncThunk<
  PersonCardType,
  PersonCardType,
  { extra: ThunkExtraArg }>(
  Action.UPDATE_PERSON,
  async (personCard, thunkAPI) => {
    const { logger } = thunkAPI.extra;
    logger.info('Updating person in the store...');
    return personCard;
  }
);

export const deletePersonAction = createAsyncThunk<
  string,
  string,
  { extra: ThunkExtraArg }>(
  Action.DELETE_PERSON,
  async (id, thunkAPI) => {
    const { logger } = thunkAPI.extra;
    logger.info('Deleting person from the store...');
    return id;
  }
);
