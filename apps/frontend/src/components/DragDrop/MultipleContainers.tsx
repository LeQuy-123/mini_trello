import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
	closestCenter,
	pointerWithin,
	rectIntersection,
	type CollisionDetection,
	DndContext,
	DragOverlay,
	type DropAnimation,
	getFirstCollision,
	TouchSensor,
	type Modifiers,
	type UniqueIdentifier,
	useSensors,
	useSensor,
	MeasuringStrategy,
	type KeyboardCoordinateGetter,
	defaultDropAnimationSideEffects,
	type Over,
	type Active,
	PointerSensor,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
	type SortingStrategy,
	horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Item, Container } from './components';

import { statusColors, type BoardWithTasks } from '@utils/helper';
import DroppableContainer from '@components/DragDrop/components/DroppableContainer';
import SortableItem from '@components/DragDrop/components/SortableItem';
import type { Card } from '@services/cardService';
import type { Task } from '@services/taskService';
import { Box, Typography, type SxProps } from '@mui/material';
import { type Theme } from '@mui/system';

export default {
	title: 'Presets/Sortable/Multiple Containers',
};


export const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';

const dropAnimation: DropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: '0.5',
			},
		},
	}),
};


interface Props {
	adjustScale?: boolean;
	containerStyle?: SxProps<Theme>;
	coordinateGetter?: KeyboardCoordinateGetter;
	getItemStyles?(args: {
		value: UniqueIdentifier;
		index: number;
		overIndex: number;
		isDragging: boolean;
		containerId: UniqueIdentifier;
		isSorting: boolean;
		isDragOverlay: boolean;
	}): React.CSSProperties;
	wrapperStyle?(args: { index: number }): React.CSSProperties;
	items: BoardWithTasks;
	handle?: boolean;
	renderItem?: any;
	strategy?: SortingStrategy;
	modifiers?: Modifiers;
	minimal?: boolean;
	trashable?: boolean;
	scrollable?: boolean;
	vertical?: boolean;
	onRemoveTask: (task: Task) => void;
	onTaskClick: (card: Card, task?: Task) => void;
	onRemoveCard: (card: Card) => void;
	onReorderCard: (data: { active: Active, over: Over | null }) => void;
	onCardClick: (card?: Card) => void;
	onReorderTask: (data: {
		sourceId: string,
		targetId: string,
		sourceGroup: string,
		targetGroup: string,
	}) => void;


}

