import type { Task } from '@services/taskService';
import type { AsyncStatus } from './type';
import { toast } from 'react-toastify';

export const getDefaultAsyncState = (): AsyncStatus => ({
	loading: false,
	error: null,
});

export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);

export const statusColors: Record<Task['status'], string> = {
	new: '#1976d2', // blue
	wip: '#f9a825', // amber
	reject: '#d32f2f', // red
	complete: '#388e3c', // green
};
