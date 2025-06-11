import {
	Box,
	Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBoard } from '@utils/useBoard';
import LoadingPage from '@components/LoadingPage';
import ErrorPage from '@components/ErrorPage';
import DrawerLayout from '@components/DrawerLayout';
import CardList from '@components/CardList';

export default function BoardDetail() {
	const { id } = useParams<{ id: string }>();

	const {
		getDetailBoardsStatus,
		getBoardDetails,
		boardDetail,
	} = useBoard();

	useEffect(() => {
		if (id) {
			getBoardDetails({ id });
		}
	}, [id]);

	if (getDetailBoardsStatus.loading) return <LoadingPage />;
	if (getDetailBoardsStatus.error  ) return <ErrorPage message={getDetailBoardsStatus.error} />;

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
				{boardDetail && <CardList
					board={boardDetail}
				/>}

			</Box>
		</DrawerLayout>
	);
}

