import {
	Box,
	Button,
	Card,
	CardContent,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Card as CardType } from '@services/cardService';
import { useEffect, useState } from 'react';
import { useTask } from '@utils/useTask';
import { CreateTaskModal } from './CreateTaskModal';
import type { Board } from '@services/boardService'
import TaskItem from './TaskItem';
import type { Task } from '@services/taskService';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDndContext, useDroppable } from '@dnd-kit/core';
type Props = {
	card: CardType;
	board: Board;
	draggingTaskId?: string | null;
	onClickEdit: () => void;
	onClickDelete: () => void;
};

export default function CardComponent({ card, board, onClickEdit, onClickDelete }: Props) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const {
		tasksByCardId,
		getTasks,
		deleteTask,
	} = useTask()
	useEffect(() => {
		getTasks({
			boardId: board.id,
			cardId: card.id
		})
	}, [board.id, card.id])

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};
	const [openMoodal, setOpenModal] = useState(false);
	const [currentTask, setCurrentTask] = useState<Task>();

	const handleClose = () => {
		setOpenModal(false);
		setCurrentTask(undefined)
	}
	const handleOpen = () => {
		console.log("🚀 ~ handleOpen ~ handleOpen:",)

		setOpenModal(true);
	}
	const tasks = tasksByCardId[card.id]
	const handleDeleteTask = (taskId: string) => {
		deleteTask({
			boardId: board.id,
			cardId: card.id,
			taskId,
		})
	}
	const handleEditTask = (task: Task) => {
		setCurrentTask(task)
		handleOpen()
	}
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({ id: `card-${card.id}`, data: { type: 'card', cardId: card.id} });

	if (!tasks) return <></>
	return (
		<>
			<Card
				ref={setNodeRef}
				sx={{
					width: 300,
					minHeight: 60,
					position: 'relative',
					opacity: isDragging ? 0.2 : 1,
					'&:hover': {
						boxShadow: (theme) => theme.shadows[4],
					},
					transform: CSS.Transform.toString(transform),
					transition,
				}}

			>
				<CardContent>
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<Box
							{...attributes}
							{...listeners}
							sx={{
								width: '100%',
								userSelect: 'none',
								cursor: 'grab',

							}}
						>
							<Typography variant="subtitle1" >
								{card.name}
							</Typography>
							{card.description && (
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mt: 0.5, ml: 0.5, width: '100%',  }}
									noWrap
								>
									{card.description}
								</Typography>
							)}
						</Box>
						<Box sx={{position: 'absolute', top: 10, right: 0}}>
							<IconButton onClick={handleMenuOpen}>
								<MoreVertIcon fontSize="small" />
							</IconButton>
						</Box>
						<Menu
							anchorEl={anchorEl}
							open={open}
							onClose={handleMenuClose}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
						>
							<MenuItem
								onClick={() => {
									handleMenuClose();
									onClickEdit();
								}}
							>
								Edit
							</MenuItem>
							<MenuItem
								onClick={() => {
									handleMenuClose();
									onClickDelete();
								}}
							>
								Delete
							</MenuItem>
						</Menu>
					</Stack>
					<DroppableCardArea  card={card}>
						<SortableContext
							items={tasks.length > 0 ? tasks.map((t) => `task-${t.id}`) : ['empty']}
							id={`tasks-${card.id}`}
							strategy={verticalListSortingStrategy}
						>
							<Stack
								sx={{
									backgroundColor: (theme) => theme.palette.background.paper,
									p: 1,
									minHeight: 60,
									borderRadius: 1,
									gap: 1,
									mt: 2,
								}}
							>
								{tasks?.map((task) => (
									<TaskItem
										key={task.id}
										task={task}
										onEdit={(task) => handleEditTask(task)}
										onDelete={(id) => handleDeleteTask(id)}
									/>
								))}
							</Stack>
						</SortableContext>
					</DroppableCardArea>

					<Stack sx={{ mt: 2 }}>
						<Button variant='outlined' onClick={handleOpen}>
							+ Create task
						</Button>
					</Stack>
				</CardContent>
			</Card>

			{card &&
				<CreateTaskModal
					card={card}
					open={openMoodal}
					onClose={handleClose}
					board={board}
					task={currentTask}
				/>
			}
		</>
	);
}



function DroppableCardArea({   children, card }: {  children: React.ReactNode, card: CardType }) {
	const { active } = useDndContext();
	const isDraggingTask = active?.data?.current?.type === 'task';
	const { setNodeRef } = useDroppable({
		id: `tasks-${card.id}`,
		data: { type: 'tasks', cardId: card.id },
	});
	return (
		<div ref={isDraggingTask ? setNodeRef : undefined}>
			{children}
		</div>
	);
}
