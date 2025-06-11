import React, { useEffect } from 'react';
import { Modal, Box, Typography, Button, Fade, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomTextField from './CustomTextField';
import { useBoard } from '@utils/useBoard';

type CreateBoardForm = {
	name: string;
	description: string;
};

type CreateCardModalProps = {
	open: boolean;
	onClose: () => void;
	board?: { id: string; name: string; description: string } | null;
};

const schema = yup.object({
	name: yup.string().required('Name is required'),
	description: yup.string().required('Description is required'),
});

export const CreateCardModal: React.FC<CreateCardModalProps> = ({ open, onClose, board }) => {
	const { createBoard, createBoardsStatus, updateBoard, updateBoardsStatus } = useBoard();
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<CreateBoardForm>({
		resolver: yupResolver(schema),
	});
	useEffect(() => {
		if (board) {
			setValue('name', board.name);
			setValue('description', board.description);
		} else {
			reset();
		}
	}, [board, open]);
	const onSubmit = async (data: CreateBoardForm) => {
		if (board) {
			await updateBoard(board.id, data);
		} else {
			await createBoard(data);
		}
		reset();
		onClose();
	};
	const handleClose = () => {
		reset();
		onClose();
	};
	const isEditing = Boolean(board);
	const loading = isEditing ? updateBoardsStatus.loading : createBoardsStatus.loading;

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
						{isEditing ? 'Edit Board' : 'Create New Board'}
					</Typography>
					<form onSubmit={handleSubmit(onSubmit)}>
						<CustomTextField
							name="name"
							control={control}
							label="Board Name"
							error={!!errors.name}
							helperText={errors.name?.message}
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
