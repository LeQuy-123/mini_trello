import { useAuth } from "@auth/AuthProvider";

export default function Boards() {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Welcome to Boards, {user?.name}</h1>
            <button onClick={logout}>Log out</button>
        </div>
    );
}
