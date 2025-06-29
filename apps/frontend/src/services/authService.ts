import apiClient from './apiClient';

export interface SignInPayload {
	email: string;
	password: string;

}

export interface SignUpPayload extends SignInPayload {
	name: string;
	otp: string;
}

export interface User {
	id: string;
	email: string;
	name: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}
class AuthService {
	async signIn(payload: SignInPayload): Promise<AuthResponse> {
		const res = await apiClient.post<AuthResponse>('auth/signin', payload);
		return res.data;
	}

	async signUp(payload: SignUpPayload): Promise<{ user: User }> {
		const res = await apiClient.post<{ user: User }>('auth/signup', payload);
		return res.data;
	}

	async fetchProfile(token?: string): Promise<User> {
		const res = await apiClient.get<User>('auth/profile', {
			headers: token ? { Authorization: `Bearer ${token}` } : {}, // No extra headers if no token
		});
		return res.data;
	}
	async sendOtp({ email }: { email: string }) {
		await apiClient.post('/auth/signup/init', { email });
	}

	async verifyOtpAndRegister({ email, name, password, otp }: SignUpPayload): Promise<any> {
		const res = await apiClient.post('/auth/signup/verify', {
			email,
			name,
			password,
			otp,
		});
		return res.data;
	}
}

export const authService = new AuthService();
