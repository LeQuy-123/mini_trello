import { useAuth } from '@utils/useAuth';
import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';

type PublicRouteProps = {
	children: JSX.Element;
};

export default function PublicRoute({ children }: PublicRouteProps) {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <Navigate to="/boards" replace /> : children;
}
