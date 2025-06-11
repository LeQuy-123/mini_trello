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
type RegisterValue = {
	name: string;
	email: string;
	password: string;
	passwordRetype: string;
};

export default function SignUp() {
	const navigate = useNavigate();
	const schema = Yup.object().shape({
		name: Yup.string().required('Email is required'),
		email: Yup.string().required('Email is required'),
		password: Yup.string().required('Password is required'),
		passwordRetype: Yup.string().required('Confirm password is required'),
	});
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterValue>({
		resolver: yupResolver(schema),
	});

	const { mode, toggleTheme } = useCustomTheme();

	const { register, registerStatus } = useAuth();

	const handleLogin = async (value: RegisterValue) => {
		const { name, email, password } = value;
		register({ name, email, password })
			.unwrap()
			.then(() => {
				navigate('/boards');
			})
			.catch((err) => {
				toast.error('Register failed: ' + err);
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
						name="name"
						label={'Username'}
						control={control}
						error={Boolean(errors.name?.message)}
						helperText={errors.name?.message || ''}
					/>
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
					<CustomTextField
						name="passwordRetype"
						control={control}
						type="password"
						label={'Password confirm'}
						error={Boolean(errors.passwordRetype?.message)}
						helperText={errors.passwordRetype?.message || ''}
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						disabled={registerStatus.loading}
						sx={{ mt: 2, height: 40 }}
					>
						{registerStatus.loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							'Sign Up'
						)}
					</Button>
					<Box mt={2} textAlign="center">
						<Typography variant="body2">
							Already have an account?{' '}
							<Box
								component="span"
								sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500 }}
								onClick={() => {
									navigate('/signin');
								}}
							>
								Sign in
							</Box>
						</Typography>
					</Box>
				</form>
			</Card>
		</Box>
	);
}
