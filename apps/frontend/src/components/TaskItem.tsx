import React, { useState } from 'react';
import {
	Box,
	Typography,
	IconButton,
	Menu,
	MenuItem,
	useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Task } from '@services/taskService';
import { statusColors } from '@utils/helper';

interface TaskItemProps {
	task: Task;
	onEdit: (task: Task) => void;
	onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const theme = useTheme();

	const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => setAnchorEl(null);

	return (
		<Box
			sx={{
				p: 1.5,
				position: 'relative',
				backgroundColor:
					theme.palette.mode === 'dark'
						? theme.palette.grey[900]
						: theme.palette.background.default,
				borderRadius: 2,
				border: `1px solid ${theme.palette.mode === 'dark'
						? theme.palette.grey[800]
						: theme.palette.grey[300]
					}`,
				boxShadow: 1,
				cursor: 'pointer',
				overflow: 'hidden',
				'&:hover .menu-btn': {
					right: 8,
					opacity: 1,
				},
				borderLeft: `6px solid ${statusColors[task.status]}`,

			}}
			onClick={() => console.log('Task clicked')}
		>
			<Box sx={{ pr: 5 }}>
				<Typography variant="subtitle2" fontWeight={500}>
					{task.title}
				</Typography>
				{task.description && (
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mt: 0.5, ml: 0.5 }}
						noWrap
					>
						{task.description}
					</Typography>
				)}
			</Box>

			<IconButton
				onClick={handleMenuClick}
				sx={{
					position: 'absolute',
					top: 4,
					right: 1,
					zIndex: 1,
				}}
			>
				<MoreVertIcon fontSize="small" />
			</IconButton>

			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				onClick={(e) => e.stopPropagation()}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<MenuItem
					onClick={() => {
						handleClose();
						onEdit(task);
					}}
				>
					Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleClose();
						onDelete(task.id);
					}}
				>
					Delete
				</MenuItem>
			</Menu>
		</Box>
	);
};

export default TaskItem;
