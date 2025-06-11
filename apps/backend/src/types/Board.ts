import { Timestamp } from 'firebase-admin/firestore'; // or from "firebase/firestore" if client-side

export interface Board {
	name: string;
	description: string;
	userId: string;
	cardsCount: number;
	createdAt: Timestamp; // Firestore Timestamp or Date, nullable if missing
	members?: string[]; // IDs of users accepted into this board
}
