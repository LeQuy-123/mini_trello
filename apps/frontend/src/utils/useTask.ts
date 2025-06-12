import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@store/index';
import {
	resetTaskStatus,
	getTasks,
	getTask,
	createTask,
	updateTask,
	deleteTask,
	reorderTasks,
	moveTasks,
} from '@store/taskSlice';
import type { CreateTaskBody, TaskMoveBody, TaskReorderBody } from '@services/taskService';

export const useTask = () => {
	const dispatch = useDispatch<AppDispatch>();

	const {
		tasksByCardId,
		get: getTasksStatus,
		getOne: getOneTaskStatus,
		create: createTaskStatus,
		update: updateTaskStatus,
		delete: removeTaskStatus,
	} = useSelector((state: RootState) => state.tasks);

	return {
		tasksByCardId,
		getTasksStatus,
		getOneTaskStatus,
		createTaskStatus,
		updateTaskStatus,
		removeTaskStatus,
		getTasks: (params: { boardId: string; cardId: string }) => dispatch(getTasks(params)),
		getTask: (params: { boardId: string; cardId: string; taskId: string }) =>
			dispatch(getTask(params)),
		createTask: (params: { boardId: string; cardId: string; data: CreateTaskBody }) =>
			dispatch(createTask(params)),
		updateTask: (params: {
			boardId: string;
			cardId: string;
			taskId: string;
			data: CreateTaskBody;
		}) => dispatch(updateTask(params)),
		deleteTask: (params: { boardId: string; cardId: string; taskId: string }) =>
			dispatch(deleteTask(params)),
		resetTaskStatus: () => dispatch(resetTaskStatus()),
		reorderTasks: ({
			boardId,
			cardId,
			data,
		}: {
			boardId: string;
			cardId: string;
			data: TaskReorderBody;
		}) => dispatch(reorderTasks({ boardId, cardId, data })),
		moveTasks: ({
			boardId,
			cardId,
			data,
		}: {
			boardId: string;
			cardId: string;
			data: TaskMoveBody;
		}) => dispatch(moveTasks({ boardId, cardId, data })),
	};
};
