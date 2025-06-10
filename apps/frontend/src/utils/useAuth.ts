import type { RootState } from "@store/index";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  login,
  register,
  getProfile,
  logout,
  resetStatus,
} from "@store/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();

  const {
    user,
    token,
    login: loginStatus,
    register: registerStatus,
    profile: profileStatus,
  } = useAppSelector((state: RootState) => state.auth);

  return {
    // State
    user,
    token,
    isAuthenticated: !!user && !!token,

    // Status
    loginStatus,
    registerStatus,
    profileStatus,
    isLoading:
      loginStatus.loading || registerStatus.loading || profileStatus.loading,

    // Actions
    login: (payload: { email: string; password: string }) =>
      dispatch(login(payload)),
    register: (payload: { name: string; email: string; password: string }) =>
      dispatch(register(payload)),
    getProfile: () => dispatch(getProfile()),
    logout: () => dispatch(logout()),
    resetStatus: () => dispatch(resetStatus()),
  
  };
}
