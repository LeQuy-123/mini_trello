import type { Task } from '@services/taskService';
import type { AsyncStatus } from './type';
import { toast } from 'react-toastify';
import type { Active, Over } from '@dnd-kit/core';
export interface DragDropArguments {
	active: Active;
	over: Over | null;
}
export const getDefaultAsyncState = (): AsyncStatus => ({
	loading: false,
	error: null,
});

export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);

export const statusColors: Record<Task['status'], string> = {
	new: '#1976d2',
	wip: '#f9a825',
	reject: '#d32f2f',
	complete: '#388e3c',
	'': 'transparent',
};

export const defaultAnnouncements = {
	onDragStart({ active }: Pick<DragDropArguments, 'active'>): string {
		const message = `Picked up draggable item ${active.id}.`;
		console.log(message);
		return message;
	},
	onDragOver({ active, over }: DragDropArguments): string {
		const message = over?.id
			? `Draggable item ${active.id} was moved over droppable area ${over.id}.`
			: `Draggable item ${active.id} is no longer over a droppable area.`;
		console.log(message);
		return message;
	},
	onDragEnd({ active, over }: DragDropArguments): string {
		const message = over?.id
			? `Draggable item ${active.id} was dropped over droppable area ${over.id}.`
			: `Draggable item ${active.id} was dropped.`;
		console.log(message);
		return message;
	},
	onDragCancel({ active }: Pick<DragDropArguments, 'active'>): string {
		const message = `Dragging was cancelled. Draggable item ${active.id} was dropped.`;
		console.log(message);
		return message;
	},
};

export function findCardIdByTaskId(
	tasksByCardId: Record<string, Task[]>,
	taskId: string
): string | undefined {
	for (const [cardId, tasks] of Object.entries(tasksByCardId)) {
		if (tasks.some((task) => task.id === taskId)) {
			return cardId;
		}
	}
	return undefined; // not found
}

export const GhostTask = {
	id: '-1',
	title: '',
	description: '',
	status: '' ,
	ownerId: '',
	assignedUserIds: []
}
