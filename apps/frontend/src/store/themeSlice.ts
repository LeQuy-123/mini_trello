// store/themeSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type PaletteMode } from '@mui/material';

interface ThemeState {
	mode: PaletteMode;
}
const localStoredMoode = localStorage.getItem('mode') as PaletteMode;

const initialState: ThemeState = {
	mode: localStoredMoode || 'light',
};

const themeSlice = createSlice({
	name: 'theme',
	initialState,
	reducers: {
		toggleTheme: (state) => {
			const newMode = state.mode === 'light' ? 'dark' : 'light';
			state.mode = newMode;
			localStorage.setItem('mode', newMode);
		},
		setTheme: (state, action: PayloadAction<PaletteMode>) => {
			state.mode = action.payload;
		},
	},
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
