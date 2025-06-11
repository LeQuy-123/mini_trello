import ErrorPage from '@components/ErrorPage';
import LoadingPage from '@components/LoadingPage';
import { Box, Typography } from '@mui/material';
import { useBoard } from '@utils/useBoard';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function BoardDetail() {
	const { id } = useParams<{ id: string }>();

	const {
		getDetailBoardsStatus,
		getBoardDetails,
		boardDetail,
	} = useBoard()
	useEffect(() => {
		getBoardDetails({
			id: id || ''
		})
	}, [])

	if (getDetailBoardsStatus.loading) return <LoadingPage />;
	if (getDetailBoardsStatus.error) return <ErrorPage message={getDetailBoardsStatus.error} />;
	return (
		<Box sx={{ flexGrow: 1 }}>
			<Box>
				<Typography variant="subtitle1" gutterBottom>
					{boardDetail?.name}
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
				>
					{boardDetail?.description}
				</Typography>
			</Box>
		</Box>
	);
}
