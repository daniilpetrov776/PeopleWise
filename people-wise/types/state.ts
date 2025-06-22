import { rootReducer } from '@/store/root-reducer';
import { store } from '../store/index'
import { PersonCardType } from './cards';
import { BirthdayNotificationSettings, BirthdayNotification } from './notifications';

export type State = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;

export type PeopleData = {
  cards: PersonCardType[];
  isDataLoading: boolean;
}

export type GlobalData = {
  isOverlayVisible: boolean;
}

export type NotificationsData = {
  isInitialized: boolean;
  hasPermissions: boolean;
  settings: BirthdayNotificationSettings | null;
  scheduledNotifications: BirthdayNotification[];
  loading: boolean;
  error: string | null;
}
