import { Box, Typography } from '@mui/material';

export default function Profile() {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<Box sx={{ p: 2 }}>
				<Typography variant="subtitle1" gutterBottom>
					Your Proofile
				</Typography>
			</Box>
		</Box>
	);
}
