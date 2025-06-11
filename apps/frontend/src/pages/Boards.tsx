import { Box, Typography } from '@mui/material';
import { BoardList } from '@components/BoardList';

export default function Boards() {
	return (
		<Box sx={{ flexGrow: 1, p: 2 }}>
			<Box sx={{ p: 2 }}>
				<Typography variant="subtitle1" gutterBottom>
					Your Workspace
				</Typography>
				<BoardList />
			</Box>
		</Box>
	);
}
