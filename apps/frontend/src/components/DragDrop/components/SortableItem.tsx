import React, {  } from 'react';
import {
	type UniqueIdentifier,
} from '@dnd-kit/core';
import {
	useSortable,
} from '@dnd-kit/sortable';


import { statusColors, useMountStatus } from '@utils/helper';
import { Item } from './Item';
import type { Task } from '@services/taskService';

export interface SortableItemProps {
	containerId: UniqueIdentifier;
	id: UniqueIdentifier;
	index: number;
	handle: boolean;
	disabled?: boolean;
	style(args: any): React.CSSProperties;
	getIndex(id: UniqueIdentifier): number;
	renderItem(): React.ReactElement;
	wrapperStyle({ index }: { index: number }): React.CSSProperties;
	status: 'new' | 'wip' | 'reject' | 'complete' | '';
	data: Task
	onRemove?(): void;
	onTaskClick?(): void;
}

export default function SortableItem({
	disabled,
	id,
	index,
	handle,
	renderItem,
	style,
	containerId,
	getIndex,
	wrapperStyle,
	status,
	data,
	onRemove,
	onTaskClick
}: SortableItemProps) {
	const {
		setNodeRef,
		setActivatorNodeRef,
		listeners,
		isDragging,
		isSorting,
		over,
		overIndex,
		transform,
		transition,
	} = useSortable({
		id,
		data: {
			type: 'task'
		}
	});
	const mounted = useMountStatus();
	const mountedWhileDragging = isDragging && !mounted;

	return (
		<Item
			ref={disabled ? undefined : setNodeRef}
			value={id}
			dragging={isDragging}
			sorting={isSorting}
			handle={handle}
			handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
			index={index}
			wrapperStyle={wrapperStyle({ index })}
			style={style({
				index,
				value: id,
				isDragging,
				isSorting,
				overIndex: over ? getIndex(over.id) : overIndex,
				containerId,
			})}
			data={data}
			color={statusColors[status]}
			transition={transition}
			transform={transform}
			fadeIn={mountedWhileDragging}
			listeners={listeners}
			renderItem={renderItem}
			onRemove={onRemove}
			onTaskClick={onTaskClick}
		/>
	);
}

