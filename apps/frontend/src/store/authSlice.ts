import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authService, type User } from "@services/authService";

interface LoginAPIRes {
  token: string;
  user: User;
}

interface AsyncStatus {
  loading: boolean;
  error: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: AsyncStatus;
  register: AsyncStatus;
  profile: AsyncStatus;
}

const getDefaultAsyncState = (): AsyncStatus => ({
  loading: false,
  error: null,
});

const localStoredAuth = localStorage.getItem("auth");
const parsedAuth = localStoredAuth ? JSON.parse(localStoredAuth) : null;

const initialState: AuthState = {
  user: parsedAuth?.user || null,
  token: parsedAuth?.token || null,
  login: getDefaultAsyncState(),
  register: getDefaultAsyncState(),
  profile: getDefaultAsyncState(),
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res: LoginAPIRes = await authService.signIn({ email, password });
      localStorage.setItem("auth", JSON.stringify(res));
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      email,
      password,
    }: { name: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res  = await authService.signUp({
        name,
        email,
        password,
      });
      localStorage.setItem("auth", JSON.stringify(res));
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.message || "Registration failed");
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/profile",
  async (_, thunkAPI) => {
    try {
      const user = await authService.fetchProfile();
      return user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.message || "Fetch profile failed");
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("auth");
    },
    setAuth(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("auth", JSON.stringify(action.payload));
    },
    resetStatus(state) {
      state.login = getDefaultAsyncState();
      state.register = getDefaultAsyncState();
      state.profile = getDefaultAsyncState();
    },
  },
  extraReducers: (builder) => {
    const handleAsync = <K extends keyof Omit<AuthState, "user" | "token">>(
      type: K,
      thunk: any
    ) => {
      builder
        .addCase(thunk.pending, (state) => {
          state[type].loading = true;
          state[type].error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state[type].loading = false;
          if (type === "login" || type === "register") {
            state.user = action.payload.user;
            state.token = action.payload.token;
          }
          if (type === "profile") {
            state.user = action.payload;
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          state[type].loading = false;
          state[type].error = action.payload as string;
        });
    };

    handleAsync("login", login);
    handleAsync("register", register);
    handleAsync("profile", getProfile);
  },
});

export const { logout, setAuth, resetStatus } = authSlice.actions;
export default authSlice.reducer;
