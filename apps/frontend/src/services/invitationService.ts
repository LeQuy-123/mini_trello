import apiClient from './apiClient';

export interface Invitation {
	inviteId: string;
	boardId: string;
	boardOwnerId: string;
	memberId: string;
	email?: string | null;
	status: 'pending' | 'accepted' | 'declined';
	createdAt: number;
	type?: 'sent' | 'received';
}

class InvitationService {
	static async sendInvitation(
		boardId: string,
		data: { member_id: string; email_member?: string }
	): Promise<{ success: true; inviteId: string }> {
		const res = await apiClient.post(`/invitations/${boardId}`, data);
		return res.data;
	}

	static async respondToInvitation(
		boardId: string,
		data: { invite_id: string; status: 'accepted' | 'declined' }
	): Promise<{ success: true }> {
		const res = await apiClient.post(`/invitations/${boardId}/respond`, data);
		return res.data;
	}

	static async getInvitations(): Promise<Invitation[]> {
		const res = await apiClient.get<Invitation[]>('/invitations');
		return res.data;
	}

	static async getUser(): Promise<any> {
		const res = await apiClient.get('/users');
		return res.data;
	}
}

export default InvitationService;
