import { configureStore, Middleware } from '@reduxjs/toolkit';
import { rootReducer } from './root-reducer';
import { Logger } from '../libs/logger'
import { ConsoleLogger } from '../libs/logger/console.loger';
import { addPersonAction, deletePersonAction, updatePersonAction } from './actions';
import { deletePerson, initDB, insertOrReplacePerson } from '@/data-base/db';


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

export const databaseMiddleware: Middleware = store => next => async action => {
  // Сначала пропускаем экшен дальше — к редьюсерам
  const result = next(action);

  if (addPersonAction.fulfilled.match(action)) {
    try {
      // await initDB(); // ✅ гарантируем инициализацию
      console.log('[Middleware] Adding person to DB:', action.payload);
      await insertOrReplacePerson(action.payload);
    } catch (error) {
      console.error('[Middleware ERROR] Failed to add person to DB:', error);
    }
  }

  if (updatePersonAction.fulfilled.match(action)) {
    try {
      // await initDB();
      console.log('[Middleware] updating person in DB:', action.payload)
      await insertOrReplacePerson(action.payload);
    } catch (error) {
      console.error('[Middleware ERROR] update person in DB:', error);
    }
  }

  if (deletePersonAction.fulfilled.match(action)) {
    await deletePerson(action.payload);
  }

  return result;
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument,
      }
    })
    .concat(loggerMiddleware, databaseMiddleware),
});