export function MultipleContainers({
	adjustScale = false,
	handle = false,
	items: initialItems,
	containerStyle,
	getItemStyles = () => ({}),
	wrapperStyle = () => ({}),
	minimal = false,
	modifiers,
	renderItem,
	strategy = verticalListSortingStrategy,
	vertical = false,
	scrollable,
	onRemoveTask,
	onRemoveCard,
	onReorderCard,
	onCardClick,
	onReorderTask,
	onTaskClick
}: Props) {

	// Hooks & State
	const [items, setItems] = useState<BoardWithTasks>(initialItems);
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [clonedItems, setClonedItems] = useState<BoardWithTasks | null>(null);

	const lastOverId = useRef<UniqueIdentifier | null>(null);

	const recentlyMoved = useRef(false);

	const isSortingCard = Boolean(activeId && items.some((item) => item.id === activeId));

	// Reset recently moved flag
	useEffect(() => {
		requestAnimationFrame(() => {
			recentlyMoved.current = false;
		});
	}, [items]);

	useEffect(() => {
		setItems(initialItems);
	}, [initialItems]);

	const collisionDetection: CollisionDetection = useCallback((args) => {
		if (activeId && isCardId(activeId)) {
			return closestCenter({
				...args,
				droppableContainers: args.droppableContainers.filter(c => isCardId(c.id)),
			});
		}

		const pointerHits = pointerWithin(args);
		const collisions = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
		let overId = getFirstCollision(collisions, 'id');

		if (overId != null) {
			if (overId === TRASH_ID) return collisions;

			if (isCardId(overId)) {
				const containerTasks = getTasksByCardId(overId);
				if (containerTasks.length > 0) {
					overId =
						closestCenter({
							...args,
							droppableContainers: args.droppableContainers.filter(c =>
								c.id !== overId && containerTasks.some(t => t.id === c.id)
							),
						})[0]?.id ?? overId;
				}
			}

			lastOverId.current = overId;
			return [{ id: overId }];
		}

		if (recentlyMoved.current) {
			lastOverId.current = activeId;
		}

		return lastOverId.current ? [{ id: lastOverId.current }] : [];
	}, [activeId, items]);

	const sensors = useSensors(
		// useSensor(MouseSensor),
		useSensor(TouchSensor),
		// useSensor(KeyboardSensor, {
		// 	coordinateGetter,
		// }),
		useSensor(PointerSensor, {
			activationConstraint: {
				delay: 100,
				tolerance: 5,
			},
		})

	);
	const isCardId = (id: UniqueIdentifier) => items.some((card) => card.id === id);

	const findCardById = (id: UniqueIdentifier): (Card & { tasks: Task[] }) | undefined =>
		items.find((card) => card.id === id || card.tasks.some((task) => task.id === id));

	const getTasksByCardId = (cardId: UniqueIdentifier) =>
		items.find((card) => card.id === cardId)?.tasks ?? [];

	const findContainerId = (id: UniqueIdentifier): string | undefined =>
		items.find((card) => card.id === id)?.id ??
		items.find((card) => card.tasks.some((task) => task.id === id))?.id;

	const getTaskIndex = (id: UniqueIdentifier): number => {
		const cardId = findContainerId(id);
		return (
			items.find((card) => card.id === cardId)?.tasks.findIndex((task) => task.id === id) ?? -1
		);
	};
	function findCardByTaskId(taskId: string) {
		return items.find(card => card.tasks?.some(task => task.id === taskId));
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={collisionDetection}
			measuring={{
				droppable: {
					strategy: MeasuringStrategy.Always,
				},
			}}
			onDragStart={({ active }) => {
				setActiveId(active.id);
				setClonedItems(structuredClone(items));
			}}
			onDragOver={({ active, over }) => {
				if (!over || !active) return;
				if (isSortingCard) {
					// Handle card (column) reorder
					if (active.id === over.id) return;

					const activeIndex = items.findIndex(c => c.id === active.id);
					const overIndex = items.findIndex(c => c.id === over.id);
					if (activeIndex === -1 || overIndex === -1) return;

					const updatedItems = [...items];
					const [moved] = updatedItems.splice(activeIndex, 1);
					updatedItems.splice(overIndex, 0, moved);
					setItems(updatedItems);
					return;
				} else {
					const activeCard = findCardById(active.id);
					const overCard = findCardByTaskId(String(over.id)) ?? findCardById(over.id);
					if (!activeCard || !overCard) return;

					if (activeCard.id === overCard.id && active.id === over.id) return;

					const fromTasks = [...activeCard.tasks];
					const toTasks = [...(overCard.tasks || [])];

					const fromIndex = fromTasks.findIndex(task => task.id === active.id);
					const overIndex = toTasks.findIndex(task => task.id === over.id);

					// Already in right place
					if (activeCard.id === overCard.id && fromIndex === overIndex) return;

					const [movedTask] = fromTasks.splice(fromIndex, 1);

					const insertAt = overIndex >= 0 ? overIndex : toTasks.length;

					if (activeCard.id === overCard.id) {
						// Moving within same card
						fromTasks.splice(insertAt > fromIndex ? insertAt - 1 : insertAt, 0, movedTask);
					} else {
						// Between different cards
						toTasks.splice(insertAt, 0, movedTask);
					}

					const updated = items.map(card => {
						if (card.id === activeCard.id) return { ...card, tasks: fromTasks };
						if (card.id === overCard.id) return { ...card, tasks: toTasks };
						return card;
					});

					recentlyMoved.current = true;
					setItems(updated);
				}
			}}
			onDragEnd={({ active, over }) => {
				if (!over || !active) return;

				if (isSortingCard) {
					if (active.id === over.id) return;

					const activeIndex = items.findIndex(c => c.id === active.id);
					const overIndex = items.findIndex(c => c.id === over.id);

					if (activeIndex === -1 || overIndex === -1) return;

					const updatedItems = [...items];
					const [moved] = updatedItems.splice(activeIndex, 1);
					updatedItems.splice(overIndex, 0, moved);
					setItems(updatedItems);
					setActiveId(null);

					onReorderCard({ active, over })
					return;
				} else {
					if (active.id === over.id) return;
					const activeCard = findCardByTaskId(String(active.id));
					const overCard = findCardByTaskId(String(over.id)) ?? findCardById(over.id);
					onReorderTask({
						sourceId: String(active.id),
						targetId: String(over.id),
						sourceGroup: String(activeCard?.id),
						targetGroup: overCard?.id || String(active.id)
					})

					if (!activeCard || !overCard) return;

					const fromTasks = [...activeCard.tasks];
					const toTasks = [...overCard.tasks];

					const fromIndex = fromTasks.findIndex(task => task.id === active.id);
					const overIndex = toTasks.findIndex(task => task.id === over.id);
					if (fromIndex === -1) return;

					const [movedTask] = fromTasks.splice(fromIndex, 1);
					const insertAt = overIndex >= 0 ? overIndex : toTasks.length;

					if (activeCard.id === overCard.id) {
						fromTasks.splice(insertAt, 0, movedTask);
						setItems(items.map(card =>
							card.id === activeCard.id ? { ...card, tasks: fromTasks } : card
						));
					} else {
						toTasks.splice(insertAt, 0, movedTask);
						setItems(items.map(card => {
							if (card.id === activeCard.id) return { ...card, tasks: fromTasks };
							if (card.id === overCard.id) return { ...card, tasks: toTasks };
							return card;
						}));
					}
					setActiveId(null);
				}
			}}

			onDragCancel={() => {
				if (clonedItems) setItems(clonedItems);
				setClonedItems(null);
				setActiveId(null);
			}}

			modifiers={modifiers}
		>
			<div style={{
				display: 'flex',
				flexDirection: vertical ? 'column' : 'row',
				gap: 20,
				boxSizing: 'border-box',
				padding: 20,
				alignItems: 'flex-start', // important: allows uneven heights
				flexWrap: 'nowrap',
				overflowX: vertical ? 'hidden' : 'auto'
			}}>
				<SortableContext
					items={[...items.map((card) => card.id), PLACEHOLDER_ID]}
					strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
				>
					{items.map((card) => {
						const tasks = card.tasks ?? [];
						return (
							<DroppableContainer
								data={card}
								key={card.id}
								id={card.id}
								items={tasks ? tasks?.map((task) => task.id) : []}
								scrollable={scrollable}
								style={containerStyle}
								unstyled={minimal}
								onRemove={() => handleRemove(card.id)}
								onLabelClick={() => onCardClick(card)}
							>
								<SortableContext items={tasks} strategy={strategy}>
									{tasks?.map((task, index) => (
										<SortableItem
											key={task.id}
											id={task.id}
											index={index}
											data={task}
											handle={handle}
											disabled={isSortingCard}
											style={getItemStyles}
											wrapperStyle={wrapperStyle}
											renderItem={renderItem}
											containerId={card.id}
											getIndex={getTaskIndex}
											status={task.status}
											onRemove={() => onRemoveTask(task)}
											onTaskClick={() => onTaskClick(card, task)}
										/>
									))}
									<Item
										value={'+ Task'}
										color={'green'}
										renderItem={renderItem}
										onTaskClick={() => onTaskClick(card, undefined)}
									/>
								</SortableContext>
							</DroppableContainer>
						)
					})}

					<Container onClick={() => onCardClick()} hover style={{cursor:'pointer'}}>
						<Box sx={{with: '100%',  display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 6}}>
							<Typography variant='h5'>
								+ Card
							</Typography>
						</Box>
					</Container>
				</SortableContext>
			</div>

			{createPortal(
				<DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
					{activeId
						? items.some((card) => card.id === activeId)
							? renderContainerDragOverlay(activeId)
							: renderSortableItemDragOverlay(activeId)
						: null}
				</DragOverlay>,
				document.body
			)}

		</DndContext>
	);

	function renderSortableItemDragOverlay(id: UniqueIdentifier) {
		let foundTask: Task | null = null;
		let containerId: UniqueIdentifier | null = null;

		for (const card of items) {
			const task = card.tasks?.find((t) => t.id === id);
			if (task) {
				foundTask = task;
				containerId = card.id;
				break; // ✅ exit early
			}
		}

		if (!foundTask || !containerId) return null;
		return (
			<Item
				value={id}
				handle={handle}
				data={foundTask}
				style={getItemStyles({
					containerId: findContainerId(id) as UniqueIdentifier,
					overIndex: -1,
					index: getTaskIndex(id),
					value: id,
					isSorting: true,
					isDragging: true,
					isDragOverlay: true,
				})}
				color={statusColors[foundTask?.status]}
				wrapperStyle={wrapperStyle({ index: 0 })}
				renderItem={renderItem}
				dragOverlay
			/>
		);
	}

	function renderContainerDragOverlay(containerId: UniqueIdentifier) {
		const card = items.find((c) => c.id === containerId);
		if (!card) return null;

		return (
			<Container
				label={`Column ${card.name || containerId}`}
				shadow
				data={card}
				unstyled={false}
			>
				{card.tasks.map((item, index) => (
					<Item
						key={item.id}
						value={item.id}
						data={item}
						handle={handle}
						style={getItemStyles({
							containerId: card.id,
							overIndex: -1,
							index: getTaskIndex(item.id),
							value: item.id,
							isDragging: false,
							isSorting: false,
							isDragOverlay: true,
						})}
						color={statusColors[item.status]}
						wrapperStyle={wrapperStyle({ index })}
						renderItem={renderItem}
					/>
				))}
				<Item
					value={'+ Task'}
					color={'green'}
					renderItem={renderItem}
					onTaskClick={() => onTaskClick(card, undefined)}
				/>
			</Container>
		);
	}

	function handleRemove(containerId: UniqueIdentifier) {
		setItems(prev => {
			return prev.filter(card => card.id !== containerId)
		});
		const deletedCard = items?.find((card) => card.id === containerId)
		if (!deletedCard) return;
		onRemoveCard(deletedCard)
	}

}



