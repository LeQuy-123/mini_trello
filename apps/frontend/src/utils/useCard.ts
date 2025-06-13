import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@store/index';
import { resetStatus } from '@store/authSlice';
import {
	createCard,
	deleteCard,
	getCard,
	getCards,
	reorderCard,
	updateCard,
} from '@store/cardSlice';
import type { CardReorderBody } from '@services/cardService';
type CardBoody = {
	name: string;
	description?: string;
};
export const useCard = () => {
	const dispatch = useDispatch<AppDispatch>();

	const {
		cards,
		card,
		getOne: getDetailCardsStatus,
		get: getCardsStatus,
		create: createCardsStatus,
		update: updateCardsStatus,
		remove: removeCardsStatus,
	} = useSelector((state: RootState) => state.cards);

	return {
		cards,
		cardDetail: card,
		getCardsStatus,
		getDetailCardsStatus,
		createCardsStatus,
		updateCardsStatus,
		removeCardsStatus,
		getCards: (params: { boardId: string; userId?: string }) => dispatch(getCards(params)),
		getCardDetails: (params: { boardId: string; cardId: string }) => dispatch(getCard(params)),
		createCard: (boardId: string, data: CardBoody) => dispatch(createCard({ boardId, data })),
		updateCard: (boardId: string, cardId: string, data: CardBoody) =>
			dispatch(updateCard({ boardId, cardId, data })),
		deleteCard: (params: { boardId: string; cardId: string }) => dispatch(deleteCard(params)),
		reorderCard: (params: { boardId: string; data: CardReorderBody }) =>
			dispatch(reorderCard(params)),

		resetStatus: () => dispatch(resetStatus()),
	};
};
