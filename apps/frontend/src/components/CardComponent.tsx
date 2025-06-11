import {
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
type Props = {
	card: CardType;
	board: Board;
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
	const handleOpen = () => setOpenModal(true);
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
	return (
		<>
			<Card
				sx={{
					width: 300,
					minHeight: 60,
					position: 'relative',
					transition: 'box-shadow 0.2s',
					'&:hover': {
						boxShadow: (theme) => theme.shadows[4],
					},
				}}
			>
				<CardContent>
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<Typography variant="subtitle1" color="text.secondary">
							{card.name}
						</Typography>
						<IconButton onClick={handleMenuOpen}>
							<MoreVertIcon fontSize="small" />
						</IconButton>
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
