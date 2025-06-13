import {
	Box,
	Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBoard } from '@utils/useBoard';
import ErrorPage from '@components/ErrorPage';
import DrawerLayout from '@components/DrawerLayout';
import CardList from '@components/DragDropSet/CardList';
import { useSocket } from '@utils/useSocket';
import { useAuth } from '@utils/useAuth';
import { useCard } from '@utils/useCard';
import { useTask } from '@utils/useTask';

export default function BoardDetail() {
	const { id } = useParams<{ id: string }>();
	const {token} = useAuth()
	const {
		getDetailBoardsStatus,
		getBoardDetails,
		boardDetail,
		resetStatus
	} = useBoard();
	const {getTasks} = useTask()
	const { socket, emit, isConnected } = useSocket(token!);
	const {
		getCards
	} = useCard();
	useEffect(() => {
		if (id) {
			getBoardDetails({ id });
		}
		return () => {
			resetStatus()
		}
	}, [id]);
	useEffect(() => {
		if (!id) return;
		if (!isConnected) return;
		emit('join-board', id);

		const onUpdate = (update: any) => {
			if (update.type === 'reorder-task') {
				console.log("🚀 ~ onUpdate ~ update:", update.data)
				getTasks({
					boardId: id,
					cardId: update.data?.cardId
				})
				if (update.data?.cardId?.data?.targetGroup) {
					getTasks({
						boardId: id,
						cardId: update.data?.targetGroup
					})
				}
			} else {
				getCards({
					boardId: id,
				})
			}

		};

		socket?.on('board-update', onUpdate);

		return () => {
			emit('leave-board', id);
			socket?.off('board-update', onUpdate);
		};
	}, [isConnected, emit, socket, id]);

	if (getDetailBoardsStatus.error  ) return <ErrorPage message={getDetailBoardsStatus.error} />;

	return (
		<DrawerLayout>
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

