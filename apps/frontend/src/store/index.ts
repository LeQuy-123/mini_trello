import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import themeReducer from "./themeSlice";
import boardReducer from "./boardSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    boards: boardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
