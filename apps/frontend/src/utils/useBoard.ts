import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@store/index';
import {
	createBoard,
	deleteBoard,
	getBoards,
	updateBoard,
	getBoard,
	resetStatus,
	getUsers,
} from '@store/boardSlice';

export const useBoard = () => {
	const dispatch = useDispatch<AppDispatch>();

	const {
		boards,
		board,
		users,
		getUsers: getBoardUsersStatus,
		getOne: getDetailBoardsStatus,
		get: getBoardsStatus,
		create: createBoardsStatus,
		update: updateBoardsStatus,
		remove: removeBoardsStatus,
	} = useSelector((state: RootState) => state.boards);

	return {
		boards,
		boardDetail: board,
		getBoardsStatus,
		getDetailBoardsStatus,
		createBoardsStatus,
		updateBoardsStatus,
		removeBoardsStatus,
		getBoardUsersStatus,
		users,
		getBoards: (params: { name?: string; created?: boolean }) => dispatch(getBoards(params)),
		getBoardDetails: (params: { id: string }) => dispatch(getBoard(params.id)),
		createBoard: (data: { name: string; description: string }) => dispatch(createBoard(data)),
		updateBoard: (id: string, data: { name: string; description: string }) =>
			dispatch(updateBoard({ id, data })),
		deleteBoard: (id: string) => dispatch(deleteBoard(id)),
		resetStatus: () => dispatch(resetStatus()),
		getUsers: (params: { id: string }) => dispatch(getUsers(params.id)),
	};
};
