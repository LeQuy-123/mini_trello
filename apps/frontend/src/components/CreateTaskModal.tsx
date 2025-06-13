import React, { useEffect } from 'react';
import {
	Modal,
	Box,
	Typography,
	Button,
	Fade,
	CircularProgress,
	TextField,
	MenuItem,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomTextField from './CustomTextField';
import type { Board } from '@services/boardService';
import type { Card } from '@services/cardService';
import type { Task } from '@services/taskService';
import { useTask } from '@utils/useTask';

type CreateTaskForm = {
	title: string;
	description: string;
	status: string;
};

type CreateTaskModalProps = {
	open: boolean;
	onClose: () => void;
	board: Board;
	card: Card;
	task?: Task;
};

const schema = yup.object({
	title: yup.string().required('Name is required'),
	description: yup.string().required('Description is required'),
	status: yup.string().required('Status is required'),
});

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
	open,
	onClose,
	board,
	card,
	task,
}) => {
	const { createTask, updateTask, createTaskStatus, updateTaskStatus } = useTask();
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<CreateTaskForm>({
		resolver: yupResolver(schema),
		defaultValues: {
			title: '',
			description: '',
			status: 'new',
		},
	});
	useEffect(() => {
		if (task) {
			setValue('title', task.title);
			setValue('description', task.description);
			setValue('status', task.status);
		} else {
			reset();
		}
	}, [task, open]);
	const onSubmit = async (data: CreateTaskForm) => {
		if (task) {
			await updateTask({
				boardId: board.id,
				cardId: card.id,
				taskId: task.id,
				data,
			});
		} else {
			await createTask({
				boardId: board.id,
				cardId: card.id,
				data,
			});
		}
		reset();
		onClose();
	};
	const handleClose = () => {
		reset();
		onClose();
	};
	const isEditing = Boolean(task);
	const loading = isEditing ? updateTaskStatus.loading : createTaskStatus.loading;

	return (
		<Modal open={open} onClose={handleClose} closeAfterTransition>
			<Fade in={open}>
				<Box
					sx={{
						position: 'absolute' as const,
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 400,
						bgcolor: 'background.paper',
						borderRadius: 2,
						boxShadow: 24,
						p: 4,
					}}
				>
					<Typography variant="h6" mb={2}>
						{isEditing ? 'Edit Task' : 'Create New Task'}
					</Typography>
					<form onSubmit={handleSubmit(onSubmit)}>
						<CustomTextField
							name="title"
							control={control}
							label="Task Name"
							error={!!errors.title}
							helperText={errors.title?.message}
						/>
						<CustomTextField
							name="description"
							control={control}
							label={'Description'}
							error={!!errors.description}
							helperText={errors.description?.message}
							multiline
							rows={4}
							sx={{ height: 120 }}
						/>
						<Controller
							name="status"
							control={control}
							defaultValue="new"
							render={({ field }) => (
								<TextField
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									select
									sx={{ mt: 4, width: '100%' }}
									label="Status"
									error={!!errors.status}
									helperText={errors.status?.message}
								>
									<MenuItem value="new">New</MenuItem>
									<MenuItem value="wip">WIP</MenuItem>
									<MenuItem value="reject">Reject</MenuItem>
									<MenuItem value="complete">Complete</MenuItem>
								</TextField>
							)}
						/>

						<Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
							<Button
								sx={{ width: 100 }}
								onClick={handleClose}
								color="secondary"
								variant="outlined"
							>
								Cancel
							</Button>
							<Button
								sx={{ width: 100 }}
								type="submit"
								color="primary"
								variant="contained"
								disabled={loading}
							>
								{loading ? (
									<CircularProgress size={24} color="inherit" />
								) : board ? (
									'Save'
								) : (
									'Create'
								)}
							</Button>
						</Box>
					</form>
				</Box>
			</Fade>
		</Modal>
	);
};
