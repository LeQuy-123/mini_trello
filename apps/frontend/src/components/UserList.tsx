import { List, ListItem, ListItemText, Paper } from '@mui/material';

export default function UserList() {
	return (
		<Paper elevation={1}>
			<List>
				<ListItem>
					<ListItemText primary="John Doe" />
				</ListItem>
				<ListItem>
					<ListItemText primary="Jane Smith" />
				</ListItem>
			</List>
		</Paper>
	);
}
