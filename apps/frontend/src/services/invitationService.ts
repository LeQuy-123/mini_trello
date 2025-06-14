import apiClient from './apiClient';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export type Invitation = {
	id: string;
	boardId: string;
	boardOwnerId: string;
	memberId: string;
	type: 'send' | 'received';
	status: InvitationStatus;
	createdAt: number;
	sender: { name: string; email: string };
	recipient: { name: string; email: string };
};

class InvitationService {
	static async sendInvitation(
		boardId: string,
		data: { memberId: string; emailMember?: string }
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
