import type { AsyncStatus } from './type';
import { toast } from 'react-toastify';

export const getDefaultAsyncState = (): AsyncStatus => ({
	loading: false,
	error: null,
});

export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
