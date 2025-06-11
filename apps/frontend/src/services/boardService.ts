import apiClient from './apiClient';
export interface Board {
	name: string;
	id: string;
	description: string;
	userId: string;
	cardCount: number;
	createdAt: any; // Firestore Timestamp or Date, nullable if missing
	members?: string[]; // IDs of users accepted into this board
}

class BoardService {
	static async getBoard(id: string): Promise<Board> {
		const res = await apiClient.get<Board>(`/boards/${id}`);
		return res.data;
	}

	static async getBoards(params?: { name?: string; created?: boolean }): Promise<Board[]> {
		const res = await apiClient.get<Board[]>('/boards', { params });
		return res.data;
	}

	static async createBoard(data: { name: string; description: string }): Promise<Board> {
		const res = await apiClient.post<Board>('/boards', data);
		return res.data;
	}

	static async updateBoard(
		id: string,
		data: { name: string; description: string }
	): Promise<Board> {
		const res = await apiClient.put<Board>(`/boards/${id}`, data);
		return res.data;
	}

	static async deleteBoard(id: string): Promise<void> {
		await apiClient.delete(`/boards/${id}`);
	}
}

export default BoardService;
