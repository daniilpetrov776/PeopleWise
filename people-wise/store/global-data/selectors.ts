import { RootState } from '../../types/state';
import { NameSpace } from '@/const';

export const getIsOverlayVisible = (state: RootState):boolean => state[NameSpace.Global].isOverlayVisible;
