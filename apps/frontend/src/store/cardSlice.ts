import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import CardService, { type Card, type CardReorderBody } from '@services/cardService';
import { showError, showSuccess } from '@utils/helper';

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
			data: { name: string; description?: string };
		},
		thunkAPI
	) => {
		try {
			const res = await CardService.createCard(boardId, data);
			showSuccess('Card created successfully');
			return res;
		} catch (error: any) {
			showError(error?.message);
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
			data: { name?: string; description?: string };
		},
		thunkAPI
	) => {
		try {
			const res = await CardService.updateCard(boardId, cardId, data);
			showSuccess('Card updated successfully');
			return res;
		} catch (error: any) {
			showError(error?.message);
			return thunkAPI.rejectWithValue(error?.message || 'Failed to update card');
		}
	}
);

export const deleteCard = createAsyncThunk(
	'cards/delete',
	async ({ boardId, cardId }: { boardId: string; cardId: string }, thunkAPI) => {
		try {
			await CardService.deleteCard(boardId, cardId);
			showSuccess('Card deleted successfully');
			return cardId;
		} catch (error: any) {
			showError(error?.message);
			return thunkAPI.rejectWithValue(error?.message || 'Failed to delete card');
		}
	}
);
export const reorderCard = createAsyncThunk(
	'cards/reorder',
	async ({ boardId, data }: { boardId: string; data: CardReorderBody }, thunkAPI) => {
		try {
			const res = await CardService.reorderCard(boardId, data);
			return res;
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
	reorder: ReturnType<typeof getDefaultAsyncState>;
}

const initialState: CardState = {
	cards: [],
	card: null,
	get: getDefaultAsyncState(),
	getOne: getDefaultAsyncState(),
	create: getDefaultAsyncState(),
	update: getDefaultAsyncState(),
	remove: getDefaultAsyncState(),
	reorder: getDefaultAsyncState(),
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
		},
		incrementTaskCount: (state, action: PayloadAction<string>) => {
			const card = state.cards.find((c) => c.id === action.payload);
			if (card) {
				card.tasksCount = (card.tasksCount ?? 0) + 1;
			}
		},
		decrementTaskCount: (state, action: PayloadAction<string>) => {
			const card = state.cards.find((c) => c.id === action.payload);
			if (card) {
				card.tasksCount = Math.max((card.tasksCount ?? 1) - 1, 0);
			}
		},
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
						state.cards.push(action.payload);
					}
					if (type === 'reorder') {
						state.cards = action.payload; // new list order
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
		handleAsync('reorder', reorderCard);
	},
});

export const { resetCardStatus, clearCards, incrementTaskCount, decrementTaskCount } =
	cardSlice.actions;
export default cardSlice.reducer;
