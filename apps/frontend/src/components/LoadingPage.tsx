import { CircularProgress, Box } from "@mui/material";

export default function LoadingPage() {
	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			height="100vh"
		>
			<CircularProgress />
		</Box>
	);
}
