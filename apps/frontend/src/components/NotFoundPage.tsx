import { Box, Typography } from '@mui/material';

type Props = {
	label: string;
};
export default function NotFoundPage({ label }: Props) {
	return (
		<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
			<Typography variant="h6">404 – {label} not found</Typography>
		</Box>
	);
}
