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
import { useState } from 'react';
import { useTask } from '@utils/useTask';

type Props = {
	card: CardType;
	onClickEdit: () => void;
	onClickDelete: () => void;
};

export default function CardComponent({ card, onClickEdit, onClickDelete }: Props) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const {} = useTask()
	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	return (
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
				<Stack sx={{mt: 2}}>
					<Button variant='outlined'>
						+ Create task
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
}
