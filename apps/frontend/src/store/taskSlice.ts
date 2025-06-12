import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import TaskService, { type Task, type CreateTaskBody } from '@services/taskService';
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
}


const initialState: TaskState = {
	tasksByCardId: {},
	task: null,
	get: getDefaultAsyncState(),
	delete: getDefaultAsyncState(),
	create: getDefaultAsyncState(),
	update: getDefaultAsyncState(),
	getOne: getDefaultAsyncState(),
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


const taskSlice = createSlice({
	name: 'tasks',
	initialState,
	reducers: {
		resetTaskStatus(state) {
			state.get = getDefaultAsyncState();
			state.create = getDefaultAsyncState();
			state.update = getDefaultAsyncState();
			state.getOne = getDefaultAsyncState();
		},
		reorderTasks: (
			state,
			action: PayloadAction<{
				sourceCardId: string;
				destinationCardId: string;
				taskId: string;
				newIndex: number;
			}>
		) => {
			const { sourceCardId, destinationCardId, taskId, newIndex } = action.payload;
			const sourceTasks = state.tasksByCardId[sourceCardId] || [];
			const destinationTasks = state.tasksByCardId[destinationCardId] || [];
			const taskIndex = sourceTasks.findIndex((t) => t.id === taskId);
			if (taskIndex === -1) return;
			const movedTask = sourceTasks[taskIndex];

			const newSourceTasks =
				sourceCardId === destinationCardId
					? [...sourceTasks]
					: sourceTasks.filter((_, i) => i !== taskIndex);

			const newDestinationTasks =
				sourceCardId === destinationCardId ? newSourceTasks : [...destinationTasks];

			if (sourceCardId === destinationCardId) {
				newDestinationTasks.splice(taskIndex, 1);
			}

			newDestinationTasks.splice(newIndex, 0, movedTask);
			state.tasksByCardId[sourceCardId] = newSourceTasks;
			state.tasksByCardId[destinationCardId] = newDestinationTasks;
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
	},
});

export const { resetTaskStatus, reorderTasks } = taskSlice.actions;
export default taskSlice.reducer;
