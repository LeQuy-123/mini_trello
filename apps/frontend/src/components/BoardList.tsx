import { useBoard } from "@utils/useBoard";
import { useEffect } from "react";

export  const BoardList = () => {
    const {
        boards,
        getBoardsStatus,
        getBoards,
        deleteBoard,
    } = useBoard();

    useEffect(() => {
        getBoards();
    }, []);

    if (getBoardsStatus.loading) return <p>Loading...</p>;
    if (getBoardsStatus.error) return <p>Error: {getBoardsStatus.error}</p>;

    return (
        <ul>
            {boards.map((board) => (
                <li key={board.id}>
                    {board.name}
                    <button onClick={() => deleteBoard(board.id)}>Delete</button>
                </li>
            ))}
        </ul>
    );
};
