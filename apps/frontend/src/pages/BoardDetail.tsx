import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBoard } from '@utils/useBoard';
import ErrorPage from '@components/ErrorPage';
import DrawerLayout from '@components/DrawerLayout';
import { useSocket } from '@utils/useSocket';
import { useAuth } from '@utils/useAuth';
import { useCard } from '@utils/useCard';
import { useTask } from '@utils/useTask';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { MultipleContainers } from '@components/DragDrop/MultipleContainers';
import type { Task } from '@services/taskService';
import type { Card } from '@services/cardService';
import type { Active, Over } from '@dnd-kit/core';
import { CreateCardModal } from '@components/CreateCardModal';
import { CreateTaskModal } from '@components/CreateTaskModal';

export default function BoardDetail() {
	const { id } = useParams<{ id: string }>();
	const { token } = useAuth();
	const { getDetailBoardsStatus, getBoardDetails, boardDetail, resetStatus } = useBoard();
	const { socket, emit, isConnected } = useSocket(token!);
	const { getCards, cards, deleteCard, reorderCard } = useCard();
	const { getTasks, tasksByCardId, deleteTask, moveTasks, reorderTasks } = useTask();

	const [selectedCard, setSelectedCard] = useState<null | Card>(null);
	const [selectedTask, setSelectedTask] = useState<null | Task>(null);

	const [open, setOpen] = useState(false);
	const handleClose = () =>{
		setSelectedCard(null);
		setOpen(false);
	}
	const handleOpen = () => setOpen(true);

	const [openTask, setOpenTask] = useState(false);
	const handleCloseTask = () =>{
		setOpenTask(false);
		setSelectedCard(null);
		setSelectedTask(null);
	}
	const handleOpenTask = () => setOpenTask(true);

	useEffect(() => {
		fetchData();
	}, []);
	const fetchData = async () => {
		try {
			if(!id) return;
			const cards = await getCards({ boardId: id }).unwrap();
			await Promise.all(
				cards.map((card) => getTasks({ boardId: id, cardId: card.id }))
			);
		} catch (error) {
			console.log('🚀 ~ fetchData ~ error:', error);
		}
	};
	useEffect(() => {
		if (id) {
			getBoardDetails({ id });
		}
		return () => {
			resetStatus();
		};
	}, [id]);
	useEffect(() => {
		if (!id) return;
		if (!isConnected) return;
		emit('join-board', id);

		const onUpdate = (update: any) => {
			if (update.type === 'reorder-task') {
				console.log('🚀 ~ onUpdate ~ update:', update.data);
				getTasks({
					boardId: id,
					cardId: update.data?.cardId,
				});
				if (update.data?.cardId?.data?.targetGroup) {
					getTasks({
						boardId: id,
						cardId: update.data?.targetGroup,
					});
				}
			} else {
				getCards({
					boardId: id,
				});
			}
		};

		socket?.on('board-update', onUpdate);

		return () => {
			emit('leave-board', id);
			socket?.off('board-update', onUpdate);
		};
	}, [isConnected, emit, socket, id]);

	const handleDeleteTask = (task: Task) => {
		if (!id) return
		deleteTask({
			boardId: id,
			taskId: task.id,
			cardId: task.cardId
		})?.unwrap()?.then(() => {
			emit('board-updated', {
				boardId: id,
				update: { type: 'reorder-card' },
			});
		})
	}
	const handleAddOrTask = (card: Card, task?: Task) => {
		handleOpenTask()
		setSelectedCard(card)
		setSelectedTask(task || null)
	}
	const handleDeleteCard = (card: Card) => {
		if (!id) return
		deleteCard({
			boardId: id,
			cardId: card.id
		})?.unwrap()?.then(() => {
			emit('board-updated', {
				boardId: id,
				update: { type: 'reorder-card' },
			});
		})
	}
	const handleReorderCard = ({ active, over }: { active: Active, over: Over | null }) => {
		if (!id) return
		if (!over?.id) return
		reorderCard({
			boardId: id,
			data: {
				sourceId: String(active.id),
				targetId: String(over?.id),
			},
		})
			.unwrap()
			.then(() => {
				emit('board-updated', {
					boardId: id,
					update: { type: 'reorder-card' },
				});
			});
	}
	const handleAddCard = (card?: Card) => {
		setSelectedCard(card || null)
		handleOpen()
	}
	const handleReorderTask = ({ sourceId, targetId, sourceGroup, targetIndex, targetGroup }: {
		sourceId: string,
		targetId: string,
		targetIndex:  number,
		sourceGroup: string,
		targetGroup: string,
	}) => {
		if(!id) return;
		if(sourceGroup === targetGroup) {
			reorderTasks({
				boardId: id,
				cardId: sourceGroup,
				data: {
					sourceId: sourceId,
					targetId: targetId || '-1',
				},
			})
				.unwrap()
				.then(() => {
					emit('board-updated', {
						boardId: id,
						update: {
							type: 'reorder-task',
							data: {
								boardId: id,
								cardId: sourceGroup,
								data: {
									sourceId: sourceId,
									targetId: targetId || '-1',
								},
							},
						},
					});
				});
		} else {
			moveTasks({
				boardId: id,
				cardId: sourceGroup,
				data: {
					sourceId: sourceId,
					targetIndex: targetIndex,
					targetGroup: targetGroup,
				},
			})
				.unwrap()
				.then(() => {
					emit('board-updated', {
						boardId: id,
						update: {
							type: 'reorder-task',
							data: {
								boardId: id,
								cardId: sourceGroup,
								data: {
									sourceId: sourceId,
									targetId: targetId || '-1',
									targetGroup: targetGroup,
								},
							},
						},
					});
				});
		}


	}
	if (getDetailBoardsStatus.error) return <ErrorPage message={getDetailBoardsStatus.error} />;

	return (
		<>
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
					<MultipleContainers
						items={cards?.map((card) => ({
							...card,
							tasks: tasksByCardId[card.id]
						}))}
						containerStyle={{
							backgroundColor: theme => {
								return theme.palette.action.focus
							}
						}}
						strategy={rectSortingStrategy}
						onRemoveTask={handleDeleteTask}
						onRemoveCard={handleDeleteCard}
						onReorderCard={handleReorderCard}
						onCardClick={handleAddCard}
						onReorderTask={handleReorderTask}
						onTaskClick={handleAddOrTask}
					/>
				</Box>
			</DrawerLayout>
			{id && (
				<CreateCardModal
					open={open}
					boardId={id}
					onClose={handleClose}
					card={selectedCard}
				/>
			)}
			{boardDetail && selectedCard && (
				<CreateTaskModal
					card={selectedCard}
					open={openTask}
					onClose={handleCloseTask}
					board={boardDetail}
					task={selectedTask}
				/>
			)}
		</>
	);
}
