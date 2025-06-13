import { Box, Typography } from '@mui/material';

type Props = {
	message: string;
};

export default function ErrorPage({ message }: Props) {
	return (
		<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
			<Typography color="error" variant="h6">
				{message}
			</Typography>
		</Box>
	);
}
