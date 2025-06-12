import React, { useEffect } from 'react';
import {
	Modal,
	Box,
	Typography,
	Button,
	Fade,
	List,
	ListItem,
	ListItemText,
	Divider,
	CircularProgress,
} from '@mui/material';
import { useInvitation } from '@utils/useInvitation';
import { useParams } from 'react-router-dom';
import { useBoard } from '@utils/useBoard';
import { useAuth } from '@utils/useAuth';

type UserInvitationModalProps = {
	open: boolean;
	onClose: () => void;

};

export const UserInvitationModal: React.FC<UserInvitationModalProps> = ({
	open,
	onClose,
}) => {
	const { user : currentUser} = useAuth()
	const {
		getUser,
		users,
		sendInvitation,
		sendInvitationStatus,
		invitations,
		getInvitations
	} = useInvitation();
	const { users: invitedUserIds } = useBoard()
	const { id } = useParams<{ id: string }>();

	useEffect(() => {
		if (open) {
			getUser();
			getInvitations();
		}
	}, [open]);

	const handleInvite = async (userId: string, email: string) => {
		if (!id) return;
		await sendInvitation(id, {
			memberId: userId,
			emailMember: email
		})?.unwrap()?.then(() => {
			getInvitations()
		});
	};

	return (
		<Modal open={open} onClose={onClose} closeAfterTransition>
			<Fade in={open}>
				<Box
					sx={{
						position: 'absolute' as const,
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 400,
						bgcolor: 'background.paper',
						borderRadius: 2,
						boxShadow: 24,
						p: 3,
					}}
				>
					<Typography variant="h6" mb={2}>
						Invite Users to Board
					</Typography>
					<Box sx={{
						overflowY: 'auto',
						maxHeight: 500,

					}}>
						<List >
							{users.map((user, index) => {
								const isInvited = invitedUserIds.findIndex((iu) => iu.id === user.id) !== -1;
								const isSendInvation = invitations?.findIndex((iv) => iv.memberId === user.id) != -1
								const isCurrentUser = currentUser?.id === user.id;
								if(isCurrentUser) return;
								return (
									<React.Fragment key={user.id}>
										<ListItem
											sx={{
												px: 1,
												py: 1,
												display: 'flex',
												justifyContent: 'space-between',
											}}
										>
											<ListItemText
												primary={<Typography variant={isCurrentUser ? 'h6' : 'inherit'}>{user.name}</Typography>}
												secondary={user.email}
											/>
											{!isInvited && (
												<Button
													variant="outlined"
													size="small"
													disabled={
														sendInvitationStatus.loading || isSendInvation
													}
													onClick={() => handleInvite(user.id, user.email)}
												>
													{sendInvitationStatus.loading ? (
														<CircularProgress size={20} />
													) : (
															isSendInvation ? 'Invited' : 'Invite'
													)}
												</Button>
											)}
										</ListItem>
										{index < users.length - 1 && <Divider />}
									</React.Fragment>
								);
							})}
						</List>
					</Box>


					<Box mt={3} display="flex" justifyContent="flex-end">
						<Button onClick={onClose} variant="outlined">
							Close
						</Button>
					</Box>
				</Box>
			</Fade>
		</Modal>
	);
};
