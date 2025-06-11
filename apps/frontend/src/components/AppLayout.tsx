import {
	AppBar,
	Box,
	Toolbar,
	Typography,
	IconButton,
	Stack,
	FormControlLabel,
	Switch,
	Tabs,
	Tab,
	useMediaQuery,
	Menu,
	MenuItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '@utils/useAuth';
import { useCustomTheme } from '@utils/useCustomTheme';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const tabRoutes = [
	{ label: 'Workspace', path: '/boards' },
	{ label: 'Settings', path: '/settings' },
	{ label: 'Profile', path: '/profile' },
];

export default function AppLayout() {
	const { user } = useAuth();
	const { mode, toggleTheme } = useCustomTheme();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const location = useLocation();
	const navigate = useNavigate();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const currentTab = tabRoutes.findIndex((tab) => location.pathname.startsWith(tab.path));

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
			<AppBar position="static" color="default" elevation={1}>
				<Toolbar>
					<Stack direction="row" sx={{ width: '100%' }} justifyContent="space-between">
						{/* Left side */}
						<Stack direction="row" alignItems="center" gap={2}>
							<Typography
								variant="h6"
								sx={{ cursor: 'pointer' }}
								onClick={() => navigate('/')}
							>
								Mini Trello
							</Typography>

							{/* Tabs or Dropdown */}
							{isMobile ? (
								<></>
							) : (
								<Tabs
									value={currentTab === -1 ? false : currentTab}
									onChange={(_, newValue) => navigate(tabRoutes[newValue].path)}
									textColor="primary"
									indicatorColor="primary"
								>
									{tabRoutes.map((tab) => (
										<Tab key={tab.path} label={tab.label} />
									))}
								</Tabs>
							)}
						</Stack>

						{/* Right side */}
						{isMobile ? (
							<>
								<IconButton edge="end" onClick={handleMenuOpen}>
									<MoreVertIcon />
								</IconButton>
								<Menu
									anchorEl={anchorEl}
									open={Boolean(anchorEl)}
									onClose={handleMenuClose}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'right',
									}}
									transformOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}
								>
									{tabRoutes.map((tab) => (
										<MenuItem onClick={() => {
											navigate(tab.path);
											handleMenuClose();
										}} key={tab.path} value={tab.path}>
											{tab.label}
										</MenuItem>
									))}
									<MenuItem>
										<FormControlLabel
											control={
												<Switch
													checked={mode === 'dark'}
													onChange={toggleTheme}
												/>
											}
											label={mode === 'light' ? '🌙 Dark' : '☀️ Light'}
										/>
									</MenuItem>
									<MenuItem>
										<NotificationsIcon sx={{ mr: 1 }} />
										Notifications
									</MenuItem>
									<MenuItem>
										<Typography variant="body2">Hello, {user?.name}</Typography>
									</MenuItem>
								</Menu>
							</>
						) : (
							<Stack direction="row" alignItems="center" gap={2}>
								<FormControlLabel
									control={
										<Switch
											checked={mode === 'dark'}
											onChange={toggleTheme}
											name="themeToggle"
										/>
									}
									label={mode === 'light' ? '🌙' : '☀️'}
								/>
								<IconButton edge="end" color="inherit">
									<NotificationsIcon />
								</IconButton>
								<Typography variant="body1">Hello, {user?.name}</Typography>
							</Stack>
						)}
					</Stack>
				</Toolbar>
			</AppBar>

			<Box sx={{ flexGrow: 1, overflow: 'auto' }}>
				<Outlet />
			</Box>
		</Box>
	);
}
