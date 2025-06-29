import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

let socket: Socket | null = null;

export const getSocket = (token: string): Socket => {
	if (!socket) {
		socket = io(SOCKET_URL, {
			auth: { token },
			autoConnect: true,
			reconnection: true,
		});
	}
	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};
