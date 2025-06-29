import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@services/authService';
import BoardService, { type Board } from '@services/boardService';
import { getDefaultAsyncState, showError, showSuccess } from '@utils/helper';
import type { AsyncStatus } from '@utils/type';

export const getBoards = createAsyncThunk(
	'boards/getAll',
	async (
		payload: {
			name?: string;
			created?: boolean;
		},
		thunkAPI
	) => {
		try {
			const boards: Board[] = await BoardService.getBoards(payload);
			return boards;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to fetch boards');
		}
	}
);

export const getUsers = createAsyncThunk('boards/getUsers', async (payload: string, thunkAPI) => {
	try {
		const board: Board = await BoardService.getUsers(payload);
		return board;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(error?.message || 'Failed to fetch board detail');
	}
});

export const getBoard = createAsyncThunk('boards/getOne', async (payload: string, thunkAPI) => {
	try {
		const board: Board = await BoardService.getBoard(payload);
		return board;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(error?.message || 'Failed to fetch board detail');
	}
});
export const createBoard = createAsyncThunk(
	'boards/create',
	async (data: { name: string; description: string }, thunkAPI) => {
		try {
			const board: Board = await BoardService.createBoard(data);
			showSuccess('Board created successfully');
			return board;
		} catch (error: any) {
			showError(error?.message || 'Failed to create board');
			return thunkAPI.rejectWithValue(error?.message || 'Failed to create board');
		}
	}
);
export const updateBoard = createAsyncThunk(
	'boards/update',
	async (payload: { id: string; data: { name: string; description: string } }, thunkAPI) => {
		try {
			const board: Board = await BoardService.updateBoard(payload.id, payload.data);
			showSuccess('Board updated successfully');
			return board;
		} catch (error: any) {
			showError(error?.message || 'Failed to update board');
			return thunkAPI.rejectWithValue(error?.message || 'Failed to update board');
		}
	}
);
export const deleteBoard = createAsyncThunk('boards/delete', async (id: string, thunkAPI) => {
	try {
		await BoardService.deleteBoard(id);
		showSuccess('Board deleted');
		return id; // so reducer can remove it
	} catch (error: any) {
		showError(error?.message || 'Failed to delete board');
		return thunkAPI.rejectWithValue(error?.message || 'Failed to delete board');
	}
});

interface BoardState {
	boards: Board[];
	users: User[];
	board: Board | null;
	get: AsyncStatus;
	getUsers: AsyncStatus;
	getOne: AsyncStatus;
	create: AsyncStatus;
	update: AsyncStatus;
	remove: AsyncStatus;
}

const initialState: BoardState = {
	boards: [],
	board: null,
	users: [],
	get: getDefaultAsyncState(),
	getUsers: getDefaultAsyncState(),
	getOne: getDefaultAsyncState(),
	create: getDefaultAsyncState(),
	update: getDefaultAsyncState(),
	remove: getDefaultAsyncState(),
};

const boardSlice = createSlice({
	name: 'boards',
	initialState,
	reducers: {
		resetStatus(state) {
			state.board = null;
			state.get = getDefaultAsyncState();
			state.getOne = getDefaultAsyncState();
			state.create = getDefaultAsyncState();
			state.update = getDefaultAsyncState();
			state.remove = getDefaultAsyncState();
		},
	},
	extraReducers: (builder) => {
		const handleAsync = <K extends keyof Omit<BoardState, 'boards' | 'board' | 'users'>>(
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
						state.boards = action.payload;
					}
					if (type === 'getUsers') {
						state.users = action.payload;
					}
					if (type === 'getOne') {
						state.board = action.payload;
					}
					if (type === 'create') {
						state.boards.unshift(action.payload);
					}
					if (type === 'update') {
						const index = state.boards.findIndex((b) => b.id === action.payload.id);
						if (index !== -1) {
							state.boards[index] = action.payload;
						}
					}
					if (type === 'remove') {
						state.boards = state.boards.filter((b) => b.id !== action.payload);
					}
				})
				.addCase(thunk.rejected, (state, action) => {
					state[type].loading = false;
					state[type].error = action.payload as string;
				});
		};

		handleAsync('get', getBoards);
		handleAsync('getOne', getBoard);
		handleAsync('create', createBoard);
		handleAsync('update', updateBoard);
		handleAsync('remove', deleteBoard);
		handleAsync('getUsers', getUsers);
	},
});

export const { resetStatus } = boardSlice.actions;
export default boardSlice.reducer;
