import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import TaskService, { type Task, type CreateTaskBody, type TaskReorderBody, type TaskMoveBody } from '@services/taskService';
import { getDefaultAsyncState, showError, showSuccess } from '@utils/helper';
import type { AsyncStatus } from '@utils/type';
import { decrementTaskCount, incrementTaskCount } from './cardSlice';

interface TaskState {
	tasksByCardId: Record<string, Task[]>;
	task: Task | null;
	get: AsyncStatus;
	delete: AsyncStatus;
	create: AsyncStatus;
	update: AsyncStatus;
	getOne: AsyncStatus;
	reorder: ReturnType<typeof getDefaultAsyncState>;
	move: AsyncStatus;
}


const initialState: TaskState = {
	tasksByCardId: {},
	task: null,
	get: getDefaultAsyncState(),
	delete: getDefaultAsyncState(),
	create: getDefaultAsyncState(),
	update: getDefaultAsyncState(),
	getOne: getDefaultAsyncState(),
	reorder: getDefaultAsyncState(),
	move: getDefaultAsyncState(),
};


export const getTasks = createAsyncThunk(
	'tasks/get',
	async ({ boardId, cardId }: { boardId: string; cardId: string }, thunkAPI) => {
		try {
			const tasks = await TaskService.getTasks({ boardId, cardId });

			return { cardId, tasks };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to fetch tasks');
		}
	}
);
export const getTask = createAsyncThunk(
	'tasks/getOne',
	async (
		{ boardId, cardId, taskId }: { boardId: string; cardId: string; taskId: string },
		thunkAPI
	) => {
		try {
			const task = await TaskService.getTask({ boardId, cardId, taskId });
			return task;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to fetch tasks');
		}
	}
);
export const createTask = createAsyncThunk(
	'tasks/create',
	async (
		{ boardId, cardId, data }: { boardId: string; cardId: string; data: CreateTaskBody },
		thunkAPI
	) => {
		try {
			const task = await TaskService.createTask({ boardId, cardId, data });
			thunkAPI.dispatch(incrementTaskCount(cardId));
			return { cardId, task };
		} catch (error: any) {
			console.log("🚀 ~ error:", error)
			showError(error);
			return thunkAPI.rejectWithValue(error?.message || 'Failed to create task');
		}
	}
);
export const deleteTask = createAsyncThunk(
	'tasks/delete',
	async (
		{
			boardId,
			cardId,
			taskId,
		}: {
			boardId: string;
			cardId: string;
			taskId: string;
		},
		thunkAPI
	) => {
		try {
			await TaskService.deleteTask({ boardId, cardId, taskId });
			thunkAPI.dispatch(decrementTaskCount(cardId));
			showSuccess('Task deleted successfully');
			return { cardId, taskId };
		} catch (error: any) {
			showError(error)
			return thunkAPI.rejectWithValue(error?.message || 'Failed to delete task');
		}
	}
);

export const updateTask = createAsyncThunk(
	'tasks/update',
	async (
		{
			boardId,
			cardId,
			taskId,
			data,
		}: {
			boardId: string;
			cardId: string;
			taskId: string;
			data: CreateTaskBody;
		},
		thunkAPI
	) => {
		try {
			const task = await TaskService.updateTask({ boardId, cardId, taskId, data });
			return { cardId, task };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to update task');
		}
	}
);

export const reorderTasks = createAsyncThunk(
	'task/reorder',
	async (
		{ boardId, data, cardId }: { boardId: string; data: TaskReorderBody; cardId: string },
		thunkAPI
	) => {
		try {
			const tasks = await TaskService.reorderTask(boardId,cardId, data);
			return { cardId, tasks };
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to reorder task');
		}
	}
);
export const moveTasks = createAsyncThunk(
	'task/move',
	async (
		{ boardId, data, cardId }: { boardId: string; data: TaskMoveBody; cardId: string },
		thunkAPI
	) => {
		try {
			await TaskService.moveTask(boardId, cardId, data);
			const tasksOriginal = await TaskService.getTasks({ boardId, cardId });
			const tasksNews = await TaskService.getTasks({ boardId, cardId: data.targetGroup });

			return {
				originalCard: cardId,
				tasksOriginal,
				newCard: data.targetGroup,
				tasksNews,
			};
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error?.message || 'Failed to move task');
		}
	}
);
const taskSlice = createSlice({
	name: 'tasks',
	initialState,
	reducers: {
		resetTaskStatus(state) {
			state.get = getDefaultAsyncState();
			state.create = getDefaultAsyncState();
			state.update = getDefaultAsyncState();
			state.getOne = getDefaultAsyncState();
			state.move = getDefaultAsyncState();
			state.reorder = getDefaultAsyncState();

		},

	},
	extraReducers: (builder) => {
		const handleAsync = <K extends keyof Omit<TaskState, 'tasksByCardId' | 'task'>>(
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
						const { cardId, tasks } = action.payload;
						state.tasksByCardId[cardId] = tasks;
					}
					if (type === 'getOne') {
						state.task = action.payload;
					}
					if (type === 'move') {
						// const { originalCard, tasksOriginal, newCard, tasksNews } = action.payload;
						// state.tasksByCardId[originalCard] = tasksOriginal;
						// state.tasksByCardId[newCard] = tasksNews;
					}
					if (type === 'reorder') {
						// const { cardId, tasks } = action.payload;
						// state.tasksByCardId[cardId] = tasks;
					}

					if (type === 'create') {
						const { cardId, task } = action.payload;
						state.tasksByCardId[cardId] = [
							...(state.tasksByCardId[cardId] || []),
							task,
						];
					}

					if (type === 'update') {
						const { cardId, task } = action.payload;
						const tasks = state.tasksByCardId[cardId] || [];
						const index = tasks.findIndex((t) => t.id === task.id);
						if (index !== -1) {
							const updatedTasks = [...tasks];
							updatedTasks[index] = task;
							state.tasksByCardId[cardId] = updatedTasks;
						}
					}
					if (type === 'delete') {
						const { cardId, taskId } = action.payload;
						const tasks = state.tasksByCardId[cardId] || [];
						state.tasksByCardId[cardId] = tasks.filter((task) => task.id !== taskId);
					}
				})
				.addCase(thunk.rejected, (state, action) => {
					state[type].loading = false;
					state[type].error = action.payload as string;
				});
		};
		handleAsync('delete', deleteTask);
		handleAsync('get', getTasks);
		handleAsync('getOne', getTask);

		handleAsync('create', createTask);
		handleAsync('update', updateTask);
		handleAsync('reorder', reorderTasks);
		handleAsync('move', moveTasks);
	},
});

export const { resetTaskStatus } = taskSlice.actions;
export default taskSlice.reducer;
