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
import React, { useState, useCallback } from 'react';
import { useTask } from '@utils/useTask';
import { CreateTaskModal } from '../CreateTaskModal';
import type { Board } from '@services/boardService'
import TaskItem from './TaskComponent';
import type { Task } from '@services/taskService';
import { useSortable } from '@dnd-kit/react/sortable';
import { useDroppable } from '@dnd-kit/react';

type Props = {
	card: CardType;
	board: Board;
	cardIndex: number;
	onClickEdit: () => void;
	onClickDelete: () => void;
};


const CardComponent = React.memo(function CardComponent({ card, board, onClickEdit, onClickDelete, cardIndex }: Props) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [openModal, setOpenModal] = useState(false);
	const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);

	const { tasksByCardId, deleteTask } = useTask();
	const tasks = tasksByCardId[card.id] || [];


	const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	}, []);

	const handleMenuClose = useCallback(() => {
		setAnchorEl(null);
	}, []);

	const handleCloseModal = useCallback(() => {
		setOpenModal(false);
		setCurrentTask(undefined);
	}, []);

	const handleOpenModal = useCallback(() => {
		setOpenModal(true);
	}, []);

	const handleDeleteTask = useCallback((taskId: string) => {
		deleteTask({ boardId: board.id, cardId: card.id, taskId });
	}, [board.id, card.id, deleteTask]);

	const handleEditTask = useCallback((task: Task) => {
		setCurrentTask(task);
		handleOpenModal();
	}, [handleOpenModal]);

	const {
		ref: dragRef,
		isDragging,
	} = useSortable({
		id: card.id,
		index: cardIndex,
		type: 'card',
		collisionPriority: 1,
		accept: ['card'],
		data: {
			name: card.name
		}
	});

	return (
		<>
			<Card
				ref={dragRef}
				sx={{
					width: 300,
					minHeight: 60,
					position: 'relative',
					opacity: isDragging ? 0.8 : 1,
					'&:hover': {
						boxShadow: (theme) => theme.shadows[4],
					},
				}}
			>
				<CardContent>
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<Box

							sx={{ width: '100%', userSelect: 'none', cursor: 'grab' }}
						>
							<Typography variant="subtitle1">{card.name}</Typography>
							{card.description && (
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mt: 0.5, ml: 0.5, width: '100%' }}
									noWrap
								>
									{card.description}
								</Typography>
							)}
						</Box>
						<Box sx={{ position: 'absolute', top: 10, right: 0 }}>
							<IconButton onClick={handleMenuOpen}>
								<MoreVertIcon fontSize="small" />
							</IconButton>
						</Box>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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

					<ListTask
						onClickDelete={handleDeleteTask}
						onClickEdit={handleEditTask}
						tasks={tasks}
						card={card}
					/>
					<Stack sx={{ mt: 2 }}>
						<Button variant="outlined" onClick={handleOpenModal}>
							+ Create task
						</Button>
					</Stack>
				</CardContent>
			</Card>

			<CreateTaskModal
				card={card}
				open={openModal}
				onClose={handleCloseModal}
				board={board}
				task={currentTask}
			/>
		</>
	);
});

export default CardComponent;

type ListTaskProps = {
	tasks: Task[]
	card: CardType
	onClickEdit: (task: Task) => void;
	onClickDelete: (taskId: string) => void;
}
const ListTask = ({ tasks, card,  onClickEdit, onClickDelete }: ListTaskProps) => {
	const { isDropTarget, ref } = useDroppable({
		id: `drop-${card.id}`,
		type: 'card',
		accept: 'item',
		collisionPriority: 0,
	});
	return (
		<Stack
			sx={{
				backgroundColor: (theme) => isDropTarget ? theme.palette.action.selected : theme.palette.background.paper,
				p: 1,
				minHeight: 60,
				borderRadius: 1,
				gap: 1,
				mt: 2,
			}}
			ref={ref}
		>
			{tasks.map((task, index) => {
				if (!task) return;
				return (
					<TaskItem
						key={task.id}
						task={task}
						taskIndex={index}
						onEdit={onClickEdit}
						onDelete={onClickDelete}
					/>
				)
			})}

		</Stack>
	);
}




