import apiClient from './apiClient';


export interface Card {
	name: string;
	description: string;
	boardId: string;
	createdAt: any;
	userId: string;
	list_member?: string[];
	tasks_count?: number;
}


class CardService {
	static async getCards(boardId: string): Promise<Card[]> {
		const res = await apiClient.get<Card[]>(`/boards/${boardId}/cards`);
		return res.data;
	}
	static async createCard(
		boardId: string,
		data: { title: string; description?: string; assignedUserIds?: string[] }
	): Promise<Card> {
		const res = await apiClient.post<Card>(`/boards/${boardId}/cards`, data);
		return res.data;
	}
	static async getCard(boardId: string, cardId: string): Promise<Card> {
		const res = await apiClient.get<Card>(`/boards/${boardId}/cards/${cardId}`);
		return res.data;
	}
	static async getCardsByUser(boardId: string, userId: string): Promise<Card[]> {
		const res = await apiClient.get<Card[]>(`/boards/${boardId}/cards/user/${userId}`);
		return res.data;
	}
	static async updateCard(
		boardId: string,
		cardId: string,
		data: { title?: string; description?: string; assignedUserIds?: string[] }
	): Promise<Card> {
		const res = await apiClient.put<Card>(`/boards/${boardId}/cards/${cardId}`, data);
		return res.data;
	}
	static async deleteCard(boardId: string, cardId: string): Promise<void> {
		await apiClient.delete(`/boards/${boardId}/cards/${cardId}`);
	}
}

export default CardService;
