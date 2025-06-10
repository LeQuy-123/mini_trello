import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    useTheme,
} from "@mui/material";
import { useBoard } from "@utils/useBoard";
import { useEffect } from "react";

type Props = {
    created?: boolean;
};

export const BoardList = ({ created }: Props) => {
    const { boards, getBoardsStatus, getBoards } = useBoard();
    const theme = useTheme();

    useEffect(() => {
        getBoards({ created });
    }, [created]);

    if (getBoardsStatus.loading) return <CircularProgress />;
    if (getBoardsStatus.error) return <Alert severity="error">{getBoardsStatus.error}</Alert>;

    return (
        <Box
            sx={{
                display: "flex", flexWrap: "wrap", gap: 2, justifyContent: {
                    xs: "center",
                    sm: "flex-start"
                }
            }}
        >   
            {boards.map((board) => (
                <Card
                    key={board.id}
                    sx={{
                        width: 300,
                        height: 150,
                        cursor: "pointer",
                        transition: "box-shadow 0.2s",
                        "&:hover": {
                            boxShadow: theme.shadows[4],
                        },
                    }}
                >
                    <CardActionArea 
                        sx={{ height: "100%", display: "flex", alignItems: "stretch", justifyContent: 'start' }} 
                        onClick={() => console.log("Clicked", board.id)}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                fontWeight={500}
                                title={board.name}
                                sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {board.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                title={board.description}
                                sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {board.description} 
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>

            ))}

            <Card
                sx={{
                    width: 300,
                    height: 150,
                    opacity: 0.8,
                    cursor: "pointer",
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                        boxShadow: theme.shadows[4],
                    },
                }}
            >
                <CardActionArea sx={{ height: "100%", display: "flex", alignItems: "center" }} 
                    onClick={() => console.log("Create new board")}>
                    <CardContent>
                        <Typography variant="subtitle1" color="text.secondary" textAlign="center">
                            + Create Board
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Box>
    );
};
