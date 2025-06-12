import {
	Card,
	CardActionArea,
	CardContent,
	Skeleton,
	Stack,
	Typography,
} from '@mui/material';
import type { Board } from '@services/boardService';
import { CreateCardModal } from './CreateCardModal';
import { useEffect, useState } from 'react';
import type { Card as CardType } from '@services/cardService';
import { useCard } from '@utils/useCard';
import CardComponent from './CardComponent';
import { useSocket } from '@utils/useSocket';
import { useTask } from '@utils/useTask';
import { DragDropProvider } from '@dnd-kit/react';
import { useAuth } from '@utils/useAuth';
type Props = {
	board: Board
}
export default function CardList({
	board
}: Props) {
	const { token } = useAuth()
	const {
		cards,
		getCards,
		getCardsStatus,
		deleteCard,
		reorderCard,

	} = useCard()
	const {  getTasks, reorderTasks, tasksByCardId, moveTasks } = useTask()
	const { emit } = useSocket(token!);

	useEffect(() => {
		fetchData()
	}, [])
	const fetchData = async () => {
		try {
			const cards = await getCards({ boardId: board.id }).unwrap();
			await Promise.all(
				cards.map((card) =>
					getTasks({ boardId: board.id, cardId: card.id })
				)
			);
		} catch (error) {
			console.log("🚀 ~ fetchData ~ error:", error)
		}
	}
	const [selectedCard, setSelectedCard] = useState<null | CardType>(null);


	const [open, setOpen] = useState(false);
	const handleClose = () => setOpen(false);
	const handleOpen = () => setOpen(true);
	const handleEdit = (card: CardType) => {
		setSelectedCard(card)
		handleOpen()
	}
	const handleDelete = (card: CardType) => {
		deleteCard({
			boardId: board.id,
			cardId: card.id
		})
	}
	const renderCardSkeletons = () => {
		const count = board.cardsCount || 3;
		return Array.from({ length: count }).map((_, idx) => (
			<Card key={idx} sx={{ width: 300, minHeight: 50 }}>
				<CardContent>
					<Skeleton variant="text" width="80%" />
				</CardContent>
			</Card>
		));
	};



	const handleDragEnd = (event: any) => {
		const { source, target } = event.operation;

		if(!target) return;
		if (event.canceled) {
			return;
		}
		if (source.type === 'card') { //move card
			const sourceIndex = source.sortable.initialIndex;
			const targetIndex = source.sortable.index
			if(sourceIndex === targetIndex) return;
			if (!cards[sourceIndex]?.id || !cards[targetIndex]?.id) return
			reorderCard({
				boardId: board.id,
				data: {
					sourceId: String(cards[sourceIndex].id),
					targetId: String(cards[targetIndex].id)
				}
			}).unwrap().then(() => {
				emit('board-updated', {
					boardId: board.id,
					update: { type: 'reorder-card' }
				});
			});
		}

		if (source.type === 'item') { //move task
			const sourceIndex = source.sortable.initialIndex;
			const targetIndex = source.sortable.index;

			const sourceGroup = source.sortable.initialGroup;
			const targetGroup = source.sortable.group;

			if (sourceGroup === targetGroup) { // move task inside 1 group
				if (sourceIndex === targetIndex) return;
				const tasks = tasksByCardId?.[source.sortable.group]
				if (!tasks[sourceIndex]?.id || !tasks[targetIndex]?.id) return
				reorderTasks({
					boardId: board.id,
					cardId: source.sortable.group,
					data: {
						sourceId: String(tasks[sourceIndex].id),
						targetId: String(tasks[targetIndex].id)
					}
				})
			} else {// move task to diffrent 1 group
				const tasksOriginal = tasksByCardId?.[sourceGroup]
				const tasksNew = tasksByCardId?.[targetGroup]
				if (!tasksOriginal[sourceIndex]?.id || !tasksNew[targetIndex]?.id) return

				moveTasks({
					boardId: board.id,
					cardId: sourceGroup,
					data: {
						sourceId: String(tasksOriginal[sourceIndex].id),
						targetId: String(tasksNew[targetIndex].id),
						targetGroup
					}
				})

			}

		}
		if (target.id?.toString()?.includes('drop-')) { //special case move item to empty card
			const targetGroup = target.id?.toString()?.replace('drop-', '')
			const sourceGroup = source.sortable.initialGroup;
			const tasksOriginal = tasksByCardId?.[sourceGroup];
			const sourceIndex = source.sortable.initialIndex;
			moveTasks({
				boardId: board.id,
				cardId: sourceGroup,
				data: {
					sourceId: String(tasksOriginal[sourceIndex].id),
					targetId: '-1',
					targetGroup
				}
			})

		}
	}





	return (
		<>
			<DragDropProvider
				onDragEnd={handleDragEnd}
			>
				<Stack direction='row' gap={2} sx={{ mt: 2 }} alignItems={'flex-start'}>
					{getCardsStatus.loading
						? renderCardSkeletons()
						: cards?.map((card, index) => (
							<CardComponent
								key={`card-${card.id}`}
								card={card}
								cardIndex={index}
								board={board}
								onClickEdit={() => handleEdit(card)}
								onClickDelete={() => handleDelete(card)}
							/>
						))}
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
							onClick={handleOpen}
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
				</Stack>

			</DragDropProvider>

			{board && <CreateCardModal
				open={open}
				boardId={board.id}
				onClose={handleClose}
				card={selectedCard}
			/>}

		</>
	);
}
