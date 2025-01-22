import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './courseSlice';
import { firebaseSyncMiddleware } from './middleware/firebaseSync';

export const store = configureStore({
    reducer: {
        courses: courseReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(firebaseSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 