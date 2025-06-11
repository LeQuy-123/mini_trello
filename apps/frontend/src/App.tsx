import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from '@pages/SignIn';
import SignUp from '@pages/SignUp';
import Boards from '@pages/Boards';
import ProtectedRoute from '@auth/ProtectedRoute';
import { createTheme, ThemeProvider } from '@mui/material';
import { useMemo } from 'react';
import { useCustomTheme } from '@utils/useCustomTheme';
import CssBaseline from '@mui/material/CssBaseline';
import PublicRoute from '@auth/PublicRoute';
import AppLayout from '@components/AppLayout';
import Settings from '@pages/Settings';
import Profile from '@pages/Profile';
import BoardDetail from '@pages/BoardDetail';

function App() {
	const { mode } = useCustomTheme();
	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode,
				},
				components: {
					MuiCssBaseline: {
						styleOverrides: {
							'*:focus': {
								outline: 'none !important',
							},
							'*:focus-visible': {
								outline: 'none !important',
								boxShadow: 'none !important',
							},
						},
					},
				},
			}),
		[mode]
	);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Routes>
				<Route
					path="/signin"
					element={
						<PublicRoute>
							<SignIn />
						</PublicRoute>
					}
				/>
				<Route
					path="/signup"
					element={
						<PublicRoute>
							<SignUp />
						</PublicRoute>
					}
				/>
				<Route
					element={
						<ProtectedRoute>
							<AppLayout />
						</ProtectedRoute>
					}
				>
					<Route path="/boards" element={<Boards />} />
					<Route path="/boards/:id" element={<BoardDetail />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/profile" element={<Profile />} />
				</Route>
				<Route path="*" element={<Navigate to="/signin" replace />} />
			</Routes>
		</ThemeProvider>
	);
}

export default App;
