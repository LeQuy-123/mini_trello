import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@store/index';
import {
	getInvitations,
	sendInvitation,
	respondToInvitation,
	getUser,
	resetInvitationStatus,
} from '@store/invitationSlice';

export const useInvitation = () => {
	const dispatch = useDispatch<AppDispatch>();

	const {
		invitations,
		users,
		get: getInvitationsStatus,
		send: sendInvitationStatus,
		respond: respondToInvitationStatus,
		getUser: getUserStatus,
	} = useSelector((state: RootState) => state.invitations);

	return {
		users,
		invitations,
		getInvitationsStatus,
		sendInvitationStatus,
		respondToInvitationStatus,
		getUserStatus,
		getInvitations: () => dispatch(getInvitations()),
		sendInvitation: (boardId: string, data: { memberId: string; emailMember?: string }) =>
			dispatch(sendInvitation({ boardId, data })),
		respondToInvitation: (
			boardId: string,
			data: { invite_id: string; status: 'accepted' | 'declined' }
		) => dispatch(respondToInvitation({ boardId, data })),
		getUser: () => dispatch(getUser()),
		resetInvitationStatus: () => dispatch(resetInvitationStatus()),
	};
};
