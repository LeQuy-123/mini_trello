import {
	Box,
	Button,
	Card,
	CircularProgress,
	FormControlLabel,
	Switch,
	Typography,
} from '@mui/material';
import { useAuth } from '@utils/useAuth';
import { useNavigate } from 'react-router-dom';
import { useCustomTheme } from '@utils/useCustomTheme';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import CustomTextField from '@components/CustomTextField';
import { toast } from 'react-toastify';
type LoginValues = {
	email: string;
	password: string;
};

export default function SignIn() {
	const navigate = useNavigate();
	const schema = Yup.object().shape({
		email: Yup.string().required('Email is required'),
		password: Yup.string().required('Password is required'),
	});
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginValues>({
		resolver: yupResolver(schema),
	});

	const { mode, toggleTheme } = useCustomTheme();

	const { login, loginStatus } = useAuth();

	const handleLogin = async (value: LoginValues) => {
		const { email, password } = value;
		login({ email, password })
			.unwrap()
			.then(() => {
				navigate('/boards');
			})
			.catch((err) => {
				toast.error('Login failed: ' + err);
			});
	};

	return (
		<Box
			minHeight="100vh"
			width="100vw"
			display="flex"
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
			sx={{ backgroundColor: (theme) => theme.palette.background.default }}
		>
			<Typography variant="h3" fontWeight={700} gutterBottom textAlign="center">
				Mini Trello
			</Typography>
			<Card
				elevation={3}
				sx={{
					p: 4,
					width: '100%',
					maxWidth: 400,
					boxSizing: 'border-box',
					position: 'relative',
				}}
			>
				<Typography variant="h5" component="h1" gutterBottom>
					Sign In
				</Typography>
				<Box position="absolute" top={32} right={8}>
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
				</Box>

				<form onSubmit={handleSubmit(handleLogin)}>
					<CustomTextField
						name="email"
						label={'Email'}
						control={control}
						error={Boolean(errors.email?.message)}
						helperText={errors.email?.message || ''}
					/>
					<CustomTextField
						name="password"
						control={control}
						type="password"
						label={'Password'}
						error={Boolean(errors.password?.message)}
						helperText={errors.password?.message || ''}
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						disabled={loginStatus.loading}
						sx={{ mt: 2, height: 40 }}
					>
						{loginStatus.loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							'Sign In'
						)}
					</Button>

					<Box mt={2} textAlign="center">
						<Typography variant="body2">
							Don’t have an account?{' '}
							<Box
								component="span"
								sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500 }}
								onClick={() => {
									navigate('/signup');
								}}
							>
								Sign up
							</Box>
						</Typography>
					</Box>
					<Button
						fullWidth
						variant="outlined"
						sx={{ mt: 4, height: 40 }}
						onClick={() => {}}
					>
						Sign in with GitHub
					</Button>
				</form>
			</Card>
		</Box>
	);
}
