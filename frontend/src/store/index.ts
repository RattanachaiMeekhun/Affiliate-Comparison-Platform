import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import builderReducer from './slices/builderSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    builder: builderReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
