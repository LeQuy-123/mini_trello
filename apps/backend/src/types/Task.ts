export interface Task {
  cardId: string;
  boardId: string;
  title: string;
  description: string;
  status: string;
  ownerId: string;
  assignedUserIds: string[];
}
