import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './authSlice';
import themeReducer from './themeSlice';
import boardReducer from './boardSlice';
import cardReducer from './cardSlice';
import taskReducer from './taskSlice';
import invitationReducer from './invitationSlice';
import authWithOtpReducer from './authSliceWithOTP';

export const store = configureStore({
	reducer: {
		theme: themeReducer,
		// auth: authReducer,
		authWithOtp: authWithOtpReducer,
		boards: boardReducer,
		cards: cardReducer,
		tasks: taskReducer,
		invitations: invitationReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
