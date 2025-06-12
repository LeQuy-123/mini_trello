import { useEffect, useState, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../socket';

type SocketEvents = {
	'join-board': (boardId: string) => void;
	'leave-board': (boardId: string) => void;
	'board-updated': (data: { boardId: string; update: any }) => void;
	'board-update': (update: any) => void;
};

type UseSocketReturn = {
	socket: Socket | null;
	emit: <K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>) => void;
	isConnected: boolean;
};

export const useSocket = (token: string): UseSocketReturn => {
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		if (!token) return;

		const socket = getSocket(token);
		socketRef.current = socket;

		const handleConnect = () => {
			console.log('Socket connected');
			setIsConnected(true);
		};

		const handleDisconnect = () => {
			console.log('Socket disconnected');
			setIsConnected(false);
		};

		const handleError = (err: any) => {
			console.error('Socket connection error:', err.message);
		};

		socket.on('connect', handleConnect);
		socket.on('disconnect', handleDisconnect);
		socket.on('connect_error', handleError);

		return () => {
			socket.off('connect', handleConnect);
			socket.off('disconnect', handleDisconnect);
			socket.off('connect_error', handleError);
			// Do NOT disconnect here unless you want to teardown globally
		};
	}, [token]);

	const emit = useCallback(
		<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>) => {
			if (socketRef.current?.connected) {
				socketRef.current.emit(event, ...args);
			} else {
				console.warn(`Socket not connected. Cannot emit event "${event}"`);
			}
		},
		[]
	);

	return {
		socket: socketRef.current,
		emit,
		isConnected,
	};
};
