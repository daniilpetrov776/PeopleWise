import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BirthdayNotificationSettings, BirthdayNotification } from '@/types/notifications';
import { birthdayNotificationService } from '@/services/birthday-notification-service';

// Async thunks
export const initializeNotifications = createAsyncThunk(
  'notifications/initialize',
  async () => {
    await birthdayNotificationService.initialize();
    const settings = await birthdayNotificationService.getSettings();
    const hasPermissions = await birthdayNotificationService.checkPermissions();
    const scheduledNotifications = await birthdayNotificationService.getScheduledNotifications();
    return { settings, hasPermissions, scheduledNotifications };
  }
);

export const requestNotificationPermissions = createAsyncThunk(
  'notifications/requestPermissions',
  async () => {
    return await birthdayNotificationService.requestPermissions();
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateSettings',
  async (settings: BirthdayNotificationSettings) => {
    await birthdayNotificationService.updateSettings(settings);
    return settings;
  }
);

export const schedulePersonNotifications = createAsyncThunk(
  'notifications/schedulePerson',
  async ({ personId, name, birthday }: { personId: string; name: string; birthday: string }) => {
    await birthdayNotificationService.schedulePersonNotifications(personId, name, birthday);
  }
);

export const cancelPersonNotifications = createAsyncThunk(
  'notifications/cancelPerson',
  async (personId: string) => {
    await birthdayNotificationService.cancelPersonNotifications(personId);
  }
);

export const updatePersonNotifications = createAsyncThunk(
  'notifications/updatePerson',
  async ({ personId, name, birthday }: { personId: string; name: string; birthday: string }) => {
    await birthdayNotificationService.updatePersonNotifications(personId, name, birthday);
  }
);

export const getScheduledNotifications = createAsyncThunk(
  'notifications/getScheduled',
  async () => {
    return await birthdayNotificationService.getScheduledNotifications();
  }
);

export const cleanupPastNotifications = createAsyncThunk(
  'notifications/cleanupPast',
  async () => {
    await birthdayNotificationService.cleanupPastNotifications();
  }
);

// State interface
interface NotificationsState {
  isInitialized: boolean;
  hasPermissions: boolean;
  settings: BirthdayNotificationSettings | null;
  scheduledNotifications: BirthdayNotification[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationsState = {
  isInitialized: false,
  hasPermissions: false,
  settings: null,
  scheduledNotifications: [],
  loading: false,
  error: null,
};

// Slice
export const notificationsData = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeNotifications.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.settings = action.payload.settings;
        state.hasPermissions = action.payload.hasPermissions;
        state.scheduledNotifications = action.payload.scheduledNotifications;
        state.loading = false;
      })
      .addCase(initializeNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to initialize notifications';
      })

      // Request permissions
      .addCase(requestNotificationPermissions.fulfilled, (state, action) => {
        state.hasPermissions = action.payload;
      })

      // Update settings
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })

      // Get scheduled notifications
      .addCase(getScheduledNotifications.fulfilled, (state, action) => {
        state.scheduledNotifications = action.payload;
      });
  },
});

// export const { clearError, setLoading } = notificationsSlice.actions;
// export default notificationsSlice.reducer;

export const { clearError, setLoading } = notificationsData.actions;
