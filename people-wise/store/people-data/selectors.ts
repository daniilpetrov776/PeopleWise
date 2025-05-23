import { RootState } from '../../types/state';
import { PersonCardType } from '../../types/cards';
import { NameSpace } from '@/const';

export const getCards = (state: RootState):PersonCardType[] => state[NameSpace.People].cards;
export const getIsDataLoading = (state: RootState) => state[NameSpace.People].isDataLoading;
