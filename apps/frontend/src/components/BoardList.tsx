import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	Typography,
	CircularProgress,
	Alert,
	useTheme,
	IconButton,
	Menu,
	MenuItem,
} from '@mui/material';
import { useBoard } from '@utils/useBoard';
import { useEffect, useState } from 'react';
import { CreateBoardModal } from './CreateBoardModal';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
type Props = {
	created?: boolean;
};

export const BoardList = ({ created }: Props) => {
	const { boards, getBoardsStatus, getBoards, deleteBoard } = useBoard();
	const theme = useTheme();
	const [open, setOpen] = useState(false);
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [menuBoardId, setMenuBoardId] = useState<string | null>(null);
	const [selectedBoard, setSelectedBoard] = useState<null | {
		id: string;
		name: string;
		description: string;
	}>(null);

	const navigate = useNavigate();

	const handleOpen = () => {
		setSelectedBoard(null);
		setOpen(true);
	};
	const handleClose = () => setOpen(false);

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, boardId: string) => {
		setMenuAnchorEl(event.currentTarget);
		setMenuBoardId(boardId);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setMenuBoardId(null);
	};

	const handleEdit = () => {
		const boardToEdit = boards.find((b) => b.id === menuBoardId);
		if (boardToEdit) {
			setSelectedBoard(boardToEdit);
			setOpen(true);
		}
		handleMenuClose();
	};

	const handleDelete = () => {
		if (menuBoardId) {
			deleteBoard(menuBoardId);
		}
		handleMenuClose();
	};

	useEffect(() => {
		getBoards({ created });
	}, [created]);

	const handleBoardClick = (id: string) => navigate(`/boards/${id}`);

	if (getBoardsStatus.loading) return <CircularProgress />;
	if (getBoardsStatus.error) return <Alert severity="error">{getBoardsStatus.error}</Alert>;

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 2,
					justifyContent: {
						xs: 'center',
						sm: 'flex-start',
					},
				}}
			>
				{boards.map((board) => (
					<Card
						key={board.id}
						sx={{
							width: 300,
							height: 150,
							position: 'relative',
							transition: 'box-shadow 0.2s',
							'&:hover': {
								boxShadow: theme.shadows[4],
							},
						}}
					>
						<IconButton
							onClick={(e) => handleMenuOpen(e, board.id)}
							sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}
							size="small"
						>
							<MoreVertIcon />
						</IconButton>
						<CardActionArea
							sx={{
								height: '100%',
								display: 'flex',
								alignItems: 'stretch',
								justifyContent: 'start',
							}}
							onClick={() => handleBoardClick(board.id)}
						>
							<CardContent sx={{ width: '100%' }}>
								<Typography
									variant="h6"
									fontWeight={500}
									title={board.name}
									sx={{
										display: '-webkit-box',
										WebkitLineClamp: 2,
										WebkitBoxOrient: 'vertical',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
									}}
								>
									{board.name}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									title={board.description}
									sx={{
										display: '-webkit-box',
										WebkitLineClamp: 3,
										WebkitBoxOrient: 'vertical',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
									}}
								>
									{board.description}
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>
				))}
				<Card
					sx={{
						width: 300,
						height: 150,
						opacity: 0.8,
						cursor: 'pointer',
						transition: 'box-shadow 0.2s',
						'&:hover': {
							boxShadow: theme.shadows[4],
						},
					}}
				>
					<CardActionArea
						sx={{ height: '100%', display: 'flex', alignItems: 'center' }}
						onClick={handleOpen}
					>
						<CardContent>
							<Typography
								variant="subtitle1"
								color="text.secondary"
								textAlign="center"
							>
								+ Create Board
							</Typography>
						</CardContent>
					</CardActionArea>
				</Card>
			</Box>
			<Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
				<MenuItem onClick={handleEdit}>
					<EditIcon sx={{ fontSize: 16, marginRight: 2 }} />
					Edit
				</MenuItem>
				<MenuItem onClick={handleDelete}>
					<DeleteIcon sx={{ fontSize: 16, marginRight: 2 }} />
					Delete
				</MenuItem>
			</Menu>
			<CreateBoardModal board={selectedBoard} open={open} onClose={handleClose} />
		</>
	);
};
