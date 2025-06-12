import {
	Divider,
	List,
	ListItem,
	ListItemText,
	Typography,
	Box,
} from '@mui/material';
import { useBoard } from '@utils/useBoard';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function UserList() {
	const { id } = useParams<{ id: string }>();
	// const { getUser, users } = useInvitation();
	const {getUsers, users} = useBoard();
	useEffect(() => {
		if (id) getUsers({ id });
	}, [id]);

	return (
		<Box sx={{ px: 2, backgroundColor: 'transparent' }}>
			{users.length === 0 ? (
				<Typography color="text.secondary">No users found.</Typography>
			) : (
				<List sx={{ bgcolor: 'transparent' }}>
					{users.map((user) => (
						<React.Fragment key={user.id}>
							<ListItem sx={{ px: 0 }}>
								<ListItemText
									primary={
										<Typography fontWeight={500}>
											{user.name}
										</Typography>
									}
									secondary={user.email}
								/>
							</ListItem>
							<Divider />
						</React.Fragment>
					))}
				</List>
			)}
		</Box>
	);
}
