import {
	Box,
	Button,
	Card,
	CircularProgress,
	FormControlLabel,
	Switch,
	Typography,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from '@mui/material';
import { useAuth } from '@utils/useAuth';
import { useNavigate } from 'react-router-dom';
import { useCustomTheme } from '@utils/useCustomTheme';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import CustomTextField from '@components/CustomTextField';
import { toast } from 'react-toastify';
import { useState } from 'react';

type RegisterValue = {
	name: string;
	email: string;
	password: string;
	passwordRetype: string;
};

export default function SignUp() {
	const navigate = useNavigate();
	const [openOtp, setOpenOtp] = useState(false);
	const [otp, setOtp] = useState('');
	const [formValues, setFormValues] = useState<RegisterValue | null>(null);

	const schema = Yup.object().shape({
		name: Yup.string().required('Username is required'),
		email: Yup.string().email('Invalid email').required('Email is required'),
		password: Yup.string().required('Password is required'),
		passwordRetype: Yup.string()
			.required('Confirm password is required')
			.oneOf([Yup.ref('password')], 'Passwords must match'),
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterValue>({
		resolver: yupResolver(schema),
	});

	const { mode, toggleTheme } = useCustomTheme();
	const { sendOtp, verifyOtpAndRegister, otpStatus, verifyStatus } = useAuth();

	const handleSendOtp = async (value: RegisterValue) => {
		setFormValues(value);
		try {
			await sendOtp(value.email).unwrap();
			setOpenOtp(true);
		} catch (err: any) {
			toast.error('Failed to send OTP: ' + err);
		}
	};

	const handleVerifyOtp = async () => {
		if (!formValues) return;
		const { name, email, password } = formValues;
		verifyOtpAndRegister({ name, email, password, otp })
			.unwrap()
			.then(() => {
				setOpenOtp(false);
				navigate('/boards');
			})
			.catch((err) => {
				toast.error('OTP verification failed: ' + err);
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
			<Card elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', position: 'relative' }}>
				<Typography variant="h5" component="h1" gutterBottom>
					Sign Up
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

				<form onSubmit={handleSubmit(handleSendOtp)}>
					<CustomTextField
						name="name"
						label="Username"
						control={control}
						error={!!errors.name}
						helperText={errors.name?.message || ''}
					/>
					<CustomTextField
						name="email"
						label="Email"
						control={control}
						error={!!errors.email}
						helperText={errors.email?.message || ''}
					/>
					<CustomTextField
						name="password"
						label="Password"
						type="password"
						control={control}
						error={!!errors.password}
						helperText={errors.password?.message || ''}
					/>
					<CustomTextField
						name="passwordRetype"
						label="Confirm Password"
						type="password"
						control={control}
						error={!!errors.passwordRetype}
						helperText={errors.passwordRetype?.message || ''}
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						disabled={otpStatus.loading}
						sx={{ mt: 2, height: 40 }}
					>
						{otpStatus.loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							'Send OTP'
						)}
					</Button>
					<Box mt={2} textAlign="center">
						<Typography variant="body2">
							Already have an account?{' '}
							<Box
								component="span"
								sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500 }}
								onClick={() => navigate('/signin')}
							>
								Sign in
							</Box>
						</Typography>
					</Box>
				</form>
			</Card>

			<Dialog open={openOtp} onClose={() => setOpenOtp(false)}>
				<DialogTitle>Enter OTP</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="One-Time Password"
						fullWidth
						variant="outlined"
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenOtp(false)} disabled={verifyStatus.loading}>
						Cancel
					</Button>
					<Button
						onClick={handleVerifyOtp}
						variant="contained"
						color="primary"
						disabled={verifyStatus.loading || otp.trim().length === 0}
					>
						{verifyStatus.loading ? (
							<CircularProgress size={20} color="inherit" />
						) : (
							'Confirm'
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
