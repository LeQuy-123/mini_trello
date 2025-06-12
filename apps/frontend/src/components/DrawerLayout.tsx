import {
	Box,
	Typography,
	Drawer,
	IconButton,
	Divider,
	styled,
	useTheme,
	useMediaQuery,
	Stack,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UserList from './UserList';
import { UserInvitationModal } from './UserInvitationModal';
const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{ open?: boolean }>(
	({ theme, open }) => ({
		flexGrow: 1,

		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		marginLeft: `-${drawerWidth}px`,
		...(open && {
			marginLeft: 0,
			transition: theme.transitions.create('margin', {
				easing: theme.transitions.easing.easeOut,
				duration: theme.transitions.duration.enteringScreen,
			}),
		}),
	})
);



const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	...theme.mixins.toolbar,
	justifyContent: 'space-between',
}));
type Props = {
	children: React.ReactNode;
}
export default function DrawerLayout({
	children
}: Props) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [open, setOpen] = useState(!isMobile);
	const [openUserModal, setOpenUserModal] = useState(false);

	const handleDrawerOpen = () => setOpen(true);
	const handleDrawerClose = () => setOpen(false);
	const handleAddUser = () => {
		setOpenUserModal(true)
	}
	return (
		<Box sx={{ display: 'flex'}}>
			<>
				<IconButton
					color="inherit"
					aria-label="open drawer"
					onClick={handleDrawerOpen}
					edge="start"
					sx={{
						...(isMobile ?
								{ ml: 1, mt: 2, width: 10, height: 10 } :
								{ ml: 2, mt: '10px', width: 30, height: 30 }),
						...(open && { display: 'none' })
					}}
				>
					<ChevronRightIcon />
				</IconButton>
				<Drawer
					sx={{
						width: drawerWidth,
						flexShrink: 0,
						'& .MuiDrawer-paper': {
							top: '66px',
							height: 'calc(100% - 66px)',
							width: drawerWidth,
							boxSizing: 'border-box',
						},
					}}
					variant="persistent"
					anchor="left"
					open={open}
				>
					<DrawerHeader>
						<Stack direction={'row'} alignItems='center'>
							<Typography variant="h6">Members</Typography>
							<IconButton onClick={handleAddUser}>
								<AddCircleOutlineIcon />
							</IconButton>
						</Stack>
						<IconButton onClick={handleDrawerClose}>
							<ChevronLeftIcon />
						</IconButton>
					</DrawerHeader>
					<Divider />
					<UserList />
				</Drawer>
			</>
			<Main open={open}>
				{children}
			</Main>
			<UserInvitationModal
				open={openUserModal}
				onClose={() => setOpenUserModal(false)}
			/>
		</Box>
	);
}
