
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});

// TypeScript와 함께 사용하기 위해 RootState와 AppDispatch 타입을 export합니다.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
