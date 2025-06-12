import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
let io: Server;

interface AuthPayload {
	uid: string;
}

export const initSocket = (server: http.Server) => {
	io = new Server(server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
	});

	io.use((socket, next) => {
		const token = socket.handshake.auth.token;

		if (!token) {
			return next(new Error('Authentication error: Token missing'));
		}

		try {
			const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
			socket.data.uid = decoded.uid;
			next();
		} catch (err) {
			return next(new Error('Authentication error: Invalid token'));
		}
	});

	io.on('connection', (socket) => {
		console.log('Socket connected:', socket.id, 'User:', socket.data.uid);

		socket.on('join-board', (boardId: string) => {
			socket.join(boardId);
			console.log(`User ${socket.data.uid} joined board ${boardId}`);
		});

		socket.on('leave-board', (boardId: string) => {
			socket.leave(boardId);
			console.log(`User ${socket.data.uid} left board ${boardId}`);
		});

		socket.on('board-updated', ({ boardId, update }) => {
			socket.to(boardId).emit('board-update', update);
		});

		socket.on('disconnect', () => {
			console.log('User disconnected:', socket.data.uid);
		});
	});
};

export const getIO = (): Server => {
	if (!io) throw new Error('Socket.io not initialized!');
	return io;
};
