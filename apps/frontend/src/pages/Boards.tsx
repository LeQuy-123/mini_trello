import { Box, Typography } from '@mui/material';
import { BoardList } from '@components/BoardList';
import { useEffect } from 'react';
import { useInvitation } from '@utils/useInvitation';

export default function Boards() {
	const { getUser, getInvitations } = useInvitation();
	useEffect(() => {
		getUser();
		getInvitations();
	}, []);

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
