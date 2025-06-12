import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@services/authService';
import InvitationService, { type Invitation } from '@services/invitationService';
import { getDefaultAsyncState, showError, showSuccess } from '@utils/helper';
import type { AsyncStatus } from '@utils/type';


export const getInvitations = createAsyncThunk('invitations/getAll', async (_, thunkAPI) => {
	try {
		const invitations: Invitation[] = await InvitationService.getInvitations();
		return invitations;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(error?.message || 'Failed to fetch invitations');
	}
});

export const sendInvitation = createAsyncThunk(
	'invitations/send',
	async (
		payload: { boardId: string; data: { member_id: string; email_member?: string } },
		thunkAPI
	) => {
		try {
			const res = await InvitationService.sendInvitation(payload.boardId, payload.data);
			showSuccess('Invitation sent');
			return res;
		} catch (error: any) {
			showError(error?.message || 'Failed to send invitation');
			return thunkAPI.rejectWithValue(error?.message || 'Failed to send invitation');
		}
	}
);

export const respondToInvitation = createAsyncThunk(
	'invitations/respond',
	async (
		payload: { boardId: string; data: { invite_id: string; status: 'accepted' | 'declined' } },
		thunkAPI
	) => {
		try {
			await InvitationService.respondToInvitation(payload.boardId, payload.data);
			showSuccess(`Invitation ${payload.data.status}`);
			return payload.data;
		} catch (error: any) {
			showError(error?.message || 'Failed to respond to invitation');
			return thunkAPI.rejectWithValue(error?.message || 'Failed to respond to invitation');
		}
	}
);

export const getUser = createAsyncThunk('invitations/getUsers', async (boardId: string, thunkAPI) => {
	console.log("🚀 ~ getUser ~ boardId:", boardId)
	try {
		const res = await InvitationService.getUser()
		return res;
	} catch (error: any) {
		return thunkAPI.rejectWithValue(error?.message || 'Failed to fetch user');
	}
});


interface InvitationState {
	users: User[];
	invitations: Invitation[];
	send: AsyncStatus;
	respond: AsyncStatus;
	get: AsyncStatus;
	getUser: AsyncStatus;
}

const initialState: InvitationState = {
	users: [],
	invitations: [],
	send: getDefaultAsyncState(),
	respond: getDefaultAsyncState(),
	get: getDefaultAsyncState(),
	getUser: getDefaultAsyncState(),
};


const invitationSlice = createSlice({
	name: 'invitations',
	initialState,
	reducers: {
		resetInvitationStatus(state) {
			state.send = getDefaultAsyncState();
			state.respond = getDefaultAsyncState();
			state.get = getDefaultAsyncState();
			state.getUser = getDefaultAsyncState();
		},
	},
	extraReducers: (builder) => {
		const handleAsync = <K extends keyof Omit<InvitationState, 'invitations' | 'users'>>(
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
						state.invitations = action.payload;
					}
					if (type === 'getUser') {
						state.users = action.payload;
					}
					if (type === 'respond') {
						const { invite_id, status } = action.payload;
						const index = state.invitations.findIndex((i) => i.inviteId === invite_id);
						if (index !== -1) {
							state.invitations[index].status = status;
						}
					}
				})
				.addCase(thunk.rejected, (state, action) => {
					state[type].loading = false;
					state[type].error = action.payload as string;
				});
		};

		handleAsync('get', getInvitations);
		handleAsync('send', sendInvitation);
		handleAsync('respond', respondToInvitation);
		handleAsync('getUser', getUser);
	},
});

export const { resetInvitationStatus } = invitationSlice.actions;
export default invitationSlice.reducer;
