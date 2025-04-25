import { combineReducers } from '@reduxjs/toolkit';
import { peopleData } from './people-data/people-data'
import { NameSpace } from '@/const';

export const rootReducer = combineReducers({
  [NameSpace.People]: peopleData.reducer,
})
