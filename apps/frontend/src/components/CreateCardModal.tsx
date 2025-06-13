import React, { useEffect } from 'react';
import { Modal, Box, Typography, Button, Fade, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomTextField from './CustomTextField';
import { useCard } from '@utils/useCard';
import { useSocket } from '@utils/useSocket';
import { useAuth } from '@utils/useAuth';

type CreateCardForm = {
	name: string;
	description: string;
};

type CreateCardModalProps = {
	boardId: string;
	open: boolean;
	onClose: () => void;
	card?: { id: string; name: string; description: string } | null;
};

const schema = yup.object({
	name: yup.string().required('Name is required'),
	description: yup.string().required('Description is required'),
});

export const CreateCardModal: React.FC<CreateCardModalProps> = ({
	open,
	onClose,
	card,
	boardId,
}) => {
	const { createCard, updateCard, createCardsStatus, updateCardsStatus } = useCard();
	const { token } = useAuth();
	const { emit } = useSocket(token!);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<CreateCardForm>({
		resolver: yupResolver(schema),
	});
	useEffect(() => {
		if (card) {
			setValue('name', card.name);
			setValue('description', card.description);
		} else {
			reset();
		}
	}, [card, open]);
	const onSubmit = async (data: CreateCardForm) => {
		if (card) {
			updateCard(boardId, card?.id, data)
				?.unwrap()
				.finally(() => {
					reset();
					onClose();
					emit('board-updated', {
						boardId: boardId,
						update: { type: 'reorder-card' },
					});
				});
		} else {
			createCard(boardId, data)
				?.unwrap()
				.finally(() => {
					reset();
					onClose();
					emit('board-updated', {
						boardId: boardId,
						update: { type: 'reorder-card' },
					});
				});
		}
	};
	const handleClose = () => {
		reset();
		onClose();
	};
	const isEditing = Boolean(card);
	const loading = isEditing ? updateCardsStatus.loading : createCardsStatus.loading;

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
						{isEditing ? 'Edit Card' : 'Create New Card'}
					</Typography>
					<form onSubmit={handleSubmit(onSubmit)}>
						<CustomTextField
							name="name"
							control={control}
							label="Card name"
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
								) : card ? (
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
