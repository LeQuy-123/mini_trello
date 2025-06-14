import apiClient from './apiClient';

export type TaskReorderBody = {
	sourceId: string;
	targetId: string;
};
export type TaskMoveBody = {
	sourceId: string;
	targetGroup: string;
	targetIndex: number;
};
export interface Task {
	id: string;
	cardId: string;
	boardId: string;
	title: string;
	description: string;
	status: 'new' | 'wip' | 'reject' | 'complete' | '';
	ownerId: string;
	assignedUserIds: string[];
}
export interface CreateTaskBody {
	title: string;
	description: string;
	status: string;
}

class TaskService {
	static async getTasks({
		boardId,
		cardId,
	}: {
		boardId: string;
		cardId: string;
	}): Promise<Task[]> {
		const res = await apiClient.get<Task[]>(`/boards/${boardId}/cards/${cardId}/tasks`);
		return res.data;
	}
	static async createTask({
		boardId,
		cardId,
		data,
	}: {
		boardId: string;
		cardId: string;
		data: CreateTaskBody;
	}): Promise<Task> {
		const res = await apiClient.post<Task>(`/boards/${boardId}/cards/${cardId}/tasks`, data);
		return res.data;
	}
	static async getTask({
		boardId,
		cardId,
		taskId,
	}: {
		boardId: string;
		cardId: string;
		taskId: string;
	}): Promise<Task> {
		const res = await apiClient.post<Task>(
			`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`
		);
		return res.data;
	}
	static async updateTask({
		boardId,
		cardId,
		taskId,
		data,
	}: {
		boardId: string;
		cardId: string;
		taskId: string;
		data: CreateTaskBody;
	}): Promise<Task> {
		const res = await apiClient.put<Task>(
			`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`,
			data
		);
		return res.data;
	}
	static async deleteTask({
		boardId,
		cardId,
		taskId,
	}: {
		boardId: string;
		cardId: string;
		taskId: string;
	}): Promise<boolean> {
		await apiClient.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`);
		return true;
	}
	static async reorderTask(
		boardId: string,
		cardId: string,
		data: TaskReorderBody
	): Promise<void> {
		const res = await apiClient.patch(`/boards/${boardId}/cards/${cardId}/tasks/reorder`, data);
		return res.data;
	}
	static async moveTask(boardId: string, cardId: string, data: TaskMoveBody): Promise<void> {
		const res = await apiClient.patch(`/boards/${boardId}/cards/${cardId}/tasks/move`, data);
		return res.data;
	}
}

export default TaskService;
