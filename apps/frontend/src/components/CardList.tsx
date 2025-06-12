import {
	Card,
	CardActionArea,
	CardContent,
	Skeleton,
	Stack,
	Typography,
} from '@mui/material';
import type { Board } from '@services/boardService';
import { CreateCardModal } from './CreateCardModal';
import { useEffect, useState } from 'react';
import type { Card as CardType } from '@services/cardService';
import { useCard } from '@utils/useCard';
import CardComponent from './CardComponent';
import {
	DndContext,
	useSensors,
	useSensor,
	PointerSensor,
	TouchSensor,
	MouseSensor,
	closestCenter,
	type CollisionDetection,
	DragOverlay,
} from '@dnd-kit/core';
import {
	SortableContext,
	horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task } from '@services/taskService';
import { useTask } from '@utils/useTask';
import TaskItem from './TaskItem';
type Props = {
	board: Board
}
export default function CardList({
	board
}: Props) {
	const {
		cards,
		getCards,
		getCardsStatus,
		deleteCard
	} = useCard()
	const { tasksByCardId } = useTask()
	useEffect(() => {
		getCards({
			boardId: board.id
		})
	}, [])
	const [selectedCard, setSelectedCard] = useState<null | CardType>(null);
	const [draggingCard, setDraggingCard] = useState<CardType | null>(null);
	const [draggingTask, setDraggingTask] = useState<Task | null>(null);

	const [open, setOpen] = useState(false);
	const handleClose = () => setOpen(false);
	const handleOpen = () => setOpen(true);
	const handleEdit = (card: CardType) => {
		setSelectedCard(card)
		handleOpen()
	}
	const handleDelete = (card: CardType) => {
		deleteCard({
			boardId: board.id,
			cardId: card.id
		})
	}
	const renderCardSkeletons = () => {
		const count = board.cardsCount || 3;
		return Array.from({ length: count }).map((_, idx) => (
			<Card key={idx} sx={{ width: 300, minHeight: 50 }}>
				<CardContent>
					<Skeleton variant="text" width="80%" />
				</CardContent>
			</Card>
		));
	};

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(TouchSensor),
		useSensor(MouseSensor)
	);

	const handleDragEnd = (event: any) => {
		const { active, over } = event;
		console.log("🚀 ~ handleDragEnd ~ active:", active)
		console.log("🚀 ~ handleDragEnd ~ over:", over)
		setDraggingCard(null)
	}

	return (
		<>
			<DndContext
				sensors={sensors}
				onDragStart={({ active }) => {
					if (active.id?.toString()?.includes('task')) {
						const taskId = active.id.toString().replace('task-', '');
						const allTasks = Object.values(tasksByCardId).flat();
						const found = allTasks.find(t => t.id === taskId);
						setDraggingTask(found || null);
					} else {
						const cardId = active.id.toString().replace('card-', '');
						const found = cards.find((c) => c.id === cardId);
						if (found) {
							setDraggingCard(found);
						}
					}

				}}
				collisionDetection={customCollisionDetection}
				onDragEnd={handleDragEnd}

			>
				<Stack direction='row' gap={2} sx={{ mt: 2 }} alignItems={'flex-start'}>
					<SortableContext
						items={cards.map(card => `card-${card.id}`)}
						id="cards"
						strategy={horizontalListSortingStrategy}
					>

						{getCardsStatus.loading
							? renderCardSkeletons()
							: cards?.map((card) => (
								<CardComponent
									key={`card-${card.id}`}
									card={card}
									board={board}
									onClickEdit={() => handleEdit(card)}
									onClickDelete={() => handleDelete(card)}
								/>
							))}
						<Card
							sx={{
								width: 300,
								minHeight: 60,
								position: 'relative',
								transition: 'box-shadow 0.2s',
								'&:hover': {
									boxShadow: (theme) => theme.shadows['4'],
								},
							}}
						>
							<CardActionArea
								sx={{
									height: '100%',
									display: 'flex',
									alignItems: 'stretch',
									justifyContent: 'start',
								}}
								onClick={handleOpen}
							>
								<CardContent>
									<Typography
										variant="subtitle1"
										color="text.secondary"
										textAlign="center"
									>
										+ Add Card
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>
					</SortableContext>
				</Stack>

				<DragOverlay>
					{draggingCard ? (
						<CardComponent
							card={draggingCard}
							board={board}
							draggingTaskId={null}
							onClickEdit={() => { }}
							onClickDelete={() => { }}
						/>
					) : draggingTask ? (
						<TaskItem
							task={draggingTask}
							onEdit={() => { }}
							onDelete={() => { }}
						/>
					) : null}
				</DragOverlay>
			</DndContext>

			{board && <CreateCardModal
				open={open}
				boardId={board.id}
				onClose={handleClose}
				card={selectedCard}
			/>}

		</>
	);
}




const customCollisionDetection: CollisionDetection = (args) => {
	const { active, droppableContainers } = args;
	const activeType = active.data.current?.type;

	const filtered = droppableContainers.filter((entry) => {
		const entryType = entry?.data?.current?.type;
		if (activeType === 'task' && entryType === 'card') return true;
		if (activeType === entryType) return true;
		return false;
	});

	return closestCenter({
		...args,
		droppableContainers: filtered,
	});
};
