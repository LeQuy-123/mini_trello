export interface User {
	id?: string;
	email: string;
	name: string;
	password: string;
	createdAt: FirebaseFirestore.Timestamp | Date;
}

export type Invitation = {
	boardId: string;
	boardOwnerId: string;
	memberId: string;
	createdAt?: FirebaseFirestore.Timestamp;
};
