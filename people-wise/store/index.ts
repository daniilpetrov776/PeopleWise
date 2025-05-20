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

const loggerMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
  const result = next(action);                   // сначала пропускаем экшен дальше
  console.log('→ action:', action);              // (опционально) логируем сам экшен
  console.log('← state:', storeAPI.getState()); // логируем стейт после редьюсеров
  return result;                                 // возвращаем результат dispatch
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument,
      }
    })
    .concat(loggerMiddleware),
});
