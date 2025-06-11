import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import CardService, { type  Card } from '@services/cardService';

export const getCards = createAsyncThunk(
	'cards/getAll',
	async (
		{
			boardId,
			userId,
		}: {
			boardId: string;
			userId?: string;
		},
		thunkAPI
	) => {
		try {
			if (userId) {
				return await CardService.getCardsByUser(boardId, userId);
			} else {
				return await CardService.getCards(boardId);
			}
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to fetch cards');
		}
	}
);

export const getCard = createAsyncThunk(
	'cards/getOne',
	async ({ boardId, cardId }: { boardId: string; cardId: string }, thunkAPI) => {
		try {
			return await CardService.getCard(boardId, cardId);
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to fetch card');
		}
	}
);

export const createCard = createAsyncThunk(
	'cards/create',
	async (
		{
			boardId,
			data,
		}: {
			boardId: string;
			data: { title: string; description?: string; assignedUserIds?: string[] };
		},
		thunkAPI
	) => {
		try {
			return await CardService.createCard(boardId, data);
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to create card');
		}
	}
);

export const updateCard = createAsyncThunk(
	'cards/update',
	async (
		{
			boardId,
			cardId,
			data,
		}: {
			boardId: string;
			cardId: string;
			data: { title?: string; description?: string; assignedUserIds?: string[] };
		},
		thunkAPI
	) => {
		try {
			return await CardService.updateCard(boardId, cardId, data);
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to update card');
		}
	}
);

export const deleteCard = createAsyncThunk(
	'cards/delete',
	async ({ boardId, cardId }: { boardId: string; cardId: string }, thunkAPI) => {
		try {
			await CardService.deleteCard(boardId, cardId);
			return cardId;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to delete card');
		}
	}
);

const getDefaultAsyncState = () => ({
	loading: false,
	error: null as string | null,
});

interface CardState {
	cards: Card[];
	card: Card | null;
	get: ReturnType<typeof getDefaultAsyncState>;
	getOne: ReturnType<typeof getDefaultAsyncState>;
	create: ReturnType<typeof getDefaultAsyncState>;
	update: ReturnType<typeof getDefaultAsyncState>;
	remove: ReturnType<typeof getDefaultAsyncState>;
}

const initialState: CardState = {
	cards: [],
	card: null,
	get: getDefaultAsyncState(),
	getOne: getDefaultAsyncState(),
	create: getDefaultAsyncState(),
	update: getDefaultAsyncState(),
	remove: getDefaultAsyncState(),
};

const cardSlice = createSlice({
	name: 'cards',
	initialState,
	reducers: {
		resetCardStatus(state) {
			state.get = getDefaultAsyncState();
			state.getOne = getDefaultAsyncState();
			state.create = getDefaultAsyncState();
			state.update = getDefaultAsyncState();
			state.remove = getDefaultAsyncState();
		},
		clearCards(state) {
			state.card = null;
			state.cards = [];
			state.get = getDefaultAsyncState();
			state.getOne = getDefaultAsyncState();
			state.create = getDefaultAsyncState();
			state.update = getDefaultAsyncState();
			state.remove = getDefaultAsyncState();
		}
	},
	extraReducers: (builder) => {
		const handleAsync = <K extends keyof Omit<CardState, 'cards' | 'card'>>(
			type: K,
			thunk: any
		) => {
			builder
				.addCase(thunk.pending, (state) => {
					state[type].loading = true;
					state[type].error = null;
				})
				.addCase(thunk.fulfilled, (state, action) => {
					state[type].loading = false;
					if (type === 'get') {
						state.cards = action.payload;
					}
					if (type === 'getOne') {
						state.card = action.payload;
					}
					if (type === 'create') {
						state.cards.unshift(action.payload);
					}
					if (type === 'update') {
						const index = state.cards.findIndex((c) => c.id === action.payload.id);
						if (index !== -1) {
							state.cards[index] = action.payload;
						}
					}
					if (type === 'remove') {
						state.cards = state.cards.filter((c) => c.id !== action.payload);
					}
				})
				.addCase(thunk.rejected, (state, action) => {
					state[type].loading = false;
					state[type].error = action.payload as string;
				});
		};
		handleAsync('get', getCards);
		handleAsync('getOne', getCard);
		handleAsync('create', createCard);
		handleAsync('update', updateCard);
		handleAsync('remove', deleteCard);
	},
});

export const { resetCardStatus, clearCards } = cardSlice.actions;
export default cardSlice.reducer;
