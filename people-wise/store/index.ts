import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './root-reducer';
import { Logger } from '../libs/logger'
import { ConsoleLogger } from '../libs/logger/console.loger';


export interface ThunkExtraArg {
  logger: Logger;
}

const extraArgument: ThunkExtraArg = {
  logger: new ConsoleLogger()
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument,
      }
    }),
});
