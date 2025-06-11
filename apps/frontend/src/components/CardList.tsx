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
type Props = {
	board: Board
}
export default function CardList({
	board
}: Props) {
	const {
		cards,
		getCards,
		getCardsStatus,
		deleteCard
	} = useCard()
	useEffect(() => {
		getCards({
			boardId: board.id
		})
	}, [])
	const [selectedCard, setSelectedCard] = useState<null | CardType>(null);
	console.log("🚀 ~ useEffect ~ board:", board)

	const [open, setOpen] = useState(false);
	const handleClose = () => setOpen(false);
	const handleOpen = () => setOpen(true);
	const handleEdit = (card: CardType ) => {
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
					<Skeleton variant="text" width="80%"  />
				</CardContent>
			</Card>
		));
	};

	return (
		<>
			<Stack direction='row' gap={2} sx={{ mt: 2 }}>
				{getCardsStatus.loading
					? renderCardSkeletons()
					: cards?.map((item) => (
						<CardComponent
							key={item.id}
							card={item}
							onClickEdit={() => handleEdit(item)}
							onClickDelete={() => handleDelete(item)}
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
			{board && <CreateCardModal
				open={open}
				boardId={board.id}
				onClose={handleClose}
				card={selectedCard}
			/> }

		</>
	);
}

