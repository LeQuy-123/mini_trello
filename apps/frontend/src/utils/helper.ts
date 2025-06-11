import type { AsyncStatus } from './type';

export const getDefaultAsyncState = (): AsyncStatus => ({
	loading: false,
	error: null,
});
