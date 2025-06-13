import React, { useState } from 'react';
import { Menu, MenuItem, IconButton, Box, Typography, Divider, Button, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getBorderColor } from '@utils/helper';
import { useInvitation } from '@utils/useInvitation';
import type { Invitation } from '@services/invitationService';
import { useBoard } from '@utils/useBoard';

const InvitationDropdown = ({ label }: { label?: string }) => {
	const { invitations, respondToInvitation, getInvitations } = useInvitation();
	const { getBoards } = useBoard();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleRespond = (inv: Invitation, status: 'accepted' | 'declined') =>
		respondToInvitation(inv.boardId, {
			invite_id: inv.id,
			status: status,
		}).then(() => {
			getInvitations();
			getBoards({});
		});

	return (
		<>
			{label ? (
				<Typography variant="body1" sx={{}} onClick={handleOpen}>
					{label}
				</Typography>
			) : (
				<IconButton color="inherit" onClick={handleOpen}>
					<NotificationsIcon />
				</IconButton>
			)}

			<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
				{invitations.length === 0 ? (
					<MenuItem disabled>No Invitations</MenuItem>
				) : (
					invitations.map((invitation) => (
						<Box
							key={invitation.id}
							sx={{
								borderLeft: `4px solid ${getBorderColor(invitation.status)}`,
								px: 2,
								py: 1,
								width: 320,
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Typography fontWeight="bold">
								{invitation.type === 'recivie' ?
									`From: ${invitation.sender.name} (${invitation.sender.email})` :
									`To: ${invitation.recipient.name} (${invitation.recipient.email})`}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Board Invite
							</Typography>

							{invitation.status === 'pending' && invitation.type === 'recivie' ? (
								<Box mt={1} display="flex" gap={1}>
									<Button
										variant="outlined"
										color="success"
										size="small"
										onClick={() => handleRespond(invitation, 'accepted')}
									>
										Accept
									</Button>
									<Button
										variant="outlined"
										color="error"
										size="small"
										onClick={() => handleRespond(invitation, 'declined')}
									>
										Reject
									</Button>
								</Box>
							) : (
								<Chip
									label={invitation.status.toUpperCase()}
									size="small"
									color={
										invitation.status === 'accepted'
											? 'success'
											: invitation.status === 'rejected'
												? 'error'
												: 'default'
									}
									sx={{ mt: 1, width: 'fit-content' }}
								/>
							)}
							<Divider sx={{ mt: 1 }} />
						</Box>
					))
				)}
			</Menu>
		</>
	);
};

export default InvitationDropdown;
