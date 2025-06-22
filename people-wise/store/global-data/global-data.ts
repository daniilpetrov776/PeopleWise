import { NameSpace } from '@/const';
import { GlobalData } from '@/types/state';
import { createSlice } from '@reduxjs/toolkit';

const initialState: GlobalData = {
  isOverlayVisible: false,
}

export const globalData = createSlice({
  name: NameSpace.Global,
  initialState,
  reducers: {
    showOverlay: (state) => {
      state.isOverlayVisible = true;
    },
    hideOverlay: (state) => {
      state.isOverlayVisible = false;
    },
  },
})

export const {showOverlay, hideOverlay} = globalData.actions;
