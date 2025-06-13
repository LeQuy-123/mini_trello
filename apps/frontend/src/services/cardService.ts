import apiClient from './apiClient';

export type CardReorderBody = {
	sourceId: string;
	targetId: string;
};

export interface Card {
	id: string;
	name: string;
	description: string;
	boardId: string;
	createdAt: any;
	userId: string;
	tasksCount?: number;
	boardIndex?: number;
}

class CardService {
	static async getCards(boardId: string): Promise<Card[]> {
		const res = await apiClient.get<Card[]>(`/boards/${boardId}/cards`);
		return res.data;
	}
	static async createCard(
		boardId: string,
		data: { name: string; description?: string }
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
		data: { name?: string; description?: string }
	): Promise<Card> {
		const res = await apiClient.put<Card>(`/boards/${boardId}/cards/${cardId}`, data);
		return res.data;
	}
	static async deleteCard(boardId: string, cardId: string): Promise<void> {
		await apiClient.delete(`/boards/${boardId}/cards/${cardId}`);
	}
	static async reorderCard(boardId: string, data: CardReorderBody): Promise<void> {
		const res = await apiClient.patch(`/boards/${boardId}/cards/reorder`, data);
		return res.data;
	}
}

export default CardService;
