import apiClient from "./apiClient";

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload extends SignInPayload {
  name: string;
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
    const res = await apiClient.post<AuthResponse>("auth/signin", payload);
    return res.data;
  }

  async signUp(payload: SignUpPayload): Promise<{ user: User }> {
    const res = await apiClient.post<{ user: User }>("auth/signup", payload);
    return res.data;
  }

  async fetchProfile(): Promise<User> {
    const res = await apiClient.get<User>("auth/profile");
    return res.data;
  }
}

export const authService = new AuthService();
