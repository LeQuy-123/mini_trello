import { Timestamp } from "firebase-admin/firestore";

export interface Card {
  name: string;
  description: string;
  boardId: string;
  createdAt: Timestamp | Date | null;
  userId: string; // creator or assigned user? (assuming creator)
  list_member?: string[]; // for user list on card (optional)
  tasks_count?: number; // optional field for tasks count
}
