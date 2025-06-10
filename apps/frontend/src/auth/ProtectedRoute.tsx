import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { type ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/signin" replace />;
}
