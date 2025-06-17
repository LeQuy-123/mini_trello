import type { RootState } from '@store/index';
import { useAppDispatch, useAppSelector } from '@store/hooks';
// import {  } from '@store/authSlice';
import { sendOtp, login, getProfile, logout, resetStatus, verifyOtpAndRegister } from '@store/authSliceWithOTP';
import type { SignUpPayload } from '@services/authService';

export function useAuth() {
	const dispatch = useAppDispatch();

	const {
		user,
		token,
		login: loginStatus,
		register: registerStatus,
		profile: profileStatus,
		otp: otpStatus,
		verify: verifyStatus,
	} = useAppSelector((state: RootState) => state.authWithOtp);

	return {
		user,
		token,
		isAuthenticated: !!user && !!token,

		otpStatus,
		verifyStatus,
		loginStatus,
		registerStatus,
		profileStatus,
		isLoading: loginStatus.loading || registerStatus.loading || profileStatus.loading,

		login: (payload: { email: string; password: string }) => dispatch(login(payload)),
		// register: (payload: { name: string; email: string; password: string }) =>
		// 	dispatch(register(payload)),
		getProfile: () => dispatch(getProfile()),
		logout: () => dispatch(logout()),
		resetStatus: () => dispatch(resetStatus()),
		sendOtp: (email: string) => dispatch(sendOtp({ email })),
		verifyOtpAndRegister: (params: SignUpPayload) => dispatch(verifyOtpAndRegister(params)),
	};
}
