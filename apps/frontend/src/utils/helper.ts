import type { Task } from '@services/taskService';
import type { AsyncStatus } from './type';
import { toast } from 'react-toastify';
import type { InvitationStatus } from '@services/invitationService';
import { green, red, grey } from '@mui/material/colors';

export const getDefaultAsyncState = (): AsyncStatus => ({
	loading: false,
	error: null,
});

export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);

export const statusColors: Record<Task['status'], string> = {
	new: '#1976d2',
	wip: '#f9a825',
	reject: '#d32f2f',
	complete: '#388e3c',
	'': 'transparent',
};

export const getBorderColor = (status: InvitationStatus) => {
	switch (status) {
		case 'pending':
			return grey[500];
		case 'accepted':
			return green[500];
		case 'rejected':
			return red[500];
		default:
			return grey[300];
	}
};


export function findCardIdByTaskId(
	tasksByCardId: Record<string, Task[]>,
	taskId: string
): string | undefined {
	for (const [cardId, tasks] of Object.entries(tasksByCardId)) {
		if (tasks.some((task) => task.id === taskId)) {
			return cardId;
		}
	}
	return undefined; // not found
}

export const GhostTask = {
	id: '-1',
	title: '',
	description: '',
	status: '' ,
	ownerId: '',
	assignedUserIds: []
}
