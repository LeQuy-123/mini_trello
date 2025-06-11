import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import boardReducer from './boardSlice';
import cardReducer from './cardSlice';
import taskReducer from './taskSlice';

export const store = configureStore({
	reducer: {
		theme: themeReducer,
		auth: authReducer,
		boards: boardReducer,
		cards: cardReducer,
		tasks: taskReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
