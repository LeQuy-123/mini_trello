import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBoard } from '@utils/useBoard';
import LoadingPage from '@components/LoadingPage';
import ErrorPage from '@components/ErrorPage';
import DrawerLayout from '@components/DrawerLayout';

export default function BoardDetail() {
	const { id } = useParams<{ id: string }>();

	const {
		getDetailBoardsStatus,
		getBoardDetails,
		boardDetail,
	} = useBoard();
		console.log("🚀 ~ BoardDetail ~ boardDetail:", boardDetail)

	useEffect(() => {
		if (id) {
			getBoardDetails({ id });
		}
	}, [id]);

	if (getDetailBoardsStatus.loading) return <LoadingPage />;
	if (getDetailBoardsStatus.error  ) return <ErrorPage message={getDetailBoardsStatus.error} />;
	const handleAddCard = () => {

	}
	return (
		<DrawerLayout boardDetail={boardDetail}>
			<Box sx={{ pl: 2, pt: 1 }}>
				<Box>
					<Typography variant="h6" gutterBottom>
						{boardDetail?.name}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{boardDetail?.description}
					</Typography>
				</Box>
				<Box sx={{mt: 2}}>
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
							onClick={handleAddCard}
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
				</Box>
			</Box>
		</DrawerLayout>
	);
}

