import { useAuth } from "@auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = () => {
        login("user123");
        navigate("/boards");
    };

    return (
        <div>
            <h1>Sign In</h1>
            <button onClick={handleLogin}>Sign In</button>
        </div>
    );
}
