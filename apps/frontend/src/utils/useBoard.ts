import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@store/index';
import { createBoard, deleteBoard, getBoards, updateBoard } from '@store/boardSlice';
import { resetStatus } from '@store/authSlice';

export const useBoard = () => {
	const dispatch = useDispatch<AppDispatch>();

	const {
		boards,
		get: getBoardsStatus,
		create: createBoardsStatus,
		update: updateBoardsStatus,
		remove: removeBoardsStatus,
	} = useSelector((state: RootState) => state.boards);

	return {
		boards,
		getBoardsStatus,
		createBoardsStatus,
		updateBoardsStatus,
		removeBoardsStatus,
		getBoards: (params: { name?: string; created?: boolean }) => dispatch(getBoards(params)),
		createBoard: (data: { name: string; description: string }) => dispatch(createBoard(data)),
		updateBoard: (id: string, data: { name: string; description: string }) =>
			dispatch(updateBoard({ id, data })),
		deleteBoard: (id: string) => dispatch(deleteBoard(id)),
		resetStatus: () => dispatch(resetStatus()),
	};
};
