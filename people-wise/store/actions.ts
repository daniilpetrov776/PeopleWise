import { createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { PersonCardType } from '../types/cards';
import { ThunkExtraArg } from '.';
import { getAllPersons } from '@/data-base/db';

const Action = {
  ADD_PERSON: 'data/ADD_PERSON',
  UPDATE_PERSON: 'data/UPDATE_PERSON',
  DELETE_PERSON: 'data/DELETE_PERSON',
  SYNC_PERSONS: 'data/SYNC_PERSONS_FROM_DB',
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

export const syncPersonsFromDB = createAsyncThunk<
  PersonCardType[],
  void,
  { extra: ThunkExtraArg}
  >(
    Action.SYNC_PERSONS,
    async (_, thunkAPI) => {
    const { logger } = thunkAPI.extra;
    logger.info('Syncing persons from DB...');
    const persons = await getAllPersons();
    return persons;
    }
  )

