import { combineReducers } from '@reduxjs/toolkit';
import { peopleData } from './people-data/people-data'
import { NameSpace } from '@/const';
import { globalData } from './global-data/global-data';

export const rootReducer = combineReducers({
  [NameSpace.People]: peopleData.reducer,
  [NameSpace.Global]: globalData.reducer,
})
