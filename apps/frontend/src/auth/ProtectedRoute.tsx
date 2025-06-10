import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "@utils/useAuth";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/signin" replace />;
}
