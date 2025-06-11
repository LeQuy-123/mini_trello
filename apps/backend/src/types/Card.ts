import { Timestamp } from 'firebase-admin/firestore';

export interface Card {
	name: string;
	description: string;
	boardId: string;
	createdAt: Timestamp | Date | null;
	userId: string;
	listMember?: string[];
	tasksCount?: number;
}
