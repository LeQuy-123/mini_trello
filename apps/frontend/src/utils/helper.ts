import type { Task } from '@services/taskService';
import type { AsyncStatus } from './type';
import { toast } from 'react-toastify';
import type { InvitationStatus } from '@services/invitationService';
import { green, red, grey } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import type { Card } from '@services/cardService';

import {
	closestCorners,
	getFirstCollision,
	KeyboardCode,
	type DroppableContainer,
	type KeyboardCoordinateGetter,
} from '@dnd-kit/core';

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

export const getBorderColor = (status: InvitationStatus) => {
	switch (status) {
		case 'pending':
			return grey[500];
		case 'accepted':
			return green[500];
		case 'rejected':
			return red[500];
		default:
			return grey[300];
	}
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
	status: '',
	ownerId: '',
	assignedUserIds: [],
};

export function useMountStatus() {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => setIsMounted(true), 500);

		return () => clearTimeout(timeout);
	}, []);

	return isMounted;
}

export type BoardWithTasks = Array<Card & { tasks: Task[] }>;

const directions: string[] = [
	KeyboardCode.Down,
	KeyboardCode.Right,
	KeyboardCode.Up,
	KeyboardCode.Left,
];

export const coordinateGetter: KeyboardCoordinateGetter = (
	event,
	{ context: { active, droppableRects, droppableContainers, collisionRect } }
) => {
	if (directions.includes(event.code)) {
		event.preventDefault();

		if (!active || !collisionRect) {
			return;
		}

		const filteredContainers: DroppableContainer[] = [];

		droppableContainers.getEnabled().forEach((entry) => {
			if (!entry || entry?.disabled) {
				return;
			}

			const rect = droppableRects.get(entry.id);

			if (!rect) {
				return;
			}

			const data = entry.data.current;

			if (data) {
				const { type, children } = data;

				if (type === 'container' && children?.length > 0) {
					if (active.data.current?.type !== 'container') {
						return;
					}
				}
			}

			switch (event.code) {
				case KeyboardCode.Down:
					if (collisionRect.top < rect.top) {
						filteredContainers.push(entry);
					}
					break;
				case KeyboardCode.Up:
					if (collisionRect.top > rect.top) {
						filteredContainers.push(entry);
					}
					break;
				case KeyboardCode.Left:
					if (collisionRect.left >= rect.left + rect.width) {
						filteredContainers.push(entry);
					}
					break;
				case KeyboardCode.Right:
					if (collisionRect.left + collisionRect.width <= rect.left) {
						filteredContainers.push(entry);
					}
					break;
			}
		});

		const collisions = closestCorners({
			active,
			collisionRect: collisionRect,
			droppableRects,
			droppableContainers: filteredContainers,
			pointerCoordinates: null,
		});
		const closestId = getFirstCollision(collisions, 'id');

		if (closestId != null) {
			const newDroppable = droppableContainers.get(closestId);
			const newNode = newDroppable?.node.current;
			const newRect = newDroppable?.rect.current;

			if (newNode && newRect) {
				if (newDroppable.id === 'placeholder') {
					return {
						x: newRect.left + (newRect.width - collisionRect.width) / 2,
						y: newRect.top + (newRect.height - collisionRect.height) / 2,
					};
				}

				if (newDroppable.data.current?.type === 'container') {
					return {
						x: newRect.left + 20,
						y: newRect.top + 74,
					};
				}

				return {
					x: newRect.left,
					y: newRect.top,
				};
			}
		}
	}

	return undefined;
};
