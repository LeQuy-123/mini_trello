import apiClient from './apiClient';


export interface Task {
	id: string;
	cardId: string;
	boardId: string;
	title: string;
	description: string;
	status: string;
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
		const res = await apiClient.get<Task[]>(`/boards/${boardId}/cards/${cardId}`);
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
		const res = await apiClient.post<Task>(`/boards/${boardId}/cards/${cardId}`, data);
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
		await apiClient.delete(
			`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`);
		return true;
	}
}

export default TaskService;
